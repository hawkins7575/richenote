// ============================================================================
// 매물 상세 정보 팝업 모달 - 모든 매물 정보 표시
// ============================================================================

import React from 'react'
import { X, MapPin, Calendar, User, Car, ChevronUp, Edit, Trash2 } from 'lucide-react'
import { Property } from '@/types/property'
import { formatPrice, formatArea } from '@/utils/propertyUtils'

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full h-[95vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex-1 flex items-center space-x-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {property.title}
              </h2>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="text-xs">{property.address}</span>
              </div>
            </div>
            
            {/* 가격 정보를 헤더에 포함 */}
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{price}</div>
              <div className="flex items-center space-x-1 text-xs">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                  {property.type}
                </span>
                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-medium">
                  {property.transaction_type}
                </span>
                <span className={`
                  px-2 py-0.5 rounded-full font-medium
                  ${property.status === '판매중' ? 'bg-green-100 text-green-800' : 
                    property.status === '예약중' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}
                `}>
                  {property.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 ml-4">
            {onEdit && (
              <button
                onClick={() => onEdit(property)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 콘텐츠 - 컴팩트한 세로 배치 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            
            {/* 첫 번째 행: 기본 정보, 위치, 가격 */}
            <div className="grid grid-cols-3 gap-4">
              
              {/* 기본 정보 */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  기본 정보
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">전용면적</span>
                    <span className="text-sm font-bold text-gray-900">{formatArea(property.area)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">층수</span>
                    <span className="text-sm font-bold text-gray-900">{property.floor}F/{property.total_floors}F</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">구조</span>
                    <span className="text-sm font-bold text-gray-900">{property.rooms}룸 {property.bathrooms}욕실</span>
                  </div>
                  
                  {/* 편의시설 */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs font-medium text-gray-700 mb-2">편의시설</div>
                    <div className="flex space-x-2">
                      <div className={`flex items-center px-2 py-1 rounded text-xs ${property.parking ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                        <Car className="w-3 h-3 mr-1" />
                        <span>주차{property.parking ? '가능' : '불가'}</span>
                      </div>
                      <div className={`flex items-center px-2 py-1 rounded text-xs ${property.elevator ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                        <ChevronUp className="w-3 h-3 mr-1" />
                        <span>엘베{property.elevator ? '있음' : '없음'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 위치 정보 */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  위치 정보
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <MapPin className="w-3 h-3 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 leading-tight">{property.address}</div>
                      {property.detailed_address && (
                        <div className="text-xs text-gray-600 mt-1">{property.detailed_address}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 가격 정보 */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  가격 정보
                </h3>
                <div className="space-y-2">
                  {property.transaction_type === '매매' && property.price && (
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                      <span className="text-xs text-gray-700">매매가</span>
                      <span className="text-sm font-bold text-blue-700">
                        {(property.price/10000).toFixed(0)}억원
                      </span>
                    </div>
                  )}
                  
                  {(property.transaction_type === '전세' || property.transaction_type === '월세') && property.deposit && (
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span className="text-xs text-gray-700">
                        {property.transaction_type === '전세' ? '전세금' : '보증금'}
                      </span>
                      <span className="text-sm font-bold text-green-700">
                        {(property.deposit/10000).toFixed(0)}억원
                      </span>
                    </div>
                  )}
                  
                  {property.transaction_type === '월세' && property.monthly_rent && (
                    <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                      <span className="text-xs text-gray-700">월세</span>
                      <span className="text-sm font-bold text-orange-700">
                        {property.monthly_rent}만원/월
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 두 번째 행: 임대인 정보, 날짜 정보, 통계 */}
            <div className="grid grid-cols-3 gap-4">
              
              {/* 임대인 정보 */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                  임대인 정보
                </h3>
                <div className="space-y-2">
                  {(property.landlord_name || property.landlord_phone) ? (
                    <>
                      {property.landlord_name && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">이름</span>
                          <span className="text-sm font-medium text-gray-900">{property.landlord_name}</span>
                        </div>
                      )}
                      {property.landlord_phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">연락처</span>
                          <span className="text-sm font-medium text-gray-900">{property.landlord_phone}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-3 text-gray-500">
                      <User className="w-4 h-4 mx-auto mb-1 opacity-50" />
                      <div className="text-xs">정보 없음</div>
                    </div>
                  )}
                </div>
              </div>

              {/* 날짜 정보 */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  날짜 정보
                </h3>
                <div className="space-y-2">
                  {property.exit_date && (
                    <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-red-500" />
                        <span className="text-xs text-gray-700">퇴실예정</span>
                      </div>
                      <span className="text-sm font-bold text-red-600">
                        {new Date(property.exit_date).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-gray-500" />
                      <span className="text-xs text-gray-700">등록일</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(property.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 통계 & 기타 정보 */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                  통계 정보
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-xs text-gray-700">조회수</span>
                    <span className="text-sm font-bold text-blue-700">{property.view_count || 0}회</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-xs text-gray-700">문의수</span>
                    <span className="text-sm font-bold text-green-700">{property.inquiry_count || 0}회</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 세 번째 행: 상세 설명 (전체 너비) */}
            {property.description && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                  상세 설명
                </h3>
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {property.description}
                  </p>
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* 액션 버튼 섹션 */}
        <div className="border-t border-gray-200 bg-white p-3">
          <div className="flex items-center justify-between">
            {/* 통계 정보 */}
            <div className="flex items-center space-x-3 text-xs text-gray-600">
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1"></div>
                <span>조회 {property.view_count || 0}회</span>
              </div>
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                <span>문의 {property.inquiry_count || 0}회</span>
              </div>
            </div>
            
            {/* 액션 버튼들 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all duration-200 border border-gray-300 hover:border-gray-400"
              >
                닫기
              </button>
              
              <button
                onClick={handleEditClick}
                className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all duration-200 font-medium text-xs"
              >
                <Edit className="w-3 h-3 inline mr-1" />
                수정하기
              </button>
              
              <button
                onClick={handleDeleteClick}
                className="px-4 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-all duration-200 font-medium text-xs"
              >
                <Trash2 className="w-3 h-3 inline mr-1" />
                삭제하기
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}