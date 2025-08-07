// ============================================================================
// 기능 향상된 매물 관리 페이지 (SaaS 버전)
// ============================================================================

import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Plus, Grid, AlignLeft, Settings } from 'lucide-react'
import { Button, Card, Badge, Input, Select, Modal, Loading } from '@/components/ui'
import { PropertyCreateForm } from '@/components/forms/PropertyCreateForm'
import { PropertyEditForm } from '@/components/forms/PropertyEditForm'
import { PropertyCard } from '@/components/property/PropertyCard'
import { PropertyDetailModal } from '@/components/property/PropertyDetailModal'
import { useProperties } from '@/hooks/useProperties'
import { useTenant } from '@/contexts/TenantContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatPrice } from '@/utils/propertyUtils'
import { FILTER_STATUS_OPTIONS } from '@/constants/propertyConstants'
import type { SimplePropertyFilters, Property, CreatePropertyData, UpdatePropertyData } from '@/types'

const PropertiesPageNew: React.FC = () => {
  
  const { user } = useAuth()
  const { tenant } = useTenant()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const [selectedTransactionType, setSelectedTransactionType] = useState('전체')
  const [selectedPropertyType, setSelectedPropertyType] = useState('전체')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [createFormOpen, setCreateFormOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [editFormOpen, setEditFormOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [detailModalProperty, setDetailModalProperty] = useState<Property | null>(null)

  // 검색어 debounce 처리 (한글 IME 입력 중 즉시 검색 방지)
  useEffect(() => {
    if (isComposing) return // 한글 입력 중에는 debounce 실행하지 않음
    
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // 300ms 딜레이

    return () => clearTimeout(timer)
  }, [searchTerm, isComposing])

  // URL 파라미터 확인하여 매물 등록 폼 자동 열기
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setCreateFormOpen(true)
      // URL에서 create 파라미터 제거
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('create')
      setSearchParams(newSearchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  // 필터 객체 생성 (debounced 검색어 사용)
  const filters = useMemo((): SimplePropertyFilters => {
    const result: SimplePropertyFilters = {}
    
    if (debouncedSearchTerm) result.search = debouncedSearchTerm
    if (selectedTransactionType !== '전체') result.transaction_type = selectedTransactionType
    if (selectedPropertyType !== '전체') result.property_type = selectedPropertyType
    if (selectedStatus) result.status = selectedStatus as any
    
    return result
  }, [debouncedSearchTerm, selectedTransactionType, selectedPropertyType, selectedStatus])

  const { 
    properties, 
    loading, 
    error, 
    refreshProperties,
    createProperty,
    updateProperty,
    deleteProperty 
  } = useProperties(filters)

  const transactionTypeOptions = [
    { value: '전체', label: '전체' },
    { value: '매매', label: '매매' },
    { value: '전세', label: '전세' },
    { value: '월세', label: '월세' },
  ]

  const propertyTypeOptions = [
    { value: '전체', label: '전체' },
    { value: '아파트', label: '아파트' },
    { value: '오피스텔', label: '오피스텔' },
    { value: '원룸', label: '원룸' },
    { value: '빌라', label: '빌라' },
  ]

  // 공통 상수에서 가져온 필터 옵션 사용



  const handleDeleteProperty = async () => {
    if (!selectedProperty) return
    
    try {
      await deleteProperty(selectedProperty.id)
      setDeleteConfirmOpen(false)
      setSelectedProperty(null)
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedTransactionType('전체')
    setSelectedPropertyType('전체')
    setSelectedStatus('')
  }

  const handleCreateProperty = async (data: CreatePropertyData) => {
    console.log('🏠 PropertiesPageNew.handleCreateProperty 시작')
    console.log('📊 받은 데이터:', data)
    // 개발 환경에서만 데이터 확인
    if (import.meta.env.DEV && data.transaction_type === '매매') {
      console.log('Page 매매가 데이터:', { price: data.price, type: typeof data.price })
    }
    console.log('👤 현재 사용자:', { user: user?.id, tenant: tenant?.id })
    
    try {
      console.log('⏳ 로딩 상태 설정...')
      setCreateLoading(true)
      
      console.log('📞 createProperty 훅 호출 중...')
      const result = await createProperty(data)
      console.log('✅ createProperty 성공:', result)
      // 저장 후 결과 확인
      if (import.meta.env.DEV && result.transaction_type === '매매') {
        console.log('Page 저장 결과:', { id: result.id, price: result.price })
      }
      
      console.log('🔄 매물 목록 새로고침...')
      // 폼이 닫히고 목록이 자동으로 새로고침됩니다
    } catch (error) {
      console.error('❌ PropertiesPageNew.handleCreateProperty 실패:', error)
      console.error('❌ 에러 타입:', typeof error)
      console.error('❌ 에러 상세:', error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error)
      throw error // 폼에서 에러 처리
    } finally {
      console.log('🏁 PropertiesPageNew.handleCreateProperty 완료')
      setCreateLoading(false)
    }
  }

  const handleEditProperty = async (data: UpdatePropertyData) => {
    if (!editingProperty) return
    
    try {
      setEditLoading(true)
      await updateProperty(editingProperty.id, data)
      setEditFormOpen(false)
      setEditingProperty(null)
      // 목록이 자동으로 새로고침됩니다
    } catch (error) {
      console.error('매물 수정 실패:', error)
      throw error // 폼에서 에러 처리
    } finally {
      setEditLoading(false)
    }
  }

  const handleOpenEditForm = (property: Property) => {
    console.log('📝 수정 폼 열기 요청:', property.title)
    try {
      setEditingProperty(property)
      setEditFormOpen(true)
      setDetailModalProperty(null) // 상세 모달 닫기
      console.log('✅ 수정 폼 상태 설정 완료')
    } catch (error) {
      console.error('❌ 수정 폼 열기 실패:', error)
      alert('수정 폼을 열 수 없습니다. 다시 시도해주세요.')
    }
  }

  const handleConfirmDelete = (property: Property) => {
    console.log('🗑️ 삭제 확인 요청:', property.title)
    try {
      const confirmDelete = window.confirm(`'${property.title}' 매물을 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)
      
      if (confirmDelete) {
        setSelectedProperty(property)
        setDeleteConfirmOpen(true)
        setDetailModalProperty(null) // 상세 모달 닫기
        console.log('✅ 삭제 확인 상태 설정 완료')
      } else {
        console.log('❌ 사용자가 삭제를 취소했습니다')
      }
    } catch (error) {
      console.error('❌ 삭제 확인 실패:', error)
      alert('삭제 확인 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loading size="lg" text="매물을 불러오는 중..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={refreshProperties}>다시 시도</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">매물 관리</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {tenant?.name}  •  총 <span className="font-semibold text-primary-600">{properties.length}</span>개의 매물
            {tenant?.limits.max_properties && (
              <span className="text-gray-500"> / {tenant.limits.max_properties}개 제한</span>
            )}
          </p>
        </div>
        <div className="flex sm:hidden"></div> {/* 모바일에서는 상단 헤더의 등록 버튼 사용 */}
        <button 
          onClick={() => setCreateFormOpen(true)}
          className="hidden sm:inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          매물 등록
        </button>
      </div>

      {/* 검색 및 필터 영역 */}
      <Card className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* 검색바 */}
          <div className="relative">
            <Input
              placeholder="매물명, 주소로 검색하세요..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              leftIcon={<Search size={18} />}
              className="text-base h-12"
            />
          </div>

          {/* 필터 영역 - 모바일 최적화 */}
          <div className="space-y-3">
            {/* 첫 번째 줄: 필터들 */}
            <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:space-x-3">
              {/* 거래유형 필터 */}
              <Select
                options={transactionTypeOptions}
                value={selectedTransactionType}
                onChange={(e) => setSelectedTransactionType(e.target.value)}
                className="w-full sm:w-24 text-sm"
              />

              {/* 매물유형 필터 */}
              <Select
                options={propertyTypeOptions}
                value={selectedPropertyType}
                onChange={(e) => setSelectedPropertyType(e.target.value)}
                className="w-full sm:w-24 text-sm"
              />

              {/* 상태 필터 */}
              <Select
                options={[...FILTER_STATUS_OPTIONS]}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full sm:w-24 text-sm"
              />
            </div>

            {/* 두 번째 줄: 뷰 모드와 초기화 */}
            <div className="flex items-center justify-between">
              {/* 뷰 모드 - 모바일 최적화 */}
              <div className="flex items-center bg-white rounded-lg p-1 border border-gray-300">
                <button
                  onClick={() => setViewMode('card')}
                  className={`flex items-center justify-center px-2 sm:px-3 py-2 rounded-md transition-colors text-xs sm:text-sm font-medium touch-target ${
                    viewMode === 'card' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Grid size={14} className="sm:mr-1" />
                  <span className="hidden sm:inline">카드</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center justify-center px-2 sm:px-3 py-2 rounded-md transition-colors text-xs sm:text-sm font-medium touch-target ${
                    viewMode === 'list' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <AlignLeft size={14} className="sm:mr-1" />
                  <span className="hidden sm:inline">리스트</span>
                </button>
              </div>

              {/* 초기화 버튼 - 모바일 최적화 */}
              <Button 
                variant="outline"
                onClick={resetFilters}
                size="sm"
                leftIcon={<Settings size={14} />}
                className="text-xs sm:text-sm px-3 py-2"
              >
                <span className="hidden sm:inline">초기화</span>
                <span className="sm:hidden">리셋</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 매물 리스트 */}
      {properties.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <p className="text-gray-500">검색 조건에 맞는 매물이 없습니다.</p>
        </Card>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {properties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => setDetailModalProperty(property)}
            />
          ))}
        </div>
      ) : (
        <PropertyList
          properties={properties}
          onView={(property) => setDetailModalProperty(property)}
        />
      )}

      {/* 매물 등록 폼 모달 */}
      <PropertyCreateForm
        isOpen={createFormOpen}
        onClose={() => setCreateFormOpen(false)}
        onSubmit={handleCreateProperty}
        loading={createLoading}
      />

      {/* 매물 상세 정보 모달 */}
      {detailModalProperty && (
        <PropertyDetailModal
          property={detailModalProperty}
          isOpen={true}
          onClose={() => {
            console.log('🔒 상세 모달 닫기')
            setDetailModalProperty(null)
          }}
          onEdit={(property) => {
            console.log('🔧 모달에서 수정 요청 받음:', property.title)
            handleOpenEditForm(property)
          }}
          onDelete={(property) => {
            console.log('🔧 모달에서 삭제 요청 받음:', property.title)
            handleConfirmDelete(property)
          }}
        />
      )}

      {/* 매물 수정 폼 모달 */}
      {editingProperty && (
        <PropertyEditForm
          isOpen={editFormOpen}
          onClose={() => {
            setEditFormOpen(false)
            setEditingProperty(null)
          }}
          onSubmit={handleEditProperty}
          property={editingProperty}
          loading={editLoading}
        />
      )}

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="매물 삭제"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            '{selectedProperty?.title}' 매물을 삭제하시겠습니까?<br />
            이 작업은 되돌릴 수 없습니다.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProperty}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}


// 매물 리스트 컴포넌트
interface PropertyListProps {
  properties: Property[]
  onView: (property: Property) => void
}

const PropertyList: React.FC<PropertyListProps> = ({ 
  properties, 
  onView
}) => {
  return (
    <Card>
      {/* 테이블 헤더 - 데스크톱만 표시 */}
      <div className="hidden lg:block bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-700">
          <div className="col-span-1">거래유형</div>
          <div className="col-span-3">매물정보</div>
          <div className="col-span-3">가격정보</div>
          <div className="col-span-2">임대인정보</div>
          <div className="col-span-1">퇴실예정일</div>
          <div className="col-span-2">추가정보</div>
        </div>
      </div>
      
      {/* 매물 리스트 */}
      <div>
        {properties.map(property => (
          <div 
            key={property.id} 
            className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer touch-target"
            onClick={() => onView(property)}
          >
            {/* 데스크톱 레이아웃 */}
            <div className="hidden lg:block px-4 py-3">
              <div className="grid grid-cols-12 gap-2 items-center text-sm">
                
                {/* 거래유형 */}
                <div className="col-span-1">
                  <Badge size="sm" variant={
                    property.transaction_type === '매매' ? 'sale' : 
                    property.transaction_type === '전세' ? 'jeonse' : 'monthly'
                  }>
                    {property.transaction_type}
                  </Badge>
                  <div className="mt-1">
                    <Badge size="sm" variant={
                      property.status === '거래중' ? 'success' : 
                      property.status === '거래완료' ? 'default' : 'default'
                    }>
                      {property.status}
                    </Badge>
                  </div>
                </div>
                
                {/* 매물정보 */}
                <div className="col-span-3">
                  <div className="font-medium text-gray-900 truncate text-sm mb-1">
                    {property.title}
                  </div>
                  <div className="text-xs text-gray-600 truncate mb-1">
                    📍 {property.address}
                  </div>
                  <div className="text-xs text-gray-500">
                    {property.type} • {property.area}m²({Math.floor(property.area/3.3)}평) • {property.floor}/{property.total_floors}층 • {property.rooms}룸 {property.bathrooms}욕실
                  </div>
                </div>

                {/* 가격정보 */}
                <div className="col-span-3">
                  <div className="font-bold text-gray-900 text-sm break-words">
                    {formatPrice(property)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    등록: {property.created_at && new Date(property.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {/* 임대인정보 */}
                <div className="col-span-2">
                  {property.landlord_name ? (
                    <div className="text-xs">
                      <div className="font-medium text-gray-700 truncate">{property.landlord_name}</div>
                      {property.landlord_phone && (
                        <div className="text-gray-500 truncate">{property.landlord_phone}</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">정보 없음</div>
                  )}
                </div>

                {/* 퇴실예정일 */}
                <div className="col-span-1">
                  {property.exit_date ? (
                    <div className="text-xs">
                      <div className="font-medium text-gray-700">
                        {new Date(property.exit_date).toLocaleDateString('ko-KR')}
                      </div>
                      <div className="text-gray-500">퇴실예정</div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">미정</div>
                  )}
                </div>

                {/* 추가정보 (편의시설) */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className={`${property.parking ? 'text-green-600' : 'text-gray-400'}`}>
                      🚗{property.parking ? '주차' : '주차X'}
                    </span>
                    <span className={`${property.elevator ? 'text-green-600' : 'text-gray-400'}`}>
                      🏢{property.elevator ? '엘베' : '엘베X'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    조회: {property.view_count || 0}
                  </div>
                </div>

              </div>
            </div>

            {/* 모바일 레이아웃 */}
            <div className="lg:hidden px-4 py-4">
              <div className="space-y-3">
                {/* 첫 번째 줄: 거래유형, 상태, 가격 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge size="sm" variant={
                      property.transaction_type === '매매' ? 'sale' : 
                      property.transaction_type === '전세' ? 'jeonse' : 'monthly'
                    }>
                      {property.transaction_type}
                    </Badge>
                    <Badge size="sm" variant={
                      property.status === '거래중' ? 'success' : 
                      property.status === '거래완료' ? 'default' : 'default'
                    }>
                      {property.status}
                    </Badge>
                  </div>
                  <div className="font-bold text-primary-600 text-base">
                    {formatPrice(property)}
                  </div>
                </div>
                
                {/* 두 번째 줄: 매물 제목 */}
                <div className="font-medium text-gray-900 text-base">
                  {property.title}
                </div>
                
                {/* 세 번째 줄: 주소 */}
                <div className="text-sm text-gray-600">
                  📍 {property.address}
                </div>
                
                {/* 네 번째 줄: 매물 상세 정보 */}
                <div className="text-sm text-gray-500">
                  {property.type} • {property.area}m² ({Math.floor(property.area/3.3)}평) • {property.floor}/{property.total_floors}층 • {property.rooms}룸 {property.bathrooms}욕실
                </div>
                
                {/* 다섯 번째 줄: 부가 정보 */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    <span className={`${property.parking ? 'text-green-600' : 'text-gray-400'}`}>
                      🚗{property.parking ? '주차' : '주차X'}
                    </span>
                    <span className={`${property.elevator ? 'text-green-600' : 'text-gray-400'}`}>
                      🏢{property.elevator ? '엘베' : '엘베X'}
                    </span>
                    {property.exit_date && (
                      <span className="text-orange-600">
                        퇴실: {new Date(property.exit_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <div>
                    등록: {property.created_at && new Date(property.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export { PropertiesPageNew }