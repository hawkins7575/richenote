// ============================================================================
// 테넌트 서비스 레이어
// ============================================================================

import { supabase, handleSupabaseError } from '@/lib/supabase'
import type { 
  Tenant, 
  CreateTenantRequest, 
  UpdateTenantRequest, 
  TenantStats 
} from '@/types/tenant'

export class TenantService {
  /**
   * 테넌트 조회 (ID)
   */
  static async getTenantById(id: string): Promise<Tenant> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw handleSupabaseError(error)
    }

    return data
  }

  /**
   * 테넌트 조회 (슬러그)
   */
  static async getTenantBySlug(slug: string): Promise<Tenant> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      throw handleSupabaseError(error)
    }

    return data
  }

  /**
   * 테넌트 조회 (도메인)
   */
  static async getTenantByDomain(domain: string): Promise<Tenant> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('domain', domain)
      .single()

    if (error) {
      throw handleSupabaseError(error)
    }

    return data
  }

  /**
   * 사용자의 테넌트 목록 조회
   */
  static async getUserTenants(userId: string): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        *,
        users!inner(id, role, status)
      `)
      .eq('users.id', userId)
      .eq('users', 'active')

    if (error) {
      throw handleSupabaseError(error)
    }

    return data
  }

  /**
   * 테넌트 생성
   */
  static async createTenant(request: CreateTenantRequest): Promise<Tenant> {
    // 1. 슬러그 중복 확인
    const { data: existing } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', request.slug)
      .single()

    if (existing) {
      throw new Error('이미 사용 중인 업체명입니다.')
    }

    // 2. 플랜별 제한사항 설정
    const planLimits = {
      starter: {
        max_properties: 50,
        max_users: 2,
        max_storage_gb: 1,
        max_api_calls_per_month: 1000,
        features_enabled: []
      },
      professional: {
        max_properties: 300,
        max_users: 8,
        max_storage_gb: 10,
        max_api_calls_per_month: 10000,
        features_enabled: ['crm', 'analytics']
      },
      business: {
        max_properties: 1000,
        max_users: 25,
        max_storage_gb: 100,
        max_api_calls_per_month: 100000,
        features_enabled: ['crm', 'analytics', 'api_access', 'custom_branding']
      },
      enterprise: {
        max_properties: 999999,
        max_users: 999999,
        max_storage_gb: 999999,
        max_api_calls_per_month: 999999,
        features_enabled: ['crm', 'analytics', 'api_access', 'custom_branding', 'sso', 'advanced_security']
      }
    }

    // 3. 테넌트 생성
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
        limits: planLimits[request.plan],
        settings: {
          timezone: 'Asia/Seoul',
          date_format: 'YYYY-MM-DD',
          currency: 'KRW',
          language: 'ko',
          default_property_status: '거래중',
          require_exit_date: true,
          require_landlord_info: true,
          email_notifications: true,
          sms_notifications: false,
          browser_notifications: true,
          require_2fa: false,
          session_timeout_minutes: 480,
        },
        ...(request.business_info && {
          business_registration_number: request.business_info.registration_number,
          address: request.business_info.address,
          phone: request.business_info.phone,
        }),
      })
      .select()
      .single()

    if (error) {
      throw handleSupabaseError(error)
    }

    return data
  }

  /**
   * 테넌트 업데이트
   */
  static async updateTenant(
    tenantId: string, 
    updates: UpdateTenantRequest
  ): Promise<Tenant> {
    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', tenantId)
      .select()
      .single()

    if (error) {
      throw handleSupabaseError(error)
    }

    return data
  }

  /**
   * 테넌트 상태 변경
   */
  static async updateTenantStatus(
    tenantId: string, 
    status: Tenant['status']
  ): Promise<void> {
    const { error } = await supabase
      .from('tenants')
      .update({ status })
      .eq('id', tenantId)

    if (error) {
      throw handleSupabaseError(error)
    }
  }

  /**
   * 테넌트 플랜 변경
   */
  static async updateTenantPlan(
    tenantId: string, 
    plan: Tenant['plan']
  ): Promise<void> {
    // 플랜별 제한사항 업데이트
    const planLimits = {
      starter: {
        max_properties: 50,
        max_users: 2,
        max_storage_gb: 1,
        max_api_calls_per_month: 1000,
        features_enabled: []
      },
      professional: {
        max_properties: 300,
        max_users: 8,
        max_storage_gb: 10,
        max_api_calls_per_month: 10000,
        features_enabled: ['crm', 'analytics']
      },
      business: {
        max_properties: 1000,
        max_users: 25,
        max_storage_gb: 100,
        max_api_calls_per_month: 100000,
        features_enabled: ['crm', 'analytics', 'api_access', 'custom_branding']
      },
      enterprise: {
        max_properties: 999999,
        max_users: 999999,
        max_storage_gb: 999999,
        max_api_calls_per_month: 999999,
        features_enabled: ['crm', 'analytics', 'api_access', 'custom_branding', 'sso', 'advanced_security']
      }
    }

    const { error } = await supabase
      .from('tenants')
      .update({ 
        plan,
        limits: planLimits[plan]
      })
      .eq('id', tenantId)

    if (error) {
      throw handleSupabaseError(error)
    }
  }

  /**
   * 테넌트 통계 조회
   */
  static async getTenantStats(tenantId: string): Promise<TenantStats> {
    const { data, error } = await supabase
      .rpc('get_tenant_stats', { tenant_id: tenantId })

    if (error) {
      throw handleSupabaseError(error)
    }

    return data
  }

  /**
   * 테넌트 삭제 (주의: 모든 관련 데이터 삭제)
   */
  static async deleteTenant(tenantId: string): Promise<void> {
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', tenantId)

    if (error) {
      throw handleSupabaseError(error)
    }
  }

  /**
   * 테넌트 사용량 확인
   */
  static async checkTenantLimits(tenantId: string): Promise<{
    isWithinLimits: boolean
    usage: Record<string, number>
    limits: Record<string, number>
    warnings: string[]
  }> {
    // 현재 사용량 조회
    const [
      { count: propertiesCount },
      { count: usersCount },
      tenant
    ] = await Promise.all([
      supabase.from('properties').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      this.getTenantById(tenantId)
    ])

    const usage = {
      properties: propertiesCount || 0,
      users: usersCount || 0,
      storage_gb: 0, // TODO: 실제 스토리지 사용량 계산
      api_calls: 0, // TODO: 실제 API 사용량 계산
    }

    const limits = tenant.limits as any
    const warnings: string[] = []
    let isWithinLimits = true

    // 제한 확인
    if (usage.properties >= limits.max_properties) {
      isWithinLimits = false
      warnings.push(`매물 개수가 한도(${limits.max_properties}개)에 도달했습니다.`)
    } else if (usage.properties >= limits.max_properties * 0.9) {
      warnings.push(`매물 개수가 한도의 90%에 도달했습니다. (${usage.properties}/${limits.max_properties})`)
    }

    if (usage.users >= limits.max_users) {
      isWithinLimits = false
      warnings.push(`사용자 수가 한도(${limits.max_users}명)에 도달했습니다.`)
    } else if (usage.users >= limits.max_users * 0.9) {
      warnings.push(`사용자 수가 한도의 90%에 도달했습니다. (${usage.users}/${limits.max_users})`)
    }

    return {
      isWithinLimits,
      usage,
      limits,
      warnings,
    }
  }
}