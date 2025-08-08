// ============================================================================
// 매물 등록 폼 컴포넌트 - 개선된 디자인
// ============================================================================

import React, { useState, useCallback, useMemo } from 'react'
import { X, Save, Home, MapPin, DollarSign, User, FileText, Settings } from 'lucide-react'
import { Button, Input, Select, Modal } from '@/components/ui'
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
  '거래중', '거래완료'
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
    status: '거래중',
    address: '',
    area: 0,
    floor: 1,
    total_floors: 1,
    rooms: 1,
    bathrooms: 1,
    parking: false,
    elevator: false
  })


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
      if (import.meta.env.DEV) {
        console.log('Form 제출 데이터:', { 
          transaction_type: formData.transaction_type,
          price: formData.price 
        })
      }
      await onSubmit(formData)
      console.log('✅ 매물 등록 성공!')
      
      // 폼 초기화
      console.log('🧹 폼 초기화 중...')
      setFormData({
        title: '',
        type: '아파트',
        transaction_type: '매매',
        status: '거래중',
        address: '',
        area: 0,
        floor: 1,
        total_floors: 1,
        rooms: 1,
        bathrooms: 1,
        parking: false,
        elevator: false
      })
      setErrors({})
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
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        {/* 모바일 최적화된 헤더 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg flex-shrink-0">
                <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-white truncate">새 매물 등록</h2>
                <p className="text-blue-100 text-xs sm:text-sm hidden sm:block">매물 정보를 입력해주세요</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 active:scale-95 p-2 h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex-shrink-0 ml-2"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              
              {/* 기본 정보 섹션 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                  <div className="p-1.5 bg-blue-600 rounded-md">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">기본 정보</h3>
                    <p className="text-xs text-gray-600 hidden sm:block">매물의 기본적인 정보를 입력해주세요</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Input
                      label="매물 제목"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      error={errors.title}
                      placeholder="예: 강남구 신사동 럭셔리 아파트"
                      required
                      className="text-sm sm:text-base h-11 sm:h-12"
                    />
                  </div>
                  
                  <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-3">
                    <Select
                      label="매물 유형"
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value as PropertyType)}
                      options={propertyTypeOptions}
                      className="text-sm sm:text-base h-11 sm:h-12"
                    />
                    
                    <Select
                      label="거래 유형"
                      value={formData.transaction_type}
                      onChange={(e) => handleInputChange('transaction_type', e.target.value as TransactionType)}
                      options={transactionTypeOptions}
                      className="text-sm sm:text-base h-11 sm:h-12"
                    />
                    
                    <Select
                      label="매물 상태"
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value as PropertyStatus)}
                      options={statusOptions}
                      className="text-sm sm:text-base h-11 sm:h-12"
                    />
                  </div>
                </div>
              </div>

              {/* 위치 정보 섹션 */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-green-100">
                <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                  <div className="p-1.5 bg-green-600 rounded-md">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">위치 정보</h3>
                    <p className="text-xs text-gray-600 hidden sm:block">매물의 정확한 위치를 입력해주세요</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Input
                      label="주소"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      error={errors.address}
                      placeholder="예: 서울시 강남구 신사동 123-45"
                      required
                      className="text-sm sm:text-base h-11 sm:h-12"
                    />
                  </div>
                  
                  <div>
                    <Input
                      label="상세 주소"
                      value={formData.detailed_address || ''}
                      onChange={(e) => handleInputChange('detailed_address', e.target.value)}
                      placeholder="예: 123동 456호"
                      className="text-sm sm:text-base h-11 sm:h-12"
                    />
                  </div>
                </div>
              </div>

              {/* 매물 정보 섹션 */}
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-3 sm:p-4 border border-purple-100">
                <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                  <div className="p-1.5 bg-purple-600 rounded-md">
                    <Home className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">매물 정보</h3>
                    <p className="text-xs text-gray-600 hidden sm:block">매물의 상세 정보를 입력해주세요</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* 면적 및 구조 */}
                  <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:gap-3">
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
                      className="text-sm sm:text-base h-11 sm:h-12"
                    />
                    
                    <Input
                      label="층수"
                      type="number"
                      value={formData.floor || ''}
                      onChange={(e) => handleInputChange('floor', parseInt(e.target.value) || 1)}
                      error={errors.floor}
                      placeholder="15"
                      min="1"
                      className="text-sm sm:text-base h-11 sm:h-12"
                    />
                    
                    <Input
                      label="전체 층수"
                      type="number"
                      value={formData.total_floors || ''}
                      onChange={(e) => handleInputChange('total_floors', parseInt(e.target.value) || 1)}
                      error={errors.total_floors}
                      placeholder="25"
                      min="1"
                      className="text-sm sm:text-base h-11 sm:h-12 sm:col-span-2 md:col-span-1"
                    />
                  </div>

                  {/* 방 구성 */}
                  <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
                    <Select
                      label="방 개수"
                      value={formData.rooms?.toString() || '1'}
                      onChange={(e) => handleInputChange('rooms', parseInt(e.target.value) || 1)}
                      error={errors.rooms}
                      options={ROOM_OPTIONS}
                      className="text-sm sm:text-base h-11 sm:h-12"
                    />
                    
                    <Input
                      label="화장실 개수"
                      type="number"
                      value={formData.bathrooms || ''}
                      onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 1)}
                      error={errors.bathrooms}
                      placeholder="2"
                      min="1"
                      className="text-sm sm:text-base h-11 sm:h-12"
                    />
                  </div>
                  
                  {/* 편의시설 */}
                  <div className="bg-white/60 rounded-lg p-3 border border-purple-200">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">편의시설</h4>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                      <label className="flex items-center space-x-2 bg-white rounded-md px-2 sm:px-3 py-2 border border-gray-200 hover:border-purple-300 active:scale-95 transition-all cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.parking}
                          onChange={(e) => handleInputChange('parking', e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4 sm:w-3 sm:h-3"
                        />
                        <span className="text-xs font-medium text-gray-700">🚗 주차</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 bg-white rounded-md px-2 sm:px-3 py-2 border border-gray-200 hover:border-purple-300 active:scale-95 transition-all cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.elevator}
                          onChange={(e) => handleInputChange('elevator', e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4 sm:w-3 sm:h-3"
                        />
                        <span className="text-xs font-medium text-gray-700">🏢 엘리베이터</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 가격 정보 섹션 */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 sm:p-4 border border-orange-100">
                <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                  <div className="p-1.5 bg-orange-600 rounded-md">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">가격 정보</h3>
                    <p className="text-xs text-gray-600 hidden sm:block">거래 유형에 맞는 가격을 입력해주세요</p>
                  </div>
                </div>
                
                <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-3">
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
                      className="text-sm sm:text-base h-11 sm:h-12"
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
                      className="text-sm sm:text-base h-11 sm:h-12"
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
                      className="text-sm sm:text-base h-11 sm:h-12"
                    />
                  )}
                </div>
              </div>

              {/* 임대인 정보 섹션 */}
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-3 sm:p-4 border border-rose-100">
                <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                  <div className="p-1.5 bg-rose-600 rounded-md">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">임대인 정보</h3>
                    <p className="text-xs text-gray-600 hidden sm:block">임대인의 연락처 정보를 입력해주세요</p>
                  </div>
                </div>
                
                <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
                  <Input
                    label="임대인 이름"
                    value={formData.landlord_name || ''}
                    onChange={(e) => handleInputChange('landlord_name', e.target.value)}
                    placeholder="홍길동"
                    className="text-sm sm:text-base h-11 sm:h-12"
                  />
                  
                  <Input
                    label="임대인 연락처"
                    value={formData.landlord_phone || ''}
                    onChange={(e) => handleInputChange('landlord_phone', e.target.value)}
                    placeholder="010-1234-5678"
                    className="text-sm sm:text-base h-11 sm:h-12"
                  />
                </div>
              </div>

              {/* 기타 정보 섹션 */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-3 sm:p-4 border border-gray-100">
                <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                  <div className="p-1.5 bg-gray-600 rounded-md">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">기타 정보</h3>
                    <p className="text-xs text-gray-600 hidden sm:block">추가적인 매물 정보를 입력해주세요</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    매물 설명
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="매물에 대한 상세한 설명을 입력해주세요&#10;예: 남향, 풀옵션, 교통 편리, 학군 좋음 등"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-xs sm:text-sm resize-none transition-colors"
                  />
                </div>
              </div>

              {/* 모바일 최적화된 폼 액션 버튼 */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-reverse space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-2 text-sm sm:text-base active:scale-95"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  leftIcon={<Save size={16} />}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 active:scale-95"
                >
                  매물 등록
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  )
}