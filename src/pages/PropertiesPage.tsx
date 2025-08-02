// ============================================================================
// 매물 관리 페이지 (MVP 코드 기반)
// ============================================================================

import React, { useState, useMemo } from 'react'
import { Search, Plus, Grid, AlignLeft, Filter, Settings } from 'lucide-react'
import { Button, Card, Badge, Input, Select } from '@/components/ui'

// MVP 샘플 데이터 (임시)
const sampleProperties = [
  {
    id: 1,
    title: "강남구 신사동 럭셔리 아파트",
    type: "아파트",
    transactionType: "매매",
    price: 35000,
    deposit: 0,
    monthlyRent: 0,
    address: "서울시 강남구 역삼동 123-10",
    area: 85,
    floor: 15,
    totalFloors: 25,
    rooms: 3,
    bathrooms: 2,
    parking: true,
    elevator: true,
    status: "판매중",
    createdAt: "2025-09-01",
    isFavorite: false,
    exitDate: "2025-08-31",
    landlordName: "김임대",
    landlordPhone: "010-1234-5678"
  },
  {
    id: 2,
    title: "경기도 성남시 분당구 정자동",
    type: "아파트",
    transactionType: "전세",
    price: 0,
    deposit: 21000,
    monthlyRent: 0,
    address: "경기도 성남시 분당구 정자동 456-78",
    area: 60,
    floor: 8,
    totalFloors: 20,
    rooms: 2,
    bathrooms: 1,
    parking: true,
    elevator: true,
    status: "예약중",
    createdAt: "2025-08-31",
    isFavorite: true,
    exitDate: "",
    landlordName: "박소유",
    landlordPhone: "010-9876-5432"
  },
]

const PropertiesPage: React.FC = () => {
  const [properties] = useState(sampleProperties)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransactionType, setSelectedTransactionType] = useState('전체')
  const [selectedPropertyType, setSelectedPropertyType] = useState('전체')
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')

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

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          property.address.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTransaction = selectedTransactionType === '전체' || property.transactionType === selectedTransactionType
      const matchesType = selectedPropertyType === '전체' || property.type === selectedPropertyType
      
      return matchesSearch && matchesTransaction && matchesType
    })
  }, [properties, searchTerm, selectedTransactionType, selectedPropertyType])

  const formatPrice = (transactionType: string, price: number, deposit: number, monthlyRent: number) => {
    if (transactionType === "매매") {
      return `${(price/10000).toFixed(0)}억 ${(price%10000/1000).toFixed(0)}천만원`
    } else if (transactionType === "전세") {
      return `${(deposit/10000).toFixed(0)}억 ${(deposit%10000/1000).toFixed(0)}천만원`
    } else {
      return `${deposit.toLocaleString()}/${monthlyRent}만원`
    }
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">매물 관리</h1>
          <p className="text-gray-600 mt-1">
            총 <span className="font-semibold text-primary-600">{filteredProperties.length}</span>개의 매물
          </p>
        </div>
        <Button leftIcon={<Plus size={18} />}>
          매물 등록
        </Button>
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
                onClick={() => {
                  setSearchTerm('')
                  setSelectedTransactionType('전체')
                  setSelectedPropertyType('전체')
                }}
                leftIcon={<Settings size={16} />}
              >
                초기화
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 매물 리스트 */}
      {filteredProperties.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <p className="text-gray-500">검색 조건에 맞는 매물이 없습니다.</p>
        </Card>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredProperties.map(property => (
            <Card key={property.id} className="card-hover">
              {/* 상단 헤더 */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={property.transactionType === '매매' ? 'sale' : property.transactionType === '전세' ? 'jeonse' : 'monthly'}>
                      {property.transactionType}
                    </Badge>
                    <Badge variant={property.status === '판매중' ? 'available' : property.status === '예약중' ? 'reserved' : 'sold'}>
                      {property.status}
                    </Badge>
                  </div>
                  <button className="p-1.5 rounded-full bg-gray-100 text-gray-400 hover:bg-red-500 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill={property.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                
                <div className="font-bold text-lg text-gray-900">
                  {formatPrice(property.transactionType, property.price, property.deposit, property.monthlyRent)}
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
                    {property.area}m² (구 {Math.floor(property.area/3.3)}평), {property.floor}층 | {property.type}
                  </div>
                  <div>임대인: {property.landlordName} ({property.landlordPhone})</div>
                  <div>
                    <span>퇴실: {property.exitDate || '정보 없음'}</span>
                    <span className="ml-3">입주: {property.createdAt}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="primary">
                    계약완료
                  </Button>
                  <Button size="sm" variant="outline">
                    문의하기
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
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
            {filteredProperties.map(property => (
              <div key={property.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="px-6 py-4">
                  <div className="grid grid-cols-12 gap-4 items-center text-sm">
                    <div className="col-span-1">
                      <Badge size="sm" variant={property.transactionType === '매매' ? 'sale' : property.transactionType === '전세' ? 'jeonse' : 'monthly'}>
                        {property.transactionType}
                      </Badge>
                    </div>
                    
                    <div className="col-span-4">
                      <div className="font-medium text-gray-900 truncate">
                        {property.title}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {property.address} | {property.area}m² (구 {Math.floor(property.area/3.3)}평), {property.floor}층 | {property.type}
                      </div>
                    </div>

                    <div className="col-span-2 text-right">
                      <div className="font-bold text-gray-900">
                        {formatPrice(property.transactionType, property.price, property.deposit, property.monthlyRent)}
                      </div>
                    </div>

                    <div className="col-span-2 text-xs text-gray-600">
                      <div>임대인: {property.landlordName}</div>
                      <div>{property.landlordPhone}</div>
                    </div>

                    <div className="col-span-1">
                      <Badge size="sm" variant={property.status === '판매중' ? 'available' : property.status === '예약중' ? 'reserved' : 'sold'}>
                        {property.status}
                      </Badge>
                    </div>

                    <div className="col-span-2 flex items-center justify-end space-x-2">
                      <Button size="sm" variant="primary">
                        계약완료
                      </Button>
                      <Button size="sm" variant="outline">
                        수정
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export { PropertiesPage }