// ============================================================================
// 매물 데이터 파싱 유틸리티
// ============================================================================

import { DESCRIPTION_PATTERNS, FACILITY_KEYWORDS, DEFAULT_VALUES } from '@/constants/propertyConstants'
import type { ParsedPropertyInfo, PropertyDbRow } from '@/types/propertyService'
import type { Property } from '@/types'

// 캐시 메모리 (성능 최적화)
const parseCache = new Map<string, ParsedPropertyInfo>()

// 구조화된 description 파싱 (캐싱 적용)
export const parseStructuredDescription = (desc: string | null): ParsedPropertyInfo => {
  console.log('🔍 description 파싱 시작:', desc)
  
  if (!desc) {
    console.log('⚠️ description이 null/undefined - 기본값 반환')
    return {
      landlord_name: undefined,
      landlord_phone: undefined,
      exit_date: undefined,
      detailed_address: undefined,
      parking: false,
      elevator: false,
      cleanDescription: '',
      is_vacant: false,
      status: DEFAULT_VALUES.PROPERTY_STATUS
    }
  }

  // 캐시 확인
  if (parseCache.has(desc)) {
    return parseCache.get(desc)!
  }

  let cleanDescription = desc
  let landlord_name: string | undefined
  let landlord_phone: string | undefined
  let exit_date: string | undefined
  let detailed_address: string | undefined
  let parsedStatus: string = DEFAULT_VALUES.PROPERTY_STATUS
  let parking = false
  let elevator = false
  let is_vacant = false

  // 상태 정보 파싱
  const statusMatch = desc.match(DESCRIPTION_PATTERNS.STATUS)
  if (statusMatch) {
    parsedStatus = statusMatch[1].trim()
    cleanDescription = cleanDescription.replace(statusMatch[0], '').trim()
  }

  // 임대인 정보 파싱 (디버그 로깅 포함)
  const landlordMatch = desc.match(DESCRIPTION_PATTERNS.LANDLORD)
  console.log('🔍 임대인 정보 매칭 결과:', landlordMatch)
  
  if (landlordMatch) {
    const landlordText = landlordMatch[1]
    console.log('📝 임대인 텍스트:', landlordText)
    
    const nameMatch = landlordText.match(DESCRIPTION_PATTERNS.LANDLORD_NAME)
    const phoneMatch = landlordText.match(DESCRIPTION_PATTERNS.LANDLORD_PHONE)
    
    if (nameMatch) {
      landlord_name = nameMatch[1].trim()
      console.log('✅ 임대인 이름 파싱:', landlord_name)
    }
    if (phoneMatch) {
      landlord_phone = phoneMatch[1].trim()
      console.log('✅ 임대인 연락처 파싱:', landlord_phone)
    }
    
    cleanDescription = cleanDescription.replace(landlordMatch[0], '').trim()
  } else {
    console.log('⚠️ 임대인 정보 매칭 실패 - description에서 찾을 수 없음')
  }

  // 퇴실 예정일 파싱
  const exitMatch = desc.match(DESCRIPTION_PATTERNS.EXIT_DATE)
  if (exitMatch) {
    exit_date = exitMatch[1].trim()
    cleanDescription = cleanDescription.replace(exitMatch[0], '').trim()
  }

  // 거주현황(공실) 파싱
  const vacantMatch = desc.match(DESCRIPTION_PATTERNS.VACANT)
  if (vacantMatch) {
    is_vacant = true
    cleanDescription = cleanDescription.replace(vacantMatch[0], '').trim()
  }

  // 편의시설 파싱
  const facilityMatch = desc.match(DESCRIPTION_PATTERNS.FACILITIES)
  if (facilityMatch) {
    const facilityText = facilityMatch[1]
    parking = facilityText.includes(FACILITY_KEYWORDS.PARKING)
    elevator = facilityText.includes(FACILITY_KEYWORDS.ELEVATOR)
    cleanDescription = cleanDescription.replace(facilityMatch[0], '').trim()
  }

  // 상세주소 파싱
  const addressMatch = desc.match(DESCRIPTION_PATTERNS.DETAILED_ADDRESS)
  if (addressMatch) {
    detailed_address = addressMatch[1].trim()
    cleanDescription = cleanDescription.replace(addressMatch[0], '').trim()
  }

  // 연속된 줄바꿈 정리
  cleanDescription = cleanDescription.replace(DESCRIPTION_PATTERNS.CONSECUTIVE_NEWLINES, '\n').trim()

  const result: ParsedPropertyInfo = {
    landlord_name,
    landlord_phone,
    exit_date,
    detailed_address,
    parking,
    elevator,
    cleanDescription,
    is_vacant,
    status: parsedStatus
  }

  console.log('✅ 파싱 완료 결과:', {
    landlord_name,
    landlord_phone,
    exit_date,
    detailed_address,
    parking,
    elevator,
    has_clean_description: !!cleanDescription,
    is_vacant,
    status: parsedStatus
  })

  // 결과 캐싱 (메모리 제한)
  if (parseCache.size > 100) {
    const firstKey = parseCache.keys().next().value
    if (firstKey) {
      parseCache.delete(firstKey)
    }
  }
  parseCache.set(desc, result)

  return result
}

// DB row를 Property 타입으로 변환
export const transformDbRowToProperty = (item: PropertyDbRow, parsedInfo: ParsedPropertyInfo): Property => {
  if (!item.description && Object.keys(parsedInfo).length === 0) {
    // 빈 파싱 정보 처리
  }
  return {
    id: item.id,
    tenant_id: item.tenant_id,
    created_by: item.user_id,
    title: item.title,
    type: item.property_type as any,
    transaction_type: item.transaction_type as any,
    address: item.address,
    detailed_address: parsedInfo.detailed_address,
    area: item.area_exclusive,
    floor: item.floor_current,
    total_floors: item.floor_total,
    rooms: item.rooms,
    bathrooms: item.bathrooms,
    price: item.price ? parseFloat(String(item.price)) : undefined,
    deposit: item.deposit ? parseFloat(String(item.deposit)) : undefined,
    monthly_rent: item.monthly_rent ? parseFloat(String(item.monthly_rent)) : undefined,
    description: parsedInfo.cleanDescription || item.description || '',
    landlord_name: parsedInfo.landlord_name,
    landlord_phone: parsedInfo.landlord_phone,
    exit_date: parsedInfo.exit_date,
    parking: parsedInfo.parking,
    elevator: parsedInfo.elevator,
    images: [],
    is_featured: false,
    view_count: 0,
    created_at: item.created_at,
    updated_at: item.updated_at,
    status: parsedInfo.status as any || DEFAULT_VALUES.PROPERTY_STATUS as any,
    options: [],
    inquiry_count: 0,
    is_urgent: false,
    is_favorite: false
  }
}