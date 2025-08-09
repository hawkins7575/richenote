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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          <Icon className={`h-4 w-4 ${color}`} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold">{value}</div>
              {change && (
                <p className="text-xs text-gray-500 mt-1">
                  {change} 지난달 대비
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  },
);
