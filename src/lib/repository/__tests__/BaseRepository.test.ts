// ============================================================================
// BaseRepository 테스트
// ============================================================================

import { describe, it, expect, vi, beforeEach } from "vitest";
import { BaseRepository } from "../BaseRepository";
import {
  createMockSupabaseResponse,
  mockSupabaseClient,
} from "@/test/mocks/supabase";

// Mock 구현
vi.mock("@/lib/supabase", () => ({
  supabase: mockSupabaseClient,
}));

// 테스트용 Repository 구현
class TestRepository extends BaseRepository<{
  id: string;
  name: string;
  created_at: string;
}> {
  constructor() {
    super("test_table");
  }
}

describe("BaseRepository", () => {
  let repository: TestRepository;

  beforeEach(() => {
    repository = new TestRepository();
    vi.clearAllMocks();
  });

  describe("findById", () => {
    it("성공적으로 ID로 레코드를 조회한다", async () => {
      const mockData = { id: "1", name: "Test Item", created_at: "2024-01-01" };

      mockSupabaseClient
        .from()
        .single.mockResolvedValue(createMockSupabaseResponse(mockData));

      const result = await repository.findById("1");

      expect(result).toEqual(mockData);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("test_table");
    });

    it("레코드가 없을 때 null을 반환한다", async () => {
      mockSupabaseClient
        .from()
        .single.mockResolvedValue(
          createMockSupabaseResponse(null, {
            code: "PGRST116",
            message: "Not found",
          }),
        );

      const result = await repository.findById("999");

      expect(result).toBeNull();
    });

    it("에러 발생 시 예외를 던진다", async () => {
      const error = new Error("Database error");
      mockSupabaseClient.from().single.mockRejectedValue(error);

      await expect(repository.findById("1")).rejects.toThrow("Database error");
    });
  });

  describe("findOne", () => {
    it("조건에 맞는 단일 레코드를 조회한다", async () => {
      const mockData = { id: "1", name: "Test Item", created_at: "2024-01-01" };
      const conditions = { name: "Test Item" };

      mockSupabaseClient
        .from()
        .single.mockResolvedValue(createMockSupabaseResponse(mockData));

      const result = await repository.findOne(conditions);

      expect(result).toEqual(mockData);
      expect(mockSupabaseClient.from().eq).toHaveBeenCalledWith(
        "name",
        "Test Item",
      );
    });
  });

  describe("findMany", () => {
    it("조건에 맞는 다중 레코드를 조회한다", async () => {
      const mockData = [
        { id: "1", name: "Test Item 1", created_at: "2024-01-01" },
        { id: "2", name: "Test Item 2", created_at: "2024-01-02" },
      ];

      // Mock 체인 설정
      const mockQuery = {
        ...mockSupabaseClient.from(),
        then: vi.fn().mockResolvedValue(createMockSupabaseResponse(mockData)),
      };
      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const result = await repository.findMany({ name: "Test Item" });

      expect(result).toEqual(mockData);
    });

    it("정렬과 제한 옵션을 적용한다", async () => {
      const mockData = [
        { id: "1", name: "Test Item", created_at: "2024-01-01" },
      ];

      const mockQuery = {
        ...mockSupabaseClient.from(),
        then: vi.fn().mockResolvedValue(createMockSupabaseResponse(mockData)),
      };
      mockSupabaseClient.from.mockReturnValue(mockQuery);

      await repository.findMany(
        {},
        {
          orderBy: { column: "created_at", ascending: false },
          limit: 10,
        },
      );

      expect(mockSupabaseClient.from().order).toHaveBeenCalledWith(
        "created_at",
        { ascending: false },
      );
      expect(mockSupabaseClient.from().limit).toHaveBeenCalledWith(10);
    });
  });

  describe("count", () => {
    it("조건에 맞는 레코드 수를 반환한다", async () => {
      mockSupabaseClient.from().then = vi
        .fn()
        .mockResolvedValue({ count: 5, error: null });

      const result = await repository.count({ name: "Test" });

      expect(result).toBe(5);
      expect(mockSupabaseClient.from().eq).toHaveBeenCalledWith("name", "Test");
    });

    it("에러가 없으면 0을 반환한다", async () => {
      mockSupabaseClient.from().then = vi
        .fn()
        .mockResolvedValue({ count: null, error: null });

      const result = await repository.count();

      expect(result).toBe(0);
    });
  });

  describe("create", () => {
    it("새 레코드를 생성한다", async () => {
      const newData = { name: "New Item" };
      const mockResult = { id: "1", ...newData, created_at: "2024-01-01" };

      mockSupabaseClient
        .from()
        .single.mockResolvedValue(createMockSupabaseResponse(mockResult));

      const result = await repository.create(newData);

      expect(result).toEqual(mockResult);
      expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith(newData);
    });
  });

  describe("update", () => {
    it("레코드를 업데이트한다", async () => {
      const updates = { name: "Updated Item" };
      const mockResult = { id: "1", ...updates, created_at: "2024-01-01" };

      mockSupabaseClient
        .from()
        .single.mockResolvedValue(createMockSupabaseResponse(mockResult));

      const result = await repository.update("1", updates);

      expect(result).toEqual(mockResult);
      expect(mockSupabaseClient.from().update).toHaveBeenCalledWith(updates);
      expect(mockSupabaseClient.from().eq).toHaveBeenCalledWith("id", "1");
    });

    it("존재하지 않는 레코드 업데이트 시 null을 반환한다", async () => {
      mockSupabaseClient
        .from()
        .single.mockResolvedValue(
          createMockSupabaseResponse(null, {
            code: "PGRST116",
            message: "Not found",
          }),
        );

      const result = await repository.update("999", { name: "Updated" });

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("레코드를 삭제한다", async () => {
      mockSupabaseClient.from().then = vi
        .fn()
        .mockResolvedValue({ error: null });

      const result = await repository.delete("1");

      expect(result).toBe(true);
      expect(mockSupabaseClient.from().delete).toHaveBeenCalled();
      expect(mockSupabaseClient.from().eq).toHaveBeenCalledWith("id", "1");
    });
  });

  describe("exists", () => {
    it("레코드 존재 시 true를 반환한다", async () => {
      mockSupabaseClient.from().then = vi
        .fn()
        .mockResolvedValue({ count: 1, error: null });

      const result = await repository.exists({ name: "Test Item" });

      expect(result).toBe(true);
    });

    it("레코드가 없으면 false를 반환한다", async () => {
      mockSupabaseClient.from().then = vi
        .fn()
        .mockResolvedValue({ count: 0, error: null });

      const result = await repository.exists({ name: "Nonexistent" });

      expect(result).toBe(false);
    });
  });
});
