// ============================================================================
// PropertyDesk SaaS - 메인 애플리케이션 컴포넌트
// ============================================================================

import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { AuthGuard } from "@/components/auth";
import { AppLayout } from "@/components/layout";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { InstallPrompt } from "@/components/ui/InstallPrompt";
import { Loading } from "@/components/ui/Loading";
import "@/styles/globals.css";

// 지연 로딩 컴포넌트들 - 성능 최적화
const DashboardPage = lazy(() => import("@/pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const PropertiesPageNew = lazy(() => import("@/pages/PropertiesPageNew").then(m => ({ default: m.PropertiesPageNew })));
const SchedulePage = lazy(() => import("@/pages/SchedulePage"));
const TeamPage = lazy(() => import("@/pages/TeamPage").then(m => ({ default: m.TeamPage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const UserGuidePage = lazy(() => import("@/pages/UserGuidePage").then(m => ({ default: m.UserGuidePage })));
const InvitationAccept = lazy(() => import("@/components/team/InvitationAccept").then(m => ({ default: m.InvitationAccept })));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TenantProvider>
          <Router>
            <Routes>
              {/* 팀 초대 수락 페이지 - AuthGuard 없이 접근 가능 */}
              <Route path="/team/invite" element={
                <Suspense fallback={<Loading />}>
                  <InvitationAccept />
                </Suspense>
              } />

              {/* 인증이 필요한 페이지들 */}
              <Route
                path="/*"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <Suspense fallback={<Loading />}>
                        <Routes>
                          <Route path="/" element={<DashboardPage />} />
                          <Route
                            path="/properties"
                            element={<PropertiesPageNew />}
                          />
                          <Route path="/schedule" element={<SchedulePage />} />
                          <Route path="/team" element={<TeamPage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/guide" element={<UserGuidePage />} />

                          {/* 테넌트별 라우팅 */}
                          <Route
                            path="/tenant/:tenantSlug/*"
                            element={<TenantRoutes />}
                          />

                          {/* 404 처리 */}
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </Suspense>

                      {/* PWA 설치 프롬프트 */}
                      <InstallPrompt />
                    </AppLayout>
                  </AuthGuard>
                }
              />
            </Routes>
        </Router>
      </TenantProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

// 테넌트별 라우팅 처리
const TenantRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/properties" element={<PropertiesPageNew />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/guide" element={<UserGuidePage />} />
      </Routes>
    </Suspense>
  );
};

export default App;
