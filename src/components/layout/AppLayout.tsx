// ============================================================================
// 메인 애플리케이션 레이아웃
// ============================================================================

import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Plus, Users, Settings, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { useTenant } from '@/contexts/TenantContext'
import { UserMenu } from './UserMenu'
import { cn } from '@/utils/cn'

interface AppLayoutProps {
  children: React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { tenant } = useTenant()
  const location = useLocation()

  const navigation = [
    { name: '대시보드', href: '/', icon: Home },
    { name: '매물 관리', href: '/properties', icon: Home },
    { name: '팀 관리', href: '/team', icon: Users },
    { name: '설정', href: '/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 모바일 사이드바 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${tenant?.branding.primary_color || '#3b82f6'}, ${tenant?.branding.secondary_color || '#1d4ed8'})` 
                }}
              >
                <Home size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {tenant?.name || 'PropertyDesk'}
                </h1>
                <p className="text-xs text-gray-500">{tenant?.plan} 플랜</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* 매물 등록 버튼 */}
          <div className="p-4">
            <Link to="/properties?create=true">
              <Button
                fullWidth
                variant="tenant"
                leftIcon={<Plus size={18} />}
                className="justify-center"
              >
                매물 등록
              </Button>
            </Link>
          </div>

          {/* 네비게이션 */}
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const isCurrent = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isCurrent
                      ? 'bg-primary-50 text-primary-700 border-primary-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* 하단 정보 */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p>매물: {tenant?.limits.max_properties || 0}개 제한</p>
              <p>사용자: {tenant?.limits.max_users || 0}명 제한</p>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="lg:ml-64">
        {/* 상단 헤더 */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
            >
              <Menu size={20} />
            </button>
            <h2 className="ml-4 lg:ml-0 text-lg font-semibold text-gray-900">
              매물장
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <UserMenu />
          </div>
        </header>

        {/* 페이지 컨텐츠 */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export { AppLayout }