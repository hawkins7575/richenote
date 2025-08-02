// ============================================================================
// RBAC (Role-Based Access Control) 타입 정의
// ============================================================================

import type { UserRole } from './user'

export interface RoleDefinition {
  role: UserRole
  name: string
  description: string
  permissions: string[]
  hierarchy: number // 0이 최고 권한
}

// 권한 정의
export const PERMISSIONS = {
  // 매물 관리
  'property.create': ['owner', 'manager', 'agent'],
  'property.read': ['owner', 'manager', 'agent', 'viewer'],
  'property.update': ['owner', 'manager', 'agent'],
  'property.delete': ['owner', 'manager'],
  'property.export': ['owner', 'manager'],
  
  // 사용자 관리
  'user.invite': ['owner', 'manager'],
  'user.read': ['owner', 'manager', 'agent'],
  'user.update': ['owner', 'manager'],
  'user.delete': ['owner'],
  'user.role.assign': ['owner'],
  
  // 팀 관리
  'team.read': ['owner', 'manager', 'agent', 'viewer'],
  'team.manage': ['owner', 'manager'],
  
  // 설정 관리
  'settings.read': ['owner', 'manager'],
  'settings.update': ['owner'],
  'settings.billing': ['owner'],
  
  // 분석 및 리포트
  'analytics.read': ['owner', 'manager'],
  'analytics.export': ['owner', 'manager'],
  
  // 테넌트 관리
  'tenant.read': ['owner'],
  'tenant.update': ['owner'],
  'tenant.delete': ['owner'],
} as const

// 역할 정의
export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  owner: {
    role: 'owner',
    name: '업체 대표',
    description: '모든 권한을 가진 업체 소유자',
    permissions: Object.keys(PERMISSIONS),
    hierarchy: 0
  },
  manager: {
    role: 'manager',
    name: '팀장/실장',
    description: '팀 관리 및 매물 관리 권한',
    permissions: [
      'property.create', 'property.read', 'property.update', 'property.delete', 'property.export',
      'user.invite', 'user.read', 'user.update',
      'team.read', 'team.manage',
      'settings.read',
      'analytics.read', 'analytics.export'
    ],
    hierarchy: 1
  },
  agent: {
    role: 'agent',
    name: '중개사',
    description: '매물 등록 및 관리 권한',
    permissions: [
      'property.create', 'property.read', 'property.update',
      'user.read',
      'team.read'
    ],
    hierarchy: 2
  },
  viewer: {
    role: 'viewer',
    name: '조회자',
    description: '읽기 전용 권한',
    permissions: [
      'property.read',
      'team.read'
    ],
    hierarchy: 3
  }
}

// 사용자 초대 관련
export interface UserInvitation {
  id: string
  tenant_id: string
  invited_by: string
  email: string
  role: UserRole
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  invited_at: string
  expires_at: string
  accepted_at?: string
}

// 권한 체크 유틸리티 타입

// 권한 체크 유틸리티 타입
export type PermissionCheck = {
  resource: string
  action: string
}

export type PermissionResult = {
  allowed: boolean
  reason?: string
}