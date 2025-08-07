// ============================================================================
// 매물 관리 서비스 - Supabase 통합
// ============================================================================

import { supabase } from './supabase'
import type { Property, SimplePropertyFilters, CreatePropertyData, UpdatePropertyData } from '@/types'
import type { PropertyDbRow } from '@/types/propertyService'
import { parseStructuredDescription, transformDbRowToProperty } from '@/utils/propertyParsing'
import { ERROR_MESSAGES, DEFAULT_VALUES } from '@/constants/propertyConstants'

// 실제 Supabase 서비스 사용

// 매물 조회 (사용자별 개별 관리) - 자동 복구 로직 포함
export const getProperties = async (userId: string, filters?: SimplePropertyFilters) => {
  try {
    console.log('🔍 getProperties 시작 - userId:', userId)
    // 개발 환경에서 필터 로깅
    if (import.meta.env.DEV) console.log('Service getProperties 필터:', filters)
    
    // 사용자의 올바른 tenant_id 조회 (자동 복구 로직 포함)
    let { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('tenant_id')
      .eq('id', userId)
      .single()

    // user_profile이 없는 경우 자동 생성
    if (userError || !userProfile) {
      console.log('⚠️ user_profile 누락 감지 - 자동 복구 시작')
      
      // 사용자 이메일 조회
      const { data: authUser } = await supabase.auth.getUser()
      if (!authUser.user?.email) {
        throw new Error('사용자 정보를 찾을 수 없습니다.')
      }
      
      // 자동 테넌트 및 프로필 생성 (트리거가 실행되지 않았을 경우의 fallback)
      const userName = authUser.user.email.split('@')[0]
      
      // 테넌트 생성
      const { data: newTenant } = await supabase
        .from('tenants')
        .insert({
          name: `${userName}의 부동산`,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (newTenant) {
        // 프로필 생성
        await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            tenant_id: newTenant.id,
            name: userName,
            role: 'admin',
            company: `${userName}의 부동산`,
            created_at: new Date().toISOString()
          })
        
        // 다시 조회
        const { data: recoveredProfile } = await supabase
          .from('user_profiles')
          .select('tenant_id')
          .eq('id', userId)
          .single()
        
        userProfile = recoveredProfile
        console.log('✅ 자동 복구 완료 - tenant_id:', userProfile?.tenant_id)
      }
    }

    const actualTenantId = userProfile?.tenant_id
    if (!actualTenantId) {
      throw new Error('사용자에게 할당된 테넌트가 없습니다.')
    }

    console.log('📋 실제 tenant_id:', actualTenantId)
    
    // 사용자의 실제 tenant_id로 매물 조회
    let query = supabase
      .from('properties')
      .select('*')
      .eq('tenant_id', actualTenantId) // 정확한 tenant_id로 필터링
      .order('created_at', { ascending: false })

    // 필터 적용
    if (filters) {
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,address.ilike.%${filters.search}%`)
      }
      
      if (filters.transaction_type && filters.transaction_type !== '전체') {
        query = query.eq('transaction_type', filters.transaction_type)
      }
      
      if (filters.property_type && filters.property_type !== '전체') {
        query = query.eq('property_type', filters.property_type)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Supabase 조회 에러:', error)
      console.error('❌ 에러 세부사항:', { message: error.message, details: error.details, hint: error.hint, code: error.code })
      throw error
    }


    // 데이터 변환하여 프론트엔드 타입에 맞춤
    let transformedData = (data || []).map((item: PropertyDbRow) => {
      const parsedInfo = parseStructuredDescription(item.description || null)
      
      // 개발 환경에서 매매가 데이터 확인
      if (import.meta.env.DEV && item.transaction_type === '매매') {
        console.log('Service DB 원본:', { title: item.title, price: item.price, type: typeof item.price })
      }
      
      // 구조화된 description에서 파싱된 상태 사용 (로컬 저장소 제거)
      const property = transformDbRowToProperty(item, parsedInfo)
      
      // 개발 환경에서 상태 파싱 결과 확인
      if (import.meta.env.DEV) {
        console.log('🔍 상태 파싱 결과:', { 
          title: item.title,
          rawDescription: item.description, 
          parsedStatus: parsedInfo.status,
          finalStatus: property.status 
        })
      }
      
      // 개발 환경에서 변환 후 데이터 확인
      if (import.meta.env.DEV && property.transaction_type === '매매') {
        console.log('Service 변환 후:', { title: property.title, price: property.price, type: typeof property.price })
      }
      
      return property
    })

    // 상태 필터링을 프론트엔드에서 처리 (DB 컬럼 추가 전까지)
    if (filters?.status && filters.status !== '') {
      transformedData = transformedData.filter(item => item.status === filters.status)
    }

    
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
    // 사용자의 올바른 tenant_id 조회
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('tenant_id')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('❌ 사용자 정보 조회 실패:', userError)
      throw new Error('사용자 정보를 찾을 수 없습니다.')
    }

    const actualTenantId = userProfile.tenant_id
    if (!actualTenantId) {
      throw new Error('사용자에게 할당된 테넌트가 없습니다.')
    }
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
    
    // 매물 상태 정보 추가
    if (propertyData.status) {
      const statusInfo = `[상태] ${propertyData.status}`
      structuredDescription = (structuredDescription ? `${structuredDescription}\n\n` : '') + statusInfo
    }
    
    // 실제 DB에 존재하는 컬럼만 사용 - 올바른 tenant_id 사용
    const dbData = {
      tenant_id: actualTenantId, // 사용자의 실제 tenant_id 사용
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

    // 개발 환경에서 DB 저장 데이터 확인
    if (import.meta.env.DEV && dbData.transaction_type === '매매') {
      console.log('Service DB 저장:', { title: dbData.title, price: dbData.price, type: typeof dbData.price })
    }

    
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

    // 개발 환경에서 DB 저장 결과 확인
    if (import.meta.env.DEV && data.transaction_type === '매매') {
      console.log('Service DB 결과:', { title: data.title, price: data.price, type: typeof data.price })
    }
    

    const parsedInfo = parseStructuredDescription(data.description)
    const transformedData = transformDbRowToProperty(data as PropertyDbRow, parsedInfo)
    transformedData.status = parsedInfo.status || propertyData.status as any || DEFAULT_VALUES.PROPERTY_STATUS as any
    transformedData.updated_at = data.updated_at

    // 개발 환경에서 최종 결과 확인
    if (import.meta.env.DEV && transformedData.transaction_type === '매매') {
      console.log('Service 최종 결과:', { title: transformedData.title, price: transformedData.price, type: typeof transformedData.price })
    }

    return transformedData
  } catch (error) {
    console.error('Error in createProperty:', error)
    throw error
  }
}

// 매물 수정
export const updateProperty = async (propertyId: string, propertyData: UpdatePropertyData, userId: string) => {
  
  try {
    // 사용자의 올바른 tenant_id 조회
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('tenant_id')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('❌ 사용자 정보 조회 실패:', userError)
      throw new Error('사용자 정보를 찾을 수 없습니다.')
    }

    const actualTenantId = userProfile.tenant_id
    if (!actualTenantId) {
      throw new Error('사용자에게 할당된 테넌트가 없습니다.')
    }

    // 기존 데이터 조회 (실제 tenant_id 사용)
    const { data: existingData } = await supabase
      .from('properties')
      .select('description')
      .eq('id', propertyId)
      .eq('tenant_id', actualTenantId) // 정확한 tenant_id로 필터링
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
      cleanDescription = cleanDescription.replace(/\[상태\][^\n\[]*/, '').trim()
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
    
    // 매물 상태 정보 추가
    if (propertyData.status) {
      const statusInfo = `[상태] ${propertyData.status}`
      newStructuredDescription = (newStructuredDescription ? `${newStructuredDescription}\n\n` : '') + statusInfo
      
      // 개발 환경에서 상태 저장 확인
      if (import.meta.env.DEV) {
        console.log('🔄 매물 수정 - 상태 저장:', { 
          매물ID: propertyId,
          상태: propertyData.status,
          구조화된설명: newStructuredDescription 
        })
      }
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


    const { data, error } = await supabase
      .from('properties')
      .update(dbData)
      .eq('id', propertyId)
      .eq('tenant_id', actualTenantId) // 정확한 tenant_id로 필터링
      .select()
      .single()

    if (error) {
      console.error('❌ 매물 수정 실패:', error)
      throw new Error(`데이터베이스 오류: ${error.message}`)
    }


    // description에서 구조화된 정보 파싱
    const parseStructuredDescription = (desc: string | null) => {
      if (!desc) return { landlord_name: undefined, landlord_phone: undefined, exit_date: undefined, detailed_address: undefined, parking: false, elevator: false, status: undefined, cleanDescription: '' }
      
      let cleanDescription = desc
      let landlord_name, landlord_phone, exit_date, detailed_address, status
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
      
      // 상태 정보 파싱
      const statusMatch = desc.match(/\[상태\]\s*([^\n\[]+)/)
      if (statusMatch) {
        status = statusMatch[1].trim()
        cleanDescription = cleanDescription.replace(statusMatch[0], '').trim()
      }
      
      // 연속된 줄바꿈 정리
      cleanDescription = cleanDescription.replace(/\n\s*\n/g, '\n').trim()
      
      return { landlord_name, landlord_phone, exit_date, detailed_address, parking, elevator, status, cleanDescription }
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
      status: parsedInfo.status || propertyData.status || '거래중',
      options: [],
      inquiry_count: 0,
      is_urgent: false,
      is_favorite: false
    }

    return transformedData
  } catch (error) {
    console.error('💥 updateProperty 전체 에러:', error)
    throw error
  }
}

// 매물 삭제
export const deleteProperty = async (propertyId: string, userId: string) => {
  
  try {
    // 사용자의 올바른 tenant_id 조회
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('tenant_id')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('❌ 사용자 정보 조회 실패:', userError)
      throw new Error('사용자 정보를 찾을 수 없습니다.')
    }

    const actualTenantId = userProfile.tenant_id
    if (!actualTenantId) {
      throw new Error('사용자에게 할당된 테넌트가 없습니다.')
    }

    // 데이터베이스에서 삭제 (실제 tenant_id 사용)
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .eq('tenant_id', actualTenantId) // 정확한 tenant_id로 필터링

    if (error) {
      console.error('❌ 매물 삭제 실패:', error)
      throw new Error(`데이터베이스 오류: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error('💥 deleteProperty 전체 에러:', error)
    throw error
  }
}

// 매물 상태 업데이트 (description에 상태 정보 저장)
export const updatePropertyStatus = async (propertyId: string, status: Property['status'], userId: string) => {
  try {
    // 사용자의 올바른 tenant_id 조회
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('tenant_id')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('❌ 사용자 정보 조회 실패:', userError)
      throw new Error('사용자 정보를 찾을 수 없습니다.')
    }

    const actualTenantId = userProfile.tenant_id
    if (!actualTenantId) {
      throw new Error('사용자에게 할당된 테넌트가 없습니다.')
    }
    
    // 기존 데이터 조회 (실제 tenant_id 사용)
    const { data: existingData, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('tenant_id', actualTenantId) // 정확한 tenant_id로 필터링
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

    // 상태 정보가 포함된 description 업데이트 (실제 tenant_id 사용)
    const { data, error } = await supabase
      .from('properties')
      .update({ description: updatedDescription })
      .eq('id', propertyId)
      .eq('tenant_id', actualTenantId) // 정확한 tenant_id로 필터링
      .select('*')
      .single()

    if (error) {
      console.error('Error updating property status:', error)
      throw error
    }

    // description에서 구조화된 정보 파싱하여 반환
    const parseStructuredDescription = (desc: string | null) => {
      if (!desc) return { landlord_name: undefined, landlord_phone: undefined, exit_date: undefined, detailed_address: undefined, parking: false, elevator: false, cleanDescription: '', status: '거래중' }
      
      let cleanDescription = desc
      let landlord_name, landlord_phone, exit_date, detailed_address, parsedStatus = '거래중'
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
      updated_at: data.updated_at,
      created_at: data.created_at,
      images: [],
      is_featured: false,
      view_count: 0,
      options: [],
      inquiry_count: 0,
      is_urgent: false,
      is_favorite: false
    }

    return updatedData
  } catch (error) {
    console.error('Error in updatePropertyStatus:', error)
    throw error
  }
}

// 매물 통계 조회 (사용자별 개별 관리)
export const getPropertyStats = async (userId: string) => {
  
  try {
    // 사용자의 올바른 tenant_id 조회
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('tenant_id')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('❌ 사용자 정보 조회 실패:', userError)
      throw new Error('사용자 정보를 찾을 수 없습니다.')
    }

    const actualTenantId = userProfile.tenant_id
    if (!actualTenantId) {
      throw new Error('사용자에게 할당된 테넌트가 없습니다.')
    }

    const { data, error } = await supabase
      .from('properties')
      .select('transaction_type, created_at')
      .eq('tenant_id', actualTenantId) // 정확한 tenant_id로 필터링

    if (error) {
      console.error('❌ 매물 통계 조회 실패:', error)
      throw error
    }


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

    return stats
  } catch (error) {
    console.error('Error in getPropertyStats:', error)
    throw error
  }
}


// 매물 즐겨찾기 토글
export const togglePropertyFavorite = async (propertyId: string, userId: string) => {
  try {
    // 사용자의 올바른 tenant_id 조회
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('tenant_id')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('❌ 사용자 정보 조회 실패:', userError)
      throw new Error('사용자 정보를 찾을 수 없습니다.')
    }

    const actualTenantId = userProfile.tenant_id
    if (!actualTenantId) {
      throw new Error('사용자에게 할당된 테넌트가 없습니다.')
    }

    // 현재 즐겨찾기 상태 조회 (실제 tenant_id 사용)
    const { data: currentProperty } = await supabase
      .from('properties')
      .select('is_favorite')
      .eq('id', propertyId)
      .eq('tenant_id', actualTenantId) // 정확한 tenant_id로 필터링
      .single()

    if (!currentProperty) {
      throw new Error(ERROR_MESSAGES.PROPERTY_NOT_FOUND)
    }

    // 즐겨찾기 상태 토글 (실제 tenant_id 사용)
    const { data, error } = await supabase
      .from('properties')
      .update({ is_favorite: !currentProperty.is_favorite })
      .eq('id', propertyId)
      .eq('tenant_id', actualTenantId) // 정확한 tenant_id로 필터링
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