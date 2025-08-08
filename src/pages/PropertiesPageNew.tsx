// ============================================================================
// 기능 향상된 매물 관리 페이지 (SaaS 버전)
// ============================================================================

import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Plus, Grid, AlignLeft, Settings } from 'lucide-react'
import { Button, Card, Badge, Input, Select, Modal, Loading } from '@/components/ui'
import { PropertyStatusBadge } from '@/components/ui/Badge'
import { PropertyCreateForm } from '@/components/forms/PropertyCreateForm'
import { PropertyEditForm } from '@/components/forms/PropertyEditForm'
import { PropertyCard } from '@/components/property/PropertyCard'
import { PropertyDetailModal } from '@/components/property/PropertyDetailModal'
import { useProperties } from '@/hooks/useProperties'
import { useTenant } from '@/contexts/TenantContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatPrice } from '@/utils/propertyUtils'
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
  const [selectedPropertyStatus, setSelectedPropertyStatus] = useState('전체')
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
    if (selectedPropertyStatus !== '전체') result.property_status = selectedPropertyStatus
    
    return result
  }, [debouncedSearchTerm, selectedTransactionType, selectedPropertyType, selectedPropertyStatus])

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

  const propertyStatusOptions = [
    { value: '전체', label: '전체' },
    { value: '거래중', label: '거래중' },
    { value: '거래완료', label: '거래완료' },
  ]

  // 검색 플레이스홀더 생성
  const getSearchPlaceholder = () => {
    const activeFilters = []
    if (selectedTransactionType !== '전체') activeFilters.push(selectedTransactionType)
    if (selectedPropertyType !== '전체') activeFilters.push(selectedPropertyType)
    if (selectedPropertyStatus !== '전체') activeFilters.push(selectedPropertyStatus)
    
    if (activeFilters.length === 0) {
      return '매물명, 주소로 검색하세요...'
    }
    
    return `${activeFilters.join(' · ')} 매물 검색...`
  }

  // 활성 필터 배열 생성
  const getActiveFilters = () => {
    const filters = []
    if (selectedTransactionType !== '전체') filters.push(`거래: ${selectedTransactionType}`)
    if (selectedPropertyType !== '전체') filters.push(`유형: ${selectedPropertyType}`)
    if (selectedPropertyStatus !== '전체') filters.push(`상태: ${selectedPropertyStatus}`)
    return filters
  }


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
    setSelectedPropertyStatus('전체')
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
      {/* 모바일 최적화된 페이지 헤더 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-100">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            {/* 헤더 정보 */}
            <div className="flex items-center space-x-3 flex-1">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">매물 관리</h1>
                <p className="text-xs sm:text-sm text-blue-700 font-medium truncate">{tenant?.name}</p>
              </div>
            </div>
            
            {/* 모바일 등록 버튼 - 간소화 */}
            <button 
              onClick={() => setCreateFormOpen(true)}
              className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg active:scale-95 sm:hover:scale-105"
            >
              <Plus size={18} className="sm:mr-2" />
              <span className="hidden sm:inline font-medium">새 매물 등록</span>
            </button>
          </div>
          
          {/* 모바일 최적화된 통계 정보 */}
          <div className="flex items-center justify-between sm:justify-start sm:space-x-6 bg-white/60 rounded-lg p-3 sm:bg-transparent sm:p-0">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-xs sm:text-sm text-gray-600">총</span>
              <span className="text-base sm:text-lg font-bold text-blue-600">{properties.length}</span>
              <span className="text-xs sm:text-sm text-gray-600">개</span>
            </div>
            
            {tenant?.limits.max_properties && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-xs sm:text-sm text-gray-500">제한</span>
                <span className="text-xs sm:text-sm font-medium text-gray-700">{tenant.limits.max_properties}개</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 모바일 최적화된 검색 및 필터 영역 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6">
          {/* 모바일 최적화된 섹션 헤더 */}
          <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            <div className="p-1.5 sm:p-2 bg-gray-100 rounded-lg">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">검색 및 필터</h2>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">원하는 매물을 빠르게 찾아보세요</p>
            </div>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            {/* 모바일 최적화된 검색바 */}
            <div className="relative">
              <Input
                placeholder={getSearchPlaceholder()}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                leftIcon={<Search size={18} />}
                className="text-sm sm:text-base h-12 sm:h-14 text-gray-700 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              
              {/* 활성 필터 표시 - 모바일 최적화 */}
              {getActiveFilters().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 flex flex-wrap gap-1 sm:gap-2 z-10">
                  {getActiveFilters().map((filter, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 bg-blue-100 text-blue-800 text-xs sm:text-sm rounded-md sm:rounded-lg font-medium"
                    >
                      {filter}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 모바일 최적화된 필터 영역 */}
            <div className="space-y-4">
              {/* 필터 드롭다운들 - 모바일에서 세로 배치 */}
              <div className="space-y-3 sm:space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
                {/* 거래유형 필터 */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">거래유형</label>
                  <Select
                    options={transactionTypeOptions}
                    value={selectedTransactionType}
                    onChange={(e) => setSelectedTransactionType(e.target.value)}
                    className="w-full h-11 sm:h-12 text-sm sm:text-base bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                {/* 매물유형 필터 */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">매물유형</label>
                  <Select
                    options={propertyTypeOptions}
                    value={selectedPropertyType}
                    onChange={(e) => setSelectedPropertyType(e.target.value)}
                    className="w-full h-11 sm:h-12 text-sm sm:text-base bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                {/* 매물상태 필터 */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">매물상태</label>
                  <Select
                    options={propertyStatusOptions}
                    value={selectedPropertyStatus}
                    onChange={(e) => setSelectedPropertyStatus(e.target.value)}
                    className="w-full h-11 sm:h-12 text-sm sm:text-base bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>

              {/* 모바일 최적화된 하단 액션 영역 */}
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pt-4 border-t border-gray-100">
                {/* 뷰 모드 토글 - 모바일 최적화 */}
                <div className="flex items-center justify-center sm:justify-start">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 mr-3 sm:mr-2">보기:</span>
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('card')}
                      className={`flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                        viewMode === 'card' 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800 active:scale-95'
                      }`}
                    >
                      <Grid size={14} className="mr-1 sm:mr-2" />
                      카드형
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                        viewMode === 'list' 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800 active:scale-95'
                      }`}
                    >
                      <AlignLeft size={14} className="mr-1 sm:mr-2" />
                      리스트형
                    </button>
                  </div>
                </div>

                {/* 초기화 버튼 - 모바일 최적화 */}
                <Button 
                  variant="outline"
                  onClick={resetFilters}
                  size="sm"
                  leftIcon={<Settings size={14} />}
                  className="text-xs sm:text-sm font-medium px-4 py-2.5 bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 active:scale-95 rounded-lg transition-all duration-200 w-full sm:w-auto"
                >
                  <span className="sm:hidden">초기화</span>
                  <span className="hidden sm:inline">필터 초기화</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                  <div className="flex flex-col space-y-1">
                    <Badge size="sm" variant={
                      property.transaction_type === '매매' ? 'sale' : 
                      property.transaction_type === '전세' ? 'jeonse' : 'monthly'
                    }>
                      {property.transaction_type}
                    </Badge>
                    {/* 매물 상태 배지 */}
                    <PropertyStatusBadge status={property.status} />
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
                    {/* 매물 상태 배지 */}
                    <PropertyStatusBadge status={property.status} />
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