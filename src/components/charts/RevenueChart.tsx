// ============================================================================
// 수익 분석 차트 컴포넌트
// ============================================================================

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

interface RevenueData {
  month: string;
  매매: number;
  전세: number;
  월세: number;
}

// 샘플 데이터 (단위: 만원)
const revenueData: RevenueData[] = [
  { month: "1월", 매매: 2800, 전세: 1200, 월세: 450 },
  { month: "2월", 매매: 3200, 전세: 1400, 월세: 520 },
  { month: "3월", 매매: 2900, 전세: 1100, 월세: 480 },
  { month: "4월", 매매: 3800, 전세: 1600, 월세: 580 },
  { month: "5월", 매매: 3500, 전세: 1500, 월세: 550 },
  { month: "6월", 매매: 4200, 전세: 1800, 월세: 620 },
  { month: "7월", 매매: 4600, 전세: 1900, 월세: 680 },
  { month: "8월", 매매: 4900, 전세: 2100, 월세: 720 },
];

interface RevenueChartProps {
  className?: string;
  data?: RevenueData[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  className = "",
  data = revenueData,
}) => {
  const formatNumber = (value: number) => {
    if (value >= 10000) {
      return `${(value / 10000).toFixed(1)}억`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}천만`;
    } else {
      return `${value}만`;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce(
        (sum: number, entry: any) => sum + entry.value,
        0,
      );

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${formatNumber(entry.value)}원`}
            </p>
          ))}
          <div className="border-t border-gray-200 mt-2 pt-2">
            <p className="text-sm font-medium text-gray-900">
              총 수익: {formatNumber(total)}원
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>거래 유형별 수익 분석</span>
          <span className="text-sm font-normal text-gray-500">최근 8개월</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} tickFormatter={formatNumber} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="매매"
                stackId="a"
                fill="#3B82F6"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="전세"
                stackId="a"
                fill="#10B981"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="월세"
                stackId="a"
                fill="#F59E0B"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
