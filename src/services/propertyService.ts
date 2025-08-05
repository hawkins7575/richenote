// ============================================================================
// 매물 관리 서비스 - Supabase 통합
// ============================================================================

import { supabase } from './supabase'
import type { Property, SimplePropertyFilters, CreatePropertyData, UpdatePropertyData } from '@/types'

// 🚨 강제로 프로덕션 모드 사용 - Mock 서비스 완전 비활성화
const isDevelopment = false

// 🚨 Mock 서비스 완전 비활성화 - 항상 실제 Supabase 사용
// let mockService: any = null
// if (isDevelopment) {
//   import('./mockPropertyService').then(service => {
//     mockService = service
//   })
// }

// 매물 조회 (테넌트별)
export const getProperties = async (tenantId: string, filters?: SimplePropertyFilters) => {
  console.log('🔍 매물 조회 시작:', { tenantId, filters, isDevelopment })
  console.log('🔧 Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
  console.log('🔧 Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '설정됨' : '없음')
  
  // 🚨 Mock 서비스 완전 비활성화 - 항상 실제 Supabase 사용
  // if (isDevelopment && mockService) {
  //   return mockService.getProperties(tenantId, filters)
  // }
  
  try {
    console.log('📡 실제 Supabase에서 매물 조회 중...')
    console.log('📊 조회 쿼리 정보:', {
      table: 'properties',
      tenant_id: tenantId,
      is_active: true
    })
    
    let query = supabase
      .from('properties')
      .select('*')
      .eq('tenant_id', tenantId)
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

    // 데이터 변환하여 프론트엔드 타입에 맞춤 (실제 DB 컬럼명 사용)
    let transformedData = (data || []).map((item: any) => {
      // 로컬 저장소에서 상태 확인, 없으면 기본 상태 '판매중'으로 설정
      const statusKey = `property_status_${item.id}`
      const savedStatus = localStorage.getItem(statusKey)
      const assignedStatus = savedStatus || item.status || '판매중'
      
      // 로컬 저장소에서 임대인 정보 확인
      const landlordKey = `property_landlord_${item.id}`
      const savedLandlordInfo = localStorage.getItem(landlordKey)
      let landlordInfo = { landlord_name: undefined, landlord_phone: undefined, exit_date: undefined }
      
      if (savedLandlordInfo) {
        try {
          landlordInfo = JSON.parse(savedLandlordInfo)
        } catch (e) {
          console.warn('임대인 정보 파싱 실패:', e)
        }
      }
      
      return {
        id: item.id,
        tenant_id: item.tenant_id,
        created_by: item.user_id,
        title: item.title,
        type: item.property_type,
        transaction_type: item.transaction_type,
        address: item.address,
        area: item.area_exclusive,
        floor: item.floor_current,
        total_floors: item.floor_total,
        rooms: item.rooms,
        bathrooms: item.bathrooms,
        price: item.price ? parseFloat(item.price) : undefined,
        deposit: item.deposit ? parseFloat(item.deposit) : undefined,
        monthly_rent: item.monthly_rent ? parseFloat(item.monthly_rent) : undefined,
        description: item.description,
        // 임대인 정보 - 로컬 저장소에서 가져오기
        landlord_name: landlordInfo.landlord_name || item.landlord_name || undefined,
        landlord_phone: landlordInfo.landlord_phone || item.landlord_phone || undefined,
        // 퇴실 날짜 - 로컬 저장소에서 가져오기
        exit_date: landlordInfo.exit_date || item.exit_date || undefined,
        images: item.images || [],
        is_featured: false,
        view_count: 0,
        created_at: item.created_at,
        updated_at: item.updated_at,
        status: assignedStatus,
        parking: false,
        elevator: false,
        options: [],
        inquiry_count: 0,
        is_urgent: false,
        is_favorite: false
      }
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
    throw new Error('테넌트 ID 또는 사용자 ID가 없습니다.')
  }
  
  // 필수 필드 검증
  if (!propertyData.title || !propertyData.address) {
    console.error('❌ 필수 필드 누락:', { title: propertyData.title, address: propertyData.address })
    throw new Error('제목과 주소는 필수 입력 항목입니다.')
  }
  
  try {
    console.log('📡 실제 Supabase에 매물 생성 요청 중...')
    // 프론트엔드 데이터를 데이터베이스 스키마에 맞게 변환
    // 실제 DB에 존재하는 컬럼만 사용
    const dbData = {
      tenant_id: tenantId,
      user_id: userId,
      title: propertyData.title,
      address: propertyData.address,
      property_type: propertyData.type,
      transaction_type: propertyData.transaction_type,
      price: propertyData.price || null,
      deposit: propertyData.deposit || null,
      monthly_rent: propertyData.monthly_rent || null,
      floor_current: propertyData.floor,
      floor_total: propertyData.total_floors,
      area_exclusive: propertyData.area,
      rooms: propertyData.rooms,
      bathrooms: propertyData.bathrooms,
      description: propertyData.description || null
      // landlord_name, landlord_phone, exit_date 컬럼이 DB에 없어서 제거
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
      throw new Error(`데이터베이스 오류: ${error.message}`)
    }
    
    console.log('✅ 매물 생성 성공:', data)

    // 임대인 정보와 퇴실 날짜를 로컬 저장소에 저장 (DB 컬럼이 없으므로)
    if (propertyData.landlord_name || propertyData.landlord_phone || propertyData.exit_date) {
      const landlordInfo = {
        landlord_name: propertyData.landlord_name || undefined,
        landlord_phone: propertyData.landlord_phone || undefined,
        exit_date: propertyData.exit_date || undefined
      }
      localStorage.setItem(`property_landlord_${data.id}`, JSON.stringify(landlordInfo))
      console.log('💾 임대인 정보 로컬 저장소에 저장:', landlordInfo)
    }

    // 프론트엔드 타입에 맞게 변환 (실제 DB 컬럼명 사용)
    const transformedData = {
      id: data.id,
      tenant_id: data.tenant_id,
      created_by: data.user_id,
      title: data.title,
      type: data.property_type,
      transaction_type: data.transaction_type,
      address: data.address,
      area: data.area_exclusive,
      floor: data.floor_current,
      total_floors: data.floor_total,
      rooms: data.rooms,
      bathrooms: data.bathrooms,
      price: data.price ? parseFloat(data.price) : undefined,
      deposit: data.deposit ? parseFloat(data.deposit) : undefined,
      monthly_rent: data.monthly_rent ? parseFloat(data.monthly_rent) : undefined,
      description: data.description,
      // 임대인 정보 - 폼 데이터 사용 (DB에 저장되지 않으므로)
      landlord_name: propertyData.landlord_name || undefined,
      landlord_phone: propertyData.landlord_phone || undefined,
      // 퇴실 날짜 - 폼 데이터 사용 (DB에 저장되지 않으므로)
      exit_date: propertyData.exit_date || undefined,
      images: [], // 빈 배열로 설정 - DB에 images 컬럼 없음
      is_featured: false,
      view_count: 0,
      created_at: data.created_at,
      updated_at: data.updated_at,
      status: '판매중' as const,
      parking: false,
      elevator: false,
      options: [],
      inquiry_count: 0,
      is_urgent: false,
      is_favorite: false
    }

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
    if (propertyData.description !== undefined) dbData.description = propertyData.description

    console.log('💾 데이터베이스 업데이트 데이터:', dbData)

    const { data, error } = await supabase
      .from('properties')
      .update(dbData)
      .eq('id', propertyId)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) {
      console.error('❌ 매물 수정 실패:', error)
      throw new Error(`데이터베이스 오류: ${error.message}`)
    }

    console.log('✅ 데이터베이스 수정 성공:', data)

    // 임대인 정보와 퇴실 날짜를 로컬 저장소에 업데이트
    if (propertyData.landlord_name !== undefined || propertyData.landlord_phone !== undefined || propertyData.exit_date !== undefined) {
      const landlordKey = `property_landlord_${propertyId}`
      
      // 기존 정보 가져오기
      let existingInfo = {}
      try {
        const existing = localStorage.getItem(landlordKey)
        if (existing) {
          existingInfo = JSON.parse(existing)
        }
      } catch (e) {
        console.warn('기존 임대인 정보 파싱 실패:', e)
      }

      // 새 정보로 업데이트
      const updatedLandlordInfo = {
        ...existingInfo,
        ...(propertyData.landlord_name !== undefined && { landlord_name: propertyData.landlord_name }),
        ...(propertyData.landlord_phone !== undefined && { landlord_phone: propertyData.landlord_phone }),
        ...(propertyData.exit_date !== undefined && { exit_date: propertyData.exit_date })
      }
      
      localStorage.setItem(landlordKey, JSON.stringify(updatedLandlordInfo))
      console.log('💾 임대인 정보 로컬 저장소 업데이트:', updatedLandlordInfo)
    }

    // 프론트엔드 타입에 맞게 변환하여 반환
    const transformedData = {
      id: data.id,
      tenant_id: data.tenant_id,
      created_by: data.user_id,
      title: data.title,
      type: data.property_type,
      transaction_type: data.transaction_type,
      address: data.address,
      area: data.area_exclusive,
      floor: data.floor_current,
      total_floors: data.floor_total,
      rooms: data.rooms,
      bathrooms: data.bathrooms,
      price: data.price ? parseFloat(data.price) : undefined,
      deposit: data.deposit ? parseFloat(data.deposit) : undefined,
      monthly_rent: data.monthly_rent ? parseFloat(data.monthly_rent) : undefined,
      description: data.description,
      // 업데이트된 임대인 정보 포함
      landlord_name: propertyData.landlord_name || undefined,
      landlord_phone: propertyData.landlord_phone || undefined,
      exit_date: propertyData.exit_date || undefined,
      images: [],
      is_featured: false,
      view_count: 0,
      created_at: data.created_at,
      updated_at: data.updated_at,
      status: propertyData.status || '판매중',
      parking: propertyData.parking || false,
      elevator: propertyData.elevator || false,
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
    // 데이터베이스에서 삭제
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .eq('tenant_id', tenantId)

    if (error) {
      console.error('❌ 매물 삭제 실패:', error)
      throw new Error(`데이터베이스 오류: ${error.message}`)
    }

    // 로컬 저장소에서 관련 데이터 삭제
    const statusKey = `property_status_${propertyId}`
    const landlordKey = `property_landlord_${propertyId}`
    
    localStorage.removeItem(statusKey)
    localStorage.removeItem(landlordKey)
    
    console.log('🧹 로컬 저장소 정리 완료:', { statusKey, landlordKey })
    console.log('✅ 매물 삭제 완료')

    return true
  } catch (error) {
    console.error('💥 deleteProperty 전체 에러:', error)
    throw error
  }
}

// 매물 상태 업데이트 (임시로 로컬 저장소 사용)
export const updatePropertyStatus = async (propertyId: string, status: Property['status'], tenantId: string) => {
  try {
    console.log('🔄 매물 상태 업데이트:', { propertyId, status, tenantId })
    
    // 임시로 로컬 저장소에 상태 저장
    const statusKey = `property_status_${propertyId}`
    localStorage.setItem(statusKey, status)
    
    // 원본 매물 정보 조회
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('tenant_id', tenantId)
      .single()

    if (error) {
      console.error('Error fetching property for status update:', error)
      throw error
    }

    // 상태가 업데이트된 데이터 반환
    const updatedData = {
      ...data,
      status: status,
      updated_at: new Date().toISOString()
    }

    console.log('✅ 매물 상태 업데이트 완료:', updatedData)
    return updatedData
  } catch (error) {
    console.error('Error in updatePropertyStatus:', error)
    throw error
  }
}

// 매물 통계 조회
export const getPropertyStats = async (tenantId: string) => {
  console.log('📊 매물 통계 조회 시작:', { tenantId })
  
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('transaction_type, created_at')
      .eq('tenant_id', tenantId)

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
    // 현재 즐겨찾기 상태 조회
    const { data: currentProperty } = await supabase
      .from('properties')
      .select('is_favorite')
      .eq('id', propertyId)
      .eq('tenant_id', tenantId)
      .single()

    if (!currentProperty) {
      throw new Error('Property not found')
    }

    // 즐겨찾기 상태 토글
    const { data, error } = await supabase
      .from('properties')
      .update({ is_favorite: !currentProperty.is_favorite })
      .eq('id', propertyId)
      .eq('tenant_id', tenantId)
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