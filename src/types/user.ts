// ============================================================================
// 사용자 및 권한 관련 타입 정의
// ============================================================================

export type UserRole = 'owner' | 'manager' | 'agent' | 'viewer'

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended'

export interface User {
  id: string
  tenant_id: string
  
  // 기본 정보
  email: string
  full_name: string
  avatar_url?: string
  phone?: string
  
  // 역할 및 권한
  role: UserRole
  status: UserStatus
  permissions: Permission[]
  
  // 업무 정보
  employee_id?: string
  department?: string
  hire_date?: string
  
  // 설정
  preferences: UserPreferences
  
  // 메타데이터
  created_at: string
  updated_at: string
  last_login_at?: string
  invited_by?: string
}

export interface Permission {
  id: string
  name: string
  resource: string // 'property', 'user', 'tenant', 'billing'
  action: string   // 'create', 'read', 'update', 'delete'
  conditions?: Record<string, any> // 추가 조건 (자신의 데이터만 수정 가능 등)
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  dashboard_layout: string[]
  notification_settings: {
    email: boolean
    sms: boolean
    browser: boolean
    frequency: 'instant' | 'hourly' | 'daily'
  }
  property_view_mode: 'card' | 'list'
  items_per_page: number
}

// 사용자 초대 요청
export interface InviteUserRequest {
  email: string
  role: UserRole
  full_name?: string
  department?: string
  custom_permissions?: string[]
}

// 사용자 생성 (회원가입)
export interface CreateUserRequest {
  email: string
  password: string
  full_name: string
  tenant_id?: string // 신규 테넌트 생성 시에는 없음
}

// 사용자 업데이트
export interface UpdateUserRequest {
  full_name?: string
  phone?: string
  avatar_url?: string
  role?: UserRole
  status?: UserStatus
  department?: string
  preferences?: Partial<UserPreferences>
}

// 역할별 기본 권한 정의
export const DEFAULT_PERMISSIONS: Record<UserRole, string[]> = {
  owner: [
    'property.*', 'user.*', 'tenant.*', 'billing.*', 'analytics.*'
  ],
  manager: [
    'property.*', 'user.read', 'user.invite', 'analytics.read'
  ],
  agent: [
    'property.create', 'property.read', 'property.update.own', 
    'customer.create', 'customer.read', 'customer.update.own'
  ],
  viewer: [
    'property.read', 'customer.read'
  ]
}

// 사용자 활동 로그
export interface UserActivity {
  id: string
  user_id: string
  tenant_id: string
  action: string
  resource: string
  resource_id?: string
  metadata?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

// 사용자 컨텍스트 타입
export interface UserContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  
  // 액션
  updateUser: (updates: UpdateUserRequest) => Promise<void>
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>
  
  // 권한 체크
  hasPermission: (permission: string) => boolean
  canAccess: (resource: string, action: string) => boolean
  isOwner: () => boolean
  isManager: () => boolean
  
  // 활동 로그
  logActivity: (action: string, resource: string, metadata?: Record<string, any>) => void
}