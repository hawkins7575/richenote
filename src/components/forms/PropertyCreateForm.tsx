// ============================================================================
// 매물 등록 폼 컴포넌트
// ============================================================================

import React, { useState } from 'react'
import { X, Save } from 'lucide-react'
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent, Modal } from '@/components/ui'
import type { CreatePropertyData, PropertyType, TransactionType, PropertyStatus } from '@/types'

interface PropertyCreateFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreatePropertyData) => Promise<void>
  loading?: boolean
}

const PROPERTY_TYPES: PropertyType[] = [
  '아파트', '오피스텔', '원룸', '빌라', '단독주택', '상가', '사무실', '기타'
]

const TRANSACTION_TYPES: TransactionType[] = [
  '매매', '전세', '월세', '단기임대'
]

const PROPERTY_STATUS: PropertyStatus[] = [
  '판매중', '예약중', '거래완료', '임시보관', '만료됨'
]

// 🧪 테스트용 샘플 데이터
const SAMPLE_PROPERTIES = [
  {
    title: '강남역 신축 오피스텔',
    address: '서울시 강남구 강남대로 123',
    type: '오피스텔' as PropertyType,
    transaction_type: '월세' as TransactionType,
    deposit: 2000,
    monthly_rent: 120,
    floor: 15,
    total_floors: 20,
    area: 33.0,
    rooms: 1,
    bathrooms: 1,
    parking: true,
    elevator: true,
    description: '강남역 도보 3분 거리의 신축 오피스텔입니다. 깨끗하고 편리한 시설을 갖추고 있습니다.',
    status: '판매중' as PropertyStatus
  },
  {
    title: '홍대입구 투룸 원룸',
    address: '서울시 마포구 와우산로 45',
    type: '원룸' as PropertyType,
    transaction_type: '전세' as TransactionType,
    deposit: 15000,
    floor: 3,
    total_floors: 5,
    area: 42.0,
    rooms: 2,
    bathrooms: 1,
    parking: false,
    elevator: false,
    description: '홍대입구역 근처 조용한 주택가의 투룸 원룸입니다. 대학생이나 직장인에게 적합합니다.',
    status: '판매중' as PropertyStatus
  },
  {
    title: '잠실 리체타워 아파트',
    address: '서울시 송파구 잠실로 789',
    type: '아파트' as PropertyType,
    transaction_type: '매매' as TransactionType,
    price: 65000,
    floor: 12,
    total_floors: 25,
    area: 84.0,
    rooms: 3,
    bathrooms: 2,
    parking: true,
    elevator: true,
    description: '잠실 롯데타워 인근의 고급 아파트입니다. 한강뷰와 우수한 교통편을 자랑합니다.',
    status: '판매중' as PropertyStatus
  }
]

export const PropertyCreateForm: React.FC<PropertyCreateFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreatePropertyData>({
    title: '',
    type: '아파트',
    transaction_type: '매매',
    address: '',
    area: 0,
    floor: 1,
    total_floors: 1,
    rooms: 1,
    bathrooms: 1,
    parking: false,
    elevator: false,
    status: '판매중'
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CreatePropertyData, string>>>({})

  const handleInputChange = (field: keyof CreatePropertyData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // 에러 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  // 🧪 테스트용 샘플 데이터 자동 입력
  const fillSampleData = (index: number = 0) => {
    const sample = SAMPLE_PROPERTIES[index % SAMPLE_PROPERTIES.length]
    setFormData(sample)
    setErrors({})
    console.log('✅ 샘플 데이터 입력 완료:', sample.title)
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreatePropertyData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요'
    }

    if (!formData.address.trim()) {
      newErrors.address = '주소를 입력해주세요'
    }

    if (formData.area <= 0) {
      newErrors.area = '면적은 0보다 커야 합니다'
    }

    if (formData.floor < 1) {
      newErrors.floor = '층수는 1층 이상이어야 합니다'
    }

    if (formData.total_floors < formData.floor) {
      newErrors.total_floors = '전체 층수는 해당 층수보다 크거나 같아야 합니다'
    }

    if (formData.rooms < 1) {
      newErrors.rooms = '방 개수는 1개 이상이어야 합니다'
    }

    if (formData.bathrooms < 1) {
      newErrors.bathrooms = '화장실 개수는 1개 이상이어야 합니다'
    }

    // 거래 유형별 가격 검증
    if (formData.transaction_type === '매매' && (!formData.price || formData.price <= 0)) {
      newErrors.price = '매매가를 입력해주세요'
    }

    if (formData.transaction_type === '전세' && (!formData.deposit || formData.deposit <= 0)) {
      newErrors.deposit = '전세금을 입력해주세요'
    }

    if (formData.transaction_type === '월세') {
      if (!formData.deposit || formData.deposit <= 0) {
        newErrors.deposit = '보증금을 입력해주세요'
      }
      if (!formData.monthly_rent || formData.monthly_rent <= 0) {
        newErrors.monthly_rent = '월세를 입력해주세요'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await onSubmit(formData)
      
      // 폼 초기화
      setFormData({
        title: '',
        type: '아파트',
        transaction_type: '매매',
        address: '',
        area: 0,
        floor: 1,
        total_floors: 1,
        rooms: 1,
        bathrooms: 1,
        parking: false,
        elevator: false,
        status: '판매중'
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('매물 등록 실패:', error)
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>새 매물 등록</CardTitle>
            <div className="flex items-center gap-2">
              {/* 🧪 테스트용 샘플 데이터 버튼 */}
              <div className="flex gap-1">
                {SAMPLE_PROPERTIES.map((sample, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => fillSampleData(index)}
                    className="h-8 px-2 text-xs"
                    type="button"
                  >
                    {sample.title.split(' ')[0]}
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1 h-8 w-8"
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">기본 정보</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="매물 제목"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    error={errors.title}
                    placeholder="예: 강남구 신사동 럭셔리 아파트"
                    required
                  />
                </div>
                
                <Select
                  label="매물 유형"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as PropertyType)}
                  options={PROPERTY_TYPES.map(type => ({ value: type, label: type }))}
                  required
                />
                
                <Select
                  label="거래 유형"
                  value={formData.transaction_type}
                  onChange={(e) => handleInputChange('transaction_type', e.target.value as TransactionType)}
                  options={TRANSACTION_TYPES.map(type => ({ value: type, label: type }))}
                  required
                />
              </div>
            </div>

            {/* 위치 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">위치 정보</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="주소"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    error={errors.address}
                    placeholder="예: 서울시 강남구 신사동 123-45"
                    required
                  />
                </div>
                
                <Input
                  label="상세 주소"
                  value={formData.detailed_address || ''}
                  onChange={(e) => handleInputChange('detailed_address', e.target.value)}
                  placeholder="예: 123동 456호"
                />
              </div>
            </div>

            {/* 매물 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">매물 정보</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input
                  label="면적 (m²)"
                  type="number"
                  value={formData.area || ''}
                  onChange={(e) => handleInputChange('area', parseFloat(e.target.value) || 0)}
                  error={errors.area}
                  placeholder="85.0"
                  min="0"
                  step="0.1"
                  required
                />
                
                <Input
                  label="층수"
                  type="number"
                  value={formData.floor || ''}
                  onChange={(e) => handleInputChange('floor', parseInt(e.target.value) || 1)}
                  error={errors.floor}
                  placeholder="15"
                  min="1"
                  required
                />
                
                <Input
                  label="전체 층수"
                  type="number"
                  value={formData.total_floors || ''}
                  onChange={(e) => handleInputChange('total_floors', parseInt(e.target.value) || 1)}
                  error={errors.total_floors}
                  placeholder="25"
                  min="1"
                  required
                />
                
                <Input
                  label="방 개수"
                  type="number"
                  value={formData.rooms || ''}
                  onChange={(e) => handleInputChange('rooms', parseInt(e.target.value) || 1)}
                  error={errors.rooms}
                  placeholder="3"
                  min="1"
                  required
                />
                
                <Input
                  label="화장실 개수"
                  type="number"
                  value={formData.bathrooms || ''}
                  onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 1)}
                  error={errors.bathrooms}
                  placeholder="2"
                  min="1"
                  required
                />
              </div>
              
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.parking}
                    onChange={(e) => handleInputChange('parking', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">주차 가능</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.elevator}
                    onChange={(e) => handleInputChange('elevator', e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">엘리베이터</span>
                </label>
              </div>
            </div>

            {/* 가격 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">가격 정보</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.transaction_type === '매매' && (
                  <Input
                    label="매매가 (만원)"
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', parseInt(e.target.value) || undefined)}
                    error={errors.price}
                    placeholder="35000"
                    min="0"
                    required
                  />
                )}
                
                {(formData.transaction_type === '전세' || formData.transaction_type === '월세') && (
                  <Input
                    label={formData.transaction_type === '전세' ? '전세금 (만원)' : '보증금 (만원)'}
                    type="number"
                    value={formData.deposit || ''}
                    onChange={(e) => handleInputChange('deposit', parseInt(e.target.value) || undefined)}
                    error={errors.deposit}
                    placeholder="21000"
                    min="0"
                    required
                  />
                )}
                
                {formData.transaction_type === '월세' && (
                  <Input
                    label="월세 (만원)"
                    type="number"
                    value={formData.monthly_rent || ''}
                    onChange={(e) => handleInputChange('monthly_rent', parseInt(e.target.value) || undefined)}
                    error={errors.monthly_rent}
                    placeholder="65"
                    min="0"
                    required
                  />
                )}
              </div>
            </div>

            {/* 임대인 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">임대인 정보</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="임대인 이름"
                  value={formData.landlord_name || ''}
                  onChange={(e) => handleInputChange('landlord_name', e.target.value)}
                  placeholder="홍길동"
                />
                
                <Input
                  label="임대인 연락처"
                  value={formData.landlord_phone || ''}
                  onChange={(e) => handleInputChange('landlord_phone', e.target.value)}
                  placeholder="010-1234-5678"
                />
              </div>
            </div>

            {/* 기타 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">기타 정보</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="퇴실 예정일"
                  type="date"
                  value={formData.exit_date || ''}
                  onChange={(e) => handleInputChange('exit_date', e.target.value)}
                />
                
                <Select
                  label="매물 상태"
                  value={formData.status || '판매중'}
                  onChange={(e) => handleInputChange('status', e.target.value as PropertyStatus)}
                  options={PROPERTY_STATUS.map(status => ({ value: status, label: status }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  매물 설명
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="매물에 대한 상세한 설명을 입력해주세요"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* 폼 액션 */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                leftIcon={<Save size={16} />}
              >
                매물 등록
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Modal>
  )
}