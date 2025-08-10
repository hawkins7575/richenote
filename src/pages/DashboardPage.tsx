// ============================================================================
// 대시보드 페이지
// ============================================================================

import React, { useState, useEffect } from "react";
import { Home, Users, TrendingUp, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Badge } from "@/components/ui";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePropertyStats, useProperties } from "@/hooks/useProperties";
// import { PropertyTrendChart, PropertyTypeChart } from "@/components/charts"; // 차트 제거
import { StatCard, ScheduleSummary } from "@/components/dashboard";
import { PropertyCard, PropertyDetailModal } from "@/components/property";
import { PropertyEditForm } from "@/components/forms/PropertyEditForm";
import { Property, UpdatePropertyData } from "@/types/property";
import { Schedule } from "@/types/schedule";
import * as teamService from "@/services/teamService";
import { scheduleService } from "@/services/scheduleService";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const { user } = useAuth();
  const {
    stats,
    loading: statsLoading,
    error: statsError,
  } = usePropertyStats();
  const { properties, loading, updateProperty, deleteProperty, refreshProperties } =
    useProperties();

  // 팀원 수 상태 관리
  const [teamMemberCount, setTeamMemberCount] = useState<number>(1);
  const [teamLoading, setTeamLoading] = useState(true);

  // 일정 상태 관리
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState<Schedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);

  // 상세 모달 상태 관리
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 수정 폼 상태 관리
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // 팀원 수 가져오기
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!user?.id) return;

      try {
        setTeamLoading(true);
        const members = await teamService.getTeamMembers(user.id);
        setTeamMemberCount(members.length);
      } catch (error) {
        console.error("팀원 수 조회 실패:", error);
        setTeamMemberCount(1); // 기본값
      } finally {
        setTeamLoading(false);
      }
    };

    fetchTeamMembers();
  }, [user?.id]);

  // 일정 데이터 가져오기
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!user?.id) return;

      try {
        setSchedulesLoading(true);
        
        // 사용자 ID를 테넌트 ID로 사용
        const tenantId = user.id;
        
        const [todayData, upcomingData] = await Promise.all([
          scheduleService.getTodaySchedules(tenantId, 3),
          scheduleService.getUpcomingSchedules(tenantId, 3)
        ]);
        
        setTodaySchedules(todayData);
        setUpcomingSchedules(upcomingData);
      } catch (error) {
        console.error("일정 조회 실패:", error);
        setTodaySchedules([]);
        setUpcomingSchedules([]);
      } finally {
        setSchedulesLoading(false);
      }
    };

    fetchSchedules();
  }, [user?.id]);

  // 일정 페이지로 이동 핸들러
  const handleViewAllSchedules = () => {
    navigate('/schedule');
  };

  // 매물 클릭 핸들러
  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  // 매물 수정 핸들러
  const handleEditProperty = async (data: UpdatePropertyData) => {
    if (!editingProperty) return;

    try {
      setEditLoading(true);
      await updateProperty(editingProperty.id, data);
      setEditFormOpen(false);
      setEditingProperty(null);
      // 목록 새로고침
      await refreshProperties();
      alert("✅ 매물이 성공적으로 수정되었습니다!");
    } catch (error) {
      console.error("매물 수정 실패:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      alert(`❌ 매물 수정 실패: ${errorMessage}`);
      throw error;
    } finally {
      setEditLoading(false);
    }
  };

  // 수정 폼 열기 핸들러
  const handleOpenEditForm = (property: Property) => {
    console.log("📝 대시보드에서 수정 폼 열기:", property.title);
    setEditingProperty(property);
    setEditFormOpen(true);
    setIsModalOpen(false); // 상세 모달 닫기
  };

  // 삭제 확인 핸들러
  const handleConfirmDelete = async (property: Property) => {
    console.log("🗑️ 대시보드에서 삭제 요청:", property.title);

    const confirmDelete = window.confirm(
      `'${property.title}' 매물을 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`,
    );

    if (confirmDelete) {
      try {
        await deleteProperty(property.id);
        setIsModalOpen(false);
        setSelectedProperty(null);
        // 목록 새로고침
        await refreshProperties();
        alert("✅ 매물이 성공적으로 삭제되었습니다!");
      } catch (error) {
        console.error("매물 삭제 실패:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";
        alert(`❌ 매물 삭제 실패: ${errorMessage}`);
      }
    }
  };

  // 실제 통계 데이터 또는 기본값
  const dashboardStats = [
    {
      title: "총 매물",
      value: (stats?.total ?? 0).toString(),
      change: "+12%",
      icon: Home,
      color: "text-blue-600",
    },
    {
      title: "활성 매물",
      value: (stats?.active ?? 0).toString(),
      change: "+5%",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "팀원",
      value: teamMemberCount.toString(),
      change: teamMemberCount > 1 ? `+${teamMemberCount - 1}` : "0",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "이번 달 등록",
      value: (stats?.this_month ?? 0).toString(),
      change: "+18%",
      icon: Calendar,
      color: "text-orange-600",
    },
  ];

  const recentProperties = [
    {
      id: 1,
      title: "강남구 신사동 럭셔리 아파트",
      type: "아파트",
      transactionType: "매매",
      price: "35억",
      // 매물 상태 필드 삭제됨
      createdAt: "2시간 전",
    },
    {
      id: 2,
      title: "성남시 분당구 정자동",
      type: "아파트",
      transactionType: "전세",
      price: "2억 1천만원",
      // 매물 상태 필드 삭제됨
      createdAt: "5시간 전",
    },
    {
      id: 3,
      title: "홍대 신축 오피스텔",
      type: "오피스텔",
      transactionType: "월세",
      price: "1000/65만원",
      // 매물 상태 필드 삭제됨
      createdAt: "1일 전",
    },
  ];

  // 로딩 상태 처리
  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-6">
      {/* 페이지 헤더 - 모바일 최적화 */}
      <div className="px-1 sm:px-0">
        <h1 className="text-lg sm:text-2xl font-bold leading-tight">
          안녕하세요, {user?.name || "사용자"}님! 👋
        </h1>
        <h2 className="text-sm sm:text-base text-gray-600 mt-1 lg:hidden">
          {tenant?.name || "리체 매물장"}
        </h2>
        <h2 className="hidden lg:block text-2xl font-bold mt-1">
          {tenant?.name || "리체 매물장"}에 오신 것을 환영합니다 👋
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1">오늘의 매물 현황을 확인해보세요</p>
      </div>

      {/* 통계 카드 - 모바일 최적화 */}
      {statsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col space-y-2">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3 hidden sm:block"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : statsError ? (
        <Card className="p-4 sm:p-6">
          <p className="text-red-600 text-center text-sm sm:text-base">{statsError}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {dashboardStats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              color={stat.color}
              loading={stat.title === "팀원" ? teamLoading : statsLoading}
            />
          ))}
        </div>
      )}


      {/* 일정 섹션 */}
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            일정 관리
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {/* 당일 일정 */}
            <ScheduleSummary
              title="오늘 일정"
              schedules={todaySchedules}
              loading={schedulesLoading}
              emptyMessage="오늘 등록된 일정이 없습니다."
              onViewAll={handleViewAllSchedules}
            />
            
            {/* 다가올 일정 */}
            <ScheduleSummary
              title="다가올 일정"
              schedules={upcomingSchedules}
              loading={schedulesLoading}
              emptyMessage="예정된 일정이 없습니다."
              onViewAll={handleViewAllSchedules}
            />
          </div>
        </div>
      </div>

      {/* 최근 등록 매물 - 새로운 카드 디자인 */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">최근 등록 매물</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {properties
              ?.slice(0, 4)
              .map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onClick={handlePropertyClick}
                />
              )) ||
              recentProperties.map((property) => (
                <div
                  key={property.id}
                  className="card bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer p-4 space-y-3"
                  onClick={() => {
                    /* Mock 데이터이므로 실제 Property 객체로 변환 필요 */
                  }}
                >
                  <h3 className="font-semibold text-lg line-clamp-1">
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
                      <span className="text-xs text-gray-500">
                        {property.type}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-500">
                        {property.transactionType}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full mr-2 bg-blue-400" />
                      <span className="text-xs font-medium text-blue-600">
                        등록됨
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* 플랜 정보 (테넌트별) */}
      {tenant && (
        <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {tenant.plan ? (tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)) : "기본"}{" "}
                  플랜
                </h3>
                <p className="text-gray-600 mt-1">
                  매물 {tenant.limits.max_properties}개 · 팀원{" "}
                  {tenant.limits.max_users}명 · 스토리지{" "}
                  {tenant.limits.max_storage_gb}GB
                </p>
              </div>
              <div className="text-right">
                <Badge variant="tenant" size="lg">
                  {tenant.status === "trial" ? "체험 중" : "활성"}
                </Badge>
                {tenant.trial_ends_at && (
                  <p className="text-xs text-gray-600 mt-1">
                    체험 종료:{" "}
                    {new Date(tenant.trial_ends_at).toLocaleDateString()}
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
        onEdit={handleOpenEditForm}
        onDelete={handleConfirmDelete}
      />

      {/* 매물 수정 폼 모달 */}
      {editingProperty && (
        <PropertyEditForm
          isOpen={editFormOpen}
          onClose={() => {
            setEditFormOpen(false);
            setEditingProperty(null);
          }}
          onSubmit={handleEditProperty}
          property={editingProperty}
          loading={editLoading}
        />
      )}
    </div>
  );
};

export { DashboardPage };
