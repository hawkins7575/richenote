// ============================================================================
// 성과 지표 위젯 컴포넌트
// ============================================================================

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PerformanceData {
  date: string;
  성약률: number;
  평균거래기간: number;
  고객만족도: number;
}

// 샘플 데이터
const performanceData: PerformanceData[] = [
  { date: "7월 1주", 성약률: 68, 평균거래기간: 22, 고객만족도: 85 },
  { date: "7월 2주", 성약률: 72, 평균거래기간: 19, 고객만족도: 87 },
  { date: "7월 3주", 성약률: 75, 평균거래기간: 18, 고객만족도: 89 },
  { date: "7월 4주", 성약률: 71, 평균거래기간: 21, 고객만족도: 86 },
  { date: "8월 1주", 성약률: 78, 평균거래기간: 16, 고객만족도: 91 },
  { date: "8월 2주", 성약률: 82, 평균거래기간: 15, 고객만족도: 93 },
  { date: "8월 3주", 성약률: 79, 평균거래기간: 17, 고객만족도: 90 },
  { date: "8월 4주", 성약률: 85, 평균거래기간: 14, 고객만족도: 95 },
];

interface PerformanceMetricsProps {
  className?: string;
  data?: PerformanceData[];
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  className = "",
  data = performanceData,
}) => {
  // 최신 데이터와 이전 주 비교
  const latestData = data[data.length - 1];
  const previousData = data[data.length - 2];

  const calculateChange = (current: number, previous: number) => {
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const getChangeIcon = (change: number, isReverse = false) => {
    const isPositive = isReverse ? change < 0 : change > 0;
    return isPositive ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  const getChangeColor = (change: number, isReverse = false) => {
    const isPositive = isReverse ? change < 0 : change > 0;
    return isPositive ? "text-green-600" : "text-red-600";
  };

  const metrics = [
    {
      title: "성약률",
      value: `${latestData.성약률}%`,
      change: parseFloat(
        calculateChange(latestData.성약률, previousData.성약률),
      ),
      isReverse: false,
    },
    {
      title: "평균 거래기간",
      value: `${latestData.평균거래기간}일`,
      change: parseFloat(
        calculateChange(latestData.평균거래기간, previousData.평균거래기간),
      ),
      isReverse: true, // 거래기간은 짧을수록 좋음
    },
    {
      title: "고객만족도",
      value: `${latestData.고객만족도}점`,
      change: parseFloat(
        calculateChange(latestData.고객만족도, previousData.고객만족도),
      ),
      isReverse: false,
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
              {entry.dataKey === "평균거래기간"
                ? "일"
                : entry.dataKey === "성약률"
                  ? "%"
                  : "점"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 지표 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {metric.value}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {getChangeIcon(metric.change, metric.isReverse)}
                  <span
                    className={`text-sm font-medium ${getChangeColor(metric.change, metric.isReverse)}`}
                  >
                    {Math.abs(metric.change)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 트렌드 차트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>주간 성과 트렌드</span>
            <Badge variant="secondary">최근 8주</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="성약률"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorSuccess)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="고객만족도"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorPrimary)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
