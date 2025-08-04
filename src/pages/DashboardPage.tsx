// ============================================================================
// 대시보드 페이지
// ============================================================================

import React, { useState } from 'react'
import { Home, Users, TrendingUp, Calendar } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { useTenant } from '@/contexts/TenantContext'
import { useAuth } from '@/contexts/AuthContext'
import { usePropertyStats, useProperties } from '@/hooks/useProperties'
import { 
  PropertyTrendChart, 
  PropertyTypeChart
} from '@/components/charts'
import { StatCard } from '@/components/dashboard'
import { PropertyCard, PropertyDetailModal } from '@/components/property'
import { Property } from '@/types/property'

const DashboardPage: React.FC = () => {
  const { tenant } = useTenant()
  const { user } = useAuth()
  const { stats, loading: statsLoading, error: statsError } = usePropertyStats()
  const { properties } = useProperties()
  
  // 상세 모달 상태 관리
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 매물 클릭 핸들러
  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
  }

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProperty(null)
  }

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
          안녕하세요, {user?.name}님! {tenant?.name || '리체 매물장'}에 오신 것을 환영합니다 👋
        </h1>
        <p className="text-gray-600 mt-1">
          오늘의 매물 현황을 확인해보세요
        </p>
      </div>

      {/* 통계 카드 - 모바일 최적화: 4개씩 한 줄 */}
      {statsLoading ? (
        <div className="grid grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-2 sm:p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1 lg:space-y-2">
                    <div className="h-3 lg:h-4 bg-gray-200 rounded w-full lg:w-20"></div>
                    <div className="h-6 lg:h-8 bg-gray-200 rounded w-full lg:w-16"></div>
                    <div className="h-3 lg:h-4 bg-gray-200 rounded w-full lg:w-12 hidden sm:block"></div>
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gray-200 rounded-lg mt-2 lg:mt-0 mx-auto lg:mx-0"></div>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dashboardStats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              color={stat.color}
              loading={statsLoading}
            />
          ))}
        </div>
      )}

      {/* 차트 섹션 - 모바일 최적화 */}
      <div className="space-y-4 lg:space-y-6">
        {/* 매물 트렌드 및 유형 분포 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <PropertyTrendChart className="lg:col-span-2" />
          <PropertyTypeChart />
        </div>
      </div>

      {/* 최근 등록 매물 - 새로운 카드 디자인 */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">최근 등록 매물</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {properties?.slice(0, 8).map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={handlePropertyClick}
              />
            )) || recentProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer p-4 space-y-3"
                onClick={() => {/* Mock 데이터이므로 실제 Property 객체로 변환 필요 */}}
              >
                <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                  {property.title}
                </h3>
                <div className="flex items-center text-gray-600">
                  <span className="text-sm">강남구</span>
                </div>
                <div className="flex items-center text-gray-900">
                  <span className="font-bold text-lg">{property.price}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{property.type}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500">{property.transactionType}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${property.status === '판매중' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    <span className={`text-xs font-medium ${property.status === '판매중' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {property.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 할 일 및 알림 섹션을 별도로 분리 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div></div> {/* 빈 공간 */}

        {/* 할 일 및 알림 - 모바일 최적화 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">오늘의 할 일</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    매물 사진 업데이트 필요
                  </p>
                  <p className="text-xs text-gray-600 hidden sm:block">
                    3개 매물의 사진을 업데이트해야 합니다
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    고객 상담 예정
                  </p>
                  <p className="text-xs text-gray-600 hidden sm:block">
                    오후 2시 강남구 아파트 상담
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    계약서 검토
                  </p>
                  <p className="text-xs text-gray-600 hidden sm:block">
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

      {/* 매물 상세 모달 */}
      <PropertyDetailModal
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onEdit={(property) => {
          // TODO: 매물 수정 페이지로 이동하는 로직 추가
          console.log('Edit property:', property.id)
          handleCloseModal()
        }}
      />
    </div>
  )
}

export { DashboardPage }