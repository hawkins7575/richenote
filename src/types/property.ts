// ============================================================================
// 매물 관련 타입 정의 (MVP 기반 + SaaS 확장)
// ============================================================================

export type PropertyType =
  | "아파트"
  | "오피스텔"
  | "원룸"
  | "빌라"
  | "단독주택"
  | "상가"
  | "사무실"
  | "기타";

export type TransactionType = "매매" | "전세" | "월세" | "단기임대";

export type PropertyStatus = "거래중" | "거래완료";

export interface Property {
  id: string;
  tenant_id: string; // 멀티테넌트 지원
  created_by: string; // 등록한 사용자 ID
  assigned_to?: string; // 담당 중개사 ID

  // 기본 정보 (MVP 호환)
  title: string;
  type: PropertyType;
  transaction_type: TransactionType;
  status: PropertyStatus;

  // 가격 정보
  price?: number; // 매매가 (만원)
  deposit?: number; // 보증금 (만원)
  monthly_rent?: number; // 월세 (만원)
  maintenance_fee?: number; // 관리비 (만원)

  // 위치 정보
  address: string;
  detailed_address?: string;
  district?: string; // 구/군
  neighborhood?: string; // 동
  latitude?: number;
  longitude?: number;

  // 물리적 정보
  area: number; // 전용면적 (m²)
  area_common?: number; // 공용면적 (m²)
  floor: number;
  total_floors: number;
  rooms: number;
  bathrooms: number;

  // 편의시설
  parking: boolean;
  parking_spaces?: number;
  elevator: boolean;

  // 추가 옵션
  options: PropertyOption[];

  // 임대인 정보 (MVP 핵심 기능)
  landlord_name?: string;
  landlord_phone?: string;
  landlord_email?: string;

  // 중요 날짜 (MVP 차별화 기능)
  exit_date?: string; // 퇴실날짜 (YYYY-MM-DD)
  available_from?: string; // 입주 가능일
  contract_end_date?: string; // 계약 만료일

  // 미디어
  images: PropertyImage[];
  videos?: PropertyVideo[];
  virtual_tour_url?: string;

  // 설명 및 메모
  description?: string;
  private_notes?: string; // 내부용 메모

  // 마케팅 정보
  highlight_features?: string[]; // 특징 (역세권, 신축, 풀옵션 등)
  tags?: string[]; // 태그

  // 상태 관리
  view_count: number;
  inquiry_count: number;
  is_featured: boolean; // 추천 매물
  is_urgent: boolean; // 급매
  is_favorite: boolean; // 즐겨찾기 (사용자별)

  // 메타데이터
  created_at: string;
  updated_at: string;
  published_at?: string;
  expires_at?: string;

  // SaaS 확장 기능
  custom_fields?: Record<string, any>; // 테넌트별 커스텀 필드
  sync_status?: "pending" | "synced" | "error"; // 외부 플랫폼 동기화 상태
  external_listings?: ExternalListing[]; // 외부 플랫폼 연동 정보
}

export interface PropertyOption {
  id: string;
  name: string;
  category: "appliance" | "furniture" | "security" | "convenience" | "other";
  included: boolean;
}

export interface PropertyImage {
  id: string;
  url: string;
  thumbnail_url?: string;
  alt_text?: string;
  order: number;
  is_primary: boolean;
  room_type?: string; // 거실, 방1, 방2, 화장실, 주방 등
}

export interface PropertyVideo {
  id: string;
  url: string;
  thumbnail_url?: string;
  title?: string;
  duration?: number;
  order: number;
}

export interface ExternalListing {
  platform: string; // 'naver', 'zigbang', 'dabang' 등
  listing_id: string;
  url?: string;
  status: "active" | "inactive" | "error";
  last_synced_at?: string;
}

// 매물 검색 및 필터링
export interface PropertyFilters {
  // 기본 필터
  transaction_types?: TransactionType[];
  property_types?: PropertyType[];
  // 매물 상태 관련 코드 완전 삭제

  // 가격 범위
  price_min?: number;
  price_max?: number;
  deposit_min?: number;
  deposit_max?: number;
  monthly_rent_min?: number;
  monthly_rent_max?: number;

  // 위치
  districts?: string[];
  neighborhoods?: string[];

  // 면적 및 구조
  area_min?: number;
  area_max?: number;
  floor_min?: number;
  floor_max?: number;
  rooms_min?: number;
  rooms_max?: number;

  // 편의시설
  has_parking?: boolean;
  has_elevator?: boolean;

  // 날짜
  available_from?: string;
  exit_date_from?: string;
  exit_date_to?: string;

  // 기타
  is_featured?: boolean;
  is_urgent?: boolean;
  assigned_to?: string;
  created_by?: string;

  // 검색
  search_query?: string;

  // 정렬
  sort_by?: "created_at" | "updated_at" | "price" | "area" | "view_count";
  sort_order?: "asc" | "desc";

  // 페이지네이션
  page?: number;
  limit?: number;
}

// 매물 생성 요청
export interface CreatePropertyRequest {
  title: string;
  type: PropertyType;
  transaction_type: TransactionType;
  address: string;
  area: number;
  floor: number;
  total_floors: number;
  rooms: number;
  bathrooms: number;
  parking: boolean;
  elevator: boolean;

  // 선택적 필드
  price?: number;
  deposit?: number;
  monthly_rent?: number;
  detailed_address?: string;
  landlord_name?: string;
  landlord_phone?: string;
  exit_date?: string;
  description?: string;
  options?: PropertyOption[];
  images?: File[];
  highlight_features?: string[];
  custom_fields?: Record<string, any>;
}

// 매물 업데이트 요청
export interface UpdatePropertyRequest {
  title?: string;
  type?: PropertyType;
  transaction_type?: TransactionType;
  // 매물 상태 관련 코드 완전 삭제
  price?: number;
  deposit?: number;
  monthly_rent?: number;
  address?: string;
  detailed_address?: string;
  area?: number;
  floor?: number;
  total_floors?: number;
  rooms?: number;
  bathrooms?: number;
  parking?: boolean;
  elevator?: boolean;
  landlord_name?: string;
  landlord_phone?: string;
  exit_date?: string;
  available_from?: string;
  description?: string;
  private_notes?: string;
  options?: PropertyOption[];
  highlight_features?: string[];
  tags?: string[];
  is_featured?: boolean;
  is_urgent?: boolean;
  assigned_to?: string;
  custom_fields?: Record<string, any>;
}

// 매물 통계
export interface PropertyStats {
  total: number;
  // 매물 상태 관련 코드 완전 삭제
  by_type: Record<PropertyType, number>;
  by_transaction_type: Record<TransactionType, number>;
  average_price: number;
  average_area: number;
  this_month: number;
  view_count_total: number;
  inquiry_count_total: number;
}

// 매물 활동 기록
export interface PropertyActivity {
  id: string;
  property_id: string;
  user_id: string;
  action: "created" | "updated" | "viewed" | "inquired" | "deleted";
  details?: Record<string, any>;
  created_at: string;
}

// 서비스 레이어용 단순화된 타입들
export interface SimplePropertyFilters {
  search?: string;
  transaction_type?: string;
  property_type?: string;
  property_status?: string;
  status?: string;
  location?: string;
  price_min?: number;
  price_max?: number;
  created_after?: string;
  created_before?: string;
  limit?: number;
}

export interface CreatePropertyData {
  title: string;
  type: PropertyType;
  transaction_type: TransactionType;
  status: PropertyStatus;
  address: string;
  detailed_address?: string;
  area: number;
  floor: number;
  total_floors: number;
  rooms: number;
  bathrooms: number;
  parking: boolean;
  elevator: boolean;
  price?: number;
  deposit?: number;
  monthly_rent?: number;
  landlord_name?: string;
  landlord_phone?: string;
  exit_date?: string;
  description?: string;
  images?: string[];
  // 매물 상태 관련 코드 완전 삭제
}

export interface UpdatePropertyData {
  title?: string;
  type?: PropertyType;
  transaction_type?: TransactionType;
  status?: PropertyStatus;
  address?: string;
  detailed_address?: string;
  area?: number;
  floor?: number;
  total_floors?: number;
  rooms?: number;
  bathrooms?: number;
  parking?: boolean;
  elevator?: boolean;
  price?: number;
  deposit?: number;
  monthly_rent?: number;
  landlord_name?: string;
  landlord_phone?: string;
  exit_date?: string;
  description?: string;
}
