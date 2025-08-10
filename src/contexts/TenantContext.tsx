// ============================================================================
// 테넌트 컨텍스트 (React Context + Zustand 통합)
// ============================================================================

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase";
import type { TenantContextType, TenantStats } from "@/types/tenant";

const TenantContext = createContext<TenantContextType | null>(null);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const { user } = useAuth(); // 인증된 사용자 정보 가져오기

  // Local state management instead of Zustand
  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tenant management functions
  const switchTenant = async (tenantId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantId)
        .single();

      if (error) throw error;
      setTenant(data);
      setError(null);
    } catch (err) {
      console.error("Failed to switch tenant:", err);
      setError("테넌트 전환에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTenant = async (updates: any) => {
    if (!tenant) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tenants")
        .update(updates)
        .eq("id", tenant.id)
        .select()
        .single();

      if (error) throw error;
      setTenant(data);
      setError(null);
    } catch (err) {
      console.error("Failed to update tenant:", err);
      setError("테넌트 업데이트에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTenantStats = async (): Promise<TenantStats> => {
    if (!tenant) {
      // Return default stats if no tenant
      return {
        total_properties: 0,
        active_properties: 0,
        total_users: 0,
        active_users: 0,
        storage_used_mb: 0,
        api_calls_this_month: 0,
        created_this_month: 0,
      };
    }

    try {
      const { data, error } = await supabase
        .from("properties")
        .select("id, status, created_at")
        .eq("tenant_id", tenant.id);

      if (error) throw error;

      const stats: TenantStats = {
        total_properties: data.length,
        active_properties: data.length, // 모든 매물을 활성으로 처리 (상태 삭제)
        total_users: 1, // Simplified - would need actual user count
        active_users: 1, // Simplified - would need actual active user count
        storage_used_mb: 0, // Simplified - would need actual storage calculation
        api_calls_this_month: 0, // Simplified - would need actual API call tracking
        created_this_month: data.filter((p) => {
          const created = new Date(p.created_at || Date.now());
          const now = new Date();
          return (
            created.getMonth() === now.getMonth() &&
            created.getFullYear() === now.getFullYear()
          );
        }).length,
      };

      return stats;
    } catch (err) {
      console.error("Failed to get tenant stats:", err);
      // Return default stats on error
      return {
        total_properties: 0,
        active_properties: 0,
        total_users: 0,
        active_users: 0,
        storage_used_mb: 0,
        api_calls_this_month: 0,
        created_this_month: 0,
      };
    }
  };

  const hasFeature = (feature: string) => {
    return tenant?.limits?.features_enabled?.includes(feature) || false;
  };

  const canCreateProperty = () => {
    if (!tenant?.limits) return true;
    // Simplified - would need actual property count check
    return true;
  };

  const canInviteUser = () => {
    if (!tenant?.limits) return true;
    // Simplified - would need actual user count check
    return true;
  };

  const isWithinLimits = (_resource: string) => {
    if (!tenant?.limits) return true;
    // Simplified - would need actual resource usage check
    return true;
  };

  // 페이지 로드 시 URL에서 테넌트 감지 또는 자동 테넌트 설정
  useEffect(() => {
    console.log("🏢 TenantContext useEffect 실행:", {
      user: user?.id,
      tenant: tenant?.id,
    });

    // 사용자별 개별 테넌트 자동 설정
    if (user && !tenant) {
      console.log("🏢 사용자별 개별 테넌트 설정 시작:", user.id);

      // 사용자별 개별 테넌트를 실제 DB에 생성/조회
      const initializeTenant = async () => {
        setIsLoading(true);
        
        // 개발환경에서는 모사 데이터 사용 (환경변수가 없을 때만)
        if (!import.meta.env.VITE_SUPABASE_URL) {
          console.log("🔧 개발환경: 모사 테넌트 데이터 사용");
          const mockTenant = {
            id: user.id,
            name: `${user.name || "사용자"}의 부동산`,
            slug: `user-${user.id}`,
            plan: "starter" as const,
            status: "active" as const,
            branding: {
              primary_color: "#3b82f6",
              secondary_color: "#1d4ed8",
              accent_color: "#f59e0b",
            },
            limits: {
              max_properties: 50,
              max_users: 2,
              max_storage_gb: 1,
              max_api_calls_per_month: 1000,
              features_enabled: ["basic"],
            },
            settings: {
              timezone: "Asia/Seoul",
              date_format: "YYYY-MM-DD",
              currency: "KRW",
              language: "ko",
              require_exit_date: true,
              require_landlord_info: true,
              email_notifications: true,
              sms_notifications: false,
              browser_notifications: true,
              require_2fa: false,
              session_timeout_minutes: 480,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: user.id,
          };
          setTenant(mockTenant);
          setError(null);
          setIsLoading(false);
          return;
        }

        try {
          // 1. 기존 테넌트 조회 (프로덕션 환경에서만)
          console.log("🔍 기존 테넌트 조회 중:", user.id);
          const { data: existingTenant, error: queryError } = await supabase
            .from("tenants")
            .select("*")
            .eq("id", user.id)
            .single();

          console.log("🔍 조회 결과:", { existingTenant, queryError });

          if (existingTenant && !queryError) {
            // 기존 테넌트가 있으면 상태에 설정 (추가 속성 포함)
            const fullTenant = {
              ...existingTenant,
              branding: {
                primary_color: "#3b82f6",
                secondary_color: "#1d4ed8",
                accent_color: "#f59e0b",
              },
              limits: {
                max_properties: 50,
                max_users: 2,
                max_storage_gb: 1,
                max_api_calls_per_month: 1000,
                features_enabled: ["basic"],
              },
              settings: {
                timezone: "Asia/Seoul",
                date_format: "YYYY-MM-DD",
                currency: "KRW",
                language: "ko",
                require_exit_date: true,
                require_landlord_info: true,
                email_notifications: true,
                sms_notifications: false,
                browser_notifications: true,
                require_2fa: false,
                session_timeout_minutes: 480,
              },
            };
            setTenant(fullTenant);
            setError(null);
            console.log("✅ 기존 테넌트 조회 완료:", existingTenant.name);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.log("🔍 기존 테넌트 조회 중 오류:", error);
          // 오류 발생시 모사 데이터로 fallback
          console.log("🔧 오류로 인한 모사 테넌트 데이터 사용");
          const mockTenant = {
            id: user.id,
            name: `${user.name || "사용자"}의 부동산`,
            slug: `user-${user.id}`,
            plan: "starter" as const,
            status: "active" as const,
            branding: {
              primary_color: "#3b82f6",
              secondary_color: "#1d4ed8",
              accent_color: "#f59e0b",
            },
            limits: {
              max_properties: 50,
              max_users: 2,
              max_storage_gb: 1,
              max_api_calls_per_month: 1000,
              features_enabled: ["basic"],
            },
            settings: {
              timezone: "Asia/Seoul",
              date_format: "YYYY-MM-DD",
              currency: "KRW",
              language: "ko",
              require_exit_date: true,
              require_landlord_info: true,
              email_notifications: true,
              sms_notifications: false,
              browser_notifications: true,
              require_2fa: false,
              session_timeout_minutes: 480,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: user.id,
          };
          setTenant(mockTenant);
          setError(null);
          setIsLoading(false);
          return;
        }

        // 테넌트가 없으면 새로 생성
        console.log("📝 새 테넌트 생성 필요");

        try {
          // 2. 새 테넌트 생성
          const userTenant = {
            id: user.id, // 사용자 ID = 테넌트 ID
            name: "PropertyDesk 베타",
          };

          console.log("📝 테넌트 생성 시작:", userTenant);
          const { data: newTenant, error: createError } = await supabase
            .from("tenants")
            .insert(userTenant)
            .select()
            .single();

          console.log("📝 테넌트 생성 결과:", { newTenant, createError });

          if (createError) {
            console.error("❌ 테넌트 생성 실패:", createError);
            throw createError;
          }

          // 생성된 테넌트를 상태에 설정 (추가 속성 포함)
          const fullTenant = {
            ...newTenant,
            branding: {
              primary_color: "#3b82f6",
              secondary_color: "#1d4ed8",
              accent_color: "#f59e0b",
            },
            limits: {
              max_properties: 1000,
              max_users: 10,
              max_storage_gb: 10,
              max_api_calls_per_month: 50000,
              features_enabled: [
                "advanced_analytics",
                "api_access",
                "custom_fields",
              ],
            },
            settings: {
              timezone: "Asia/Seoul",
              date_format: "YYYY-MM-DD",
              currency: "KRW",
              language: "ko",
              // default_property_status: 매물 상태 필드 삭제됨
              require_exit_date: true,
              require_landlord_info: true,
              email_notifications: true,
              sms_notifications: false,
              browser_notifications: true,
              require_2fa: false,
              session_timeout_minutes: 480,
            },
          };

          setTenant(fullTenant);
          setError(null);

          console.log(
            "✅ 새 테넌트 생성 완료:",
            newTenant.name,
            "User ID:",
            user.id,
          );
        } catch (error) {
          console.error("❌ 테넌트 초기화 실패:", error);
          setTenant(null);
          setError("테넌트 초기화에 실패했습니다.");
        } finally {
          setIsLoading(false);
        }
      };

      initializeTenant();
    }
  }, [user, tenant]); // user 의존성 추가

  // 테넌트별 CSS 변수 설정 (동적 브랜딩)
  useEffect(() => {
    if (tenant?.branding) {
      const root = document.documentElement;
      root.style.setProperty("--tenant-primary", tenant.branding.primary_color);
      root.style.setProperty(
        "--tenant-secondary",
        tenant.branding.secondary_color || "#6b7280",
      );
      root.style.setProperty(
        "--tenant-accent",
        tenant.branding.accent_color || "#f59e0b",
      );

      // 파비콘 업데이트
      if (tenant.branding.favicon_url) {
        const favicon = document.querySelector(
          'link[rel="icon"]',
        ) as HTMLLinkElement;
        if (favicon) {
          favicon.href = tenant.branding.favicon_url;
        }
      }

      // 페이지 타이틀 업데이트
      document.title = `${tenant.name} - PropertyDesk`;
    } else {
      // 기본 브랜딩으로 복원
      const root = document.documentElement;
      root.style.setProperty("--tenant-primary", "#3b82f6");
      root.style.setProperty("--tenant-secondary", "#6b7280");
      root.style.setProperty("--tenant-accent", "#f59e0b");
      document.title = "PropertyDesk - 부동산 관리 플랫폼";
    }
  }, [tenant]);

  const contextValue: TenantContextType = {
    tenant,
    isLoading,
    error,
    switchTenant,
    updateTenant,
    getTenantStats,
    hasFeature,
    canCreateProperty,
    canInviteUser,
    isWithinLimits,
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};

// 테넌트 컨텍스트 훅
export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant는 TenantProvider 내에서 사용되어야 합니다.");
  }
  return context;
};

// 테넌트 요구 가드 컴포넌트
interface TenantGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireFeatures?: string[];
}

export const TenantGuard: React.FC<TenantGuardProps> = ({
  children,
  fallback = <div>테넌트를 선택해주세요.</div>,
  requireFeatures = [],
}) => {
  const { tenant, hasFeature } = useTenant();

  // 테넌트가 없는 경우
  if (!tenant) {
    return <>{fallback}</>;
  }

  // 필요한 기능이 없는 경우
  if (requireFeatures.length > 0) {
    const missingFeatures = requireFeatures.filter(
      (feature) => !hasFeature(feature),
    );
    if (missingFeatures.length > 0) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            이 기능을 사용하려면 다음 기능이 필요합니다:{" "}
            {missingFeatures.join(", ")}
          </p>
          <p className="text-sm text-yellow-600 mt-1">
            요금제를 업그레이드하거나 관리자에게 문의하세요.
          </p>
        </div>
      );
    }
  }

  return <>{children}</>;
};

// 테넌트별 라우팅 헬퍼
export const getTenantUrl = (
  path: string,
  tenant?: { slug: string } | null,
) => {
  if (!tenant) return path;

  // 서브도메인 방식
  const isProduction = window.location.hostname.includes("propertydesk.com");
  if (isProduction) {
    return `https://${tenant.slug}.propertydesk.com${path}`;
  }

  // 개발 환경: 경로 방식
  return `/tenant/${tenant.slug}${path}`;
};

// 테넌트 설정 훅
export const useTenantSettings = () => {
  const { tenant, updateTenant } = useTenant();

  const updateSettings = async (settings: any) => {
    if (!tenant) return;

    await updateTenant({
      settings: {
        ...tenant.settings,
        ...settings,
      },
    });
  };

  return {
    settings: tenant?.settings,
    updateSettings,
    timezone: tenant?.settings.timezone || "Asia/Seoul",
    currency: tenant?.settings.currency || "KRW",
    language: tenant?.settings.language || "ko",
  };
};

// 테넌트 브랜딩 훅
export const useTenantBranding = () => {
  const { tenant, updateTenant } = useTenant();

  const updateBranding = async (branding: any) => {
    if (!tenant) return;

    await updateTenant({
      branding: {
        ...tenant.branding,
        ...branding,
      },
    });
  };

  return {
    branding: tenant?.branding,
    updateBranding,
    primaryColor: tenant?.branding.primary_color || "#3b82f6",
    logoUrl: tenant?.branding.logo_url,
  };
};
