// ============================================================================
// Repository 인덱스 - 중앙 집중식 데이터 접근 레이어
// ============================================================================

import { TenantRepository } from "./TenantRepository";
import { PropertyRepository } from "./PropertyRepository";

export { BaseRepository } from "./BaseRepository";
export { TenantRepository } from "./TenantRepository";
export { PropertyRepository } from "./PropertyRepository";

export type { CreateTenantData, UpdateTenantData } from "./TenantRepository";

export type {
  PropertyFilters,
  PropertySearchOptions,
  PropertyStats,
} from "./PropertyRepository";

// 싱글톤 레포지토리 인스턴스
export const tenantRepository = new TenantRepository();
export const propertyRepository = new PropertyRepository();
