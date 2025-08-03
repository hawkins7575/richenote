// ============================================================================
// 매물 관리 서비스 - Supabase 통합
// ============================================================================

import { supabase } from './supabase'
import type { Property, SimplePropertyFilters, CreatePropertyData, UpdatePropertyData } from '@/types'

// 개발 환경에서는 모킹된 서비스 사용
const isDevelopment = import.meta.env.VITE_APP_ENV === 'development'

// 개발 환경용 모킹된 서비스 동적 임포트
let mockService: any = null
if (isDevelopment) {
  import('./mockPropertyService').then(service => {
    mockService = service
  })
}

// 매물 조회 (테넌트별)
export const getProperties = async (tenantId: string, filters?: SimplePropertyFilters) => {
  // 개발 환경에서는 모킹된 서비스 사용
  if (isDevelopment && mockService) {
    return mockService.getProperties(tenantId, filters)
  }
  
  try {
    let query = supabase
      .from('properties')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
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
      console.error('Error fetching properties:', error)
      throw error
    }

    // 데이터 변환하여 프론트엔드 타입에 맞춤
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
      is_featured: item.featured || false,
      view_count: item.view_count || 0,
      created_at: item.created_at,
      updated_at: item.updated_at,
      status: '판매중' as const, // 기본 상태
      parking: false, // 기본값
      elevator: false, // 기본값
      options: [],
      inquiry_count: 0,
      is_urgent: false,
      is_favorite: false
    }))

    return transformedData
  } catch (error) {
    console.error('Error in getProperties:', error)
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
  // 개발 환경에서는 모킹된 서비스 사용
  if (isDevelopment && mockService) {
    return mockService.createProperty(propertyData, tenantId, userId)
  }
  
  try {
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
      images: propertyData.images || [],
      is_active: true,
      featured: false,
      view_count: 0
    }

    const { data, error } = await supabase
      .from('properties')
      .insert(dbData)
      .select('*')
      .single()

    if (error) {
      console.error('Error creating property:', error)
      throw error
    }

    // 프론트엔드 타입에 맞게 변환
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
      is_featured: data.featured || false,
      view_count: data.view_count || 0,
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
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('status, transaction_type, created_at')
      .eq('tenant_id', tenantId)

    if (error) {
      console.error('Error fetching property stats:', error)
      throw error
    }

    const stats = {
      total: data.length,
      active: data.filter(p => p.status === 'available').length,
      reserved: data.filter(p => p.status === 'reserved').length,
      sold: data.filter(p => p.status === 'sold').length,
      this_month: data.filter(p => {
        const created = new Date(p.created_at)
        const now = new Date()
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
      }).length,
      by_transaction_type: {
        sale: data.filter(p => p.transaction_type === 'sale').length,
        jeonse: data.filter(p => p.transaction_type === 'jeonse').length,
        monthly: data.filter(p => p.transaction_type === 'monthly').length,
      }
    }

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