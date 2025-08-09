// ============================================================================
// 테넌트 서비스 레이어
// ============================================================================

import { handleSupabaseError } from "@/lib/supabase";
import { tenantRepository } from "@/lib/repository";
import type {
  Tenant,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantStats,
} from "@/types/tenant";

export class TenantService {
  /**
   * 테넌트 조회 (ID)
   */
  static async getTenantById(id: string): Promise<Tenant> {
    try {
      const tenant = await tenantRepository.findById(id);
      if (!tenant) {
        throw new Error("테넌트를 찾을 수 없습니다.");
      }
      return tenant;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }

  /**
   * 테넌트 조회 (슬러그)
   */
  static async getTenantBySlug(slug: string): Promise<Tenant> {
    try {
      const tenant = await tenantRepository.findBySlug(slug);
      if (!tenant) {
        throw new Error("테넌트를 찾을 수 없습니다.");
      }
      return tenant;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }

  /**
   * 테넌트 조회 (도메인)
   */
  static async getTenantByDomain(domain: string): Promise<Tenant> {
    try {
      const tenant = await tenantRepository.findByDomain(domain);
      if (!tenant) {
        throw new Error("테넌트를 찾을 수 없습니다.");
      }
      return tenant;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }

  /**
   * 사용자의 테넌트 목록 조회
   */
  static async getUserTenants(userId: string): Promise<Tenant[]> {
    try {
      return await tenantRepository.findByUserId(userId);
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }

  /**
   * 테넌트 생성
   */
  static async createTenant(
    request: CreateTenantRequest,
    createdBy: string,
  ): Promise<Tenant> {
    try {
      return await tenantRepository.createWithPlanLimits({
        name: request.name,
        slug: request.slug,
        plan: request.plan,
        created_by: createdBy,
        branding: request.branding,
        business_info: request.business_info,
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }

  /**
   * 테넌트 업데이트
   */
  static async updateTenant(
    tenantId: string,
    updates: UpdateTenantRequest,
  ): Promise<Tenant> {
    try {
      const tenant = await tenantRepository.update(tenantId, updates as any);
      if (!tenant) {
        throw new Error("테넌트를 찾을 수 없습니다.");
      }
      return tenant;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }

  /**
   * 테넌트 상태 변경
   */
  static async updateTenantStatus(
    tenantId: string,
    status: Tenant["status"],
  ): Promise<void> {
    try {
      await tenantRepository.update(tenantId, { status });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }

  /**
   * 테넌트 플랜 변경
   */
  static async updateTenantPlan(
    tenantId: string,
    plan: Tenant["plan"],
  ): Promise<void> {
    try {
      await tenantRepository.updatePlan(tenantId, plan);
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }

  /**
   * 테넌트 통계 조회
   */
  static async getTenantStats(tenantId: string): Promise<TenantStats> {
    try {
      return await tenantRepository.getStats(tenantId);
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }

  /**
   * 테넌트 삭제 (주의: 모든 관련 데이터 삭제)
   */
  static async deleteTenant(tenantId: string): Promise<void> {
    try {
      await tenantRepository.delete(tenantId);
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }

  /**
   * 테넌트 사용량 확인
   */
  static async checkTenantLimits(tenantId: string): Promise<{
    isWithinLimits: boolean;
    usage: Record<string, number>;
    limits: Record<string, number>;
    warnings: string[];
  }> {
    try {
      return await tenantRepository.checkLimits(tenantId);
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }
}
