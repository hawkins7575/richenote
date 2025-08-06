// ============================================================================
// 테넌트 컨텍스트 (React Context + Zustand 통합)
// ============================================================================

import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTenantStore } from '@/stores/tenantStore'
import { supabase } from '@/services/supabase'
import type { TenantContextType } from '@/types/tenant'

const TenantContext = createContext<TenantContextType | null>(null)

interface TenantProviderProps {
  children: ReactNode
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const { user } = useAuth() // 인증된 사용자 정보 가져오기
  const {
    tenant,
    isLoading,
    error,
    switchTenant,
    updateTenant,
    getTenantStats,
    hasFeature,
    canCreateProperty,
    canInviteUser,
    isWithinLimits,
  } = useTenantStore()

  // 페이지 로드 시 URL에서 테넌트 감지 또는 자동 테넌트 설정
  useEffect(() => {
    // 사용자별 개별 테넌트 자동 설정
    if (user && !tenant) {
      console.log('🏢 사용자별 개별 테넌트 설정 시작:', user.id)
      
      // 사용자별 개별 테넌트를 실제 DB에 생성/조회
      const initializeTenant = async () => {
        try {
          // 1. 기존 테넌트 조회
          const { data: existingTenant } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (existingTenant) {
            // 기존 테넌트가 있으면 스토어에 설정
            useTenantStore.setState({ 
              tenant: existingTenant,
              isLoading: false,
              error: null 
            })
            console.log('✅ 기존 테넌트 조회 완료:', existingTenant.name)
            return
          }
        } catch (error) {
          // 테넌트가 없으면 새로 생성
          console.log('📝 새 테넌트 생성 필요')
        }
        
        try {
          // 2. 새 테넌트 생성
          const userTenant = {
            id: user.id, // 사용자 ID = 테넌트 ID
            name: 'PropertyDesk 베타',
            slug: `user-${user.id.slice(0, 8)}`,
            plan: 'professional',
            status: 'trial',
            trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_by: user.id,
          }
          
          const { data: newTenant, error } = await supabase
            .from('tenants')
            .insert(userTenant)
            .select()
            .single()
          
          if (error) {
            console.error('❌ 테넌트 생성 실패:', error)
            throw error
          }
          
          // 생성된 테넌트를 스토어에 설정 (추가 속성 포함)
          const fullTenant = {
            ...newTenant,
            branding: {
              primary_color: '#3b82f6',
              secondary_color: '#1d4ed8',
              accent_color: '#f59e0b',
            },
            limits: {
              max_properties: 1000,
              max_users: 10,
              max_storage_gb: 10,
              max_api_calls_per_month: 50000,
              features_enabled: ['advanced_analytics', 'api_access', 'custom_fields'],
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
              session_timeout_minutes: 480,
            },
          }
          
          useTenantStore.setState({ 
            tenant: fullTenant,
            isLoading: false,
            error: null 
          })
          
          console.log('✅ 새 테넌트 생성 완료:', newTenant.name, 'User ID:', user.id)
        } catch (error) {
          console.error('❌ 테넌트 초기화 실패:', error)
          useTenantStore.setState({ 
            tenant: null,
            isLoading: false,
            error: '테넌트 초기화에 실패했습니다.' 
          })
        }
      }
      
      initializeTenant()
    }
  }, [user, tenant]) // user 의존성 추가

  // 테넌트별 CSS 변수 설정 (동적 브랜딩)
  useEffect(() => {
    if (tenant?.branding) {
      const root = document.documentElement
      root.style.setProperty('--tenant-primary', tenant.branding.primary_color)
      root.style.setProperty('--tenant-secondary', tenant.branding.secondary_color || '#6b7280')
      root.style.setProperty('--tenant-accent', tenant.branding.accent_color || '#f59e0b')
      
      // 파비콘 업데이트
      if (tenant.branding.favicon_url) {
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
        if (favicon) {
          favicon.href = tenant.branding.favicon_url
        }
      }
      
      // 페이지 타이틀 업데이트
      document.title = `${tenant.name} - PropertyDesk`
    } else {
      // 기본 브랜딩으로 복원
      const root = document.documentElement
      root.style.setProperty('--tenant-primary', '#3b82f6')
      root.style.setProperty('--tenant-secondary', '#6b7280')
      root.style.setProperty('--tenant-accent', '#f59e0b')
      document.title = 'PropertyDesk - 부동산 관리 플랫폼'
    }
  }, [tenant])

  const contextValue: TenantContextType = {
    tenant,
    isLoading,
    error,
    switchTenant,
    updateTenant,
    getTenantStats,
    hasFeature,
    canCreateProperty,
    canInviteUser,
    isWithinLimits,
  }

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  )
}

// 테넌트 컨텍스트 훅
export const useTenant = () => {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant는 TenantProvider 내에서 사용되어야 합니다.')
  }
  return context
}

// 테넌트 요구 가드 컴포넌트
interface TenantGuardProps {
  children: ReactNode
  fallback?: ReactNode
  requireFeatures?: string[]
}

export const TenantGuard: React.FC<TenantGuardProps> = ({ 
  children, 
  fallback = <div>테넌트를 선택해주세요.</div>,
  requireFeatures = []
}) => {
  const { tenant, hasFeature } = useTenant()

  // 테넌트가 없는 경우
  if (!tenant) {
    return <>{fallback}</>
  }

  // 필요한 기능이 없는 경우
  if (requireFeatures.length > 0) {
    const missingFeatures = requireFeatures.filter(feature => !hasFeature(feature))
    if (missingFeatures.length > 0) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            이 기능을 사용하려면 다음 기능이 필요합니다: {missingFeatures.join(', ')}
          </p>
          <p className="text-sm text-yellow-600 mt-1">
            요금제를 업그레이드하거나 관리자에게 문의하세요.
          </p>
        </div>
      )
    }
  }

  return <>{children}</>
}

// 테넌트별 라우팅 헬퍼
export const getTenantUrl = (path: string, tenant?: { slug: string } | null) => {
  if (!tenant) return path
  
  // 서브도메인 방식
  const isProduction = window.location.hostname.includes('propertydesk.com')
  if (isProduction) {
    return `https://${tenant.slug}.propertydesk.com${path}`
  }
  
  // 개발 환경: 경로 방식
  return `/tenant/${tenant.slug}${path}`
}

// 테넌트 설정 훅
export const useTenantSettings = () => {
  const { tenant, updateTenant } = useTenant()
  
  const updateSettings = async (settings: any) => {
    if (!tenant) return
    
    await updateTenant({
      settings: {
        ...tenant.settings,
        ...settings,
      },
    })
  }
  
  return {
    settings: tenant?.settings,
    updateSettings,
    timezone: tenant?.settings.timezone || 'Asia/Seoul',
    currency: tenant?.settings.currency || 'KRW',
    language: tenant?.settings.language || 'ko',
  }
}

// 테넌트 브랜딩 훅
export const useTenantBranding = () => {
  const { tenant, updateTenant } = useTenant()
  
  const updateBranding = async (branding: any) => {
    if (!tenant) return
    
    await updateTenant({
      branding: {
        ...tenant.branding,
        ...branding,
      },
    })
  }
  
  return {
    branding: tenant?.branding,
    updateBranding,
    primaryColor: tenant?.branding.primary_color || '#3b82f6',
    logoUrl: tenant?.branding.logo_url,
  }
}