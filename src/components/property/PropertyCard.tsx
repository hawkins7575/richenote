// ============================================================================
// 매물 카드 컴포넌트 - 빠른 스캔을 위한 간단한 정보 표시
// ============================================================================

import React, { memo } from 'react'
import { Calendar, MapPin, DollarSign } from 'lucide-react'
import { Property } from '@/types/property'
import { formatPrice, extractNeighborhood } from '@/utils/propertyUtils'

interface PropertyCardProps {
  property: Property
  onClick?: (property: Property) => void
  className?: string
}

export const PropertyCard: React.FC<PropertyCardProps> = memo(({ 
  property, 
  onClick,
  className = '' 
}) => {
  const neighborhood = extractNeighborhood(property.address)
  const price = formatPrice(property)
  
  return (
    <div 
      className={`
        bg-white rounded-xl border border-gray-200 hover:border-blue-300 
        hover:shadow-md transition-all duration-200 cursor-pointer
        p-4 space-y-3 group
        ${className}
      `}
      onClick={() => onClick?.(property)}
    >
      {/* 매물명 */}
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-gray-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
          {property.title}
        </h3>
        {property.is_urgent && (
          <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium ml-2 flex-shrink-0">
            급매
          </span>
        )}
      </div>

      {/* 간단한 주소 (동 단위) */}
      <div className="flex items-center text-gray-600">
        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
        <span className="text-sm truncate">{neighborhood}</span>
      </div>

      {/* 가격 */}
      <div className="flex items-center text-gray-900">
        <DollarSign className="w-4 h-4 mr-1 text-green-600 flex-shrink-0" />
        <span className="font-bold text-lg">{price}</span>
      </div>

      {/* 거주 현황 - 퇴실날짜 또는 공실 */}
      {property.exit_date ? (
        <div className="flex items-center text-orange-600">
          <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="text-sm font-medium">
            퇴실: {new Date(property.exit_date).toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      ) : (
        <div className="flex items-center text-green-600">
          <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="text-sm font-medium">공실</span>
        </div>
      )}

      {/* 하단 구분선 및 상태 */}
      <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">{property.type}</span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500">{property.transaction_type}</span>
        </div>
        
        <div className="flex items-center">
          <span className={`
            inline-block w-2 h-2 rounded-full mr-2
            ${property.status === '판매중' ? 'bg-green-400' : 
              property.status === '예약중' ? 'bg-yellow-400' : 
              property.status === '거래완료' ? 'bg-gray-400' :
              property.status === '임시보관' ? 'bg-blue-400' :
              property.status === '만료됨' ? 'bg-red-400' : 'bg-gray-400'}
          `} />
          <span className={`
            text-xs font-medium
            ${property.status === '판매중' ? 'text-green-600' : 
              property.status === '예약중' ? 'text-yellow-600' : 
              property.status === '거래완료' ? 'text-gray-600' :
              property.status === '임시보관' ? 'text-blue-600' :
              property.status === '만료됨' ? 'text-red-600' : 'text-gray-600'}
          `}>
            {property.status}
          </span>
        </div>
      </div>
    </div>
  )
})