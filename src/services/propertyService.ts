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
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,address.ilike.%${filters.search}%`)
      }
      if (filters.transaction_type && filters.transaction_type !== '전체') {
        query = query.eq('transaction_type', filters.transaction_type)
      }
      if (filters.property_type && filters.property_type !== '전체') {
        query = query.eq('type', filters.property_type)
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
    const transformedData = (data || []).map((item: any) => ({
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
      price: item.price,
      deposit: item.deposit,
      monthly_rent: item.monthly_rent,
      description: item.description,
      images: item.images || [],
      is_featured: false,
      view_count: 0,
      created_at: item.created_at,
      updated_at: item.updated_at,
      status: '판매중',
      parking: false,
      elevator: false,
      options: [],
      inquiry_count: 0,
      is_urgent: false,
      is_favorite: false
    }))

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
  
  // 🚨 Mock 서비스 완전 비활성화 - 항상 실제 Supabase 사용
  // if (isDevelopment && mockService) {
  //   console.log('⚠️ 개발 환경 - Mock 서비스 사용')
  //   return mockService.createProperty(propertyData, tenantId, userId)
  // }
  
  try {
    console.log('📡 실제 Supabase에 매물 생성 요청 중...')
    // 프론트엔드 데이터를 데이터베이스 스키마에 맞게 변환
    const dbData = {
      tenant_id: tenantId,
      user_id: userId,
      title: propertyData.title,
      address: propertyData.address,
      property_type: propertyData.type,
      transaction_type: propertyData.transaction_type,
      price: propertyData.price,
      deposit: propertyData.deposit,
      monthly_rent: propertyData.monthly_rent,
      floor_current: propertyData.floor,
      floor_total: propertyData.total_floors,
      area_exclusive: propertyData.area,
      rooms: propertyData.rooms,
      bathrooms: propertyData.bathrooms,
      description: propertyData.description,
      images: propertyData.images || []
    }

    console.log('💾 데이터베이스 삽입 데이터:', dbData)
    
    const { data, error } = await supabase
      .from('properties')
      .insert(dbData)
      .select('*')
      .single()

    if (error) {
      console.error('❌ 매물 생성 실패:', error)
      throw error
    }
    
    console.log('✅ 매물 생성 성공:', data)

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
      price: data.price,
      deposit: data.deposit,
      monthly_rent: data.monthly_rent,
      description: data.description,
      images: data.images || [],
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
  try {
    const { data, error } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', propertyId)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) {
      console.error('Error updating property:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in updateProperty:', error)
    throw error
  }
}

// 매물 삭제
export const deleteProperty = async (propertyId: string, tenantId: string) => {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .eq('tenant_id', tenantId)

    if (error) {
      console.error('Error deleting property:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Error in deleteProperty:', error)
    throw error
  }
}

// 매물 상태 업데이트
export const updatePropertyStatus = async (propertyId: string, status: Property['status'], tenantId: string) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', propertyId)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) {
      console.error('Error updating property status:', error)
      throw error
    }

    return data
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