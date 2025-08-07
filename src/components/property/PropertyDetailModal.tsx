// ============================================================================
// 매물 상세 정보 팝업 모달 - 모든 매물 정보 표시
// ============================================================================

import React from 'react'
import { X, MapPin, User, Car, ChevronUp, Edit, Trash2 } from 'lucide-react'
import { Property } from '@/types/property'
import { formatPrice, formatArea, formatMoney } from '@/utils/propertyUtils'
import '@/styles/mobile-modal.css'

interface PropertyDetailModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (property: Property) => void
  onDelete?: (property: Property) => void
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!isOpen || !property) return null

  const price = formatPrice(property)

  // 방갯수 포맷팅 (소수점 포함)
  const formatRooms = (rooms: number) => {
    return rooms % 1 === 0 ? `${rooms}룸` : `${rooms}룸`
  }

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(property)
    }
  }

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(property)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 touch-manipulation">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] h-[95vh] overflow-hidden flex flex-col shadow-2xl">
        {/* 헤더 - 모바일 최적화 */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          {/* 모바일: 세로 배치 */}
          <div className="lg:hidden p-3 sm:p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex-1 pr-4">
                {property.title}
              </h2>
              <button
                onClick={onClose}
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="닫기"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm sm:text-base text-gray-600 leading-relaxed">{property.address}</span>
            </div>
            
            <div className="text-center py-2 bg-white rounded-lg border border-blue-200">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">{price}</div>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {property.type}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {property.transaction_type}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  property.status === '거래중' ? 'bg-green-100 text-green-800' : 
                  property.status === '거래완료' ? 'bg-gray-100 text-gray-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {property.status}
                </span>
              </div>
            </div>
          </div>
          
          {/* 데스크톱: 개선된 가로 배치 */}
          <div className="hidden lg:flex items-center justify-between p-6 space-x-6">
            <div className="flex-1 flex items-center space-x-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h2>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-base">{property.address}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 mb-2">{price}</div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full font-medium text-sm">
                    {property.type}
                  </span>
                  <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full font-medium text-sm">
                    {property.transaction_type}
                  </span>
                  <span className={`px-3 py-1.5 rounded-full font-medium text-sm ${
                    property.status === '거래중' ? 'bg-green-100 text-green-800' : 
                    property.status === '거래완료' ? 'bg-gray-100 text-gray-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {property.status}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 콘텐츠 - 모바일 최적화 */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 pb-safe pb-20">
            
            {/* 모바일: 세로 스택 레이아웃 */}
            <div className="lg:hidden space-y-3">
              
              {/* 기본 정보 */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  기본 정보
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-blue-200">
                    <span className="text-sm text-gray-700 font-medium">전용면적</span>
                    <span className="text-base font-bold text-gray-900">{formatArea(property.area)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-blue-200">
                    <span className="text-sm text-gray-700 font-medium">층수</span>
                    <span className="text-base font-bold text-gray-900">{property.floor}F / {property.total_floors}F</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-700 font-medium">구조</span>
                    <span className="text-base font-bold text-gray-900">{formatRooms(property.rooms)} {property.bathrooms}욕실</span>
                  </div>
                  
                  {/* 편의시설 */}
                  <div className="pt-2 border-t border-blue-200">
                    <div className="text-sm font-bold text-gray-800 mb-2">편의시설</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`flex items-center justify-center py-2 px-3 rounded-lg text-xs font-medium ${
                        property.parking ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-600 border border-gray-300'
                      }`}>
                        <Car className="w-3 h-3 mr-1" />
                        <span>주차 {property.parking ? '가능' : '불가'}</span>
                      </div>
                      <div className={`flex items-center justify-center py-2 px-3 rounded-lg text-xs font-medium ${
                        property.elevator ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-600 border border-gray-300'
                      }`}>
                        <ChevronUp className="w-3 h-3 mr-1" />
                        <span>엘리베이터 {property.elevator ? '있음' : '없음'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 위치 정보 */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  위치 정보
                </h3>
                <div className="flex items-start space-x-2 p-2 bg-white rounded-lg border border-green-200">
                  <MapPin className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{property.address}</div>
                    {property.detailed_address && (
                      <div className="text-xs text-gray-600 mt-1">{property.detailed_address}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* 가격 정보 */}
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  가격 정보
                </h3>
                <div className="space-y-2">
                  {property.transaction_type === '매매' && property.price && (
                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-blue-800">매매가</span>
                        <span className="text-base font-bold text-blue-900">
                          {formatMoney(property.price)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {(property.transaction_type === '전세' || property.transaction_type === '월세') && property.deposit !== undefined && (
                    <div className="bg-green-100 border border-green-300 rounded-lg p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-green-800">
                          {property.transaction_type === '전세' ? '전세금' : '보증금'}
                        </span>
                        <span className="text-base font-bold text-green-900">
                          {formatMoney(property.deposit)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {property.transaction_type === '월세' && property.monthly_rent && (
                    <div className="bg-orange-100 border border-orange-300 rounded-lg p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-orange-800">월세</span>
                        <span className="text-base font-bold text-orange-900">
                          {property.monthly_rent}만원/월
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 데스크톱: 스크롤 없는 한 화면 레이아웃 */}
            <div className="hidden lg:block">
              
              {/* 첫 번째 행: 4열 그리드 */}
              <div className="grid grid-cols-4 gap-3 mb-3">
                
                {/* 기본 정보 */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    기본 정보
                  </h3>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center bg-white rounded p-1.5 border border-blue-200">
                      <span className="text-xs text-gray-700 font-medium">전용면적</span>
                      <span className="text-sm font-bold text-gray-900">{formatArea(property.area)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white rounded p-1.5 border border-blue-200">
                      <span className="text-xs text-gray-700 font-medium">층수</span>
                      <span className="text-sm font-bold text-gray-900">{property.floor}F / {property.total_floors}F</span>
                    </div>
                    <div className="flex justify-between items-center bg-white rounded p-1.5 border border-blue-200">
                      <span className="text-xs text-gray-700 font-medium">구조</span>
                      <span className="text-sm font-bold text-gray-900">{formatRooms(property.rooms)} {property.bathrooms}욕실</span>
                    </div>
                  </div>
                </div>

                {/* 가격 정보 */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    가격 정보
                  </h3>
                  <div className="space-y-1.5">
                    {property.transaction_type === '매매' && property.price && (
                      <div className="bg-blue-100 border border-blue-300 rounded p-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-blue-800">매매가</span>
                          <span className="text-sm font-bold text-blue-900">{formatMoney(property.price)}</span>
                        </div>
                      </div>
                    )}
                    
                    {(property.transaction_type === '전세' || property.transaction_type === '월세') && property.deposit !== undefined && (
                      <div className="bg-green-100 border border-green-300 rounded p-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-green-800">
                            {property.transaction_type === '전세' ? '전세금' : '보증금'}
                          </span>
                          <span className="text-sm font-bold text-green-900">{formatMoney(property.deposit)}</span>
                        </div>
                      </div>
                    )}
                    
                    {property.transaction_type === '월세' && property.monthly_rent && (
                      <div className="bg-orange-100 border border-orange-300 rounded p-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-orange-800">월세</span>
                          <span className="text-sm font-bold text-orange-900">{property.monthly_rent}만원/월</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 편의시설 & 위치 */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    편의시설 & 위치
                  </h3>
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-1">
                      <div className={`flex items-center justify-center py-1 px-1.5 rounded text-xs font-medium ${
                        property.parking ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-600 border border-gray-300'
                      }`}>
                        <Car className="w-3 h-3 mr-1" />
                        <span>주차</span>
                      </div>
                      <div className={`flex items-center justify-center py-1 px-1.5 rounded text-xs font-medium ${
                        property.elevator ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-600 border border-gray-300'
                      }`}>
                        <ChevronUp className="w-3 h-3 mr-1" />
                        <span>EV</span>
                      </div>
                    </div>
                    <div className="bg-white rounded p-1.5 border border-green-200">
                      <div className="flex items-start">
                        <MapPin className="w-3 h-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-gray-900 leading-tight">{property.address}</div>
                      </div>
                      {property.detailed_address && (
                        <div className="text-xs text-gray-600 mt-1 ml-4">{property.detailed_address}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 임대인 & 날짜 정보 */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    임대인 & 날짜 정보
                  </h3>
                  <div className="space-y-1.5 mb-2">
                    {(property.landlord_name || property.landlord_phone) ? (
                      <>
                        {property.landlord_name && (
                          <div className="bg-white rounded p-1.5 border border-purple-200">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-gray-700">임대인</span>
                              <span className="text-sm font-bold text-gray-900">{property.landlord_name}</span>
                            </div>
                          </div>
                        )}
                        {property.landlord_phone && (
                          <div className="bg-white rounded p-1.5 border border-purple-200">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-gray-700">연락처</span>
                              <span className="text-sm font-bold text-gray-900">{property.landlord_phone}</span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="bg-white rounded p-1.5 border border-purple-200 text-center text-gray-500">
                        <User className="w-3 h-3 mx-auto mb-0.5 opacity-50" />
                        <div className="text-xs">임대인 정보 없음</div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {property.exit_date ? (
                      <div className="bg-red-100 border border-red-300 rounded p-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-red-800">퇴실예정</span>
                          <span className="text-xs font-bold text-red-900">
                            {new Date(property.exit_date).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-100 border border-green-300 rounded p-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-green-800">거주현황</span>
                          <span className="text-xs font-bold text-green-900">공실</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-white border border-purple-200 rounded p-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-800">등록일</span>
                        <span className="text-xs font-bold text-gray-900">
                          {new Date(property.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 두 번째 행: 상세 설명만 (임대인 정보는 첫 번째 행에 통합) */}
              {property.description && (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-3 border border-amber-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                    상세 설명
                  </h3>
                  <div className="bg-white p-3 rounded border border-amber-200 h-24 overflow-y-auto">
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {property.description}
                    </p>
                  </div>
                </div>
              )}
            </div>


            {/* 모바일: 상세 설명 (임대인, 날짜 정보는 위에 포함됨) */}
            <div className="lg:hidden space-y-4">
              {/* 상세 설명만 표시 */}
              {property.description && (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <div className="w-3 h-3 bg-amber-500 rounded-full mr-3"></div>
                    상세 설명
                  </h3>
                  <div className="bg-white p-4 sm:p-6 rounded-lg border border-amber-200 shadow-sm">
                    <p className="text-base sm:text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {property.description}
                    </p>
                  </div>
                </div>
              )}
            </div>


            
          </div>
        </div>

        {/* 액션 버튼 섹션 - 모바일 최적화 */}
        <div className="border-t border-gray-200 bg-white">
          {/* 모바일: 세로 스택 레이아웃 */}
          <div className="lg:hidden p-3 sm:p-4 pb-safe space-y-3 mb-20">
            
            {/* 액션 버튼들 */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={onClose}
                className="py-4 px-4 text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400 min-h-[48px] flex items-center justify-center"
                aria-label="모달 닫기"
              >
                닫기
              </button>
              
              <button
                onClick={handleEditClick}
                className="py-4 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 font-medium text-base min-h-[48px] flex items-center justify-center"
                aria-label="매물 정보 수정"
              >
                <Edit className="w-4 h-4 mr-2" />
                수정
              </button>
              
              <button
                onClick={handleDeleteClick}
                className="py-4 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-all duration-200 font-medium text-base min-h-[48px] flex items-center justify-center"
                aria-label="매물 삭제"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </button>
            </div>
          </div>
          
          {/* 데스크톱: 개선된 가로 레이아웃 */}
          <div className="hidden lg:flex items-center justify-between p-6 bg-gray-50">
            <div></div>
            
            {/* 액션 버튼들 */}
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400 font-medium"
              >
                닫기
              </button>
              
              <button
                onClick={handleEditClick}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-sm flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                수정하기
              </button>
              
              <button
                onClick={handleDeleteClick}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium text-sm flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                삭제하기
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}