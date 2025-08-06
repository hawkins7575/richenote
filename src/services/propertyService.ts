// ============================================================================
// 매물 관리 서비스 - Supabase 통합
// ============================================================================

import { supabase } from './supabase'
import type { Property, SimplePropertyFilters, CreatePropertyData, UpdatePropertyData } from '@/types'
import type { PropertyDbRow } from '@/types/propertyService'
import { parseStructuredDescription, transformDbRowToProperty } from '@/utils/propertyParsing'
import { ERROR_MESSAGES, DEFAULT_VALUES } from '@/constants/propertyConstants'

// 🚨 강제로 프로덕션 모드 사용 - Mock 서비스 완전 비활성화
const isDevelopment = false

// 🚨 Mock 서비스 완전 비활성화 - 항상 실제 Supabase 사용
// let mockService: any = null
// if (isDevelopment) {
//   import('./mockPropertyService').then(service => {
//     mockService = service
//   })
// }

// 매물 조회 (사용자별 개별 관리)
export const getProperties = async (tenantId: string, filters?: SimplePropertyFilters) => {
  console.log('🔍 매물 조회 시작 (사용자별):', { tenantId, filters })
  console.log('🔧 Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
  console.log('🔧 Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '설정됨' : '없음')
  
  try {
    console.log('📡 사용자별 매물 조회 중...')
    console.log('📊 조회 쿼리 정보:', {
      table: 'properties',
      tenant_id: tenantId,
      user_id: tenantId // 사용자 ID와 tenant_id가 동일
    })
    
    // 사용자별 개별 데이터 조회: tenant_id 또는 user_id로 필터링
    let query = supabase
      .from('properties')
      .select('*')
      .or(`tenant_id.eq.${tenantId},user_id.eq.${tenantId}`) // 기존 데이터 호환성
      .order('created_at', { ascending: false })

    // 필터 적용
    if (filters) {
      console.log('🔧 필터 적용 중:', filters)
      
      if (filters.search) {
        console.log('🔍 검색 필터 적용:', filters.search)
        query = query.or(`title.ilike.%${filters.search}%,address.ilike.%${filters.search}%`)
      }
      
      if (filters.transaction_type && filters.transaction_type !== '전체') {
        console.log('💰 거래유형 필터 적용:', filters.transaction_type)
        query = query.eq('transaction_type', filters.transaction_type)
      }
      
      if (filters.property_type && filters.property_type !== '전체') {
        console.log('🏠 매물유형 필터 적용:', filters.property_type)
        query = query.eq('property_type', filters.property_type)
      }
      
      if (filters.status && filters.status !== '') {
        console.log('📊 상태 필터 적용:', filters.status)
        // DB에 status 컬럼이 아직 없으므로 프론트엔드에서 필터링 처리
        // 실제 DB 컬럼이 추가되면 이 로직을 query.eq로 변경
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Supabase 조회 에러:', error)
      console.error('❌ 에러 세부사항:', { message: error.message, details: error.details, hint: error.hint, code: error.code })
      throw error
    }

    console.log('✅ Supabase 조회 성공!')
    console.log('📊 조회된 원본 데이터 개수:', data?.length || 0)
    console.log('📋 첫 번째 데이터 샘플:', data?.[0])

    // 데이터 변환하여 프론트엔드 타입에 맞춤
    let transformedData = (data || []).map((item: PropertyDbRow) => {
      const parsedInfo = parseStructuredDescription(item.description || null)
      
      // 로컬 저장소에서 상태 확인 (호환성 유지)
      const statusKey = `property_status_${item.id}`
      const savedStatus = localStorage.getItem(statusKey)
      const assignedStatus = savedStatus || parsedInfo.status || DEFAULT_VALUES.PROPERTY_STATUS
      
      const property = transformDbRowToProperty(item, parsedInfo)
      property.status = assignedStatus as any
      
      return property
    })

    // 상태 필터링을 프론트엔드에서 처리 (DB 컬럼 추가 전까지)
    if (filters?.status && filters.status !== '') {
      transformedData = transformedData.filter(item => item.status === filters.status)
    }

    console.log('🔄 변환된 데이터:', transformedData)
    console.log('📊 최종 반환 데이터 개수:', transformedData.length)
    
    return transformedData
  } catch (error) {
    console.error('💥 getProperties 전체 에러:', error)
    console.error('💥 에러 타입:', typeof error)
    console.error('💥 에러 정보:', error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error)
    throw error
  }
}

// 매물 상세 조회
export const getProperty = async (propertyId: string, tenantId: string) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        landlord:user_profiles!properties_landlord_id_fkey(
          id,
          name,
          phone,
          email
        )
      `)
      .eq('id', propertyId)
      .eq('tenant_id', tenantId)
      .single()

    if (error) {
      console.error('Error fetching property:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in getProperty:', error)
    throw error
  }
}

// 매물 생성
export const createProperty = async (propertyData: CreatePropertyData, tenantId: string, userId: string) => {
  console.log('🏠 매물 생성 시작:', { propertyData, tenantId, userId, isDevelopment })
  
  // 필수 파라미터 검증
  if (!tenantId || !userId) {
    console.error('❌ 필수 파라미터 누락:', { tenantId, userId })
    throw new Error(ERROR_MESSAGES.MISSING_TENANT_USER)
  }
  
  // 필수 필드 검증
  if (!propertyData.title || !propertyData.address) {
    console.error('❌ 필수 필드 누락:', { title: propertyData.title, address: propertyData.address })
    throw new Error(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS)
  }
  
  try {
    console.log('📡 실제 Supabase에 매물 생성 요청 중...')
    // 프론트엔드 데이터를 데이터베이스 스키마에 맞게 변환
    
    // 임대인 정보와 기타 정보를 description에 구조화하여 저장
    let structuredDescription = propertyData.description || ''
    
    // 임대인 정보 추가
    if (propertyData.landlord_name || propertyData.landlord_phone) {
      const landlordInfo = []
      if (propertyData.landlord_name) landlordInfo.push(`임대인: ${propertyData.landlord_name}`)
      if (propertyData.landlord_phone) landlordInfo.push(`연락처: ${propertyData.landlord_phone}`)
      
      const landlordSection = `[임대인정보] ${landlordInfo.join(' | ')}`
      structuredDescription = landlordSection + (structuredDescription ? `\n\n${structuredDescription}` : '')
    }
    
    // 퇴실 예정일 또는 공실 상태 추가
    if (propertyData.exit_date) {
      const exitInfo = `[퇴실예정] ${propertyData.exit_date}`
      structuredDescription = (structuredDescription ? `${structuredDescription}\n\n` : '') + exitInfo
    } else {
      // exit_date가 없으면 공실로 처리
      const vacantInfo = `[거주현황] 공실`
      structuredDescription = (structuredDescription ? `${structuredDescription}\n\n` : '') + vacantInfo
    }
    
    // 편의시설 정보 추가
    const facilities = []
    if (propertyData.parking) facilities.push('주차가능')
    if (propertyData.elevator) facilities.push('엘리베이터')
    if (facilities.length > 0) {
      const facilityInfo = `[편의시설] ${facilities.join(', ')}`
      structuredDescription = (structuredDescription ? `${structuredDescription}\n\n` : '') + facilityInfo
    }
    
    // 상세 주소 정보 추가
    if (propertyData.detailed_address) {
      const addressInfo = `[상세주소] ${propertyData.detailed_address}`
      structuredDescription = (structuredDescription ? `${structuredDescription}\n\n` : '') + addressInfo
    }
    
    // 실제 DB에 존재하는 컬럼만 사용 - 사용자별 개별 관리
    const dbData = {
      tenant_id: userId, // 사용자 ID를 tenant_id로 사용하여 완전 개별 관리
      user_id: userId,
      title: propertyData.title,
      address: propertyData.address || '',
      property_type: propertyData.type,
      transaction_type: propertyData.transaction_type,
      price: propertyData.price || null,
      deposit: propertyData.deposit || null,
      monthly_rent: propertyData.monthly_rent || null,
      floor_current: propertyData.floor || DEFAULT_VALUES.FLOOR,
      floor_total: propertyData.total_floors || DEFAULT_VALUES.TOTAL_FLOORS,
      area_exclusive: propertyData.area || DEFAULT_VALUES.AREA,
      rooms: propertyData.rooms || DEFAULT_VALUES.ROOMS,
      bathrooms: propertyData.bathrooms || DEFAULT_VALUES.BATHROOMS,
      description: structuredDescription || null
    }

    console.log('💾 데이터베이스 삽입 데이터:', dbData)
    console.log('🔍 Supabase 연결 정보:', {
      url: import.meta.env.VITE_SUPABASE_URL ? '설정됨' : '없음',
      key: import.meta.env.VITE_SUPABASE_ANON_KEY ? '설정됨' : '없음'
    })
    
    const { data, error } = await supabase
      .from('properties')
      .insert(dbData)
      .select('*')
      .single()

    if (error) {
      console.error('❌ 매물 생성 실패:', error)
      console.error('❌ 에러 코드:', error.code)
      console.error('❌ 에러 메시지:', error.message)
      console.error('❌ 에러 세부사항:', error.details)
      console.error('❌ 에러 힌트:', error.hint)
      throw new Error(`${ERROR_MESSAGES.DATABASE_ERROR}: ${error.message}`)
    }
    
    console.log('✅ 매물 생성 성공:', data)

    const parsedInfo = parseStructuredDescription(data.description)
    const transformedData = transformDbRowToProperty(data as PropertyDbRow, parsedInfo)
    transformedData.status = propertyData.status as any || DEFAULT_VALUES.PROPERTY_STATUS as any

    return transformedData
  } catch (error) {
    console.error('Error in createProperty:', error)
    throw error
  }
}

// 매물 수정
export const updateProperty = async (propertyId: string, propertyData: UpdatePropertyData, tenantId: string) => {
  console.log('🔄 매물 수정 시작:', { propertyId, propertyData, tenantId })
  
  try {
    // 기존 데이터 조회 (사용자별 개별 관리)
    const { data: existingData } = await supabase
      .from('properties')
      .select('description')
      .eq('id', propertyId)
      .or(`tenant_id.eq.${tenantId},user_id.eq.${tenantId}`) // 기존 데이터 호환성
      .single()

    // 기존 description에서 정보 파싱
    const parseExistingInfo = (desc: string | null) => {
      if (!desc) return { cleanDescription: '' }
      
      let cleanDescription = desc
      
      // 기존 구조화된 정보들 제거
      cleanDescription = cleanDescription.replace(/\[임대인정보\][^\n\[]*/, '').trim()
      cleanDescription = cleanDescription.replace(/\[퇴실예정\][^\n\[]*/, '').trim()
      cleanDescription = cleanDescription.replace(/\[편의시설\][^\n\[]*/, '').trim()
      cleanDescription = cleanDescription.replace(/\[상세주소\][^\n\[]*/, '').trim()
      cleanDescription = cleanDescription.replace(/\n\s*\n/g, '\n').trim()
      
      return { cleanDescription }
    }
    
    const existingInfo = parseExistingInfo(existingData?.description)
    
    // 새로운 구조화된 description 생성
    let newStructuredDescription = propertyData.description !== undefined ? propertyData.description : existingInfo.cleanDescription
    
    // 임대인 정보 추가
    if (propertyData.landlord_name || propertyData.landlord_phone) {
      const landlordInfo = []
      if (propertyData.landlord_name) landlordInfo.push(`임대인: ${propertyData.landlord_name}`)
      if (propertyData.landlord_phone) landlordInfo.push(`연락처: ${propertyData.landlord_phone}`)
      
      const landlordSection = `[임대인정보] ${landlordInfo.join(' | ')}`
      newStructuredDescription = landlordSection + (newStructuredDescription ? `\n\n${newStructuredDescription}` : '')
    }
    
    // 퇴실 예정일 추가
    if (propertyData.exit_date) {
      const exitInfo = `[퇴실예정] ${propertyData.exit_date}`
      newStructuredDescription = (newStructuredDescription ? `${newStructuredDescription}\n\n` : '') + exitInfo
    }
    
    // 편의시설 정보 추가
    const facilities = []
    if (propertyData.parking) facilities.push('주차가능')
    if (propertyData.elevator) facilities.push('엘리베이터')
    if (facilities.length > 0) {
      const facilityInfo = `[편의시설] ${facilities.join(', ')}`
      newStructuredDescription = (newStructuredDescription ? `${newStructuredDescription}\n\n` : '') + facilityInfo
    }
    
    // 상세 주소 정보 추가
    if (propertyData.detailed_address) {
      const addressInfo = `[상세주소] ${propertyData.detailed_address}`
      newStructuredDescription = (newStructuredDescription ? `${newStructuredDescription}\n\n` : '') + addressInfo
    }
    
    // 프론트엔드 데이터를 데이터베이스 스키마에 맞게 변환
    const dbData: any = {}
    
    // 기본 필드들만 DB에 저장
    if (propertyData.title !== undefined) dbData.title = propertyData.title
    if (propertyData.type !== undefined) dbData.property_type = propertyData.type
    if (propertyData.transaction_type !== undefined) dbData.transaction_type = propertyData.transaction_type
    if (propertyData.address !== undefined) dbData.address = propertyData.address
    if (propertyData.area !== undefined) dbData.area_exclusive = propertyData.area
    if (propertyData.floor !== undefined) dbData.floor_current = propertyData.floor
    if (propertyData.total_floors !== undefined) dbData.floor_total = propertyData.total_floors
    if (propertyData.rooms !== undefined) dbData.rooms = propertyData.rooms
    if (propertyData.bathrooms !== undefined) dbData.bathrooms = propertyData.bathrooms
    if (propertyData.price !== undefined) dbData.price = propertyData.price
    if (propertyData.deposit !== undefined) dbData.deposit = propertyData.deposit
    if (propertyData.monthly_rent !== undefined) dbData.monthly_rent = propertyData.monthly_rent
    
    // 구조화된 description 저장
    dbData.description = newStructuredDescription || null

    console.log('💾 데이터베이스 업데이트 데이터:', dbData)

    const { data, error } = await supabase
      .from('properties')
      .update(dbData)
      .eq('id', propertyId)
      .or(`tenant_id.eq.${tenantId},user_id.eq.${tenantId}`) // 기존 데이터 호환성
      .select()
      .single()

    if (error) {
      console.error('❌ 매물 수정 실패:', error)
      throw new Error(`데이터베이스 오류: ${error.message}`)
    }

    console.log('✅ 데이터베이스 수정 성공:', data)

    // description에서 구조화된 정보 파싱
    const parseStructuredDescription = (desc: string | null) => {
      if (!desc) return { landlord_name: undefined, landlord_phone: undefined, exit_date: undefined, detailed_address: undefined, parking: false, elevator: false, cleanDescription: '' }
      
      let cleanDescription = desc
      let landlord_name, landlord_phone, exit_date, detailed_address
      let parking = false, elevator = false
      
      // 임대인 정보 파싱
      const landlordMatch = desc.match(/\[임대인정보\]\s*([^\n\[]+)/)
      if (landlordMatch) {
        const landlordText = landlordMatch[1]
        const nameMatch = landlordText.match(/임대인:\s*([^|]+)/)
        const phoneMatch = landlordText.match(/연락처:\s*([^|]+)/)
        
        if (nameMatch) landlord_name = nameMatch[1].trim()
        if (phoneMatch) landlord_phone = phoneMatch[1].trim()
        
        cleanDescription = cleanDescription.replace(landlordMatch[0], '').trim()
      }
      
      // 퇴실 예정일 파싱
      const exitMatch = desc.match(/\[퇴실예정\]\s*([^\n\[]+)/)
      if (exitMatch) {
        exit_date = exitMatch[1].trim()
        cleanDescription = cleanDescription.replace(exitMatch[0], '').trim()
      }
      
      // 편의시설 파싱
      const facilityMatch = desc.match(/\[편의시설\]\s*([^\n\[]+)/)
      if (facilityMatch) {
        const facilityText = facilityMatch[1]
        parking = facilityText.includes('주차가능')
        elevator = facilityText.includes('엘리베이터')
        cleanDescription = cleanDescription.replace(facilityMatch[0], '').trim()
      }
      
      // 상세주소 파싱
      const addressMatch = desc.match(/\[상세주소\]\s*([^\n\[]+)/)
      if (addressMatch) {
        detailed_address = addressMatch[1].trim()
        cleanDescription = cleanDescription.replace(addressMatch[0], '').trim()
      }
      
      // 연속된 줄바꿈 정리
      cleanDescription = cleanDescription.replace(/\n\s*\n/g, '\n').trim()
      
      return { landlord_name, landlord_phone, exit_date, detailed_address, parking, elevator, cleanDescription }
    }

    const parsedInfo = parseStructuredDescription(data.description)

    // 프론트엔드 타입에 맞게 변환하여 반환
    const transformedData = {
      id: data.id,
      tenant_id: data.tenant_id,
      created_by: data.user_id,
      title: data.title,
      type: data.property_type,
      transaction_type: data.transaction_type,
      address: data.address,
      detailed_address: parsedInfo.detailed_address,
      area: data.area_exclusive,
      floor: data.floor_current,
      total_floors: data.floor_total,
      rooms: data.rooms,
      bathrooms: data.bathrooms,
      price: data.price ? parseFloat(data.price) : undefined,
      deposit: data.deposit ? parseFloat(data.deposit) : undefined,
      monthly_rent: data.monthly_rent ? parseFloat(data.monthly_rent) : undefined,
      description: parsedInfo.cleanDescription || data.description,
      // description에서 파싱된 임대인 정보 사용
      landlord_name: parsedInfo.landlord_name,
      landlord_phone: parsedInfo.landlord_phone,
      exit_date: parsedInfo.exit_date,
      parking: parsedInfo.parking,
      elevator: parsedInfo.elevator,
      images: [],
      is_featured: false,
      view_count: 0,
      created_at: data.created_at,
      updated_at: data.updated_at,
      status: propertyData.status || '판매중',
      options: [],
      inquiry_count: 0,
      is_urgent: false,
      is_favorite: false
    }

    console.log('✅ 매물 수정 완료:', transformedData)
    return transformedData
  } catch (error) {
    console.error('💥 updateProperty 전체 에러:', error)
    throw error
  }
}

// 매물 삭제
export const deleteProperty = async (propertyId: string, tenantId: string) => {
  console.log('🗑️ 매물 삭제 시작:', { propertyId, tenantId })
  
  try {
    // 데이터베이스에서 삭제 (사용자별 개별 관리)
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .or(`tenant_id.eq.${tenantId},user_id.eq.${tenantId}`) // 기존 데이터 호환성

    if (error) {
      console.error('❌ 매물 삭제 실패:', error)
      throw new Error(`데이터베이스 오류: ${error.message}`)
    }

    console.log('✅ 매물 삭제 완료')
    return true
  } catch (error) {
    console.error('💥 deleteProperty 전체 에러:', error)
    throw error
  }
}

// 매물 상태 업데이트 (description에 상태 정보 저장)
export const updatePropertyStatus = async (propertyId: string, status: Property['status'], tenantId: string) => {
  try {
    console.log('🔄 매물 상태 업데이트:', { propertyId, status, tenantId })
    
    // 기존 데이터 조회 (사용자별 개별 관리)
    const { data: existingData, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .or(`tenant_id.eq.${tenantId},user_id.eq.${tenantId}`) // 기존 데이터 호환성
      .single()

    if (fetchError) {
      console.error('Error fetching property for status update:', fetchError)
      throw fetchError
    }

    // description에 상태 정보 추가/업데이트
    let updatedDescription = existingData.description || ''
    
    // 기존 상태 정보 제거
    updatedDescription = updatedDescription.replace(/\[상태\][^\n\[]*/, '').trim()
    
    // 새 상태 정보 추가
    const statusInfo = `[상태] ${status}`
    updatedDescription = statusInfo + (updatedDescription ? `\n\n${updatedDescription}` : '')

    // 상태 정보가 포함된 description 업데이트 (사용자별 개별 관리)
    const { data, error } = await supabase
      .from('properties')
      .update({ description: updatedDescription })
      .eq('id', propertyId)
      .or(`tenant_id.eq.${tenantId},user_id.eq.${tenantId}`) // 기존 데이터 호환성
      .select('*')
      .single()

    if (error) {
      console.error('Error updating property status:', error)
      throw error
    }

    // description에서 구조화된 정보 파싱하여 반환
    const parseStructuredDescription = (desc: string | null) => {
      if (!desc) return { landlord_name: undefined, landlord_phone: undefined, exit_date: undefined, detailed_address: undefined, parking: false, elevator: false, cleanDescription: '', status: '판매중' }
      
      let cleanDescription = desc
      let landlord_name, landlord_phone, exit_date, detailed_address, parsedStatus = '판매중'
      let parking = false, elevator = false
      
      // 상태 정보 파싱
      const statusMatch = desc.match(/\[상태\]\s*([^\n\[]+)/)
      if (statusMatch) {
        parsedStatus = statusMatch[1].trim()
        cleanDescription = cleanDescription.replace(statusMatch[0], '').trim()
      }
      
      // 기타 정보들도 파싱 (기존 로직 재사용)
      const landlordMatch = desc.match(/\[임대인정보\]\s*([^\n\[]+)/)
      if (landlordMatch) {
        const landlordText = landlordMatch[1]
        const nameMatch = landlordText.match(/임대인:\s*([^|]+)/)
        const phoneMatch = landlordText.match(/연락처:\s*([^|]+)/)
        
        if (nameMatch) landlord_name = nameMatch[1].trim()
        if (phoneMatch) landlord_phone = phoneMatch[1].trim()
        
        cleanDescription = cleanDescription.replace(landlordMatch[0], '').trim()
      }
      
      const exitMatch = desc.match(/\[퇴실예정\]\s*([^\n\[]+)/)
      if (exitMatch) {
        exit_date = exitMatch[1].trim()
        cleanDescription = cleanDescription.replace(exitMatch[0], '').trim()
      }
      
      const facilityMatch = desc.match(/\[편의시설\]\s*([^\n\[]+)/)
      if (facilityMatch) {
        const facilityText = facilityMatch[1]
        parking = facilityText.includes('주차가능')
        elevator = facilityText.includes('엘리베이터')
        cleanDescription = cleanDescription.replace(facilityMatch[0], '').trim()
      }
      
      const addressMatch = desc.match(/\[상세주소\]\s*([^\n\[]+)/)
      if (addressMatch) {
        detailed_address = addressMatch[1].trim()
        cleanDescription = cleanDescription.replace(addressMatch[0], '').trim()
      }
      
      cleanDescription = cleanDescription.replace(/\n\s*\n/g, '\n').trim()
      
      return { landlord_name, landlord_phone, exit_date, detailed_address, parking, elevator, cleanDescription, status: parsedStatus }
    }

    const parsedInfo = parseStructuredDescription(data.description)

    const updatedData = {
      id: data.id,
      tenant_id: data.tenant_id,
      created_by: data.user_id,
      title: data.title,
      type: data.property_type,
      transaction_type: data.transaction_type,
      address: data.address,
      detailed_address: parsedInfo.detailed_address,
      area: data.area_exclusive,
      floor: data.floor_current,
      total_floors: data.floor_total,
      rooms: data.rooms,
      bathrooms: data.bathrooms,
      price: data.price ? parseFloat(data.price) : undefined,
      deposit: data.deposit ? parseFloat(data.deposit) : undefined,
      monthly_rent: data.monthly_rent ? parseFloat(data.monthly_rent) : undefined,
      description: parsedInfo.cleanDescription,
      landlord_name: parsedInfo.landlord_name,
      landlord_phone: parsedInfo.landlord_phone,
      exit_date: parsedInfo.exit_date,
      parking: parsedInfo.parking,
      elevator: parsedInfo.elevator,
      status: parsedInfo.status,
      updated_at: data.updated_at || new Date().toISOString(),
      created_at: data.created_at,
      images: [],
      is_featured: false,
      view_count: 0,
      options: [],
      inquiry_count: 0,
      is_urgent: false,
      is_favorite: false
    }

    console.log('✅ 매물 상태 업데이트 완료:', updatedData)
    return updatedData
  } catch (error) {
    console.error('Error in updatePropertyStatus:', error)
    throw error
  }
}

// 매물 통계 조회 (사용자별 개별 관리)
export const getPropertyStats = async (tenantId: string) => {
  console.log('📊 사용자별 매물 통계 조회:', { tenantId })
  
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('transaction_type, created_at')
      .or(`tenant_id.eq.${tenantId},user_id.eq.${tenantId}`) // 기존 데이터 호환성

    if (error) {
      console.error('❌ 매물 통계 조회 실패:', error)
      throw error
    }

    console.log('📊 조회된 매물 데이터:', data)
    console.log('📊 데이터 개수:', data?.length || 0)

    const stats = {
      total: data.length,
      active: data.length, // 모든 매물을 활성으로 간주
      reserved: 0,
      sold: 0,
      this_month: data.filter(p => {
        const created = new Date(p.created_at)
        const now = new Date()
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
      }).length,
      by_transaction_type: {
        sale: data.filter(p => p.transaction_type === '매매').length,
        jeonse: data.filter(p => p.transaction_type === '전세').length,
        monthly: data.filter(p => p.transaction_type === '월세').length,
      }
    }

    console.log('📊 계산된 통계:', stats)
    return stats
  } catch (error) {
    console.error('Error in getPropertyStats:', error)
    throw error
  }
}


// 매물 즐겨찾기 토글
export const togglePropertyFavorite = async (propertyId: string, tenantId: string) => {
  try {
    // 현재 즐겨찾기 상태 조회 (사용자별 개별 관리)
    const { data: currentProperty } = await supabase
      .from('properties')
      .select('is_favorite')
      .eq('id', propertyId)
      .or(`tenant_id.eq.${tenantId},user_id.eq.${tenantId}`) // 기존 데이터 호환성
      .single()

    if (!currentProperty) {
      throw new Error(ERROR_MESSAGES.PROPERTY_NOT_FOUND)
    }

    // 즐겨찾기 상태 토글 (사용자별 개별 관리)
    const { data, error } = await supabase
      .from('properties')
      .update({ is_favorite: !currentProperty.is_favorite })
      .eq('id', propertyId)
      .or(`tenant_id.eq.${tenantId},user_id.eq.${tenantId}`) // 기존 데이터 호환성
      .select()
      .single()

    if (error) {
      console.error('Error toggling property favorite:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in togglePropertyFavorite:', error)
    throw error
  }
}