// ============================================================================
// 테넌트 컨텍스트 (React Context)
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
  const { user } = useAuth();

  // Local state management
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
        active_properties: data.length,
        total_users: 1,
        active_users: 1,
        storage_used_mb: 0,
        api_calls_this_month: 0,
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
    return true;
  };

  const canInviteUser = () => {
    if (!tenant?.limits) return true;
    return true;
  };

  const isWithinLimits = (_resource: string) => {
    if (!tenant?.limits) return true;
    return true;
  };

  // 사용자별 개별 테넌트 자동 설정
  useEffect(() => {
    console.log("🏢 TenantContext useEffect 실행:", {
      user: user?.id,
      tenant: tenant?.id,
    });

    if (user && !tenant) {
      console.log("🏢 사용자별 개별 테넌트 설정 시작:", user.id);

      const initializeTenant = async () => {
        setIsLoading(true);
        
        // 모사 테넌트 데이터 사용 (테넌트 테이블 미구현 상태)
        console.log("🔧 모사 테넌트 데이터 사용");
        const mockTenant = {
          id: user.id,
          name: `${user.name || "사용자"}의 부동산`,
          slug: `user-${user.id}`,
          plan: "starter" as const,
          status: "trial" as const,
          trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
      };

      initializeTenant();
    }
  }, [user, tenant]);

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

      // 페이지 타이틀 업데이트
      document.title = `${tenant.name} - PropertyDesk`;
    }
  }, [tenant]);

  const value: TenantContextType = {
    // State
    tenant,
    isLoading,
    error,

    // Actions
    switchTenant,
    updateTenant,

    // Utilities
    getTenantStats,
    hasFeature,
    canCreateProperty,
    canInviteUser,
    isWithinLimits,
  };

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
};

// Custom hook to use tenant context
export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
};

// 테넌트 URL 생성 유틸리티
export const getTenantUrl = (tenant: any, path = "") => {
  if (!tenant?.slug) return path;

  // 프로덕션 환경에서는 서브도메인 방식 사용 가능
  if (process.env.NODE_ENV === "production") {
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