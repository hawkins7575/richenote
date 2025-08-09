// ============================================================================
// Query Builder - 복잡한 쿼리 구성을 위한 헬퍼
// ============================================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { logger } from "@/utils/logger";

export interface QueryOptions {
  select?: string;
  limit?: number;
  offset?: number;
  orderBy?: Array<{ column: string; ascending?: boolean }>;
}

export interface FilterCondition {
  column: string;
  operator:
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "like"
    | "ilike"
    | "in"
    | "is";
  value: unknown;
}

export class QueryBuilder {
  private client: SupabaseClient<Database>;
  private tableName: string;
  private conditions: FilterCondition[] = [];
  private options: QueryOptions = {};

  constructor(client: SupabaseClient<Database>, tableName: string) {
    this.client = client;
    this.tableName = tableName;
  }

  /**
   * 필터 조건 추가
   */
  where(
    column: string,
    operator: FilterCondition["operator"],
    value: unknown,
  ): this {
    this.conditions.push({ column, operator, value });
    return this;
  }

  /**
   * 동등 조건 (간편 메서드)
   */
  whereEqual(column: string, value: unknown): this {
    return this.where(column, "eq", value);
  }

  /**
   * LIKE 조건 (간편 메서드)
   */
  whereLike(column: string, value: string): this {
    return this.where(column, "ilike", `%${value}%`);
  }

  /**
   * IN 조건 (간편 메서드)
   */
  whereIn(column: string, values: unknown[]): this {
    return this.where(column, "in", values);
  }

  /**
   * 범위 조건 추가
   */
  whereBetween(column: string, min: unknown, max: unknown): this {
    this.where(column, "gte", min);
    this.where(column, "lte", max);
    return this;
  }

  /**
   * OR 조건 (복잡한 조건)
   */
  whereOr(
    conditions: Array<{
      column: string;
      operator: FilterCondition["operator"];
      value: unknown;
    }>,
  ): this {
    // Supabase의 or() 메서드를 사용하기 위해 특별한 처리
    const orCondition: FilterCondition = {
      column: "__or__",
      operator: "eq",
      value: conditions,
    };
    this.conditions.push(orCondition);
    return this;
  }

  /**
   * 선택할 컬럼 지정
   */
  select(columns: string): this {
    this.options.select = columns;
    return this;
  }

  /**
   * 정렬 조건 추가
   */
  orderBy(column: string, ascending = true): this {
    if (!this.options.orderBy) {
      this.options.orderBy = [];
    }
    this.options.orderBy.push({ column, ascending });
    return this;
  }

  /**
   * 제한 조건 (LIMIT)
   */
  limit(count: number): this {
    this.options.limit = count;
    return this;
  }

  /**
   * 오프셋 조건 (OFFSET)
   */
  offset(count: number): this {
    this.options.offset = count;
    return this;
  }

  /**
   * 페이지네이션 (간편 메서드)
   */
  paginate(page: number, pageSize: number): this {
    this.limit(pageSize);
    this.offset((page - 1) * pageSize);
    return this;
  }

  /**
   * 다중 레코드 조회 실행
   */
  async findMany<T>(): Promise<T[]> {
    try {
      let query = this.client
        .from(this.tableName)
        .select(this.options.select || "*");

      // 필터 조건 적용
      for (const condition of this.conditions) {
        if (condition.column === "__or__") {
          // OR 조건 처리
          const orConditions = condition.value as Array<{
            column: string;
            operator: FilterCondition["operator"];
            value: unknown;
          }>;
          const orString = orConditions
            .map((c) => `${c.column}.${c.operator}.${c.value}`)
            .join(",");
          query = query.or(orString);
        } else {
          // 일반 조건 처리
          switch (condition.operator) {
            case "eq":
              query = query.eq(condition.column, condition.value);
              break;
            case "neq":
              query = query.neq(condition.column, condition.value);
              break;
            case "gt":
              query = query.gt(condition.column, condition.value);
              break;
            case "gte":
              query = query.gte(condition.column, condition.value);
              break;
            case "lt":
              query = query.lt(condition.column, condition.value);
              break;
            case "lte":
              query = query.lte(condition.column, condition.value);
              break;
            case "like":
              query = query.like(condition.column, condition.value as string);
              break;
            case "ilike":
              query = query.ilike(condition.column, condition.value as string);
              break;
            case "in":
              query = query.in(condition.column, condition.value as unknown[]);
              break;
            case "is":
              query = query.is(condition.column, condition.value);
              break;
          }
        }
      }

      // 정렬 조건 적용
      if (this.options.orderBy) {
        for (const order of this.options.orderBy) {
          query = query.order(order.column, { ascending: order.ascending });
        }
      }

      // 제한 및 오프셋 적용
      if (this.options.limit) {
        if (this.options.offset) {
          query = query.range(
            this.options.offset,
            this.options.offset + this.options.limit - 1,
          );
        } else {
          query = query.limit(this.options.limit);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data as T[]) || [];
    } catch (error) {
      logger.error("QueryBuilder findMany failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "QueryBuilder",
        action: "findMany",
        table: this.tableName,
        conditions: this.conditions,
        options: this.options,
      });
      throw error;
    }
  }

  /**
   * 단일 레코드 조회 실행
   */
  async findFirst<T>(): Promise<T | null> {
    try {
      this.limit(1);
      const results = await this.findMany<T>();
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      logger.error("QueryBuilder findFirst failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "QueryBuilder",
        action: "findFirst",
        table: this.tableName,
      });
      throw error;
    }
  }

  /**
   * 레코드 개수 조회 실행
   */
  async count(): Promise<number> {
    try {
      let query = this.client
        .from(this.tableName)
        .select("*", { count: "exact", head: true });

      // 필터 조건 적용 (count에는 select, orderBy, limit 불필요)
      for (const condition of this.conditions) {
        if (condition.column === "__or__") {
          const orConditions = condition.value as Array<{
            column: string;
            operator: FilterCondition["operator"];
            value: unknown;
          }>;
          const orString = orConditions
            .map((c) => `${c.column}.${c.operator}.${c.value}`)
            .join(",");
          query = query.or(orString);
        } else {
          switch (condition.operator) {
            case "eq":
              query = query.eq(condition.column, condition.value);
              break;
            case "neq":
              query = query.neq(condition.column, condition.value);
              break;
            case "gt":
              query = query.gt(condition.column, condition.value);
              break;
            case "gte":
              query = query.gte(condition.column, condition.value);
              break;
            case "lt":
              query = query.lt(condition.column, condition.value);
              break;
            case "lte":
              query = query.lte(condition.column, condition.value);
              break;
            case "like":
              query = query.like(condition.column, condition.value as string);
              break;
            case "ilike":
              query = query.ilike(condition.column, condition.value as string);
              break;
            case "in":
              query = query.in(condition.column, condition.value as unknown[]);
              break;
            case "is":
              query = query.is(condition.column, condition.value);
              break;
          }
        }
      }

      const { count, error } = await query;

      if (error) throw error;

      return count || 0;
    } catch (error) {
      logger.error("QueryBuilder count failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        component: "QueryBuilder",
        action: "count",
        table: this.tableName,
      });
      throw error;
    }
  }

  /**
   * 쿼리 조건 초기화
   */
  reset(): this {
    this.conditions = [];
    this.options = {};
    return this;
  }

  /**
   * 새 QueryBuilder 인스턴스 생성 (정적 팩토리 메서드)
   */
  static from(
    client: SupabaseClient<Database>,
    tableName: string,
  ): QueryBuilder {
    return new QueryBuilder(client, tableName);
  }
}

export default QueryBuilder;
