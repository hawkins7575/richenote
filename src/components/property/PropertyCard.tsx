// ============================================================================
// 매물 카드 컴포넌트 - 세련된 심플 디자인으로 가독성 최적화
// ============================================================================

import React, { memo } from "react";
import { Calendar, MapPin, DollarSign, Home } from "lucide-react";
import { Property } from "@/types/property";
import { formatPrice, extractNeighborhood } from "@/utils/propertyUtils";
import { PropertyStatusBadge } from "@/components/ui/Badge";

interface PropertyCardProps {
  property: Property;
  onClick?: (property: Property) => void;
  className?: string;
}

export const PropertyCard: React.FC<PropertyCardProps> = memo(
  ({ property, onClick, className = "" }) => {
    const neighborhood = extractNeighborhood(property.address);
    const price = formatPrice(property);

    return (
      <div
        className={`
        card bg-white rounded-2xl border border-gray-100 hover:border-blue-200
        hover:shadow-lg transition-all duration-300 cursor-pointer
        p-3 sm:p-5 group active:scale-[0.98] touch-target
        relative overflow-hidden min-h-[200px] sm:min-h-[240px]
        ${className}
      `}
        onClick={() => onClick?.(property)}
      >
        {/* 거래완료 워터마크 오버레이 */}
        {property.status === "거래완료" && (
          <div className="absolute -top-1 -right-6 sm:-right-8 z-10">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 sm:px-8 py-1 sm:py-1.5 transform rotate-45 shadow-lg">
              <span className="text-xs font-bold tracking-wider">완료</span>
            </div>
          </div>
        )}

        {/* 매물 헤더 - 모바일 최적화 */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors mb-1">
              {property.title}
            </h3>
            <div className="flex items-center text-gray-500">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">{neighborhood}</span>
            </div>
          </div>
          
          {/* 급매 태그 - 모바일 축소 */}
          {property.is_urgent && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold flex-shrink-0">
              급매
            </div>
          )}
        </div>

        {/* 가격 표시 - 모바일 반응형 */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center">
            <div className="bg-blue-50 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-lg sm:text-xl text-blue-600 truncate">
                {price}
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {property.transaction_type}
              </div>
            </div>
          </div>
        </div>

        {/* 거주 현황 - 모바일 컴팩트 */}
        <div className="mb-3 sm:mb-4">
          {property.exit_date ? (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 sm:p-3">
              <div className="flex items-center text-orange-700">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold truncate">
                  퇴실: {new Date(property.exit_date).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3">
              <div className="flex items-center text-green-700">
                <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold">즉시 입주 가능</span>
              </div>
            </div>
          )}
        </div>

        {/* 매물 정보 - 간결한 텍스트 형태 */}
        <div className="border-t border-gray-50 pt-3 sm:pt-4 flex-1">
          {/* 매물 기본 정보 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <span className="font-medium">{Math.floor(property.area / 3.3)}평</span>
              <span className="text-gray-300">•</span>
              <span className="font-medium">{property.rooms}룸</span>
              {property.floor && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{property.floor}층</span>
                </>
              )}
            </div>
          </div>

          {/* 하단 정보 - 모바일 스택형 레이아웃 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center flex-wrap gap-1 sm:gap-2">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                {property.type}
              </span>
              
              {/* 편의시설 - 모바일 축소 */}
              {property.parking && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md font-medium">
                  주차
                </span>
              )}
              {property.elevator && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">
                  승강기
                </span>
              )}
            </div>
            
            <div className="flex justify-end sm:justify-start">
              <PropertyStatusBadge status={property.status} />
            </div>
          </div>
        </div>
      </div>
    );
  },
);
