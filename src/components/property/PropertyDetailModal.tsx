// ============================================================================
// 매물 상세 정보 팝업 모달 - 모든 매물 정보 표시
// ============================================================================

import React from 'react'
import { X, MapPin, User, Car, ChevronUp, Edit, Trash2 } from 'lucide-react'
import { Property } from '@/types/property'
import { formatPrice, formatArea, formatMoney } from '@/utils/propertyUtils'
import { PropertyStatusBadge } from '@/components/ui/Badge'
import { useIsMobile } from '@/hooks/useMobileDetection'
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
  const isMobile = useIsMobile()

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 touch-manipulation">
      <div className="bg-white rounded-t-2xl sm:rounded-lg w-full max-w-7xl max-h-[95vh] h-[95vh] sm:h-auto overflow-hidden flex flex-col shadow-2xl">
        {/* 헤더 - 모바일 최적화 */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          {/* 모바일 스와이프 인디케이터 */}
          {isMobile && (
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>
          )}
          
          {/* 모바일: 세로 배치 */}
          {isMobile && (
            <div className="p-3 sm:p-4 space-y-3">
            <div className="flex items-start justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex-1 pr-4">
                {property.title}
              </h2>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <button
                  onClick={handleEditClick}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="매물 수정"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="매물 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
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
                {/* 매물 상태 배지 */}
                <PropertyStatusBadge status={property.status} />
              </div>
            </div>
            </div>
          )}
          
          {/* 데스크톱: 개선된 가로 배치 */}
          {!isMobile && (
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
                  {/* 매물 상태 배지 */}
                  <PropertyStatusBadge status={property.status} />
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
          )}
        </div>

        {/* 콘텐츠 - 모바일 최적화 */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-3 py-2 sm:p-4 space-y-2 sm:space-y-4 pb-safe pb-24">
            
            {/* 모바일: 초컴팩트 레이아웃 */}
            {isMobile && (
            <div className="space-y-2">
              
              {/* 기본 정보 - 초컴팩트 디자인 */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-2">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                  기본 정보
                </h3>
                <div className="space-y-1">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-700 font-medium">면적</span>
                    <span className="text-sm font-bold text-gray-900">{formatArea(property.area)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-blue-200">
                    <span className="text-sm text-gray-700 font-medium">층수</span>
                    <span className="text-sm font-bold text-gray-900">{property.floor}F/{property.total_floors}F</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-blue-200">
                    <span className="text-sm text-gray-700 font-medium">구조</span>
                    <span className="text-sm font-bold text-gray-900">{formatRooms(property.rooms)} {property.bathrooms}욕실</span>
                  </div>
                  
                  {/* 편의시설 - 한줄 표시 */}
                  <div className="pt-1 border-t border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">편의시설</span>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center px-2 py-1 rounded text-xs font-medium ${
                          property.parking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Car className="w-3 h-3 mr-1" />
                          주차
                        </div>
                        <div className={`flex items-center px-2 py-1 rounded text-xs font-medium ${
                          property.elevator ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <ChevronUp className="w-3 h-3 mr-1" />
                          EV
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 위치 정보 - 초컴팩트 */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-2">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  위치 정보
                </h3>
                <div className="flex items-start space-x-2 p-2 bg-white rounded border border-green-200">
                  <MapPin className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 leading-tight break-words">{property.address}</div>
                    {property.detailed_address && (
                      <div className="text-xs text-gray-600 mt-0.5">{property.detailed_address}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* 가격 정보 - 초컴팩트 */}
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-2">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                  가격 정보
                </h3>
                <div className="space-y-1">
                  {property.transaction_type === '매매' && property.price && (
                    <div className="bg-blue-100 border border-blue-300 rounded p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-blue-800">매매가</span>
                        <span className="text-base font-bold text-blue-900">
                          {formatMoney(property.price)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {(property.transaction_type === '전세' || property.transaction_type === '월세') && property.deposit !== undefined && (
                    <div className="bg-green-100 border border-green-300 rounded p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-green-800">
                          {property.transaction_type === '전세' ? '전세금' : '보증금'}
                        </span>
                        <span className="text-base font-bold text-green-900">
                          {formatMoney(property.deposit)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {property.transaction_type === '월세' && property.monthly_rent && (
                    <div className="bg-orange-100 border border-orange-300 rounded p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-orange-800">월세</span>
                        <span className="text-base font-bold text-orange-900">
                          {property.monthly_rent}만원/월
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}

            {/* 데스크톱: 공간 최적화된 레이아웃 */}
            {!isMobile && (
            <div className="block">
              
              {/* 첫 번째 행: 4열 그리드 - 더 큰 글씨와 여백 축소 */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                
                {/* 기본 정보 */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    기본 정보
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-white rounded p-2 border border-blue-200">
                      <span className="text-sm text-gray-700 font-semibold">전용면적</span>
                      <span className="text-base font-bold text-gray-900">{formatArea(property.area)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white rounded p-2 border border-blue-200">
                      <span className="text-sm text-gray-700 font-semibold">층수</span>
                      <span className="text-base font-bold text-gray-900">{property.floor}F / {property.total_floors}F</span>
                    </div>
                    <div className="flex justify-between items-center bg-white rounded p-2 border border-blue-200">
                      <span className="text-sm text-gray-700 font-semibold">구조</span>
                      <span className="text-base font-bold text-gray-900">{formatRooms(property.rooms)} {property.bathrooms}욕실</span>
                    </div>
                  </div>
                </div>

                {/* 가격 정보 */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    가격 정보
                  </h3>
                  <div className="space-y-2">
                    {property.transaction_type === '매매' && property.price && (
                      <div className="bg-blue-100 border border-blue-300 rounded p-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-blue-800">매매가</span>
                          <span className="text-base font-bold text-blue-900">{formatMoney(property.price)}</span>
                        </div>
                      </div>
                    )}
                    
                    {(property.transaction_type === '전세' || property.transaction_type === '월세') && property.deposit !== undefined && (
                      <div className="bg-green-100 border border-green-300 rounded p-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-green-800">
                            {property.transaction_type === '전세' ? '전세금' : '보증금'}
                          </span>
                          <span className="text-base font-bold text-green-900">{formatMoney(property.deposit)}</span>
                        </div>
                      </div>
                    )}
                    
                    {property.transaction_type === '월세' && property.monthly_rent && (
                      <div className="bg-orange-100 border border-orange-300 rounded p-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-orange-800">월세</span>
                          <span className="text-base font-bold text-orange-900">{property.monthly_rent}만원/월</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 편의시설 & 위치 */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    편의시설 & 위치
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`flex items-center justify-center py-2 px-2 rounded text-sm font-semibold ${
                        property.parking ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-600 border border-gray-300'
                      }`}>
                        <Car className="w-4 h-4 mr-1" />
                        <span>주차</span>
                      </div>
                      <div className={`flex items-center justify-center py-2 px-2 rounded text-sm font-semibold ${
                        property.elevator ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-600 border border-gray-300'
                      }`}>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        <span>EV</span>
                      </div>
                    </div>
                    <div className="bg-white rounded p-2 border border-green-200">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-900 leading-tight font-medium">{property.address}</div>
                      </div>
                      {property.detailed_address && (
                        <div className="text-sm text-gray-600 mt-1 ml-6 font-medium">{property.detailed_address}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 임대인 & 날짜 정보 */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    임대인 & 날짜
                  </h3>
                  <div className="space-y-2 mb-3">
                    {(property.landlord_name || property.landlord_phone) ? (
                      <>
                        {property.landlord_name && (
                          <div className="bg-white rounded p-2 border border-purple-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-gray-700">임대인</span>
                              <span className="text-base font-bold text-gray-900">{property.landlord_name}</span>
                            </div>
                          </div>
                        )}
                        {property.landlord_phone && (
                          <div className="bg-white rounded p-2 border border-purple-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-gray-700">연락처</span>
                              <span className="text-base font-bold text-gray-900">{property.landlord_phone}</span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="bg-white rounded p-2 border border-purple-200 text-center text-gray-500">
                        <User className="w-4 h-4 mx-auto mb-1 opacity-50" />
                        <div className="text-sm font-medium">정보 없음</div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {property.exit_date ? (
                      <div className="bg-red-100 border border-red-300 rounded p-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-red-800">퇴실예정</span>
                          <span className="text-sm font-bold text-red-900">
                            {new Date(property.exit_date).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-100 border border-green-300 rounded p-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-green-800">거주현황</span>
                          <span className="text-sm font-bold text-green-900">공실</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-white border border-purple-200 rounded p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-800">등록일</span>
                        <span className="text-sm font-bold text-gray-900">
                          {new Date(property.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 두 번째 행: 상세 설명 - 더 큰 글씨 */}
              {property.description && (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                    <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                    상세 설명
                  </h3>
                  <div className="bg-white p-4 rounded border border-amber-200 max-h-32 overflow-y-auto">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                      {property.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
            )}

            {/* 모바일: 임대인 정보 - 초컴팩트 */}
            {isMobile && (
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-2">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
                  임대인 & 날짜
                </h3>
                <div className="space-y-1">
                  {(property.landlord_name || property.landlord_phone) ? (
                    <div className="bg-white border border-purple-200 rounded p-2 space-y-1">
                      {property.landlord_name && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-purple-800">임대인</span>
                          <span className="text-sm font-bold text-gray-900">{property.landlord_name}</span>
                        </div>
                      )}
                      {property.landlord_phone && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-purple-800">연락처</span>
                          <span className="text-sm font-bold text-gray-900">{property.landlord_phone}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white border border-purple-200 rounded p-2 text-center">
                      <User className="w-3 h-3 mx-auto mb-0.5 text-gray-400" />
                      <div className="text-xs text-gray-500">정보 없음</div>
                    </div>
                  )}
                  
                  {/* 날짜 정보 - 한줄씩 */}
                  <div className="space-y-1">
                    {property.exit_date ? (
                      <div className="bg-red-100 border border-red-300 rounded p-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-red-800">퇴실예정</span>
                          <span className="text-sm font-bold text-red-900">
                            {new Date(property.exit_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-100 border border-green-300 rounded p-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-green-800">거주현황</span>
                          <span className="text-sm font-bold text-green-900">공실</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-white border border-purple-200 rounded p-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-800">등록일</span>
                        <span className="text-sm font-bold text-gray-900">
                          {new Date(property.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 상세 설명 - 초컴팩트 */}
              {property.description && (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-2">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-1"></div>
                    상세 설명
                  </h3>
                  <div className="bg-white p-2 rounded border border-amber-200">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {property.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
            )}

            
          </div>
        </div>

        {/* 액션 버튼 섹션 */}
        <div className="border-t border-gray-200 bg-white lg:bg-gray-50">
          {/* 모바일: 간단한 안전 영역만 */}
          {isMobile && <div className="pb-safe-4"></div>}
          
          {/* 데스크톱: 개선된 가로 레이아웃 */}
          {!isMobile && (
          <div className="flex items-center justify-between p-6 bg-gray-50">
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
          )}
        </div>

      </div>
    </div>
  )
}