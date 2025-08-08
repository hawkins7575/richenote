// ============================================================================
// 모킹된 매물 서비스 - 개발/데모용
// ============================================================================

import type { Property, SimplePropertyFilters, CreatePropertyData, UpdatePropertyData } from '@/types'
import { logger } from '@/utils/logger'

// 메모리 기반 데이터 저장소
let mockProperties: Property[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    created_by: '00000000-0000-0000-0000-000000000001',
    title: '강남구 신사동 럭셔리 아파트',
    type: '아파트',
    transaction_type: '매매',
    // 매물 상태 관련 코드 완전 삭제
    price: 350000,
    deposit: undefined,
    monthly_rent: undefined,
    maintenance_fee: 15,
    address: '서울시 강남구 역삼동 123-10',
    detailed_address: '123동 456호',
    district: '강남구',
    neighborhood: '신사동',
    latitude: 37.5219,
    longitude: 127.0274,
    area: 85.0,
    area_common: 25.0,
    floor: 15,
    total_floors: 25,
    rooms: 3,
    bathrooms: 2,
    parking: true,
    parking_spaces: 1,
    elevator: true,
    options: [],
    landlord_name: '김임대',
    landlord_phone: '010-1234-5678',
    landlord_email: 'landlord1@example.com',
    exit_date: '2025-08-31',
    available_from: '2025-09-01',
    contract_end_date: undefined,
    images: [
      {
        id: 'img-1',
        url: 'https://via.placeholder.com/400x300?text=Property+1',
        order: 1,
        is_primary: true
      },
      {
        id: 'img-2',
        url: 'https://via.placeholder.com/400x300?text=Property+1-2',
        order: 2,
        is_primary: false
      }
    ],
    videos: [],
    virtual_tour_url: undefined,
    description: '역세권 신축 럭셔리 아파트입니다. 남향, 고층, 풀옵션.',
    private_notes: '우수 매물, 추천',
    highlight_features: ['역세권', '신축', '럭셔리', '남향'],
    tags: ['추천매물', '급매'],
    view_count: 45,
    inquiry_count: 12,
    is_featured: true,
    is_urgent: false,
    is_favorite: false,
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-01-20T14:30:00Z',
    published_at: '2025-01-15T10:00:00Z',
    expires_at: undefined,
    custom_fields: {},
    sync_status: 'synced',
    external_listings: []
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    created_by: '00000000-0000-0000-0000-000000000001',
    title: '경기도 성남시 분당구 정자동',
    type: '아파트',
    transaction_type: '전세',
    // 매물 상태 관련 코드 완전 삭제
    price: undefined,
    deposit: 210000,
    monthly_rent: undefined,
    maintenance_fee: 8,
    address: '경기도 성남시 분당구 정자동 456-78',
    detailed_address: '456동 789호',
    district: '분당구',
    neighborhood: '정자동',
    area: 60.0,
    floor: 8,
    total_floors: 20,
    rooms: 2,
    bathrooms: 1,
    parking: true,
    parking_spaces: 1,
    elevator: true,
    options: [],
    landlord_name: '박소유',
    landlord_phone: '010-9876-5432',
    exit_date: undefined,
    description: '분당 정자동 카페거리 근처, 교통 편리.',
    highlight_features: ['분당', '정자동', '교통편리'],
    tags: [],
    view_count: 32,
    inquiry_count: 8,
    is_featured: false,
    is_urgent: false,
    is_favorite: false,
    created_at: '2025-01-18T11:00:00Z',
    updated_at: '2025-01-22T16:45:00Z',
    published_at: '2025-01-18T12:00:00Z',
    images: [],
    videos: [],
    virtual_tour_url: undefined,
    private_notes: '',
    expires_at: undefined,
    custom_fields: {},
    sync_status: 'synced',
    external_listings: []
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    created_by: '00000000-0000-0000-0000-000000000001',
    title: '홍대 신축 오피스텔',
    type: '오피스텔',
    transaction_type: '월세',
    // 매물 상태 관련 코드 완전 삭제
    price: undefined,
    deposit: 10000,
    monthly_rent: 65,
    maintenance_fee: 5,
    address: '서울시 마포구 상수동 789-12',
    detailed_address: '789동 101호',
    district: '마포구',
    neighborhood: '상수동',
    area: 25.0,
    floor: 5,
    total_floors: 15,
    rooms: 1,
    bathrooms: 1,
    parking: false,
    elevator: true,
    options: [],
    landlord_name: '이주인',
    landlord_phone: '010-5555-6666',
    description: '홍대입구역 5분 거리, 신축 오피스텔.',
    highlight_features: ['홍대', '신축', '역세권'],
    tags: ['원룸', '신축'],
    view_count: 67,
    inquiry_count: 15,
    is_featured: false,
    is_urgent: true,
    is_favorite: true,
    created_at: '2025-01-20T08:30:00Z',
    updated_at: '2025-01-25T10:15:00Z',
    published_at: '2025-01-20T09:00:00Z',
    images: [],
    videos: [],
    virtual_tour_url: undefined,
    private_notes: '',
    expires_at: undefined,
    custom_fields: {},
    sync_status: 'synced',
    external_listings: []
  }
]

// ID 생성 헬퍼
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 지연 시뮬레이션
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 매물 조회 (테넌트별)
export const getProperties = async (tenantId: string, filters?: SimplePropertyFilters): Promise<Property[]> => {
  logger.debug('🏠 Mock Service: getProperties 호출됨', { tenantId, filters })
  await delay(300) // API 호출 시뮬레이션
  
  let results = mockProperties.filter(p => p.tenant_id === tenantId)
  
  // 필터 적용
  if (filters) {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      results = results.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.address.toLowerCase().includes(searchLower)
      )
    }
    if (filters.transaction_type && filters.transaction_type !== '전체') {
      results = results.filter(p => p.transaction_type === filters.transaction_type)
    }
    if (filters.property_type && filters.property_type !== '전체') {
      results = results.filter(p => p.type === filters.property_type)
    }
    // 매물 상태 필터 로직 완전 삭제
  }
  
  return results
}

// 매물 상세 조회
export const getProperty = async (propertyId: string, tenantId: string): Promise<Property | null> => {
  await delay(200)
  
  const property = mockProperties.find(p => p.id === propertyId && p.tenant_id === tenantId)
  return property || null
}

// 매물 생성
export const createProperty = async (propertyData: CreatePropertyData, tenantId: string, userId: string): Promise<Property> => {
  await delay(500)
  
  const newProperty: Property = {
    id: generateId(),
    tenant_id: tenantId,
    created_by: userId,
    assigned_to: undefined,
    title: propertyData.title,
    type: propertyData.type,
    transaction_type: propertyData.transaction_type,
    // 매물 상태 관련 코드 완전 삭제
    price: propertyData.price,
    deposit: propertyData.deposit,
    monthly_rent: propertyData.monthly_rent,
    maintenance_fee: undefined,
    address: propertyData.address,
    detailed_address: propertyData.detailed_address,
    district: undefined,
    neighborhood: undefined,
    latitude: undefined,
    longitude: undefined,
    area: propertyData.area,
    area_common: undefined,
    floor: propertyData.floor,
    total_floors: propertyData.total_floors,
    rooms: propertyData.rooms,
    bathrooms: propertyData.bathrooms,
    parking: propertyData.parking,
    parking_spaces: propertyData.parking ? 1 : 0,
    elevator: propertyData.elevator,
    options: [],
    landlord_name: propertyData.landlord_name,
    landlord_phone: propertyData.landlord_phone,
    landlord_email: undefined,
    exit_date: propertyData.exit_date,
    available_from: undefined,
    contract_end_date: undefined,
    images: [
      {
        id: 'img-1',
        url: 'https://via.placeholder.com/400x300?text=Property+1',
        order: 1,
        is_primary: true
      },
      {
        id: 'img-2',
        url: 'https://via.placeholder.com/400x300?text=Property+1-2',
        order: 2,
        is_primary: false
      }
    ],
    videos: [],
    virtual_tour_url: undefined,
    description: propertyData.description,
    private_notes: undefined,
    highlight_features: [],
    tags: [],
    view_count: 0,
    inquiry_count: 0,
    is_featured: false,
    is_urgent: false,
    is_favorite: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    expires_at: undefined,
    custom_fields: {},
    sync_status: 'synced',
    external_listings: []
  }
  
  mockProperties.unshift(newProperty) // 최신 순으로 추가
  return newProperty
}

// 매물 수정
export const updateProperty = async (propertyId: string, propertyData: UpdatePropertyData, tenantId: string): Promise<Property | null> => {
  await delay(400)
  
  const index = mockProperties.findIndex(p => p.id === propertyId && p.tenant_id === tenantId)
  if (index === -1) return null
  
  mockProperties[index] = {
    ...mockProperties[index],
    ...propertyData,
    updated_at: new Date().toISOString()
  }
  
  return mockProperties[index]
}

// 매물 삭제
export const deleteProperty = async (propertyId: string, tenantId: string): Promise<boolean> => {
  await delay(300)
  
  const index = mockProperties.findIndex(p => p.id === propertyId && p.tenant_id === tenantId)
  if (index === -1) return false
  
  mockProperties.splice(index, 1)
  return true
}

// 매물 상태 업데이트 함수 완전 삭제

// 매물 통계 조회
export const getPropertyStats = async (tenantId: string) => {
  await delay(200)
  
  const properties = mockProperties.filter(p => p.tenant_id === tenantId)
  
  const stats = {
    total: properties.length,
    active: properties.length, // 매물 상태 제거로 전체를 active로 처리
    reserved: 0,
    sold: 0, // 매물 상태 제거로 sold는 0으로 고정
    this_month: properties.filter(p => {
      const created = new Date(p.created_at)
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length,
    by_transaction_type: {
      sale: properties.filter(p => p.transaction_type === '매매').length,
      jeonse: properties.filter(p => p.transaction_type === '전세').length,
      monthly: properties.filter(p => p.transaction_type === '월세').length,
    }
  }
  
  return stats
}

// 매물 즐겨찾기 토글
export const togglePropertyFavorite = async (propertyId: string, tenantId: string): Promise<Property | null> => {
  await delay(200)
  
  const index = mockProperties.findIndex(p => p.id === propertyId && p.tenant_id === tenantId)
  if (index === -1) return null
  
  mockProperties[index] = {
    ...mockProperties[index],
    is_favorite: !mockProperties[index].is_favorite,
    updated_at: new Date().toISOString()
  }
  
  return mockProperties[index]
}