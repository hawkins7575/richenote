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
  const { user, loading, signOut } = useAuth()

  const handleForceSignOut = async () => {
    try {
      await signOut()
      window.location.reload()
    } catch (error) {
      console.error('Force sign out error:', error)
      // 강제로 로컬스토리지 정리
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loading size="lg" text="로딩 중..." />
          <p className="text-sm text-gray-500 mt-4">
            5초 이상 로딩이 지속되면 아래 버튼을 클릭하세요
          </p>
          <button
            onClick={handleForceSignOut}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            강제 로그아웃
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return <>{fallback}</>
  }

  return <>{children}</>
}