// ============================================================================
// 테넌트 상태 관리 Store (Zustand)
// ============================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  Tenant, 
  TenantStats, 
  CreateTenantRequest, 
  UpdateTenantRequest 
} from '@/types/tenant'
import { setTenantContext, clearTenantContext, supabase, handleSupabaseError } from '@/lib/supabase'

interface TenantState {
  // 상태
  tenant: Tenant | null
  isLoading: boolean
  error: string | null
  
  // 액션
  setTenant: (tenant: Tenant | null) => void
  switchTenant: (tenantId: string) => Promise<void>
  createTenant: (request: CreateTenantRequest) => Promise<Tenant>
  updateTenant: (updates: UpdateTenantRequest) => Promise<void>
  getTenantStats: () => Promise<TenantStats>
  
  // 권한 체크
  hasFeature: (feature: string) => boolean
  canCreateProperty: () => boolean
  canInviteUser: () => boolean
  isWithinLimits: (resource: keyof Tenant['limits']) => boolean
  
  // 유틸리티
  clearError: () => void
  reset: () => void
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      tenant: null,
      isLoading: false,
      error: null,

      // 테넌트 설정
      setTenant: (tenant) => {
        set({ tenant, error: null })
        
        // Supabase RLS 컨텍스트 설정
        if (tenant) {
          setTenantContext(tenant.id).catch((error) => {
            console.error('테넌트 컨텍스트 설정 실패:', error)
            set({ error: '테넌트 컨텍스트 설정에 실패했습니다.' })
          })
        } else {
          clearTenantContext().catch(console.error)
        }
      },

      // 테넌트 전환
      switchTenant: async (tenantId: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', tenantId)
            .single()

          if (error) throw error

          // 테넌트 설정
          get().setTenant(data)
          
          // 사용자의 테넌트 접근 권한 확인
          const { data: userTenant, error: userError } = await supabase
            .from('users')
            .select('tenant_id, role')
            .eq('tenant_id', tenantId)
            .single()

          if (userError || !userTenant) {
            throw new Error('해당 테넌트에 접근 권한이 없습니다.')
          }

        } catch (error: any) {
          const handledError = handleSupabaseError(error)
          set({ error: handledError.message, tenant: null })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      // 테넌트 생성
      createTenant: async (request: CreateTenantRequest) => {
        set({ isLoading: true, error: null })
        
        try {
          // 슬러그 중복 확인
          const { data: existing } = await supabase
            .from('tenants')
            .select('id')
            .eq('slug', request.slug)
            .single()

          if (existing) {
            throw new Error('이미 사용 중인 업체명입니다.')
          }

          // 테넌트 생성
          const { data, error } = await supabase
            .from('tenants')
            .insert({
              name: request.name,
              slug: request.slug,
              plan: request.plan,
              status: 'trial',
              trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14일 체험
              branding: {
                primary_color: '#3b82f6',
                secondary_color: '#6b7280',
                accent_color: '#f59e0b',
                ...request.branding,
              },
              limits: {
                max_properties: request.plan === 'starter' ? 50 : request.plan === 'professional' ? 300 : 1000,
                max_users: request.plan === 'starter' ? 2 : request.plan === 'professional' ? 8 : 25,
                max_storage_gb: request.plan === 'starter' ? 1 : request.plan === 'professional' ? 10 : 100,
                max_api_calls_per_month: request.plan === 'starter' ? 1000 : request.plan === 'professional' ? 10000 : 100000,
                features_enabled: request.plan === 'starter' ? [] : request.plan === 'professional' ? ['crm', 'analytics'] : ['crm', 'analytics', 'api_access', 'custom_branding'],
              },
              settings: {
                timezone: 'Asia/Seoul',
                date_format: 'YYYY-MM-DD',
                currency: 'KRW',
                language: 'ko',
                default_property_status: '판매중',
                require_exit_date: true,
                require_landlord_info: true,
                email_notifications: true,
                sms_notifications: false,
                browser_notifications: true,
                require_2fa: false,
                session_timeout_minutes: 480, // 8시간
              },
            })
            .select()
            .single()

          if (error) throw error

          // 생성된 테넌트 설정
          get().setTenant(data)
          
          return data
        } catch (error: any) {
          const handledError = handleSupabaseError(error)
          set({ error: handledError.message })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      // 테넌트 업데이트
      updateTenant: async (updates: UpdateTenantRequest) => {
        const { tenant } = get()
        if (!tenant) throw new Error('테넌트가 선택되지 않았습니다.')

        set({ isLoading: true, error: null })
        
        try {
          const { data, error } = await supabase
            .from('tenants')
            .update(updates)
            .eq('id', tenant.id)
            .select()
            .single()

          if (error) throw error

          // 업데이트된 테넌트 설정
          get().setTenant(data)
          
        } catch (error: any) {
          const handledError = handleSupabaseError(error)
          set({ error: handledError.message })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      // 테넌트 통계 조회
      getTenantStats: async (): Promise<TenantStats> => {
        const { tenant } = get()
        if (!tenant) throw new Error('테넌트가 선택되지 않았습니다.')

        try {
          // 병렬로 통계 데이터 조회
          const [
            { count: totalProperties },
            { count: activeProperties },
            { count: totalUsers },
            { count: activeUsers },
            { count: createdThisMonth }
          ] = await Promise.all([
            supabase.from('properties').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('properties').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id).eq('status', '판매중'),
            supabase.from('users').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('users').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id).eq('status', 'active'),
            supabase.from('properties').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id).gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
          ])

          return {
            total_properties: totalProperties || 0,
            active_properties: activeProperties || 0,
            total_users: totalUsers || 0,
            active_users: activeUsers || 0,
            storage_used_mb: 0, // TODO: 스토리지 사용량 계산
            api_calls_this_month: 0, // TODO: API 사용량 계산
            created_this_month: createdThisMonth || 0,
          }
        } catch (error: any) {
          const handledError = handleSupabaseError(error)
          set({ error: handledError.message })
          throw error
        }
      },

      // 기능 사용 가능 여부 확인
      hasFeature: (feature: string) => {
        const { tenant } = get()
        return tenant?.limits.features_enabled.includes(feature) || false
      },

      // 매물 생성 가능 여부 확인
      canCreateProperty: () => {
        const { tenant } = get()
        if (!tenant) return false
        
        // TODO: 현재 매물 수를 확인하여 제한 검사
        return true
      },

      // 사용자 초대 가능 여부 확인
      canInviteUser: () => {
        const { tenant } = get()
        if (!tenant) return false
        
        // TODO: 현재 사용자 수를 확인하여 제한 검사
        return true
      },

      // 리소스 제한 확인
      isWithinLimits: (resource: keyof Tenant['limits']) => {
        const { tenant } = get()
        if (!tenant) return false
        
        // TODO: 실제 사용량과 비교하여 제한 검사
        return true
      },

      // 에러 초기화
      clearError: () => set({ error: null }),

      // 상태 초기화
      reset: () => {
        clearTenantContext().catch(console.error)
        set({
          tenant: null,
          isLoading: false,
          error: null,
        })
      },
    }),
    {
      name: 'propertydesk-tenant',
      partialize: (state) => ({
        tenant: state.tenant,
      }),
    }
  )
)