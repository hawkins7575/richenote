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
// import { usePropertyTypeDistribution } from '@/hooks/useChartData'

interface PropertyTypeData {
  type: string
  count: number
  percentage: number
}

// 차트 색상
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316']

interface PropertyTypeChartProps {
  className?: string
}

// 임시 샘플 데이터
const typeData: PropertyTypeData[] = [
  { type: '아파트', count: 145, percentage: 45.2 },
  { type: '오피스텔', count: 89, percentage: 27.8 },
  { type: '빌라/연립', count: 52, percentage: 16.2 },
  { type: '단독주택', count: 23, percentage: 7.2 },
  { type: '상가/사무실', count: 12, percentage: 3.6 },
]

export const PropertyTypeChart: React.FC<PropertyTypeChartProps> = ({ 
  className = "" 
}) => {
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="tooltip bg-white p-2 sm:p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-xs sm:text-sm">{data.type}</p>
          <p className="text-xs sm:text-sm text-gray-600">{`${data.count}건 (${data.percentage}%)`}</p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props
    if (!cx || !cy || midAngle === undefined || !innerRadius || !outerRadius || !percent) return null
    if (percent < 0.08) return null // 8% 미만은 라벨 숨김 (모바일 최적화)

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
        fontSize={10}
        fontWeight="bold"
        className="sm:text-xs"
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
          <span className="text-sm font-normal text-gray-500">총 {typeData.reduce((sum, item) => sum + item.count, 0)}건</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="h-64 sm:h-80">
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                iconSize={10}
                formatter={(value: string, entry: any) => {
                  const color = entry?.color || '#000'
                  const count = entry?.payload?.count || 0
                  return (
                    <span style={{ color, fontSize: '11px' }} className="sm:text-sm">
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