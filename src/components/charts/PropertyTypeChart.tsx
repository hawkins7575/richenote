// ============================================================================
// 매물 유형별 분포 차트 컴포넌트
// ============================================================================

import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface PropertyTypeData {
  type: string
  count: number
  percentage: number
}

// 샘플 데이터
const typeData: PropertyTypeData[] = [
  { type: '아파트', count: 145, percentage: 45.2 },
  { type: '오피스텔', count: 89, percentage: 27.8 },
  { type: '빌라/연립', count: 52, percentage: 16.2 },
  { type: '단독주택', count: 23, percentage: 7.2 },
  { type: '상가/사무실', count: 12, percentage: 3.6 },
]

// 차트 색상
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

interface PropertyTypeChartProps {
  className?: string
  data?: PropertyTypeData[]
}

export const PropertyTypeChart: React.FC<PropertyTypeChartProps> = ({ 
  className = "",
  data = typeData 
}) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.type}</p>
          <p className="text-sm text-gray-600">{`${data.count}건 (${data.percentage}%)`}</p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // 5% 미만은 라벨 숨김

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180)
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>매물 유형별 분포</span>
          <span className="text-sm font-normal text-gray-500">총 {data.reduce((sum, item) => sum + item.count, 0)}건</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value, entry: any) => {
                  const color = entry?.color || '#000'
                  const count = entry?.payload?.count || 0
                  return (
                    <span style={{ color }}>
                      {value} ({count}건)
                    </span>
                  )
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}