// ============================================================================
// 구조화된 로깅 유틸리티
// ============================================================================

const isDevelopment =
  import.meta.env.DEV || import.meta.env.VITE_APP_ENV === "development";

export interface LogContext {
  userId?: string;
  tenantId?: string;
  correlationId?: string;
  component?: string;
  action?: string;
  [key: string]: unknown;
}

export interface LogLevel {
  DEBUG: "debug";
  INFO: "info";
  WARN: "warn";
  ERROR: "error";
}

// const LOG_LEVELS: LogLevel = {
//   DEBUG: "debug",
//   INFO: "info",
//   WARN: "warn",
//   ERROR: "error",
// };

class StructuredLogger {
  private formatMessage(
    level: keyof LogLevel,
    message: string,
    context?: LogContext,
  ): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toLowerCase(),
      message,
      ...context,
    };
    return JSON.stringify(logEntry);
  }

  private shouldLog(level: keyof LogLevel): boolean {
    // 개발 환경에서는 모든 로그 출력
    if (isDevelopment) return true;

    // 프로덕션에서는 WARN과 ERROR만 출력
    return level === "WARN" || level === "ERROR";
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog("DEBUG")) {
      console.debug(this.formatMessage("DEBUG", message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog("INFO")) {
      console.info(this.formatMessage("INFO", message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog("WARN")) {
      console.warn(this.formatMessage("WARN", message, context));
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.shouldLog("ERROR")) {
      console.error(this.formatMessage("ERROR", message, context));
    }
  }

  // 개발 환경에서만 사용하는 간단한 로그
  devLog(message: string, ...args: unknown[]): void {
    if (isDevelopment) {
      console.log(`[DEV] ${message}`, ...args);
    }
  }
}

export const logger = new StructuredLogger();
