// ============================================================================
// 테넌트 레포지토리 - 데이터베이스 접근 레이어
// ============================================================================

import { BaseRepository } from "./BaseRepository";
import type { Tenant, TenantStats } from "@/types/tenant";
import { logger } from "@/utils/logger";

export interface CreateTenantData {
  name: string;
  slug: string;
  plan: "starter" | "professional" | "business" | "enterprise";
  created_by: string;
  branding?: Record<string, unknown>;
  business_info?: {
    registration_number?: string;
    address?: string;
    phone?: string;
  };
}

export interface UpdateTenantData {
  name?: string;
  slug?: string;
  plan?: Tenant["plan"];
  status?: Tenant["status"];
  branding?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  business_registration_number?: string;
  address?: string;
  phone?: string;
}

export class TenantRepository extends BaseRepository<Tenant> {
  constructor() {
    super("tenants");
  }

  /**
   * 슬러그로 테넌트 조회
   */
  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.findOne({ slug });
  }

  /**
   * 도메인으로 테넌트 조회
   */
  async findByDomain(domain: string): Promise<Tenant | null> {
    return this.findOne({ domain });
  }

  /**
   * 사용자의 테넌트 목록 조회
   */
  async findByUserId(userId: string): Promise<Tenant[]> {
    try {
      const { data, error } = await this.client
        .from("tenants")
        .select(
          `
          *,
          users!inner(id, role, status)
        `,
        )
        .eq("users.id", userId)
        .eq("users.status", "active");

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error("Failed to find tenants by user ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "TenantRepository",
        action: "findByUserId",
        userId,
      });
      throw error;
    }
  }

  /**
   * 플랜별 제한사항을 포함한 테넌트 생성
   */
  async createWithPlanLimits(data: CreateTenantData): Promise<Tenant> {
    try {
      // 슬러그 중복 확인
      const existing = await this.findBySlug(data.slug);
      if (existing) {
        throw new Error("이미 사용 중인 업체명입니다.");
      }

      // 플랜별 제한사항 설정
      const planLimits = this.getPlanLimits(data.plan);

      const tenantData = {
        name: data.name,
        slug: data.slug,
        plan: data.plan,
        status: "trial" as const,
        created_by: data.created_by,
        trial_ends_at: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        branding: {
          primary_color: "#3b82f6",
          secondary_color: "#6b7280",
          accent_color: "#f59e0b",
          ...data.branding,
        },
        limits: planLimits,
        settings: {
          timezone: "Asia/Seoul",
          date_format: "YYYY-MM-DD",
          currency: "KRW",
          language: "ko",
          default_property_status: "거래중",
          require_exit_date: true,
          require_landlord_info: true,
          email_notifications: true,
          sms_notifications: false,
          browser_notifications: true,
          require_2fa: false,
          session_timeout_minutes: 480,
        },
        ...(data.business_info && {
          business_registration_number: data.business_info.registration_number,
          address: data.business_info.address,
          phone: data.business_info.phone,
        }),
      };

      return await this.create(tenantData);
    } catch (error) {
      logger.error("Failed to create tenant with plan limits", {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "TenantRepository",
        action: "createWithPlanLimits",
        data,
      });
      throw error;
    }
  }

  /**
   * 테넌트 플랜 업데이트 (제한사항 포함)
   */
  async updatePlan(
    tenantId: string,
    plan: Tenant["plan"],
  ): Promise<Tenant | null> {
    try {
      const planLimits = this.getPlanLimits(plan);

      return await this.update(tenantId, {
        plan,
        limits: planLimits,
      });
    } catch (error) {
      logger.error("Failed to update tenant plan", {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "TenantRepository",
        action: "updatePlan",
        tenantId,
        plan,
      });
      throw error;
    }
  }

  /**
   * 테넌트 통계 조회
   */
  async getStats(tenantId: string): Promise<TenantStats> {
    try {
      const { data, error } = await this.client.rpc("get_tenant_stats", {
        tenant_id: tenantId,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error("Failed to get tenant stats", {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "TenantRepository",
        action: "getStats",
        tenantId,
      });
      throw error;
    }
  }

  /**
   * 테넌트 사용량 확인
   */
  async checkLimits(tenantId: string): Promise<{
    isWithinLimits: boolean;
    usage: Record<string, number>;
    limits: Record<string, number>;
    warnings: string[];
  }> {
    try {
      // 테넌트 정보 조회
      const tenant = await this.findById(tenantId);
      if (!tenant) {
        throw new Error("테넌트를 찾을 수 없습니다.");
      }

      // 현재 사용량 조회
      const [propertiesCount, usersCount] = await Promise.all([
        this.count({ tenant_id: tenantId }),
        await this.client
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("tenant_id", tenantId)
          .then(({ count }) => count || 0),
      ]);

      const usage = {
        properties: propertiesCount,
        users: usersCount,
        storage_gb: Math.round(Math.random() * 5), // 임시: 실제 스토리지 계산 필요
        api_calls: Math.round(Math.random() * 1000), // 임시: 실제 API 사용량 계산 필요
      };

      const limits = tenant.limits;
      const warnings: string[] = [];
      let isWithinLimits = true;

      // 제한 확인
      if (usage.properties >= limits.max_properties) {
        isWithinLimits = false;
        warnings.push(
          `매물 개수가 한도(${limits.max_properties}개)에 도달했습니다.`,
        );
      } else if (usage.properties >= limits.max_properties * 0.9) {
        warnings.push(
          `매물 개수가 한도의 90%에 도달했습니다. (${usage.properties}/${limits.max_properties})`,
        );
      }

      if (usage.users >= limits.max_users) {
        isWithinLimits = false;
        warnings.push(
          `사용자 수가 한도(${limits.max_users}명)에 도달했습니다.`,
        );
      } else if (usage.users >= limits.max_users * 0.9) {
        warnings.push(
          `사용자 수가 한도의 90%에 도달했습니다. (${usage.users}/${limits.max_users})`,
        );
      }

      // limits에서 숫자형 속성만 추출
      const numericLimits: Record<string, number> = {
        max_properties: limits.max_properties,
        max_users: limits.max_users,
        max_storage_gb: limits.max_storage_gb,
        max_api_calls_per_month: limits.max_api_calls_per_month,
      };

      return {
        isWithinLimits,
        usage,
        limits: numericLimits,
        warnings,
      };
    } catch (error) {
      logger.error("Failed to check tenant limits", {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "TenantRepository",
        action: "checkLimits",
        tenantId,
      });
      throw error;
    }
  }

  /**
   * 플랜별 제한사항 반환
   */
  private getPlanLimits(plan: Tenant["plan"]) {
    const planLimits = {
      starter: {
        max_properties: 50,
        max_users: 2,
        max_storage_gb: 1,
        max_api_calls_per_month: 1000,
        features_enabled: [],
      },
      professional: {
        max_properties: 300,
        max_users: 8,
        max_storage_gb: 10,
        max_api_calls_per_month: 10000,
        features_enabled: ["crm", "analytics"],
      },
      business: {
        max_properties: 1000,
        max_users: 25,
        max_storage_gb: 100,
        max_api_calls_per_month: 100000,
        features_enabled: ["crm", "analytics", "api_access", "custom_branding"],
      },
      enterprise: {
        max_properties: 999999,
        max_users: 999999,
        max_storage_gb: 999999,
        max_api_calls_per_month: 999999,
        features_enabled: [
          "crm",
          "analytics",
          "api_access",
          "custom_branding",
          "sso",
          "advanced_security",
        ],
      },
    };

    return planLimits[plan];
  }
}
