// ============================================================================
// 매물 등록 폼 컴포넌트
// ============================================================================

import React, { useState, useCallback, useMemo } from 'react'
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

// 방 개수 옵션 (정수만 지원 - DB integer 컬럼)
const ROOM_OPTIONS = [
  { value: '1', label: '1개' },
  { value: '2', label: '2개' },
  { value: '3', label: '3개' },
  { value: '4', label: '4개' },
  { value: '5', label: '5개' },
  { value: '6', label: '6개' },
  { value: '7', label: '7개' }
]

// 샘플 데이터 제거 - 실제 Supabase 데이터 사용

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

  const [isVacant, setIsVacant] = useState(false)

  const [errors, setErrors] = useState<Partial<Record<keyof CreatePropertyData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = useCallback((field: keyof CreatePropertyData, value: any) => {
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
  }, [errors])

  // 메모이제이션된 옵션들
  const propertyTypeOptions = useMemo(() => 
    PROPERTY_TYPES.map(type => ({ value: type, label: type })), []
  )
  
  const transactionTypeOptions = useMemo(() => 
    TRANSACTION_TYPES.map(type => ({ value: type, label: type })), []
  )
  
  const statusOptions = useMemo(() => 
    PROPERTY_STATUS.map(status => ({ value: status, label: status })), []
  )

  // 샘플 데이터 기능 제거

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreatePropertyData, string>> = {}

    // 필수항목 1: 매물 제목
    if (!formData.title?.trim()) {
      newErrors.title = '제목을 입력해주세요'
    }

    // 필수항목 2: 주소
    if (!formData.address?.trim()) {
      newErrors.address = '주소를 입력해주세요'
    }

    // 필수항목 3: 거래 유형별 가격 검증
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

    // 선택적 검증: 입력된 경우에만 유효성 검사
    if (formData.total_floors && formData.floor && formData.total_floors < formData.floor) {
      newErrors.total_floors = '전체 층수는 해당 층수보다 크거나 같아야 합니다'
    }

    // 면적 검증
    if (!formData.area || formData.area <= 0) {
      newErrors.area = '면적을 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🚀 매물 등록 폼 제출 시작')
    console.log('📋 폼 데이터:', formData)
    console.log('✅ 폼 유효성 검사 시작...')
    
    const isValid = validateForm()
    console.log('📊 폼 유효성 검사 결과:', isValid)
    console.log('❌ 에러 목록:', errors)
    
    if (!isValid) {
      console.log('❌ 폼 유효성 검사 실패 - 제출 중단')
      return
    }
    
    if (isSubmitting) {
      console.log('⏳ 이미 제출 중 - 중복 제출 방지')
      return
    }

    console.log('🔄 매물 등록 요청 시작...')
    setIsSubmitting(true)
    
    try {
      console.log('📡 onSubmit 함수 호출 중...')
      // 매매가 데이터 확인 (개발 환경에서만)
      if (import.meta.env.DEV && formData.transaction_type === '매매') {
        console.log('Form 매매가 데이터:', { price: formData.price, type: typeof formData.price })
      }
      await onSubmit(formData)
      console.log('✅ 매물 등록 성공!')
      
      // 폼 초기화
      console.log('🧹 폼 초기화 중...')
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
      setIsVacant(false)
      console.log('🚪 폼 닫기...')
      onClose()
    } catch (error) {
      console.error('💥 매물 등록 실패:', error)
      console.error('💥 에러 타입:', typeof error)
      console.error('💥 에러 상세:', error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error)
      
      // 사용자에게 에러 메시지 표시
      alert(`매물 등록에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      console.log('🏁 매물 등록 프로세스 완료')
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>새 매물 등록</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-8 w-8"
            >
              <X size={16} />
            </Button>
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
                  options={propertyTypeOptions}
                />
                
                <Select
                  label="거래 유형"
                  value={formData.transaction_type}
                  onChange={(e) => handleInputChange('transaction_type', e.target.value as TransactionType)}
                  options={transactionTypeOptions}
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
                />
                
                <Input
                  label="전체 층수"
                  type="number"
                  value={formData.total_floors || ''}
                  onChange={(e) => handleInputChange('total_floors', parseInt(e.target.value) || 1)}
                  error={errors.total_floors}
                  placeholder="25"
                  min="1"
                />
                
                <Select
                  label="방 개수"
                  value={formData.rooms?.toString() || '1'}
                  onChange={(e) => handleInputChange('rooms', parseInt(e.target.value) || 1)}
                  error={errors.rooms}
                  options={ROOM_OPTIONS}
                />
                
                <Input
                  label="화장실 개수"
                  type="number"
                  value={formData.bathrooms || ''}
                  onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 1)}
                  error={errors.bathrooms}
                  placeholder="2"
                  min="1"
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
                {/* 퇴실예정일 / 공실 선택 */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    거주 현황
                  </label>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isVacant}
                        onChange={(e) => {
                          setIsVacant(e.target.checked)
                          if (e.target.checked) {
                            handleInputChange('exit_date', undefined)
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">현재 공실</span>
                    </label>
                    
                    {!isVacant && (
                      <Input
                        label="퇴실 예정일"
                        type="date"
                        value={formData.exit_date || ''}
                        onChange={(e) => handleInputChange('exit_date', e.target.value)}
                        placeholder="퇴실 예정일을 선택하세요"
                      />
                    )}
                  </div>
                </div>
                
                <Select
                  label="매물 상태"
                  value={formData.status || '판매중'}
                  onChange={(e) => handleInputChange('status', e.target.value as PropertyStatus)}
                  options={statusOptions}
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