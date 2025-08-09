// ============================================================================
// Base Repository 클래스 - 공통 데이터베이스 접근 패턴
// ============================================================================

import { supabase } from "@/lib/supabase";
import { logger } from "@/utils/logger";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export abstract class BaseRepository<T> {
  protected client: SupabaseClient<Database>;
  protected tableName: string;

  constructor(tableName: string) {
    this.client = supabase;
    this.tableName = tableName;
  }

  /**
   * 단일 레코드 조회 (ID 기반)
   */
  async findById(id: string): Promise<T | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Not found
        }
        throw error;
      }

      return data as T;
    } catch (error) {
      logger.error(`Failed to find record by id in ${this.tableName}`, {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "BaseRepository",
        action: "findById",
        table: this.tableName,
        id,
      });
      throw error;
    }
  }

  /**
   * 조건부 단일 레코드 조회
   */
  async findOne(
    conditions: Record<string, unknown>,
    select = "*",
  ): Promise<T | null> {
    try {
      let query = this.client.from(this.tableName).select(select);

      // 조건 적용
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query.single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Not found
        }
        throw error;
      }

      return data as T;
    } catch (error) {
      logger.error(`Failed to find one record in ${this.tableName}`, {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "BaseRepository",
        action: "findOne",
        table: this.tableName,
        conditions,
      });
      throw error;
    }
  }

  /**
   * 다중 레코드 조회
   */
  async findMany(
    conditions?: Record<string, unknown>,
    options?: {
      select?: string;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
      offset?: number;
    },
  ): Promise<T[]> {
    try {
      let query = this.client
        .from(this.tableName)
        .select(options?.select || "*");

      // 조건 적용
      if (conditions) {
        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // 정렬
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      // 제한
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

      return (data as T[]) || [];
    } catch (error) {
      logger.error(`Failed to find many records in ${this.tableName}`, {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "BaseRepository",
        action: "findMany",
        table: this.tableName,
        conditions,
        options,
      });
      throw error;
    }
  }

  /**
   * 레코드 수 조회
   */
  async count(conditions?: Record<string, unknown>): Promise<number> {
    try {
      let query = this.client
        .from(this.tableName)
        .select("*", { count: "exact", head: true });

      // 조건 적용
      if (conditions) {
        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { count, error } = await query;

      if (error) throw error;

      return count || 0;
    } catch (error) {
      logger.error(`Failed to count records in ${this.tableName}`, {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "BaseRepository",
        action: "count",
        table: this.tableName,
        conditions,
      });
      throw error;
    }
  }

  /**
   * 레코드 생성
   */
  async create(data: Omit<T, "id" | "created_at" | "updated_at">): Promise<T> {
    try {
      const { data: result, error } = await this.client
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      return result as T;
    } catch (error) {
      logger.error(`Failed to create record in ${this.tableName}`, {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "BaseRepository",
        action: "create",
        table: this.tableName,
        data,
      });
      throw error;
    }
  }

  /**
   * 다중 레코드 생성
   */
  async createMany(
    dataArray: Array<Omit<T, "id" | "created_at" | "updated_at">>,
  ): Promise<T[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .insert(dataArray)
        .select();

      if (error) throw error;

      return (data as T[]) || [];
    } catch (error) {
      logger.error(`Failed to create many records in ${this.tableName}`, {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "BaseRepository",
        action: "createMany",
        table: this.tableName,
        count: dataArray.length,
      });
      throw error;
    }
  }

  /**
   * 레코드 업데이트
   */
  async update(
    id: string,
    updates: Partial<Omit<T, "id" | "created_at">>,
  ): Promise<T | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Not found
        }
        throw error;
      }

      return data as T;
    } catch (error) {
      logger.error(`Failed to update record in ${this.tableName}`, {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "BaseRepository",
        action: "update",
        table: this.tableName,
        id,
        updates,
      });
      throw error;
    }
  }

  /**
   * 조건부 레코드 업데이트
   */
  async updateWhere(
    conditions: Record<string, unknown>,
    updates: Partial<Omit<T, "id" | "created_at">>,
  ): Promise<T[]> {
    try {
      let query = this.client.from(this.tableName).update(updates);

      // 조건 적용
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query.select();

      if (error) throw error;

      return (data as T[]) || [];
    } catch (error) {
      logger.error(`Failed to update records where in ${this.tableName}`, {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "BaseRepository",
        action: "updateWhere",
        table: this.tableName,
        conditions,
        updates,
      });
      throw error;
    }
  }

  /**
   * 레코드 삭제
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq("id", id);

      if (error) throw error;

      return true;
    } catch (error) {
      logger.error(`Failed to delete record in ${this.tableName}`, {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "BaseRepository",
        action: "delete",
        table: this.tableName,
        id,
      });
      throw error;
    }
  }

  /**
   * 조건부 레코드 삭제
   */
  async deleteWhere(conditions: Record<string, unknown>): Promise<number> {
    try {
      let query = this.client.from(this.tableName).delete({ count: "exact" });

      // 조건 적용
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { count, error } = await query;

      if (error) throw error;

      return count || 0;
    } catch (error) {
      logger.error(`Failed to delete records where in ${this.tableName}`, {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "BaseRepository",
        action: "deleteWhere",
        table: this.tableName,
        conditions,
      });
      throw error;
    }
  }

  /**
   * 존재 여부 확인
   */
  async exists(conditions: Record<string, unknown>): Promise<boolean> {
    try {
      const count = await this.count(conditions);
      return count > 0;
    } catch (error) {
      logger.error(`Failed to check existence in ${this.tableName}`, {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "BaseRepository",
        action: "exists",
        table: this.tableName,
        conditions,
      });
      throw error;
    }
  }

  /**
   * 트랜잭션 실행
   */
  async transaction<R>(
    callback: (client: SupabaseClient<Database>) => Promise<R>,
  ): Promise<R> {
    try {
      // Supabase는 자동으로 트랜잭션을 관리하므로 콜백 실행
      return await callback(this.client);
    } catch (error) {
      logger.error(`Transaction failed in ${this.tableName}`, {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "BaseRepository",
        action: "transaction",
        table: this.tableName,
      });
      throw error;
    }
  }
}
