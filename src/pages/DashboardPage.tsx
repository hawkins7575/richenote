// ============================================================================
// 대시보드 페이지
// ============================================================================

import React from 'react'
import { Home, Users, TrendingUp, Calendar } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { useTenant } from '@/contexts/TenantContext'
import { useAuth } from '@/contexts/AuthContext'
import { usePropertyStats } from '@/hooks/useProperties'
import { 
  PropertyTrendChart, 
  PropertyTypeChart, 
  RevenueChart, 
  PerformanceMetrics 
} from '@/components/charts'

const DashboardPage: React.FC = () => {
  const { tenant } = useTenant()
  const { user } = useAuth()
  const { stats, loading: statsLoading, error: statsError } = usePropertyStats()

  // 실제 통계 데이터 또는 기본값
  const dashboardStats = [
    {
      title: '총 매물',
      value: stats ? stats.total.toString() : '0',
      change: '+12%',
      icon: Home,
      color: 'text-blue-600',
    },
    {
      title: '활성 매물',
      value: stats ? stats.active.toString() : '0',
      change: '+5%',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: '팀원',
      value: '8', // TODO: 실제 팀원 수로 교체
      change: '+2',
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: '이번 달 등록',
      value: stats ? stats.this_month.toString() : '0',
      change: '+18%',
      icon: Calendar,
      color: 'text-orange-600',
    },
  ]

  const recentProperties = [
    {
      id: 1,
      title: '강남구 신사동 럭셔리 아파트',
      type: '아파트',
      transactionType: '매매',
      price: '35억',
      status: '판매중',
      createdAt: '2시간 전',
    },
    {
      id: 2,
      title: '성남시 분당구 정자동',
      type: '아파트', 
      transactionType: '전세',
      price: '2억 1천만원',
      status: '예약중',
      createdAt: '5시간 전',
    },
    {
      id: 3,
      title: '홍대 신축 오피스텔',
      type: '오피스텔',
      transactionType: '월세',
      price: '1000/65만원',
      status: '판매중',
      createdAt: '1일 전',
    },
  ]

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          안녕하세요, {user?.name}님! {tenant?.name || 'PropertyDesk'}에 오신 것을 환영합니다 👋
        </h1>
        <p className="text-gray-600 mt-1">
          오늘의 매물 현황을 확인해보세요
        </p>
      </div>

      {/* 통계 카드 */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : statsError ? (
        <Card className="p-6">
          <p className="text-red-600 text-center">{statsError}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {stat.value}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        {stat.change}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                      <Icon size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* 차트 섹션 */}
      <div className="space-y-6">
        {/* 매물 트렌드 및 유형 분포 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <PropertyTrendChart className="xl:col-span-2" />
          <PropertyTypeChart />
        </div>

        {/* 수익 분석 및 성과 지표 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <RevenueChart />
          <div>
            <PerformanceMetrics />
          </div>
        </div>
      </div>

      {/* 최근 등록 매물 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>최근 등록 매물</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProperties.map((property) => (
                <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {property.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" size="sm">
                        {property.type}
                      </Badge>
                      <Badge 
                        variant={property.transactionType === '매매' ? 'sale' : property.transactionType === '전세' ? 'jeonse' : 'monthly'} 
                        size="sm"
                      >
                        {property.transactionType}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {property.createdAt}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {property.price}
                    </p>
                    <Badge 
                      variant={property.status === '판매중' ? 'available' : 'reserved'}
                      size="sm"
                    >
                      {property.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 할 일 및 알림 */}
        <Card>
          <CardHeader>
            <CardTitle>오늘의 할 일</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    매물 사진 업데이트 필요
                  </p>
                  <p className="text-xs text-gray-600">
                    3개 매물의 사진을 업데이트해야 합니다
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    고객 상담 예정
                  </p>
                  <p className="text-xs text-gray-600">
                    오후 2시 강남구 아파트 상담
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    계약서 검토
                  </p>
                  <p className="text-xs text-gray-600">
                    분당구 전세 계약서 최종 검토
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 플랜 정보 (테넌트별) */}
      {tenant && (
        <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)} 플랜
                </h3>
                <p className="text-gray-600 mt-1">
                  매물 {tenant.limits.max_properties}개 · 팀원 {tenant.limits.max_users}명 · 스토리지 {tenant.limits.max_storage_gb}GB
                </p>
              </div>
              <div className="text-right">
                <Badge variant="tenant" size="lg">
                  {tenant.status === 'trial' ? '체험 중' : '활성'}
                </Badge>
                {tenant.trial_ends_at && (
                  <p className="text-xs text-gray-600 mt-1">
                    체험 종료: {new Date(tenant.trial_ends_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { DashboardPage }