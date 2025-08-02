// ============================================================================
// 권한 체크 컴포넌트
// ============================================================================

import React from 'react'
import { usePermissions, type WithPermissionProps } from '@/hooks/usePermissions'

// 권한 체크 컴포넌트
export const PermissionGate: React.FC<WithPermissionProps> = ({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}