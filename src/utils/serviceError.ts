// ============================================================================
// Service Error Handling Utilities
// ============================================================================

import type { ApiError } from "@/types/api";
import { logger } from "./logger";

export class ServiceError extends Error {
  public readonly code: string;
  public readonly field?: string;
  public readonly details?: Record<string, any>;

  constructor(error: ApiError | string, context?: any) {
    if (typeof error === "string") {
      super(error);
      this.code = "UNKNOWN_ERROR";
    } else {
      super(error.message);
      this.code = error.code;
      this.field = error.field || undefined;
      this.details = error.details || undefined;
    }

    this.name = "ServiceError";

    if (context) {
      logger.error("ServiceError occurred:", {
        code: this.code,
        message: this.message,
        field: this.field,
        context,
      });
    }
  }
}

export const createServiceError = (
  code: string,
  message: string,
  field?: string,
) => {
  return new ServiceError({
    code,
    message,
    ...(field && { field }),
  });
};

export const handleSupabaseError = (error: any, context?: string) => {
  logger.error(`Supabase error${context ? ` in ${context}` : ""}:`, error);

  if (error.code) {
    return new ServiceError({
      code: error.code,
      message: error.message || "Database operation failed",
      details: error.details,
    });
  }

  return new ServiceError(
    "DATABASE_ERROR",
    error.message || "An unknown database error occurred",
  );
};

export const isServiceError = (error: any): error is ServiceError => {
  return error instanceof ServiceError;
};
