// ============================================================================
// PropertyDesk SaaS - 메인 애플리케이션 컴포넌트
// ============================================================================

import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { TenantProvider } from '@/contexts/TenantContext'
import { AuthGuard } from '@/components/auth'
import { AppLayout } from '@/components/layout'
import { InstallPrompt } from '@/components/ui/InstallPrompt'
import { DashboardPage } from '@/pages/DashboardPage'
import { PropertiesPageNew } from '@/pages/PropertiesPageNew'
import { TeamPage } from '@/pages/TeamPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { UserGuidePage } from '@/pages/UserGuidePage'
import { InvitationAccept } from '@/components/team/InvitationAccept'
import '@/styles/globals.css'

function App() {

  return (
    <AuthProvider>
      <TenantProvider>
        <Router>
        <Routes>
          {/* 팀 초대 수락 페이지 - AuthGuard 없이 접근 가능 */}
          <Route path="/team/invite" element={<InvitationAccept />} />
          
          {/* 인증이 필요한 페이지들 */}
          <Route path="/*" element={
            <AuthGuard>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/properties" element={<PropertiesPageNew />} />
                  <Route path="/team" element={<TeamPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/guide" element={<UserGuidePage />} />
                  
                  {/* 테넌트별 라우팅 */}
                  <Route path="/tenant/:tenantSlug/*" element={<TenantRoutes />} />
                  
                  {/* 404 처리 */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                
                {/* PWA 설치 프롬프트 */}
                <InstallPrompt />
              </AppLayout>
            </AuthGuard>
          } />
        </Routes>
        </Router>
      </TenantProvider>
    </AuthProvider>
  )
}

// 테넌트별 라우팅 처리
const TenantRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/properties" element={<PropertiesPageNew />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/guide" element={<UserGuidePage />} />
    </Routes>
  )
}

export default App