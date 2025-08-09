// ============================================================================
// 매물 트렌드 차트 컴포넌트
// ============================================================================

import React from "react";
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
// import { useMonthlyTrend } from '@/hooks/useChartData'

interface PropertyTrendData {
  month: string;
  등록: number;
  판매완료: number;
  거래중: number;
}

interface PropertyTrendChartProps {
  className?: string;
}

// 임시 샘플 데이터
const trendData: PropertyTrendData[] = [
  { month: "3월", 등록: 45, 판매완료: 32, 거래중: 8 },
  { month: "4월", 등록: 52, 판매완료: 38, 거래중: 12 },
  { month: "5월", 등록: 48, 판매완료: 35, 거래중: 10 },
  { month: "6월", 등록: 61, 판매완료: 42, 거래중: 15 },
  { month: "7월", 등록: 55, 판매완료: 39, 거래중: 13 },
  { month: "8월", 등록: 67, 판매완료: 45, 거래중: 18 },
];

export const PropertyTrendChart: React.FC<PropertyTrendChartProps> = ({
  className = "",
}) => {
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>매물 트렌드 분석</span>
          <span className="text-sm font-normal text-gray-500">최근 6개월</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="h-64 sm:h-80">
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
        </div>
      </CardContent>
    </Card>
  );
};
