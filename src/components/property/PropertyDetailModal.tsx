// ============================================================================
// 매물 상세 정보 팝업 모달 - 모든 매물 정보 표시
// ============================================================================

import React from 'react'
import { X, MapPin, Calendar, User, Phone, Mail, Car, ChevronUp, Edit } from 'lucide-react'
import { Property } from '@/types/property'
import { formatPrice, formatArea } from '@/utils/propertyUtils'

interface PropertyDetailModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (property: Property) => void
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!isOpen || !property) return null

  const price = formatPrice(property)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {property.title}
            </h2>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{property.address}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {onEdit && (
              <button
                onClick={() => onEdit(property)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 기본 정보 */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">매물 유형</span>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {property.type}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {property.transaction_type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">가격</span>
                    <span className="font-bold text-xl text-gray-900">{price}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">면적</span>
                    <span className="font-medium">{formatArea(property.area)}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">층수</span>
                    <span className="font-medium">{property.floor}층 / {property.total_floors}층</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">방/욕실</span>
                    <span className="font-medium">{property.rooms}룸 / {property.bathrooms}욕실</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">상태</span>
                    <span className={`
                      px-3 py-1 rounded-full text-sm font-medium
                      ${property.status === '판매중' ? 'bg-green-100 text-green-800' : 
                        property.status === '예약중' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'}
                    `}>
                      {property.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* 편의시설 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">편의시설</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`
                    flex items-center p-3 rounded-lg border
                    ${property.parking ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}
                  `}>
                    <Car className="w-5 h-5 mr-2" />
                    <span className="text-sm">주차장</span>
                  </div>
                  <div className={`
                    flex items-center p-3 rounded-lg border
                    ${property.elevator ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}
                  `}>
                    <ChevronUp className="w-5 h-5 mr-2" />
                    <span className="text-sm">엘리베이터</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 임대인 정보 및 중요 날짜 */}
            <div className="space-y-6">
              {/* 임대인 정보 */}
              {(property.landlord_name || property.landlord_phone) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">임대인 정보</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    {property.landlord_name && (
                      <div className="flex items-center">
                        <User className="w-5 h-5 mr-3 text-gray-500" />
                        <span>{property.landlord_name}</span>
                      </div>
                    )}
                    {property.landlord_phone && (
                      <div className="flex items-center">
                        <Phone className="w-5 h-5 mr-3 text-gray-500" />
                        <span>{property.landlord_phone}</span>
                      </div>
                    )}
                    {property.landlord_email && (
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 mr-3 text-gray-500" />
                        <span>{property.landlord_email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 중요 날짜 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">중요 날짜</h3>
                <div className="space-y-3">
                  {property.exit_date && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-red-500" />
                        <span className="text-gray-600">퇴실날짜</span>
                      </div>
                      <span className="font-medium text-red-600">
                        {new Date(property.exit_date).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  )}
                  
                  {property.available_from && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-green-500" />
                        <span className="text-gray-600">입주 가능일</span>
                      </div>
                      <span className="font-medium text-green-600">
                        {new Date(property.available_from).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                      <span className="text-gray-600">등록일</span>
                    </div>
                    <span className="font-medium">
                      {new Date(property.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 특징 및 태그 */}
              {(property.highlight_features?.length || property.tags?.length) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">특징</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.highlight_features?.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                    {property.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 상세 설명 */}
          {property.description && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">상세 설명</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              조회 {property.view_count}회 · 문의 {property.inquiry_count}회
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                닫기
              </button>
              {onEdit && (
                <button
                  onClick={() => onEdit(property)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  수정하기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}