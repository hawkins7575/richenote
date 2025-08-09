// ============================================================================
// Logger 유틸리티 테스트
// ============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "../logger";

describe("Logger", () => {
  beforeEach(() => {
    // Console 메서드 spy 설정
    vi.spyOn(console, "debug").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("개발 환경에서", () => {
    beforeEach(() => {
      // 개발 환경으로 설정
      vi.stubEnv("DEV", true);
    });

    it("debug 로그를 출력한다", () => {
      const message = "Debug message";
      const context = { userId: "user-1", action: "test" };

      logger.debug(message, context);

      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining(`"level":"debug"`),
      );
      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining(`"message":"${message}"`),
      );
      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining(`"userId":"user-1"`),
      );
    });

    it("info 로그를 출력한다", () => {
      const message = "Info message";
      const context = { component: "TestComponent" };

      logger.info(message, context);

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining(`"level":"info"`),
      );
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining(`"message":"${message}"`),
      );
    });

    it("warn 로그를 출력한다", () => {
      const message = "Warning message";

      logger.warn(message);

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(`"level":"warn"`),
      );
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(`"message":"${message}"`),
      );
    });

    it("error 로그를 출력한다", () => {
      const message = "Error message";
      const context = { error: "Database connection failed" };

      logger.error(message, context);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(`"level":"error"`),
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(`"message":"${message}"`),
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(`"error":"Database connection failed"`),
      );
    });

    it("devLog를 출력한다", () => {
      const message = "Development log";
      const extraData = { test: "data" };

      logger.devLog(message, extraData);

      expect(console.log).toHaveBeenCalledWith(
        "[DEV] Development log",
        extraData,
      );
    });
  });

  describe("프로덕션 환경에서", () => {
    beforeEach(() => {
      // 프로덕션 환경으로 설정
      vi.stubEnv("DEV", false);
      vi.stubEnv("VITE_APP_ENV", "production");
    });

    it("debug 로그를 출력하지 않는다", () => {
      logger.debug("Debug message");
      expect(console.debug).not.toHaveBeenCalled();
    });

    it("info 로그를 출력하지 않는다", () => {
      logger.info("Info message");
      expect(console.info).not.toHaveBeenCalled();
    });

    it("warn 로그는 출력한다", () => {
      logger.warn("Warning message");
      expect(console.warn).toHaveBeenCalled();
    });

    it("error 로그는 출력한다", () => {
      logger.error("Error message");
      expect(console.error).toHaveBeenCalled();
    });

    it("devLog를 출력하지 않는다", () => {
      logger.devLog("Development log");
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe("로그 메시지 형식", () => {
    beforeEach(() => {
      vi.stubEnv("DEV", true);
    });

    it("올바른 JSON 형식으로 로그를 출력한다", () => {
      const message = "Test message";
      const context = {
        userId: "user-123",
        tenantId: "tenant-456",
        correlationId: "corr-789",
        component: "TestComponent",
        action: "testAction",
      };

      logger.info(message, context);

      const logCall = (console.info as any).mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData).toMatchObject({
        level: "info",
        message,
        userId: "user-123",
        tenantId: "tenant-456",
        correlationId: "corr-789",
        component: "TestComponent",
        action: "testAction",
      });
      expect(logData.timestamp).toBeDefined();
      expect(new Date(logData.timestamp)).toBeInstanceOf(Date);
    });

    it("추가 컨텍스트 필드를 포함한다", () => {
      const message = "Test with extra fields";
      const context = {
        customField: "custom value",
        nestedObject: { key: "value" },
        arrayField: [1, 2, 3],
      };

      logger.warn(message, context);

      const logCall = (console.warn as any).mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.customField).toBe("custom value");
      expect(logData.nestedObject).toEqual({ key: "value" });
      expect(logData.arrayField).toEqual([1, 2, 3]);
    });

    it("컨텍스트 없이도 정상 동작한다", () => {
      const message = "Simple message";

      logger.error(message);

      const logCall = (console.error as any).mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData).toMatchObject({
        level: "error",
        message,
        timestamp: expect.any(String),
      });
    });
  });
});
