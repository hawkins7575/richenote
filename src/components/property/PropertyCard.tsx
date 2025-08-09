// ============================================================================
// 매물 카드 컴포넌트 - 빠른 스캔을 위한 간단한 정보 표시
// ============================================================================

import React, { memo } from "react";
import { Calendar, MapPin, DollarSign } from "lucide-react";
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
        card bg-white rounded-xl border border-gray-200 hover:border-blue-300 
        hover:shadow-md transition-all duration-200 cursor-pointer
        p-3 sm:p-4 space-y-3 group active:scale-[0.98] touch-target
        relative
        ${className}
      `}
        onClick={() => onClick?.(property)}
      >
        {/* 거래완료 워터마크 오버레이 */}
        {property.status === "거래완료" && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-red-600/90 text-white px-3 py-1.5 rounded-lg transform rotate-12 shadow-lg">
              <span className="text-sm sm:text-base font-bold tracking-wide">
                완료
              </span>
            </div>
          </div>
        )}

        {/* 모바일 최적화된 헤더 - 매물명과 급매 태그 */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base sm:text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors flex-1 min-w-0">
            {property.title}
          </h3>
          {property.is_urgent && (
            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium flex-shrink-0">
              급매
            </span>
          )}
        </div>

        {/* 모바일 최적화된 주소 표시 */}
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
          <span className="text-sm sm:text-base truncate">{neighborhood}</span>
        </div>

        {/* 모바일 최적화된 가격 표시 */}
        <div className="flex items-center text-gray-900">
          <DollarSign className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
          <span className="font-bold text-lg sm:text-xl text-blue-600">
            {price}
          </span>
        </div>

        {/* 모바일 최적화된 거주 현황 */}
        {property.exit_date ? (
          <div className="flex items-center text-orange-600">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm font-medium">
              퇴실:{" "}
              {new Date(property.exit_date).toLocaleDateString("ko-KR", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        ) : (
          <div className="flex items-center text-green-600">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm font-medium">공실</span>
          </div>
        )}

        {/* 모바일 최적화된 하단 정보 */}
        <div className="border-t border-gray-100 pt-3">
          {/* 첫 번째 줄: 매물 유형과 거래 유형 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
              <span>{property.type}</span>
              <span className="text-gray-300">•</span>
              <span>{property.transaction_type}</span>
            </div>
            <PropertyStatusBadge status={property.status} />
          </div>

          {/* 두 번째 줄: 상세 정보 (모바일에서 더 많은 정보 표시) */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <span>
                {property.area}m² ({Math.floor(property.area / 3.3)}평)
              </span>
              <span>{property.rooms}룸</span>
              {property.floor && <span>{property.floor}층</span>}
            </div>

            {/* 편의시설 아이콘 - 모바일 친화적 */}
            <div className="flex items-center space-x-2">
              {property.parking && (
                <span className="text-green-600" title="주차 가능">
                  🚗
                </span>
              )}
              {property.elevator && (
                <span className="text-blue-600" title="엘리베이터">
                  🏢
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
