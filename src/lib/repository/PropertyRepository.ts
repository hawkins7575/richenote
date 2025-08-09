// ============================================================================
// 매물 레포지토리 - 데이터베이스 접근 레이어
// ============================================================================

import { BaseRepository } from "./BaseRepository";
import type { Property } from "@/types/property";
import { logger } from "@/utils/logger";

export interface PropertyFilters {
  tenant_id?: string;
  property_type?: string;
  transaction_type?: string;
  status?: string;
  location?: string;
  price_min?: number;
  price_max?: number;
  created_after?: string;
  created_before?: string;
}

export interface PropertySearchOptions {
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

export interface PropertyStats {
  total: number;
  active: number;
  inactive: number;
  this_month: number;
  by_type: Record<string, number>;
  by_transaction_type: Record<string, number>;
  by_status: Record<string, number>;
  total_users: number;
}

export class PropertyRepository extends BaseRepository<Property> {
  constructor() {
    super("properties");
  }

  /**
   * 테넌트별 매물 조회
   */
  async findByTenantId(
    tenantId: string,
    filters?: Omit<PropertyFilters, "tenant_id">,
    options?: PropertySearchOptions,
  ): Promise<Property[]> {
    try {
      let query = this.client
        .from("properties")
        .select(options?.select || "*")
        .eq("tenant_id", tenantId);

      // 필터 적용
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === "price_min") {
              query = query.gte("price", value);
            } else if (key === "price_max") {
              query = query.lte("price", value);
            } else if (key === "created_after") {
              query = query.gte("created_at", value);
            } else if (key === "created_before") {
              query = query.lte("created_at", value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      // 정렬
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? false,
        });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // 페이지네이션
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 100) - 1,
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data as unknown as Property[]) || [];
    } catch (error) {
      logger.error("Failed to find properties by tenant ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "PropertyRepository",
        action: "findByTenantId",
        tenantId,
        filters,
        options,
      });
      throw error;
    }
  }

  /**
   * 매물 검색 (제목, 주소, 설명 기반)
   */
  async searchProperties(
    tenantId: string,
    searchTerm: string,
    filters?: Omit<PropertyFilters, "tenant_id">,
    options?: PropertySearchOptions,
  ): Promise<Property[]> {
    try {
      let query = this.client
        .from("properties")
        .select(options?.select || "*")
        .eq("tenant_id", tenantId)
        .or(
          `title.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`,
        );

      // 필터 적용
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === "price_min") {
              query = query.gte("price", value);
            } else if (key === "price_max") {
              query = query.lte("price", value);
            } else if (key === "created_after") {
              query = query.gte("created_at", value);
            } else if (key === "created_before") {
              query = query.lte("created_at", value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      // 정렬
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? false,
        });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // 페이지네이션
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 100) - 1,
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data as unknown as Property[]) || [];
    } catch (error) {
      logger.error("Failed to search properties", {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "PropertyRepository",
        action: "searchProperties",
        tenantId,
        searchTerm,
        filters,
        options,
      });
      throw error;
    }
  }

  /**
   * 테넌트별 매물 통계 조회
   */
  async getStatsByTenantId(tenantId: string): Promise<PropertyStats> {
    try {
      // 기본 통계
      const [totalCount, activeCount, thisMonthCount] = await Promise.all([
        this.count({ tenant_id: tenantId }),
        this.count({ tenant_id: tenantId, status: "active" }),
        this.count({
          tenant_id: tenantId,
          created_after: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1,
          ).toISOString(),
        }),
      ]);

      // 유형별 통계
      const { data: typeStats, error: typeError } = await this.client
        .from("properties")
        .select("property_type")
        .eq("tenant_id", tenantId);

      if (typeError) throw typeError;

      const byType =
        typeStats?.reduce(
          (acc, item) => {
            acc[item.property_type] = (acc[item.property_type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ) || {};

      // 거래 유형별 통계
      const { data: transactionStats, error: transactionError } =
        await this.client
          .from("properties")
          .select("transaction_type")
          .eq("tenant_id", tenantId);

      if (transactionError) throw transactionError;

      const byTransactionType =
        transactionStats?.reduce(
          (acc, item) => {
            acc[item.transaction_type] = (acc[item.transaction_type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ) || {};

      // 상태별 통계
      const { data: statusStats, error: statusError } = await this.client
        .from("properties")
        .select("status")
        .eq("tenant_id", tenantId);

      if (statusError) throw statusError;

      const byStatus =
        statusStats?.reduce(
          (acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ) || {};

      // 사용자 수 조회
      const { count: userCount, error: userError } = await this.client
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId);

      if (userError) throw userError;

      return {
        total: totalCount,
        active: activeCount,
        inactive: totalCount - activeCount,
        this_month: thisMonthCount,
        by_type: byType,
        by_transaction_type: byTransactionType,
        by_status: byStatus,
        total_users: userCount || 1,
      };
    } catch (error) {
      logger.error("Failed to get property stats", {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "PropertyRepository",
        action: "getStatsByTenantId",
        tenantId,
      });
      throw error;
    }
  }

  /**
   * 매물 상태 일괄 업데이트
   */
  async updateStatusBatch(
    propertyIds: string[],
    status: string,
    tenantId: string,
  ): Promise<Property[]> {
    try {
      const { data, error } = await this.client
        .from("properties")
        .update({ status })
        .in("id", propertyIds)
        .eq("tenant_id", tenantId)
        .select();

      if (error) throw error;

      return (data as unknown as Property[]) || [];
    } catch (error) {
      logger.error("Failed to update property status batch", {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "PropertyRepository",
        action: "updateStatusBatch",
        propertyIds,
        status,
        tenantId,
      });
      throw error;
    }
  }

  /**
   * 매물 삭제 (일괄)
   */
  async deleteBatch(propertyIds: string[], tenantId: string): Promise<number> {
    try {
      const { count, error } = await this.client
        .from("properties")
        .delete({ count: "exact" })
        .in("id", propertyIds)
        .eq("tenant_id", tenantId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      logger.error("Failed to delete properties batch", {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "PropertyRepository",
        action: "deleteBatch",
        propertyIds,
        tenantId,
      });
      throw error;
    }
  }

  /**
   * 최근 매물 조회
   */
  async findRecentProperties(
    tenantId: string,
    limit = 10,
  ): Promise<Property[]> {
    return this.findByTenantId(
      tenantId,
      {},
      {
        orderBy: { column: "created_at", ascending: false },
        limit,
      },
    );
  }

  /**
   * 매물 중복 확인 (제목 + 주소 기반)
   */
  async checkDuplicate(
    title: string,
    address: string,
    tenantId: string,
  ): Promise<Property | null> {
    try {
      const { data, error } = await this.client
        .from("properties")
        .select("*")
        .eq("title", title)
        .eq("address", address)
        .eq("tenant_id", tenantId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Not found
        }
        throw error;
      }

      return data as Property;
    } catch (error) {
      logger.error("Failed to check property duplicate", {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "PropertyRepository",
        action: "checkDuplicate",
        title,
        address,
        tenantId,
      });
      throw error;
    }
  }
}
