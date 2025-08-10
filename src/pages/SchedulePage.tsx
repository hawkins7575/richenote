// ============================================================================
// 캘린더형 스케줄 관리 페이지
// ============================================================================

import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  List,
  Grid3X3,
  Eye,
  MapPin
} from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { ScheduleForm } from "@/components/schedule";
import { ScheduleDetailModal } from "@/components/schedule/ScheduleDetailModal";
import { useIsMobile } from "@/hooks/useMobileDetection";
import { useAuth } from "@/contexts/AuthContext";
// import { useTenant } from "@/contexts/TenantContext"; // 현재 사용하지 않음
import { Schedule, CalendarView, ScheduleCategory } from "@/types/schedule";
import { scheduleService } from "@/services/scheduleService";

const SchedulePage: React.FC = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  // const { tenant } = useTenant(); // 현재 사용하지 않음
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ScheduleCategory | "all">("all");
  // const [isLoading, setIsLoading] = useState(false); // 현재 사용하지 않음

  // 카테고리별 색상 매핑
  const categoryColors = {
    property_viewing: "bg-blue-500",
    contract_signing: "bg-green-500", 
    maintenance: "bg-yellow-500",
    client_meeting: "bg-purple-500",
    team_meeting: "bg-indigo-500",
    personal: "bg-pink-500",
    other: "bg-gray-500"
  };

  const categoryLabels = {
    property_viewing: "매물 보기",
    contract_signing: "계약 체결",
    maintenance: "유지보수", 
    client_meeting: "고객 미팅",
    team_meeting: "팀 회의",
    personal: "개인 일정",
    other: "기타"
  };

  // 스케줄 데이터 로드 - 사용자별 완전한 데이터 분리
  useEffect(() => {
    const loadSchedules = async () => {
      if (!user) {
        console.log("⏳ 사용자 인증 대기 중...");
        return;
      }
      
      // setIsLoading(true); // 로딩 상태 사용하지 않음
      try {
        console.log("📅 스케줄 데이터 로드 시작:", {
          userId: user.id,
          tenantId: user.id // 사용자 ID가 테넌트 ID
        });
        
        // 사용자 ID를 테넌트 ID로 사용하여 완전한 데이터 분리
        const data = await scheduleService.getSchedules(user.id);
        console.log("📅 로드된 스케줄:", data.length, "개");
        setSchedules(data);
      } catch (error) {
        console.error("❌ 스케줄 로드 실패:", error);
        setSchedules([]); // 오류 시 빈 배열로 설정
      } finally {
        // setIsLoading(false); // 로딩 상태 사용하지 않음
      }
    };

    loadSchedules();
  }, [user]); // user 의존성으로 변경

  // 스케줄 생성/수정 핸들러
  const handleScheduleSubmit = (schedule: Schedule) => {
    setSchedules(prev => {
      const existing = prev.find(s => s.id === schedule.id);
      if (existing) {
        return prev.map(s => s.id === schedule.id ? schedule : s);
      } else {
        return [...prev, schedule];
      }
    });
  };

  // 스케줄 상세보기
  const handleScheduleClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowDetailModal(true);
  };

  // 스케줄 수정
  const handleScheduleEdit = (schedule: Schedule) => {
    console.log("📝 스케줄 수정 요청:", {
      id: schedule.id,
      title: schedule.title,
      tenant_id: schedule.tenant_id,
      created_by: schedule.created_by,
      currentUserId: user?.id
    });
    setEditingSchedule(schedule);
    setShowCreateModal(true);
  };

  // 스케줄 삭제
  const handleScheduleDelete = async (scheduleId: string) => {
    try {
      console.log("🗑️ 스케줄 삭제 요청:", { scheduleId, currentUserId: user?.id });
      await scheduleService.deleteSchedule(scheduleId, user?.id);
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      console.log("✅ 스케줄 삭제 완료:", scheduleId);
    } catch (error) {
      console.error("❌ 스케줄 삭제 실패:", error);
      throw error;
    }
  };

  // 모달 닫기 핸들러
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setEditingSchedule(null);
    setSelectedDate(null);
  };

  // 월 캘린더 렌더링
  const renderMonthCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const days = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* 월 캘린더 헤더 */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 py-3">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
        </div>

        {/* 월 캘린더 본체 */}
        <div className="divide-y divide-gray-200">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7">
              {week.map((day, dayIndex) => {
                const isToday = day.toDateString() === new Date().toDateString();
                const isCurrentMonth = day.getMonth() === month;
                const daySchedules = schedules.filter(schedule => {
                  const scheduleDate = new Date(schedule.start_date);
                  return scheduleDate.toDateString() === day.toDateString();
                });

                return (
                  <div
                    key={dayIndex}
                    className={`min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 border-r border-gray-100 last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !isCurrentMonth ? "bg-gray-25 text-gray-400" : ""
                    }`}
                    onClick={() => {
                      setSelectedDate(day);
                      setShowCreateModal(true);
                    }}
                  >
                    <div className={`text-xs sm:text-sm mb-1 ${
                      isToday 
                        ? "w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs"
                        : "font-medium"
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    {/* 스케줄 표시 */}
                    <div className="space-y-1">
                      {daySchedules.slice(0, isMobile ? 1 : 3).map((schedule, idx) => (
                        <div
                          key={idx}
                          className={`text-xs px-1 py-0.5 sm:px-2 sm:py-1 rounded text-white truncate cursor-pointer hover:opacity-80 touch-target ${
                            categoryColors[schedule.category]
                          }`}
                          onClick={(e) => {
                            e.stopPropagation(); // 부모 클릭 이벤트 방지
                            handleScheduleClick(schedule);
                          }}
                          title={`${schedule.title} - 클릭하여 상세보기`}
                        >
                          {schedule.title}
                        </div>
                      ))}
                      {daySchedules.length > (isMobile ? 1 : 3) && (
                        <div className="text-xs text-gray-500">
                          +{daySchedules.length - (isMobile ? 1 : 3)}개 더
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 일정 리스트 뷰 렌더링
  const renderAgendaView = () => {
    const filteredSchedules = schedules.filter(schedule => 
      selectedCategory === "all" || schedule.category === selectedCategory
    );

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">일정 목록</h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {filteredSchedules.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>등록된 일정이 없습니다.</p>
            </div>
          ) : (
            filteredSchedules.map((schedule) => (
              <div 
                key={schedule.id} 
                className="p-4 hover:bg-blue-50 cursor-pointer transition-all duration-200 border-l-4 border-transparent hover:border-blue-400 hover:shadow-sm"
                onClick={() => handleScheduleClick(schedule)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleScheduleClick(schedule);
                  }
                }}
                aria-label={`${schedule.title} 일정 상세보기`}
                title="클릭하여 일정 상세보기"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className={`w-3 h-3 rounded-full mt-1 ${categoryColors[schedule.category]} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {schedule.title}
                        </h4>
                        {schedule.priority === 'urgent' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600">
                            긴급
                          </span>
                        )}
                        {schedule.priority === 'high' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-600">
                            높음
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {categoryLabels[schedule.category]}
                      </p>
                      <div className="flex items-center text-xs text-gray-400 mb-1">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {new Date(schedule.start_date).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                          hour: schedule.all_day ? undefined : "2-digit",
                          minute: schedule.all_day ? undefined : "2-digit",
                        })}
                        {schedule.location && (
                          <>
                            <MapPin className="w-3 h-3 ml-3 mr-1" />
                            <span className="truncate">{schedule.location}</span>
                          </>
                        )}
                      </div>
                      {schedule.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {schedule.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* 클릭 힌트 아이콘 */}
                  <div className="flex-shrink-0 ml-2">
                    <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">일정 관리</h1>
          <p className="text-gray-600 mt-1">캘린더로 일정을 관리하세요</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* 일정 등록 버튼 */}
          <Button
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            variant="tenant"
            size={isMobile ? "sm" : "md"}
          >
            {isMobile ? "등록" : "일정 등록"}
          </Button>

          {/* 필터 버튼 */}
          <Button
            onClick={() => setShowFilterModal(true)}
            leftIcon={<Filter className="w-4 h-4" />}
            variant="outline"
            size={isMobile ? "sm" : "md"}
          >
            {isMobile ? "필터" : "필터"}
          </Button>
        </div>
      </div>

      {/* 캘린더 컨트롤 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        {/* 날짜 네비게이션 */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() - 1);
                setCurrentDate(newDate);
              }}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <h2 className="text-lg font-semibold min-w-[120px] text-center">
              {currentDate.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long"
              })}
            </h2>

            <Button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setCurrentDate(newDate);
              }}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={() => setCurrentDate(new Date())}
            variant="outline"
            size="sm"
          >
            오늘
          </Button>
        </div>

        {/* 뷰 전환 */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setView("month")}
            variant={view === "month" ? "primary" : "outline"}
            size="sm"
            leftIcon={<Grid3X3 className="w-4 h-4" />}
          >
            월간
          </Button>
          <Button
            onClick={() => setView("agenda")}
            variant={view === "agenda" ? "primary" : "outline"}
            size="sm"
            leftIcon={<List className="w-4 h-4" />}
          >
            목록
          </Button>
        </div>
      </div>

      {/* 캘린더 내용 */}
      {view === "month" ? renderMonthCalendar() : renderAgendaView()}

      {/* 일정 생성 모달 */}
      <ScheduleForm
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onSubmit={handleScheduleSubmit}
        initialData={editingSchedule}
        selectedDate={selectedDate || undefined}
      />

      {/* 일정 상세 보기 모달 */}
      <ScheduleDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        schedule={selectedSchedule}
        onEdit={handleScheduleEdit}
        onDelete={handleScheduleDelete}
      />

      {/* 필터 모달 */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="일정 필터"
      >
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ScheduleCategory | "all")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="all">전체</option>
                <option value="property_viewing">매물 보기</option>
                <option value="contract_signing">계약 체결</option>
                <option value="maintenance">유지보수</option>
                <option value="client_meeting">고객 미팅</option>
                <option value="team_meeting">팀 회의</option>
                <option value="personal">개인 일정</option>
                <option value="other">기타</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-2">
            <Button onClick={() => setShowFilterModal(false)} variant="outline">
              취소
            </Button>
            <Button onClick={() => setShowFilterModal(false)} variant="tenant">
              적용
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SchedulePage;