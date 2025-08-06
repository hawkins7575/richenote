// ============================================================================
// 매물 관련 상수 정의
// ============================================================================

// 구조화된 description 태그
export const DESCRIPTION_TAGS = {
  LANDLORD_INFO: '임대인정보',
  EXIT_DATE: '퇴실예정',
  FACILITIES: '편의시설',
  DETAILED_ADDRESS: '상세주소',
  OCCUPANCY_STATUS: '거주현황',
  STATUS: '상태'
} as const

// 정규식 패턴
export const DESCRIPTION_PATTERNS = {
  LANDLORD: /\[임대인정보\]\s*([^\n\[]+)/,
  LANDLORD_NAME: /임대인:\s*([^|]+)/,
  LANDLORD_PHONE: /연락처:\s*([^|]+)/,
  EXIT_DATE: /\[퇴실예정\]\s*([^\n\[]+)/,
  VACANT: /\[거주현황\]\s*공실/,
  FACILITIES: /\[편의시설\]\s*([^\n\[]+)/,
  DETAILED_ADDRESS: /\[상세주소\]\s*([^\n\[]+)/,
  STATUS: /\[상태\]\s*([^\n\[]+)/,
  CONSECUTIVE_NEWLINES: /\n\s*\n/g
} as const

// 편의시설 키워드
export const FACILITY_KEYWORDS = {
  PARKING: '주차가능',
  ELEVATOR: '엘리베이터'
} as const

// 기본값
export const DEFAULT_VALUES = {
  PROPERTY_STATUS: '판매중',
  FLOOR: 1,
  TOTAL_FLOORS: 1,
  AREA: 0,
  ROOMS: 1,
  BATHROOMS: 1
} as const

// 에러 메시지
export const ERROR_MESSAGES = {
  MISSING_TENANT_USER: '테넌트 ID 또는 사용자 ID가 없습니다.',
  MISSING_REQUIRED_FIELDS: '제목과 주소는 필수 입력 항목입니다.',
  DATABASE_ERROR: '데이터베이스 오류',
  PROPERTY_NOT_FOUND: 'Property not found'
} as const