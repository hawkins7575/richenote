// ============================================================================
// 매물 서비스 전용 타입 정의
// ============================================================================

// 구조화된 description 파싱 결과
export interface ParsedPropertyInfo {
  landlord_name?: string
  landlord_phone?: string
  exit_date?: string
  detailed_address?: string
  parking: boolean
  elevator: boolean
  cleanDescription: string
  is_vacant?: boolean
  // 매물 상태 관련 코드 완전 삭제
}

// 데이터베이스 raw 데이터 타입
export interface PropertyDbRow {
  id: string
  tenant_id: string
  user_id: string
  title: string
  property_type: string
  transaction_type: string
  address: string
  area_exclusive: number
  floor_current: number
  floor_total: number
  rooms: number
  bathrooms: number
  price?: string | number
  deposit?: string | number
  monthly_rent?: string | number
  description?: string
  created_at: string
  updated_at: string
  status?: string
}

// API 결과 타입
export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

// 통계 조회 결과
export interface PropertyStatsResult {
  total: number
  active: number
  reserved: number
  sold: number
  this_month: number
  by_transaction_type: {
    sale: number
    jeonse: number
    monthly: number
  }
}