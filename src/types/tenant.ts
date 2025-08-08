// ============================================================================
// 테넌트 (중개업소) 관련 타입 정의
// ============================================================================

export type TenantSubscriptionPlan = 'starter' | 'professional' | 'business' | 'enterprise'

export type TenantStatus = 'active' | 'suspended' | 'trial' | 'inactive'

export interface Tenant {
  id: string
  name: string
  slug: string // URL 친화적 식별자 (abc-realty)
  domain?: string // 커스텀 도메인 (abc.propertydesk.com)
  
  // 구독 정보
  plan: TenantSubscriptionPlan
  status: TenantStatus
  trial_ends_at?: string
  subscription_ends_at?: string
  
  // 비즈니스 정보
  business_registration_number?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  
  // 브랜딩 설정
  branding: TenantBranding
  
  // 사용량 제한
  limits: TenantLimits
  
  // 설정
  settings: TenantSettings
  
  // 메타데이터
  created_at: string
  updated_at: string
  created_by: string // 생성한 사용자 ID
}

export interface TenantBranding {
  logo_url?: string
  primary_color: string
  secondary_color?: string
  accent_color?: string
  custom_css?: string
  favicon_url?: string
}

export interface TenantLimits {
  max_properties: number
  max_users: number
  max_storage_gb: number
  max_api_calls_per_month: number
  features_enabled: string[] // ['crm', 'analytics', 'api_access', 'custom_branding']
}

export interface TenantSettings {
  timezone: string
  date_format: string
  currency: string
  language: string
  
  // 매물 관련 설정
  auto_archive_days?: number
  require_exit_date: boolean
  require_landlord_info: boolean
  
  // 알림 설정
  email_notifications: boolean
  sms_notifications: boolean
  browser_notifications: boolean
  
  // 보안 설정
  require_2fa: boolean
  session_timeout_minutes: number
  allowed_ip_ranges?: string[]
}

// 테넌트 생성 요청
export interface CreateTenantRequest {
  name: string
  slug: string
  plan: TenantSubscriptionPlan
  business_info?: {
    registration_number?: string
    address?: string
    phone?: string
  }
  branding?: Partial<TenantBranding>
}

// 테넌트 업데이트 요청
export interface UpdateTenantRequest {
  name?: string
  branding?: Partial<TenantBranding>
  settings?: Partial<TenantSettings>
}

// 테넌트 통계
export interface TenantStats {
  total_properties: number
  active_properties: number
  total_users: number
  active_users: number
  storage_used_mb: number
  api_calls_this_month: number
  created_this_month: number
}

// 테넌트 컨텍스트 타입
export interface TenantContextType {
  tenant: Tenant | null
  isLoading: boolean
  error: string | null
  
  // 액션
  switchTenant: (tenantId: string) => Promise<void>
  updateTenant: (updates: UpdateTenantRequest) => Promise<void>
  getTenantStats: () => Promise<TenantStats>
  
  // 권한 체크
  hasFeature: (feature: string) => boolean
  canCreateProperty: () => boolean
  canInviteUser: () => boolean
  isWithinLimits: (resource: keyof TenantLimits) => boolean
}