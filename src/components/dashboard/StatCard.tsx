// ============================================================================
// 통계 카드 컴포넌트
// ============================================================================

import React, { memo } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  color?: string;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = memo(
  ({
    title,
    value,
    change,
    icon: Icon,
    color = "text-gray-600",
    loading = false,
  }) => {
    return (
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate pr-2">
            {title}
          </CardTitle>
          <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${color} flex-shrink-0`} />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-3/4 mb-1 sm:mb-2"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : (
            <>
              <div className="text-lg sm:text-2xl font-bold text-gray-900 leading-none">
                {value}
              </div>
              {change && (
                <p className="text-xs sm:text-xs text-gray-500 mt-1 leading-none">
                  <span className="hidden sm:inline">{change} 지난달 대비</span>
                  <span className="sm:hidden">{change}</span>
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  },
);
