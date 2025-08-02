// ============================================================================
// 매물 트렌드 차트 컴포넌트
// ============================================================================

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface PropertyTrendData {
  month: string
  등록: number
  판매완료: number
  예약중: number
}

// 샘플 데이터 (실제로는 API에서 가져올 데이터)
const trendData: PropertyTrendData[] = [
  { month: '1월', 등록: 45, 판매완료: 32, 예약중: 8 },
  { month: '2월', 등록: 52, 판매완료: 38, 예약중: 12 },
  { month: '3월', 등록: 48, 판매완료: 35, 예약중: 10 },
  { month: '4월', 등록: 61, 판매완료: 42, 예약중: 15 },
  { month: '5월', 등록: 55, 판매완료: 39, 예약중: 13 },
  { month: '6월', 등록: 67, 판매완료: 48, 예약중: 18 },
  { month: '7월', 등록: 72, 판매완료: 51, 예약중: 20 },
  { month: '8월', 등록: 78, 판매완료: 55, 예약중: 22 },
]

interface PropertyTrendChartProps {
  className?: string
  data?: PropertyTrendData[]
}

export const PropertyTrendChart: React.FC<PropertyTrendChartProps> = ({ 
  className = "",
  data = trendData 
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}건`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>매물 트렌드 분석</span>
          <span className="text-sm font-normal text-gray-500">최근 8개월</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="등록"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="판매완료"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="예약중"
                stroke="#F59E0B"
                strokeWidth={3}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}