// ============================================================================
// 매물 관리 서비스 V2 - Repository 패턴 적용
// ============================================================================

import { propertyRepository } from "@/lib/repository";
import { supabase } from "./supabase";
import type {
  SimplePropertyFilters,
  CreatePropertyData,
  UpdatePropertyData,
  Property,
} from "@/types";
import { logger } from "@/utils/logger";

/**
 * 개선된 매물 조회 서비스
 * Repository 패턴과 QueryBuilder를 활용하여 복잡한 쿼리 로직을 단순화
 */
export class PropertyServiceV2 {
  /**
   * 매물 목록 조회 (테넌트별)
   */
  static async getProperties(
    userId: string,
    filters?: SimplePropertyFilters,
  ): Promise<Property[]> {
    try {
      logger.info("매물 목록 조회 시작", {
        userId,
        filters,
        component: "PropertyServiceV2",
        action: "getProperties",
      });

      // 사용자의 tenant_id 조회
      const tenantId = await this.getUserTenantId(userId);

      // Repository 패턴을 사용한 조회
      const properties = await propertyRepository.findByTenantId(
        tenantId,
        this.convertFiltersToRepositoryFormat(filters),
        {
          orderBy: { column: "created_at", ascending: false },
          limit: filters?.limit || 50,
        },
      );

      logger.info("매물 목록 조회 완료", {
        userId,
        count: properties.length,
        component: "PropertyServiceV2",
        action: "getProperties",
      });

      return properties;
    } catch (error) {
      logger.error("매물 목록 조회 실패", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
        filters,
        component: "PropertyServiceV2",
        action: "getProperties",
      });
      throw error;
    }
  }

  /**
   * 매물 검색
   */
  static async searchProperties(
    userId: string,
    searchTerm: string,
    filters?: SimplePropertyFilters,
  ): Promise<Property[]> {
    try {
      logger.info("매물 검색 시작", {
        userId,
        searchTerm,
        filters,
        component: "PropertyServiceV2",
        action: "searchProperties",
      });

      const tenantId = await this.getUserTenantId(userId);

      const properties = await propertyRepository.searchProperties(
        tenantId,
        searchTerm,
        this.convertFiltersToRepositoryFormat(filters),
        {
          orderBy: { column: "created_at", ascending: false },
          limit: filters?.limit || 30,
        },
      );

      logger.info("매물 검색 완료", {
        userId,
        searchTerm,
        count: properties.length,
        component: "PropertyServiceV2",
        action: "searchProperties",
      });

      return properties;
    } catch (error) {
      logger.error("매물 검색 실패", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
        searchTerm,
        component: "PropertyServiceV2",
        action: "searchProperties",
      });
      throw error;
    }
  }

  /**
   * 단일 매물 조회
   */
  static async getProperty(
    propertyId: string,
    userId: string,
  ): Promise<Property | null> {
    try {
      const tenantId = await this.getUserTenantId(userId);

      const property = await propertyRepository.findOne({
        id: propertyId,
        tenant_id: tenantId,
      });

      return property;
    } catch (error) {
      logger.error("매물 조회 실패", {
        error: error instanceof Error ? error.message : "Unknown error",
        propertyId,
        userId,
        component: "PropertyServiceV2",
        action: "getProperty",
      });
      throw error;
    }
  }

  /**
   * 매물 생성
   */
  static async createProperty(
    userId: string,
    data: CreatePropertyData,
  ): Promise<Property> {
    try {
      logger.info("매물 생성 시작", {
        userId,
        title: data.title,
        component: "PropertyServiceV2",
        action: "createProperty",
      });

      const tenantId = await this.getUserTenantId(userId);

      // 중복 확인
      const existingProperty = await propertyRepository.checkDuplicate(
        data.title,
        data.address,
        tenantId,
      );

      if (existingProperty) {
        throw new Error("동일한 제목과 주소의 매물이 이미 존재합니다.");
      }

      // 매물 생성
      const propertyData = {
        ...data,
        tenant_id: tenantId,
        created_by: userId,
        status: data.status || "active",
        view_count: 0,
        options: [],
        is_favorite: false,
        inquiry_count: 0,
        last_contacted_at: null,
        featured_until: null,
        is_featured: false,
        is_urgent: false,
        images: [],
      };

      const property = await propertyRepository.create(propertyData);

      logger.info("매물 생성 완료", {
        userId,
        propertyId: property.id,
        title: property.title,
        component: "PropertyServiceV2",
        action: "createProperty",
      });

      return property;
    } catch (error) {
      logger.error("매물 생성 실패", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
        data: data.title,
        component: "PropertyServiceV2",
        action: "createProperty",
      });
      throw error;
    }
  }

  /**
   * 매물 수정
   */
  static async updateProperty(
    propertyId: string,
    userId: string,
    updates: UpdatePropertyData,
  ): Promise<Property | null> {
    try {
      logger.info("매물 수정 시작", {
        propertyId,
        userId,
        component: "PropertyServiceV2",
        action: "updateProperty",
      });

      const tenantId = await this.getUserTenantId(userId);

      // 권한 확인: 해당 테넌트의 매물인지 검증
      const existingProperty = await propertyRepository.findOne({
        id: propertyId,
        tenant_id: tenantId,
      });

      if (!existingProperty) {
        throw new Error("매물을 찾을 수 없거나 수정 권한이 없습니다.");
      }

      // 수정 실행
      const updatedProperty = await propertyRepository.update(propertyId, {
        ...updates,
        updated_at: new Date().toISOString(),
      });

      logger.info("매물 수정 완료", {
        propertyId,
        userId,
        component: "PropertyServiceV2",
        action: "updateProperty",
      });

      return updatedProperty;
    } catch (error) {
      logger.error("매물 수정 실패", {
        error: error instanceof Error ? error.message : "Unknown error",
        propertyId,
        userId,
        component: "PropertyServiceV2",
        action: "updateProperty",
      });
      throw error;
    }
  }

  /**
   * 매물 삭제
   */
  static async deleteProperty(
    propertyId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      logger.info("매물 삭제 시작", {
        propertyId,
        userId,
        component: "PropertyServiceV2",
        action: "deleteProperty",
      });

      const tenantId = await this.getUserTenantId(userId);

      // 권한 확인
      const existingProperty = await propertyRepository.findOne({
        id: propertyId,
        tenant_id: tenantId,
      });

      if (!existingProperty) {
        throw new Error("매물을 찾을 수 없거나 삭제 권한이 없습니다.");
      }

      // 삭제 실행
      const success = await propertyRepository.delete(propertyId);

      logger.info("매물 삭제 완료", {
        propertyId,
        userId,
        success,
        component: "PropertyServiceV2",
        action: "deleteProperty",
      });

      return success;
    } catch (error) {
      logger.error("매물 삭제 실패", {
        error: error instanceof Error ? error.message : "Unknown error",
        propertyId,
        userId,
        component: "PropertyServiceV2",
        action: "deleteProperty",
      });
      throw error;
    }
  }

  /**
   * 매물 통계 조회
   */
  static async getPropertyStats(userId: string) {
    try {
      const tenantId = await this.getUserTenantId(userId);
      return await propertyRepository.getStatsByTenantId(tenantId);
    } catch (error) {
      logger.error("매물 통계 조회 실패", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
        component: "PropertyServiceV2",
        action: "getPropertyStats",
      });
      throw error;
    }
  }

  /**
   * 매물 상태 일괄 업데이트
   */
  static async updatePropertiesStatus(
    propertyIds: string[],
    status: string,
    userId: string,
  ): Promise<Property[]> {
    try {
      logger.info("매물 상태 일괄 업데이트 시작", {
        propertyIds,
        status,
        userId,
        component: "PropertyServiceV2",
        action: "updatePropertiesStatus",
      });

      const tenantId = await this.getUserTenantId(userId);

      const updatedProperties = await propertyRepository.updateStatusBatch(
        propertyIds,
        status,
        tenantId,
      );

      logger.info("매물 상태 일괄 업데이트 완료", {
        count: updatedProperties.length,
        status,
        userId,
        component: "PropertyServiceV2",
        action: "updatePropertiesStatus",
      });

      return updatedProperties;
    } catch (error) {
      logger.error("매물 상태 일괄 업데이트 실패", {
        error: error instanceof Error ? error.message : "Unknown error",
        propertyIds,
        status,
        userId,
        component: "PropertyServiceV2",
        action: "updatePropertiesStatus",
      });
      throw error;
    }
  }

  /**
   * 최근 매물 조회
   */
  static async getRecentProperties(
    userId: string,
    limit = 10,
  ): Promise<Property[]> {
    try {
      const tenantId = await this.getUserTenantId(userId);
      return await propertyRepository.findRecentProperties(tenantId, limit);
    } catch (error) {
      logger.error("최근 매물 조회 실패", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
        limit,
        component: "PropertyServiceV2",
        action: "getRecentProperties",
      });
      throw error;
    }
  }

  /**
   * 사용자의 tenant_id 조회 (헬퍼 메서드)
   */
  private static async getUserTenantId(userId: string): Promise<string> {
    const { data: userProfile, error } = await supabase
      .from("user_profiles")
      .select("tenant_id")
      .eq("id", userId)
      .single();

    if (error || !userProfile?.tenant_id) {
      throw new Error("사용자의 테넌트 정보를 찾을 수 없습니다.");
    }

    return userProfile.tenant_id;
  }

  /**
   * 필터 형식을 Repository 형식으로 변환 (헬퍼 메서드)
   */
  private static convertFiltersToRepositoryFormat(
    filters?: SimplePropertyFilters,
  ) {
    if (!filters) return undefined;

    return {
      property_type: filters.property_type,
      transaction_type: filters.transaction_type,
      status: filters.status,
      location: filters.location,
      price_min: filters.price_min,
      price_max: filters.price_max,
      created_after: filters.created_after,
      created_before: filters.created_before,
    };
  }
}

// 기존 함수형 API와의 호환성을 위한 래퍼 함수들
export const getPropertiesV2 =
  PropertyServiceV2.getProperties.bind(PropertyServiceV2);
export const searchPropertiesV2 =
  PropertyServiceV2.searchProperties.bind(PropertyServiceV2);
export const getPropertyV2 =
  PropertyServiceV2.getProperty.bind(PropertyServiceV2);
export const createPropertyV2 =
  PropertyServiceV2.createProperty.bind(PropertyServiceV2);
export const updatePropertyV2 =
  PropertyServiceV2.updateProperty.bind(PropertyServiceV2);
export const deletePropertyV2 =
  PropertyServiceV2.deleteProperty.bind(PropertyServiceV2);
export const getPropertyStatsV2 =
  PropertyServiceV2.getPropertyStats.bind(PropertyServiceV2);
