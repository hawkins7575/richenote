// ============================================================================
// API 응답 및 에러 관련 타입 정의
// ============================================================================

// 기본 API 응답 구조
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiError[];
  meta?: ResponseMeta;
}

// 페이지네이션이 포함된 응답
export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_previous: boolean;
    has_next: boolean;
  };
  meta?: ResponseMeta;
}

// 응답 메타데이터
export interface ResponseMeta {
  timestamp: string;
  request_id: string;
  version: string;
  execution_time_ms: number;
}

// API 에러
export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

// HTTP 메서드
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// API 요청 설정
export interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// 쿼리 매개변수 (검색, 필터링, 정렬)
export interface QueryParams {
  // 페이지네이션
  page?: number;
  limit?: number;

  // 정렬
  sort?: string; // 'field:asc' 또는 'field:desc' 형식

  // 검색
  search?: string;

  // 필터링 (동적 필드)
  [key: string]: any;
}

// Supabase 특화 쿼리 빌더 타입
export interface SupabaseQueryBuilder {
  select?: string;
  eq?: Record<string, any>;
  neq?: Record<string, any>;
  gt?: Record<string, any>;
  gte?: Record<string, any>;
  lt?: Record<string, any>;
  lte?: Record<string, any>;
  like?: Record<string, any>;
  ilike?: Record<string, any>;
  in?: Record<string, any[]>;
  contains?: Record<string, any>;
  range?: [number, number];
  order?: { column: string; ascending?: boolean }[];
}

// 벌크 작업 요청
export interface BulkOperation<T = any> {
  operation: "create" | "update" | "delete";
  data: T[];
  options?: {
    batch_size?: number;
    continue_on_error?: boolean;
    return_results?: boolean;
  };
}

// 벌크 작업 응답
export interface BulkOperationResponse<T = any> {
  success: boolean;
  total_requested: number;
  total_processed: number;
  total_succeeded: number;
  total_failed: number;
  results?: T[];
  errors?: {
    index: number;
    error: ApiError;
    data: any;
  }[];
}

// 파일 업로드 응답
export interface FileUploadResponse {
  success: boolean;
  file: {
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
    uploaded_at: string;
  };
  error?: ApiError;
}

// 실시간 이벤트 타입
export interface RealtimeEvent<T = any> {
  event: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  new?: T;
  old?: T;
  timestamp: string;
}

// 웹훅 이벤트
export interface WebhookEvent<T = any> {
  id: string;
  event_type: string;
  tenant_id: string;
  data: T;
  created_at: string;
  delivered_at?: string;
  attempts: number;
  next_retry?: string;
  status: "pending" | "delivered" | "failed" | "cancelled";
}

// API 키 정보
export interface ApiKey {
  id: string;
  name: string;
  key: string; // 마스킹된 키 (pk_****...)
  permissions: string[];
  last_used?: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

// 속도 제한 정보
export interface RateLimit {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  window: number; // seconds
}

// API 사용 통계
export interface ApiUsage {
  period: "hour" | "day" | "month";
  timestamp: string;
  calls: number;
  errors: number;
  average_response_time: number;
  peak_concurrent_requests: number;
}

// 헬스 체크 응답
export interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  timestamp: string;
  services: {
    database: "up" | "down";
    storage: "up" | "down";
    cache: "up" | "down";
    queue: "up" | "down";
  };
  metrics: {
    uptime_seconds: number;
    memory_usage_mb: number;
    cpu_usage_percent: number;
  };
}

// API 클라이언트 인터페이스
export interface ApiClient {
  // 기본 요청
  request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>>;

  // HTTP 메서드별 헬퍼
  get<T = any>(url: string, params?: QueryParams): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: any): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: any): Promise<ApiResponse<T>>;
  patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>>;
  delete<T = any>(url: string): Promise<ApiResponse<T>>;

  // 페이지네이션
  paginate<T = any>(
    url: string,
    params?: QueryParams,
  ): Promise<PaginatedResponse<T>>;

  // 파일 업로드
  upload(file: File, path?: string): Promise<FileUploadResponse>;

  // 벌크 작업
  bulk<T = any>(operation: BulkOperation<T>): Promise<BulkOperationResponse<T>>;

  // 설정
  setBaseURL(url: string): void;
  setDefaultHeaders(headers: Record<string, string>): void;
  setAuthToken(token: string): void;
  setTimeout(timeout: number): void;
}

// 에러 핸들러 타입
export type ApiErrorHandler = (error: ApiError, context?: any) => void;

// 재시도 정책
export interface RetryPolicy {
  attempts: number;
  delay: number; // ms
  backoff?: "linear" | "exponential";
  retryOn?: (error: ApiError) => boolean;
}
