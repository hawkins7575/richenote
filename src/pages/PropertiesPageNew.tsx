// ============================================================================
// 기능 향상된 매물 관리 페이지 (SaaS 버전)
// ============================================================================

import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Plus, Grid, AlignLeft, Filter, Settings, Trash2, Edit, Eye, Heart } from 'lucide-react'
import { Button, Card, Badge, Input, Select, Modal, Loading } from '@/components/ui'
import { PropertyCreateForm } from '@/components/forms/PropertyCreateForm'
import { useProperties } from '@/hooks/useProperties'
import { useTenant } from '@/contexts/TenantContext'
import { useAuth } from '@/contexts/AuthContext'
import type { SimplePropertyFilters, Property, CreatePropertyData } from '@/types'

const PropertiesPageNew: React.FC = () => {
  const { user } = useAuth()
  const { tenant } = useTenant()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransactionType, setSelectedTransactionType] = useState('전체')
  const [selectedPropertyType, setSelectedPropertyType] = useState('전체')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [createFormOpen, setCreateFormOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

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

  // 필터 객체 생성
  const filters = useMemo((): SimplePropertyFilters => {
    const result: SimplePropertyFilters = {}
    
    if (searchTerm) result.search = searchTerm
    if (selectedTransactionType !== '전체') result.transaction_type = selectedTransactionType
    if (selectedPropertyType !== '전체') result.property_type = selectedPropertyType
    if (selectedStatus) result.status = selectedStatus as any
    
    return result
  }, [searchTerm, selectedTransactionType, selectedPropertyType, selectedStatus])

  const { 
    properties, 
    loading, 
    error, 
    refreshProperties,
    createProperty,
    updatePropertyStatus,
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

  const statusOptions = [
    { value: '', label: '모든 상태' },
    { value: '판매중', label: '판매중' },
    { value: '예약중', label: '예약중' },
    { value: '거래완료', label: '거래완료' },
  ]

  const formatPrice = (property: Property) => {
    if (property.transaction_type === '매매' && property.price) {
      return `${(property.price/10000).toFixed(0)}억 ${(property.price%10000/1000).toFixed(0)}천만원`
    } else if (property.transaction_type === '전세' && property.deposit) {
      return `${(property.deposit/10000).toFixed(0)}억 ${(property.deposit%10000/1000).toFixed(0)}천만원`
    } else if (property.transaction_type === '월세' && property.deposit && property.monthly_rent) {
      return `${property.deposit.toLocaleString()}/${property.monthly_rent}만원`
    }
    return '가격 정보 없음'
  }

  const handleStatusChange = async (propertyId: string, newStatus: Property['status']) => {
    try {
      await updatePropertyStatus(propertyId, newStatus)
    } catch (error) {
      console.error('Status update failed:', error)
    }
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
    setSelectedStatus('')
  }

  const handleCreateProperty = async (data: CreatePropertyData) => {
    try {
      setCreateLoading(true)
      await createProperty(data)
      // 폼이 닫히고 목록이 자동으로 새로고침됩니다
    } catch (error) {
      console.error('매물 등록 실패:', error)
      throw error // 폼에서 에러 처리
    } finally {
      setCreateLoading(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">매물 관리</h1>
          <p className="text-gray-600 mt-1">
            {tenant?.name}  •  총 <span className="font-semibold text-primary-600">{properties.length}</span>개의 매물
            {tenant?.limits.max_properties && (
              <span className="text-gray-500"> / {tenant.limits.max_properties}개 제한</span>
            )}
          </p>
        </div>
        <button 
          onClick={() => setCreateFormOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          매물 등록
        </button>
      </div>

      {/* 검색 및 필터 영역 */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* 검색바 */}
          <div className="relative">
            <Input
              placeholder="매물명, 주소로 검색하세요..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={20} />}
              className="text-base"
            />
          </div>

          {/* 필터 및 뷰 옵션 */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              {/* 거래유형 필터 */}
              <Select
                options={transactionTypeOptions}
                value={selectedTransactionType}
                onChange={(e) => setSelectedTransactionType(e.target.value)}
                className="w-32"
              />

              {/* 매물유형 필터 */}
              <Select
                options={propertyTypeOptions}
                value={selectedPropertyType}
                onChange={(e) => setSelectedPropertyType(e.target.value)}
                className="w-32"
              />

              {/* 상태 필터 */}
              <Select
                options={statusOptions}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-32"
              />
            </div>

            <div className="flex items-center space-x-3">
              {/* 뷰 모드 */}
              <div className="flex items-center bg-white rounded-lg p-1 border border-gray-300">
                <button
                  onClick={() => setViewMode('card')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                    viewMode === 'card' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Grid size={16} />
                  <span>카드</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                    viewMode === 'list' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <AlignLeft size={16} />
                  <span>리스트</span>
                </button>
              </div>

              {/* 초기화 버튼 */}
              <Button 
                variant="outline"
                onClick={resetFilters}
                leftIcon={<Settings size={16} />}
              >
                초기화
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              onStatusChange={handleStatusChange}
              onDelete={(property) => {
                setSelectedProperty(property)
                setDeleteConfirmOpen(true)
              }}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      ) : (
        <PropertyTable
          properties={properties}
          onStatusChange={handleStatusChange}
          onDelete={(property) => {
            setSelectedProperty(property)
            setDeleteConfirmOpen(true)
          }}
          formatPrice={formatPrice}
        />
      )}

      {/* 매물 등록 폼 모달 */}
      <PropertyCreateForm
        isOpen={createFormOpen}
        onClose={() => setCreateFormOpen(false)}
        onSubmit={handleCreateProperty}
        loading={createLoading}
      />

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

// 매물 카드 컴포넌트
interface PropertyCardProps {
  property: Property
  onStatusChange: (propertyId: string, status: Property['status']) => void
  onDelete: (property: Property) => void
  formatPrice: (property: Property) => string
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onStatusChange, 
  onDelete, 
  formatPrice 
}) => {
  return (
    <Card className="card-hover overflow-hidden">
      {/* 상단 헤더 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant={
              property.transaction_type === '매매' ? 'sale' : 
              property.transaction_type === '전세' ? 'jeonse' : 'monthly'
            }>
              {property.transaction_type}
            </Badge>
            <Badge variant={
              property.status === '판매중' ? 'available' : 
              property.status === '예약중' ? 'reserved' : 'sold'
            }>
              {property.status}
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <button className="p-1.5 rounded-full bg-gray-100 text-gray-400 hover:bg-red-500 hover:text-white transition-colors">
              <Heart size={14} fill={property.is_favorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
        
        <div className="font-bold text-lg text-gray-900">
          {formatPrice(property)}
        </div>
      </div>
      
      {/* 매물 정보 */}
      <div className="p-4">
        <h3 className="font-medium text-sm mb-2 text-ellipsis-2 text-gray-800">
          {property.title}
        </h3>
        <div className="text-xs text-gray-600 mb-3 truncate">
          {property.address}
        </div>

        <div className="text-xs text-gray-600 space-y-1 mb-4">
          <div>
            {property.area}m² ({Math.floor(property.area/3.3)}평), {property.floor}층 | {property.type}
          </div>
          {property.landlord_name && (
            <div>임대인: {property.landlord_name} ({property.landlord_phone})</div>
          )}
          {property.exit_date && (
            <div>
              <span>퇴실: {property.exit_date}</span>
              <span className="ml-3">등록: {new Date(property.created_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <select 
            value={property.status}
            onChange={(e) => onStatusChange(property.id, e.target.value as Property['status'])}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="판매중">판매중</option>
            <option value="예약중">예약중</option>
            <option value="거래완료">거래완료</option>
          </select>
          <Button size="sm" variant="outline">
            <Edit size={12} className="mr-1" />
            수정
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onDelete(property)}
          >
            <Trash2 size={12} className="mr-1" />
            삭제
          </Button>
        </div>
      </div>
    </Card>
  )
}

// 매물 테이블 컴포넌트
interface PropertyTableProps {
  properties: Property[]
  onStatusChange: (propertyId: string, status: Property['status']) => void
  onDelete: (property: Property) => void
  formatPrice: (property: Property) => string
}

const PropertyTable: React.FC<PropertyTableProps> = ({ 
  properties, 
  onStatusChange, 
  onDelete, 
  formatPrice 
}) => {
  return (
    <Card>
      {/* 테이블 헤더 */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-700">
          <div className="col-span-1">거래유형</div>
          <div className="col-span-4">매물정보</div>
          <div className="col-span-2 text-right">결제금액</div>
          <div className="col-span-2">임대인정보</div>
          <div className="col-span-1">진행상태</div>
          <div className="col-span-2 text-right">액션</div>
        </div>
      </div>
      
      {/* 매물 리스트 */}
      <div>
        {properties.map(property => (
          <div key={property.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="px-6 py-4">
              <div className="grid grid-cols-12 gap-4 items-center text-sm">
                <div className="col-span-1">
                  <Badge size="sm" variant={
                    property.transaction_type === '매매' ? 'sale' : 
                    property.transaction_type === '전세' ? 'jeonse' : 'monthly'
                  }>
                    {property.transaction_type}
                  </Badge>
                </div>
                
                <div className="col-span-4">
                  <div className="font-medium text-gray-900 truncate">
                    {property.title}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {property.address} | {property.area}m² ({Math.floor(property.area/3.3)}평), {property.floor}층 | {property.type}
                  </div>
                </div>

                <div className="col-span-2 text-right">
                  <div className="font-bold text-gray-900">
                    {formatPrice(property)}
                  </div>
                </div>

                <div className="col-span-2 text-xs text-gray-600">
                  {property.landlord_name ? (
                    <>
                      <div>임대인: {property.landlord_name}</div>
                      <div>{property.landlord_phone}</div>
                    </>
                  ) : (
                    <div className="text-gray-400">정보 없음</div>
                  )}
                </div>

                <div className="col-span-1">
                  <select 
                    value={property.status}
                    onChange={(e) => onStatusChange(property.id, e.target.value as Property['status'])}
                    className="text-xs border border-gray-300 rounded px-2 py-1 w-full"
                  >
                    <option value="판매중">판매중</option>
                    <option value="예약중">예약중</option>
                    <option value="거래완료">거래완료</option>
                  </select>
                </div>

                <div className="col-span-2 flex items-center justify-end space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye size={12} className="mr-1" />
                    보기
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit size={12} className="mr-1" />
                    수정
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onDelete(property)}
                  >
                    <Trash2 size={12} className="mr-1" />
                    삭제
                  </Button>
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