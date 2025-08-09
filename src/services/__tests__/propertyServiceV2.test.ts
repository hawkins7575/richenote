// ============================================================================
// PropertyServiceV2 테스트
// ============================================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import { PropertyServiceV2 } from "../propertyServiceV2";
import type { PropertyStatus } from "@/types";
import {
  mockProperty,
  createMockSupabaseResponse,
  mockSupabaseClient,
} from "@/test/mocks/supabase";

// Repository Mock
vi.mock("@/lib/repository", () => {
  const mockPropertyRepository = {
    findByTenantId: vi.fn(),
    searchProperties: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getStatsByTenantId: vi.fn(),
    updateStatusBatch: vi.fn(),
    findRecentProperties: vi.fn(),
    checkDuplicate: vi.fn(),
  };
  return {
    propertyRepository: mockPropertyRepository,
  };
});

vi.mock("../supabase", () => ({
  supabase: mockSupabaseClient,
}));

describe("PropertyServiceV2", () => {
  let mockPropertyRepository: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Repository mock 가져오기
    const { propertyRepository } = await import("@/lib/repository");
    mockPropertyRepository = propertyRepository;

    // 기본 user profile 응답 설정
    mockSupabaseClient
      .from()
      .single.mockResolvedValue(
        createMockSupabaseResponse({ tenant_id: "tenant-1" }),
      );
  });

  describe("getProperties", () => {
    it("사용자의 매물 목록을 조회한다", async () => {
      const mockProperties = [mockProperty];
      mockPropertyRepository.findByTenantId.mockResolvedValue(mockProperties);

      const result = await PropertyServiceV2.getProperties("user-1");

      expect(result).toEqual(mockProperties);
      expect(mockPropertyRepository.findByTenantId).toHaveBeenCalledWith(
        "tenant-1",
        undefined,
        {
          orderBy: { column: "created_at", ascending: false },
          limit: 50,
        },
      );
    });

    it("필터를 적용하여 매물을 조회한다", async () => {
      const filters = {
        property_type: "아파트",
        transaction_type: "매매",
        limit: 20,
      };
      const mockProperties = [mockProperty];
      mockPropertyRepository.findByTenantId.mockResolvedValue(mockProperties);

      const result = await PropertyServiceV2.getProperties("user-1", filters);

      expect(result).toEqual(mockProperties);
      expect(mockPropertyRepository.findByTenantId).toHaveBeenCalledWith(
        "tenant-1",
        {
          property_type: "아파트",
          transaction_type: "매매",
          status: undefined,
          location: undefined,
          price_min: undefined,
          price_max: undefined,
          created_after: undefined,
          created_before: undefined,
        },
        {
          orderBy: { column: "created_at", ascending: false },
          limit: 20,
        },
      );
    });

    it("사용자 tenant_id가 없으면 에러를 던진다", async () => {
      mockSupabaseClient
        .from()
        .single.mockResolvedValue(
          createMockSupabaseResponse(null, { message: "User not found" }),
        );

      await expect(
        PropertyServiceV2.getProperties("invalid-user"),
      ).rejects.toThrow("사용자의 테넌트 정보를 찾을 수 없습니다.");
    });
  });

  describe("searchProperties", () => {
    it("검색어로 매물을 검색한다", async () => {
      const searchTerm = "강남";
      const mockProperties = [mockProperty];
      mockPropertyRepository.searchProperties.mockResolvedValue(mockProperties);

      const result = await PropertyServiceV2.searchProperties(
        "user-1",
        searchTerm,
      );

      expect(result).toEqual(mockProperties);
      expect(mockPropertyRepository.searchProperties).toHaveBeenCalledWith(
        "tenant-1",
        searchTerm,
        undefined,
        {
          orderBy: { column: "created_at", ascending: false },
          limit: 30,
        },
      );
    });
  });

  describe("getProperty", () => {
    it("단일 매물을 조회한다", async () => {
      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);

      const result = await PropertyServiceV2.getProperty(
        "property-1",
        "user-1",
      );

      expect(result).toEqual(mockProperty);
      expect(mockPropertyRepository.findOne).toHaveBeenCalledWith({
        id: "property-1",
        tenant_id: "tenant-1",
      });
    });

    it("매물이 없으면 null을 반환한다", async () => {
      mockPropertyRepository.findOne.mockResolvedValue(null);

      const result = await PropertyServiceV2.getProperty(
        "nonexistent",
        "user-1",
      );

      expect(result).toBeNull();
    });
  });

  describe("createProperty", () => {
    const createData = {
      title: "새 매물",
      address: "서울시 강남구",
      type: "아파트" as const,
      transaction_type: "매매" as const,
      status: "active" as PropertyStatus,
      price: 500000000,
      area: 85,
      floor: 5,
      total_floors: 15,
      rooms: 3,
      bathrooms: 2,
      description: "테스트 매물입니다",
      options: [],
      parking: true,
      elevator: true,
    };

    it("새 매물을 생성한다", async () => {
      mockPropertyRepository.checkDuplicate.mockResolvedValue(null);
      mockPropertyRepository.create.mockResolvedValue({
        ...mockProperty,
        ...createData,
      });

      const result = await PropertyServiceV2.createProperty(
        "user-1",
        createData,
      );

      expect(result.title).toBe("새 매물");
      expect(mockPropertyRepository.checkDuplicate).toHaveBeenCalledWith(
        "새 매물",
        "서울시 강남구",
        "tenant-1",
      );
    });

    it("중복 매물이 있으면 에러를 던진다", async () => {
      mockPropertyRepository.checkDuplicate.mockResolvedValue(mockProperty);

      await expect(
        PropertyServiceV2.createProperty("user-1", createData),
      ).rejects.toThrow("동일한 제목과 주소의 매물이 이미 존재합니다.");
    });
  });

  describe("updateProperty", () => {
    const updateData = {
      title: "수정된 매물",
      price: 600000000,
    };

    it("매물을 수정한다", async () => {
      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);
      mockPropertyRepository.update.mockResolvedValue({
        ...mockProperty,
        ...updateData,
      });

      const result = await PropertyServiceV2.updateProperty(
        "property-1",
        "user-1",
        updateData,
      );

      expect(result?.title).toBe("수정된 매물");
      expect(mockPropertyRepository.update).toHaveBeenCalledWith(
        "property-1",
        expect.objectContaining({
          title: "수정된 매물",
          price: 600000000,
          updated_at: expect.any(String),
        }),
      );
    });

    it("권한이 없으면 에러를 던진다", async () => {
      mockPropertyRepository.findOne.mockResolvedValue(null);

      await expect(
        PropertyServiceV2.updateProperty("property-1", "user-1", updateData),
      ).rejects.toThrow("매물을 찾을 수 없거나 수정 권한이 없습니다.");
    });
  });

  describe("deleteProperty", () => {
    it("매물을 삭제한다", async () => {
      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);
      mockPropertyRepository.delete.mockResolvedValue(true);

      const result = await PropertyServiceV2.deleteProperty(
        "property-1",
        "user-1",
      );

      expect(result).toBe(true);
      expect(mockPropertyRepository.delete).toHaveBeenCalledWith("property-1");
    });

    it("권한이 없으면 에러를 던진다", async () => {
      mockPropertyRepository.findOne.mockResolvedValue(null);

      await expect(
        PropertyServiceV2.deleteProperty("property-1", "user-1"),
      ).rejects.toThrow("매물을 찾을 수 없거나 삭제 권한이 없습니다.");
    });
  });

  describe("getPropertyStats", () => {
    it("매물 통계를 조회한다", async () => {
      const mockStats = {
        total: 10,
        active: 8,
        inactive: 2,
        this_month: 3,
        by_type: { 아파트: 5, 오피스텔: 3 },
        by_transaction_type: { 매매: 6, 전세: 4 },
        by_status: { active: 8, inactive: 2 },
        total_users: 2,
      };
      mockPropertyRepository.getStatsByTenantId.mockResolvedValue(mockStats);

      const result = await PropertyServiceV2.getPropertyStats("user-1");

      expect(result).toEqual(mockStats);
      expect(mockPropertyRepository.getStatsByTenantId).toHaveBeenCalledWith(
        "tenant-1",
      );
    });
  });

  describe("updatePropertiesStatus", () => {
    it("다중 매물의 상태를 일괄 업데이트한다", async () => {
      const propertyIds = ["property-1", "property-2"];
      const status = "inactive";
      const updatedProperties = [
        { ...mockProperty, status },
        { ...mockProperty, id: "property-2", status },
      ];
      mockPropertyRepository.updateStatusBatch.mockResolvedValue(
        updatedProperties,
      );

      const result = await PropertyServiceV2.updatePropertiesStatus(
        propertyIds,
        status,
        "user-1",
      );

      expect(result).toEqual(updatedProperties);
      expect(mockPropertyRepository.updateStatusBatch).toHaveBeenCalledWith(
        propertyIds,
        status,
        "tenant-1",
      );
    });
  });

  describe("getRecentProperties", () => {
    it("최근 매물을 조회한다", async () => {
      const recentProperties = [mockProperty];
      mockPropertyRepository.findRecentProperties.mockResolvedValue(
        recentProperties,
      );

      const result = await PropertyServiceV2.getRecentProperties("user-1", 5);

      expect(result).toEqual(recentProperties);
      expect(mockPropertyRepository.findRecentProperties).toHaveBeenCalledWith(
        "tenant-1",
        5,
      );
    });
  });
});
