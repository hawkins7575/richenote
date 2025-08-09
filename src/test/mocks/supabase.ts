// ============================================================================
// Supabase Mock 유틸리티
// ============================================================================

import { vi } from "vitest";

export const createMockSupabaseResponse = <T>(
  data: T | null,
  error: any = null,
) => ({
  data,
  error,
  status: error ? 400 : 200,
  statusText: error ? "Bad Request" : "OK",
});

export const createMockSupabaseQuery = () => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  like: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  then: vi.fn().mockReturnThis(),
});

export const mockSupabaseClient = {
  from: vi.fn(() => createMockSupabaseQuery()),
  auth: {
    getUser: vi.fn(),
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  },
  rpc: vi.fn(),
};

// Mock 테스트 데이터
export const mockTenant = {
  id: "tenant-1",
  name: "테스트 부동산",
  slug: "test-real-estate",
  plan: "starter" as const,
  status: "active" as const,
  limits: {
    max_properties: 50,
    max_users: 2,
    max_storage_gb: 1,
    max_api_calls_per_month: 1000,
    features_enabled: [],
  },
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

export const mockProperty = {
  id: "property-1",
  tenant_id: "tenant-1",
  title: "테스트 매물",
  address: "서울시 강남구 테스트동 123-45",
  property_type: "아파트",
  transaction_type: "매매",
  price: 500000000,
  status: "active",
  description: "테스트용 매물입니다.",
  created_by: "user-1",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

export const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "테스트 사용자",
  tenant_id: "tenant-1",
  role: "owner" as const,
  status: "active" as const,
  created_at: "2024-01-01T00:00:00Z",
};
