// ============================================================================
// 타입 가드 유틸리티 - 런타임 타입 안전성 보장
// ============================================================================

import { Property } from "@/types/property";
import { AuthUser } from "@/types/auth";
import { Schedule } from "@/types/schedule";

/**
 * 값이 null이나 undefined가 아닌지 확인
 */
export function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * 값이 문자열인지 확인
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * 값이 숫자인지 확인
 */
export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

/**
 * 값이 불리언인지 확인
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * 값이 객체인지 확인 (null 제외)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * 값이 배열인지 확인
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * 매물 객체인지 확인
 */
export function isProperty(value: unknown): value is Property {
  if (!isObject(value)) return false;
  
  const requiredFields = [
    "id", "title", "type", "transaction_type", "status",
    "address", "area_exclusive", "price"
  ];
  
  return requiredFields.every(field => field in value);
}

/**
 * 인증된 사용자 객체인지 확인
 */
export function isAuthUser(value: unknown): value is AuthUser {
  if (!isObject(value)) return false;
  
  const requiredFields = ["id", "email", "name", "role"];
  
  return requiredFields.every(field => 
    field in value && isString(value[field])
  );
}

/**
 * 일정 객체인지 확인
 */
export function isSchedule(value: unknown): value is Schedule {
  if (!isObject(value)) return false;
  
  const requiredFields = ["id", "title", "start_date", "category"];
  
  return requiredFields.every(field => field in value);
}

/**
 * API 에러 응답인지 확인
 */
export function isApiError(value: unknown): value is { message: string; code?: string } {
  return isObject(value) && 
         "message" in value && 
         isString(value.message);
}

/**
 * Supabase 에러인지 확인
 */
export function isSupabaseError(value: unknown): value is { 
  message: string; 
  details?: string; 
  hint?: string; 
  code?: string;
} {
  return isObject(value) && 
         "message" in value && 
         isString(value.message);
}

/**
 * 유효한 이메일 형식인지 확인
 */
export function isValidEmail(value: unknown): value is string {
  if (!isString(value)) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * 유효한 전화번호 형식인지 확인 (한국)
 */
export function isValidPhoneNumber(value: unknown): value is string {
  if (!isString(value)) return false;
  
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return phoneRegex.test(value);
}

/**
 * 유효한 가격인지 확인
 */
export function isValidPrice(value: unknown): value is number {
  return isNumber(value) && value >= 0;
}

/**
 * 유효한 URL인지 확인
 */
export function isValidUrl(value: unknown): value is string {
  if (!isString(value)) return false;
  
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * 에러 메시지 추출 (다양한 에러 타입 지원)
 */
export function extractErrorMessage(error: unknown): string {
  if (isString(error)) return error;
  
  if (isApiError(error) || isSupabaseError(error)) {
    return error.message;
  }
  
  if (isObject(error)) {
    if ("message" in error && isString(error.message)) {
      return error.message;
    }
    
    if ("error" in error && isString(error.error)) {
      return error.error;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return "알 수 없는 오류가 발생했습니다.";
}

/**
 * Promise가 성공했는지 확인하는 타입 가드
 */
export function isPromiseSuccess<T>(
  result: PromiseSettledResult<T>
): result is PromiseFulfilledResult<T> {
  return result.status === "fulfilled";
}

/**
 * Promise가 실패했는지 확인하는 타입 가드
 */
export function isPromiseRejected<T>(
  result: PromiseSettledResult<T>
): result is PromiseRejectedResult {
  return result.status === "rejected";
}

/**
 * 개발 환경인지 확인
 */
export function isDevelopment(): boolean {
  return import.meta.env.MODE === "development";
}

/**
 * 프로덕션 환경인지 확인
 */
export function isProduction(): boolean {
  return import.meta.env.MODE === "production";
}