// ============================================================================
// 인증 가드 - 로그인 필수 컴포넌트
// ============================================================================

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoginPage } from './LoginPage'
import { Loading } from '@/components/ui'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback = <LoginPage /> 
}) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="로딩 중..." />
      </div>
    )
  }

  if (!user) {
    return <>{fallback}</>
  }

  return <>{children}</>
}