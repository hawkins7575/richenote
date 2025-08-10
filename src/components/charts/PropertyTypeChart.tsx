// ============================================================================
// 매물 유형별 분포 차트 컴포넌트
// ============================================================================

import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { chartService, PropertyTypeData } from "@/services/chartService";

// 차트 색상
const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#F97316",
];

interface PropertyTypeChartProps {
  className?: string;
}

export const PropertyTypeChart: React.FC<PropertyTypeChartProps> = ({
  className = "",
}) => {
  const { user } = useAuth();
  const [typeData, setTypeData] = useState<PropertyTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 실제 데이터 로드
  useEffect(() => {
    const loadTypeData = async () => {
      if (!user?.id) {
        console.log("⏳ 사용자 인증 대기 중...");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log("📊 매물 유형 분포 데이터 로드 시작:", { userId: user.id });
        const data = await chartService.getPropertyTypeData(user.id);
        console.log("📊 로드된 유형 분포 데이터:", data);
        console.log("📊 유형 분포 총 개수:", data.reduce((sum, item) => sum + item.count, 0));
        
        setTypeData(data);
      } catch (err) {
        console.error("❌ 유형 분포 데이터 로드 실패:", err);
        setError("유형 분포 데이터를 불러올 수 없습니다.");
        
        // 오류 시 기본 데이터 설정
        setTypeData([
          { type: "아파트", count: 0, percentage: 0 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadTypeData();
  }, [user?.id]);
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="tooltip bg-white p-2 sm:p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-xs sm:text-sm">{data.type}</p>
          <p className="text-xs sm:text-sm text-gray-600">{`${data.count}건 (${data.percentage}%)`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    if (
      !cx ||
      !cy ||
      midAngle === undefined ||
      !innerRadius ||
      !outerRadius ||
      !percent
    )
      return null;
    if (percent < 0.08) return null; // 8% 미만은 라벨 숨김 (모바일 최적화)

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={10}
        fontWeight="bold"
        className="sm:text-xs"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // 로딩 상태 처리
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>매물 유형별 분포</span>
            <span className="text-sm font-normal text-gray-500">로딩 중...</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="h-64 sm:h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalCount = typeData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>매물 유형별 분포</span>
          <div className="text-right">
            <span className="text-sm font-normal text-gray-500">
              총 {totalCount}건
            </span>
            {error && (
              <div className="text-xs text-red-500 mt-1">{error}</div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="h-64 sm:h-80">
          {totalCount === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-sm mb-2">📊</div>
                <div className="text-xs">매물 데이터가 없습니다</div>
                <div className="text-xs">매물을 등록해보세요</div>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={80}
                  innerRadius={20}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {typeData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: "10px", fontSize: "11px" }}
                  iconSize={10}
                  formatter={(value: string, entry: any) => {
                    const color = entry?.color || "#000";
                    const count = entry?.payload?.count || 0;
                    return (
                      <span
                        style={{ color, fontSize: "11px" }}
                        className="sm:text-sm"
                      >
                        {value} ({count}건)
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
