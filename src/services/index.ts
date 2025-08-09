// ============================================================================
// 서비스 레이어 - Supabase 통합
// ============================================================================

import * as mockService from "./mockPropertyService";
import * as realService from "./propertyService";

// Mock API 사용 여부 결정 (개발 환경에서만)
const useMockAPI = import.meta.env.VITE_MOCK_API === "true";
const propertyService = useMockAPI ? mockService : realService;

export const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyStats,
  togglePropertyFavorite,
} = propertyService;
