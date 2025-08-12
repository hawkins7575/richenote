// ============================================================================
// 에러 메시지 한국어화 및 표준화 유틸리티
// ============================================================================

import type { AuthError } from "@supabase/supabase-js";

// Supabase Auth 에러 메시지 매핑
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // 로그인 관련
  'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'Email not confirmed': '이메일 인증이 필요합니다. 메일함을 확인해주세요.',
  'Too many requests': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
  'Invalid email': '올바른 이메일 형식을 입력해주세요.',

  // 회원가입 관련  
  'User already registered': '이미 등록된 이메일 주소입니다.',
  'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다.',
  'Password should be at least 8 characters': '비밀번호는 최소 8자 이상이어야 합니다.',
  'Weak password': '더 강한 비밀번호를 사용해주세요.',
  'Email address is invalid': '올바른 이메일 주소를 입력해주세요.',
  
  // 비밀번호 재설정
  'Unable to validate email address: invalid format': '올바른 이메일 형식을 입력해주세요.',
  'Email rate limit exceeded': '이메일 전송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',

  // 세션 관련
  'Invalid refresh token': '세션이 만료되었습니다. 다시 로그인해주세요.',
  'Refresh token is expired': '세션이 만료되었습니다. 다시 로그인해주세요.',
  'JWT expired': '로그인 세션이 만료되었습니다. 다시 로그인해주세요.',

  // 권한 관련
  'Insufficient privileges': '충분한 권한이 없습니다.',
  'Access denied': '접근이 거부되었습니다.',

  // 네트워크 관련
  'Network request failed': '네트워크 연결을 확인해주세요.',
  'Request timeout': '요청 시간이 초과되었습니다. 다시 시도해주세요.',

  // 일반적인 에러
  'Internal server error': '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  'Service temporarily unavailable': '서비스가 일시적으로 사용할 수 없습니다.',
  'Database connection failed': '데이터베이스 연결에 실패했습니다.',
};

// 에러 코드별 메시지
export const ERROR_CODE_MESSAGES: Record<string, string> = {
  // HTTP 상태 코드
  '400': '잘못된 요청입니다.',
  '401': '인증이 필요합니다.',
  '403': '접근 권한이 없습니다.',
  '404': '요청한 리소스를 찾을 수 없습니다.',
  '422': '입력 데이터에 오류가 있습니다.',
  '429': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
  '500': '서버 내부 오류가 발생했습니다.',
  '502': '서버 게이트웨이 오류입니다.',
  '503': '서비스가 일시적으로 사용할 수 없습니다.',

  // Supabase 에러 코드
  'PGRST116': '요청한 데이터를 찾을 수 없습니다.',
  'PGRST301': '권한이 없습니다.',
  '23505': '이미 존재하는 데이터입니다.',
  '23503': '관련 데이터가 존재하지 않습니다.',
};

// 에러 타입별 기본 메시지
export const ERROR_TYPE_MESSAGES: Record<string, string> = {
  'auth': '인증 과정에서 오류가 발생했습니다.',
  'database': '데이터베이스 작업 중 오류가 발생했습니다.',
  'network': '네트워크 연결 오류가 발생했습니다.',
  'validation': '입력 데이터가 올바르지 않습니다.',
  'permission': '접근 권한이 없습니다.',
  'unknown': '알 수 없는 오류가 발생했습니다.',
};

// 메인 에러 메시지 변환 함수
export const getKoreanErrorMessage = (error: AuthError | Error | string): string => {
  // 문자열인 경우 직접 처리
  if (typeof error === 'string') {
    return AUTH_ERROR_MESSAGES[error] || error;
  }

  // AuthError 또는 Error 객체인 경우
  const errorMessage = error.message || '';
  
  // 1. 직접 매칭
  if (AUTH_ERROR_MESSAGES[errorMessage]) {
    return AUTH_ERROR_MESSAGES[errorMessage];
  }

  // 2. 부분 매칭 (키워드 기반)
  for (const [key, value] of Object.entries(AUTH_ERROR_MESSAGES)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // 3. 에러 코드로 매칭 (AuthError의 경우)
  if ('code' in error && error.code && ERROR_CODE_MESSAGES[error.code]) {
    return ERROR_CODE_MESSAGES[error.code];
  }

  // 4. HTTP 상태 코드로 매칭
  if ('status' in error && error.status && ERROR_CODE_MESSAGES[error.status.toString()]) {
    return ERROR_CODE_MESSAGES[error.status.toString()];
  }

  // 5. 일반적인 패턴 매칭
  if (errorMessage.includes('timeout')) {
    return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return '네트워크 연결을 확인해주세요.';
  }

  if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
    return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  // 6. 기본 메시지 반환
  return errorMessage || '알 수 없는 오류가 발생했습니다.';
};

// 에러 타입 감지
export const getErrorType = (error: AuthError | Error | string): string => {
  const errorMessage = typeof error === 'string' ? error : error.message || '';
  
  if (errorMessage.includes('auth') || errorMessage.includes('login') || errorMessage.includes('credential')) {
    return 'auth';
  }
  
  if (errorMessage.includes('database') || errorMessage.includes('PGRST')) {
    return 'database';
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('connection') || errorMessage.includes('timeout')) {
    return 'network';
  }
  
  if (errorMessage.includes('validation') || errorMessage.includes('invalid') || errorMessage.includes('format')) {
    return 'validation';
  }
  
  if (errorMessage.includes('permission') || errorMessage.includes('denied') || errorMessage.includes('unauthorized')) {
    return 'permission';
  }
  
  return 'unknown';
};

// 에러 심각도 평가
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export const getErrorSeverity = (error: AuthError | Error | string): ErrorSeverity => {
  const errorMessage = typeof error === 'string' ? error : error.message || '';
  
  // 치명적 에러
  if (errorMessage.includes('internal server error') || 
      errorMessage.includes('database connection failed') ||
      errorMessage.includes('service unavailable')) {
    return 'critical';
  }
  
  // 높은 우선순위
  if (errorMessage.includes('unauthorized') || 
      errorMessage.includes('access denied') ||
      errorMessage.includes('session expired')) {
    return 'high';
  }
  
  // 중간 우선순위  
  if (errorMessage.includes('invalid') || 
      errorMessage.includes('not found') ||
      errorMessage.includes('rate limit')) {
    return 'medium';
  }
  
  // 낮은 우선순위
  return 'low';
};

// 사용자 친화적 에러 메시지 생성
export const createUserFriendlyError = (
  error: AuthError | Error | string,
  context?: string
): { message: string; type: string; severity: ErrorSeverity; suggestions?: string[] } => {
  const message = getKoreanErrorMessage(error);
  const type = getErrorType(error);
  const severity = getErrorSeverity(error);
  
  let suggestions: string[] = [];
  
  // 컨텍스트와 에러 타입에 따른 제안사항
  if (type === 'auth' || context === 'login') {
    suggestions = [
      '이메일 주소를 다시 확인해주세요.',
      '비밀번호를 정확히 입력했는지 확인해주세요.',
      '비밀번호를 잊으신 경우 "비밀번호를 잊으셨나요?" 링크를 클릭해주세요.'
    ];
  } else if (type === 'network') {
    suggestions = [
      '인터넷 연결 상태를 확인해주세요.',
      '잠시 후 다시 시도해주세요.',
      '문제가 지속되면 관리자에게 문의해주세요.'
    ];
  } else if (type === 'validation') {
    suggestions = [
      '입력한 정보를 다시 확인해주세요.',
      '필수 항목이 모두 입력되었는지 확인해주세요.'
    ];
  }
  
  return {
    message,
    type,
    severity,
    suggestions: suggestions.length > 0 ? suggestions : undefined
  };
};