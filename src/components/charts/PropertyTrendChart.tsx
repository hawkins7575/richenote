// ============================================================================
// 매물 트렌드 차트 컴포넌트
// ============================================================================

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { chartService, PropertyTrendData } from "@/services/chartService";

interface PropertyTrendChartProps {
  className?: string;
}

export const PropertyTrendChart: React.FC<PropertyTrendChartProps> = ({
  className = "",
}) => {
  const { user } = useAuth();
  const [trendData, setTrendData] = useState<PropertyTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 실제 데이터 로드
  useEffect(() => {
    const loadTrendData = async () => {
      if (!user?.id) {
        console.log("⏳ 사용자 인증 대기 중...");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log("📊 매물 트렌드 데이터 로드 시작:", { userId: user.id });
        const data = await chartService.getPropertyTrendData(user.id);
        console.log("📊 로드된 트렌드 데이터:", data);
        console.log("📊 트렌드 데이터 총계 확인:", data.map(d => ({ month: d.month, total: d.총계 })));
        
        setTrendData(data);
      } catch (err) {
        console.error("❌ 트렌드 데이터 로드 실패:", err);
        setError("트렌드 데이터를 불러올 수 없습니다.");
        
        // 오류 시 기본 데이터 설정
        setTrendData([
          { month: "3월", 등록: 0, 판매완료: 0, 거래중: 0, 총계: 0 },
          { month: "4월", 등록: 0, 판매완료: 0, 거래중: 0, 총계: 0 },
          { month: "5월", 등록: 0, 판매완료: 0, 거래중: 0, 총계: 0 },
          { month: "6월", 등록: 0, 판매완료: 0, 거래중: 0, 총계: 0 },
          { month: "7월", 등록: 0, 판매완료: 0, 거래중: 0, 총계: 0 },
          { month: "8월", 등록: 0, 판매완료: 0, 거래중: 0, 총계: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadTrendData();
  }, [user?.id]);
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="tooltip bg-white p-2 sm:p-4 border border-gray-200 rounded-lg shadow-lg text-xs sm:text-sm">
          <p className="font-medium mb-1 sm:mb-2">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-xs sm:text-sm"
              style={{ color: entry.color }}
            >
              {`${entry.dataKey}: ${entry.value}건`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 로딩 상태 처리
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>매물 트렌드 분석</span>
            <span className="text-sm font-normal text-gray-500">최근 6개월</span>
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>매물 트렌드 분석</span>
          <div className="text-right">
            <span className="text-sm font-normal text-gray-500">최근 6개월</span>
            {error && (
              <div className="text-xs text-red-500 mt-1">{error}</div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="h-64 sm:h-80">
          {trendData.length === 0 || trendData.every(d => d.총계 === 0) ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-sm mb-2">📊</div>
                <div className="text-xs">매물 데이터가 없습니다</div>
                <div className="text-xs">매물을 등록해보세요</div>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  stroke="#666"
                  fontSize={10}
                  className="sm:text-xs"
                />
                <YAxis
                  stroke="#666"
                  fontSize={10}
                  className="sm:text-xs"
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} iconSize={12} />
                <Line
                  type="monotone"
                  dataKey="등록"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: "#3B82F6", strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 4, stroke: "#3B82F6", strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="판매완료"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: "#10B981", strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 4, stroke: "#10B981", strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="거래중"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ fill: "#F59E0B", strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 4, stroke: "#F59E0B", strokeWidth: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
