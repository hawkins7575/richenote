// ============================================================================
// 간단한 테스트 - 테스트 인프라 확인용
// ============================================================================

import { describe, it, expect } from "vitest";

describe("기본 테스트", () => {
  it("기본적인 JavaScript 기능이 작동한다", () => {
    expect(1 + 1).toBe(2);
    expect("hello").toBe("hello");
    expect([1, 2, 3]).toHaveLength(3);
  });

  it("객체 비교가 작동한다", () => {
    const obj = { name: "test", value: 123 };
    expect(obj).toEqual({ name: "test", value: 123 });
  });

  it("비동기 함수가 작동한다", async () => {
    const promise = Promise.resolve("async test");
    await expect(promise).resolves.toBe("async test");
  });

  it("에러 처리가 작동한다", () => {
    expect(() => {
      throw new Error("test error");
    }).toThrow("test error");
  });
});
