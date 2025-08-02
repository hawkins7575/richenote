// ============================================================================
// 권한 관리 훅
// ============================================================================

import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PERMISSIONS, ROLE_DEFINITIONS, type UserRole, type PermissionCheck, type PermissionResult } from '@/types'

export const usePermissions = () => {
  const { user } = useAuth()

  // 사용자의 역할과 권한 정보
  const userRole = user?.role as UserRole
  const roleDefinition = userRole ? ROLE_DEFINITIONS[userRole] : null

  // 권한 체크 함수
  const hasPermission = useMemo(() => {
    return (permission: string): boolean => {
      if (!user || !userRole) return false
      
      // 권한이 정의되어 있는지 확인
      const allowedRoles = PERMISSIONS[permission as keyof typeof PERMISSIONS]
      if (!allowedRoles) return false

      // 사용자의 역할이 허용된 역할에 포함되는지 확인
      return (allowedRoles as readonly UserRole[]).includes(userRole)
    }
  }, [user, userRole])

  // 복수 권한 체크
  const hasAnyPermission = useMemo(() => {
    return (permissions: string[]): boolean => {
      return permissions.some(permission => hasPermission(permission))
    }
  }, [hasPermission])

  // 모든 권한 체크
  const hasAllPermissions = useMemo(() => {
    return (permissions: string[]): boolean => {
      return permissions.every(permission => hasPermission(permission))
    }
  }, [hasPermission])

  // 리소스별 권한 체크
  const checkPermission = useMemo(() => {
    return ({ resource, action }: PermissionCheck): PermissionResult => {
      const permissionKey = `${resource}.${action}`
      const allowed = hasPermission(permissionKey)
      
      return {
        allowed,
        reason: allowed ? undefined : `권한이 없습니다: ${permissionKey}`
      }
    }
  }, [hasPermission])

  // 역할 계층 체크 (상위 역할은 하위 역할의 권한을 모두 가짐)
  const canManageRole = useMemo(() => {
    return (targetRole: UserRole): boolean => {
      if (!userRole || !roleDefinition) return false
      
      const targetRoleDefinition = ROLE_DEFINITIONS[targetRole]
      return roleDefinition.hierarchy < targetRoleDefinition.hierarchy
    }
  }, [userRole, roleDefinition])

  // 권한별 액션 가능 여부
  const can = useMemo(() => ({
    // 매물 관리
    createProperty: hasPermission('property.create'),
    readProperty: hasPermission('property.read'),
    updateProperty: hasPermission('property.update'),
    deleteProperty: hasPermission('property.delete'),
    exportProperty: hasPermission('property.export'),
    
    // 사용자 관리
    inviteUser: hasPermission('user.invite'),
    readUser: hasPermission('user.read'),
    updateUser: hasPermission('user.update'),
    deleteUser: hasPermission('user.delete'),
    assignRole: hasPermission('user.role.assign'),
    
    // 팀 관리
    readTeam: hasPermission('team.read'),
    manageTeam: hasPermission('team.manage'),
    
    // 설정 관리
    readSettings: hasPermission('settings.read'),
    updateSettings: hasPermission('settings.update'),
    manageBilling: hasPermission('settings.billing'),
    
    // 분석 및 리포트
    readAnalytics: hasPermission('analytics.read'),
    exportAnalytics: hasPermission('analytics.export'),
    
    // 테넌트 관리
    readTenant: hasPermission('tenant.read'),
    updateTenant: hasPermission('tenant.update'),
    deleteTenant: hasPermission('tenant.delete'),
  }), [hasPermission])

  return {
    user,
    userRole,
    roleDefinition,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkPermission,
    canManageRole,
    can
  }
}

// 권한이 필요한 컴포넌트를 위한 HOC 타입
export interface WithPermissionProps {
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}