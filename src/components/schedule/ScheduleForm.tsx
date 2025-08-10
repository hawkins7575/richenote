// ============================================================================
// 스케줄 생성/수정 폼 컴포넌트
// ============================================================================

import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Users, Tag, AlertCircle } from "lucide-react";
import { Button, Input, Modal } from "@/components/ui";
import { Schedule, ScheduleFormData, ScheduleCategory, SchedulePriority } from "@/types/schedule";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { scheduleService } from "@/services/scheduleService";
import { supabase } from "@/lib/supabase";
import { useProperties } from "@/hooks/useProperties";

interface ScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (schedule: Schedule) => void;
  initialData?: Schedule | null;
  selectedDate?: Date;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  selectedDate,
}) => {
  const { user, loading: authLoading, session, getCurrentUser } = useAuth();
  const { tenant } = useTenant();
  const { properties } = useProperties();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ScheduleFormData>({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    all_day: false,
    category: "other",
    priority: "medium",
    property_id: "",
    attendees: [],
    location: "",
  });

  // 초기 데이터 설정
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || "",
        start_date: initialData.start_date,
        end_date: initialData.end_date,
        all_day: initialData.all_day,
        category: initialData.category,
        priority: initialData.priority,
        property_id: initialData.property_id || "",
        attendees: initialData.attendees || [],
        location: initialData.location || "",
      });
    } else {
      // 새 일정 생성 시 기본값 설정
      const now = new Date();
      
      // 선택된 날짜의 적절한 시간대 설정
      let startTime: Date;
      let endTime: Date;
      
      if (selectedDate) {
        // 캘린더에서 날짜를 클릭한 경우: 선택한 날짜의 현재 시간으로 설정
        startTime = new Date(selectedDate);
        // 선택한 날짜의 현재 시각 또는 다음 정시로 설정
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        if (selectedDate.toDateString() === now.toDateString()) {
          // 오늘 날짜면 현재 시각 기준으로 다음 정시
          startTime.setHours(currentHour + (currentMinute > 0 ? 1 : 0), 0, 0, 0);
        } else {
          // 다른 날짜면 오전 9시로 설정
          startTime.setHours(9, 0, 0, 0);
        }
      } else {
        // 일정 등록 버튼으로 직접 들어온 경우: 현재 시간 기준 다음 정시
        startTime = new Date(now);
        startTime.setHours(now.getHours() + 1, 0, 0, 0);
      }
      
      // 종료 시간은 시작 시간의 1시간 후
      endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);
      
      const startDateTime = startTime.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM 형식
      const endDateTime = endTime.toISOString().slice(0, 16);
      
      console.log("🕐 기본 시간 설정:", {
        selectedDate: selectedDate?.toISOString(),
        clickedDate: selectedDate?.toDateString(),
        currentDate: now.toDateString(),
        isToday: selectedDate?.toDateString() === now.toDateString(),
        startDateTime,
        endDateTime
      });
      
      setFormData(prev => ({
        ...prev,
        start_date: startDateTime,
        end_date: endDateTime,
      }));
    }
  }, [initialData, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🚀 handleSubmit 함수 실행됨!");
    console.log("📋 현재 formData:", formData);
    console.log("🔍 현재 인증 상태:", { 
      authLoading, 
      hasUser: !!user, 
      userId: user?.id,
      hasSession: !!session 
    });
    
    // 인증 로딩 중이면 대기
    if (authLoading) {
      setError("인증 상태를 확인하는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    
    // 폼 유효성 검사
    if (!formData.title.trim()) {
      setError("일정 제목을 입력해주세요.");
      return;
    }
    
    if (!formData.start_date) {
      setError("시작 일시를 선택해주세요.");
      return;
    }
    
    if (!formData.end_date) {
      setError("종료 일시를 선택해주세요.");
      return;
    }
    
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      setError("종료 일시는 시작 일시보다 뒤여야 합니다.");
      return;
    }
    
    console.log("✅ 폼 유효성 검사 통과");
    
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. 현재 인증된 사용자 확인 (여러 방법으로 시도)
      console.log("🔐 인증 사용자 확인 중...");
      
      let currentUser = null;
      
      // 개선된 getCurrentUser 함수 사용
      const authUser = await getCurrentUser();
      
      if (!authUser) {
        console.error("❌ 사용자 인증 실패");
        setError("사용자 인증에 실패했습니다. 페이지를 새로고침하거나 다시 로그인해주세요.");
        return;
      }
      
      currentUser = { id: authUser.id, email: authUser.email };

      console.log("✅ 인증된 사용자:", {
        id: currentUser.id,
        email: currentUser.email
      });

      // 2. 사용자의 tenant_id 확인 (사용자 ID가 tenant_id가 됨)
      const tenantId = currentUser.id; // 각 사용자별로 독립적인 데이터 관리
      console.log("🏢 테넌트 ID:", tenantId);

      // 3. 폼 데이터 정리 (UUID 필드 처리)
      const cleanedFormData = { ...formData };
      
      // property_id가 빈 문자열이면 속성 제거 (DB에서 NULL로 처리됨)
      if (!cleanedFormData.property_id || cleanedFormData.property_id.trim() === '') {
        delete cleanedFormData.property_id;
      }
      
      // attendees가 빈 배열이면 속성 제거 (DB에서 NULL로 처리됨)
      if (Array.isArray(cleanedFormData.attendees) && cleanedFormData.attendees.length === 0) {
        delete cleanedFormData.attendees;
      }
      
      console.log("🧹 정리된 폼 데이터:", cleanedFormData);

      // 4. 스케줄 생성/수정
      let schedule: Schedule;
      
      if (initialData) {
        console.log("🔄 일정 수정 중...", {
          scheduleId: initialData.id,
          tenantId,
          currentUserId: currentUser.id,
          originalTenantId: initialData.tenant_id,
          originalCreatedBy: initialData.created_by
        });
        
        // 클라이언트 측에서 기본 권한 확인 (추가 보안은 서버에서)
        if (initialData.tenant_id !== tenantId || initialData.created_by !== currentUser.id) {
          console.error("❌ 클라이언트 권한 확인 실패");
          setError("이 일정을 수정할 권한이 없습니다.");
          return;
        }
        
        schedule = await scheduleService.updateSchedule(initialData.id, cleanedFormData, currentUser.id);
      } else {
        console.log("➕ 일정 생성 중...");
        schedule = await scheduleService.createSchedule(
          tenantId, // 사용자 ID를 테넌트 ID로 사용
          currentUser.id,
          cleanedFormData
        );
      }
      
      console.log("✅ 일정 저장 성공:", schedule);
      
      // 4. UI 업데이트 및 모달 닫기
      onSubmit(schedule);
      onClose();
      
    } catch (err: any) {
      console.error("❌ 일정 저장 실패:", err);
      console.error("❌ 오류 상세:", {
        message: err.message,
        stack: err.stack,
        name: err.name,
        code: err.code
      });
      
      // 사용자 친화적 오류 메시지
      if (err.message?.includes("JWT") || err.message?.includes("인증이 필요합니다")) {
        setError("세션이 만료되었습니다. 페이지를 새로고침하거나 다시 로그인해주세요.");
      } else if (err.message?.includes("permission") || err.message?.includes("권한이 없습니다")) {
        setError("이 일정을 수정할 권한이 없습니다. 본인이 작성한 일정만 수정 가능합니다.");
      } else if (err.message?.includes("찾을 수 없습니다")) {
        setError("일정을 찾을 수 없습니다. 이미 삭제되었거나 권한이 없을 수 있습니다.");
      } else {
        setError(err.message || "일정 저장 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ScheduleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 종일 일정 체크 시 시간 자동 설정
    if (field === "all_day" && value) {
      const startDate = formData.start_date.split('T')[0];
      const endDate = formData.end_date.split('T')[0];
      setFormData(prev => ({
        ...prev,
        start_date: `${startDate}T00:00`,
        end_date: `${endDate}T23:59`,
      }));
    }
  };

  const categoryOptions: { value: ScheduleCategory; label: string; icon: React.ReactNode }[] = [
    { value: "property_viewing", label: "매물 보기", icon: <MapPin className="w-4 h-4" /> },
    { value: "contract_signing", label: "계약 체결", icon: <Tag className="w-4 h-4" /> },
    { value: "maintenance", label: "유지보수", icon: <AlertCircle className="w-4 h-4" /> },
    { value: "client_meeting", label: "고객 미팅", icon: <Users className="w-4 h-4" /> },
    { value: "team_meeting", label: "팀 회의", icon: <Users className="w-4 h-4" /> },
    { value: "personal", label: "개인 일정", icon: <Calendar className="w-4 h-4" /> },
    { value: "other", label: "기타", icon: <Tag className="w-4 h-4" /> },
  ];

  const priorityOptions: { value: SchedulePriority; label: string; color: string }[] = [
    { value: "low", label: "낮음", color: "text-gray-600" },
    { value: "medium", label: "보통", color: "text-blue-600" },
    { value: "high", label: "높음", color: "text-orange-600" },
    { value: "urgent", label: "긴급", color: "text-red-600" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "일정 수정" : "새 일정 등록"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            일정 제목 *
          </label>
          <Input
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="일정 제목을 입력하세요"
            required
          />
        </div>

        {/* 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            설명
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="일정에 대한 자세한 설명을 입력하세요"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none h-20"
          />
        </div>

        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            카테고리 *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value as ScheduleCategory)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            required
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 우선순위 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            우선순위
          </label>
          <select
            value={formData.priority}
            onChange={(e) => handleChange("priority", e.target.value as SchedulePriority)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 연관 매물 */}
        {(formData.category === "property_viewing" || formData.category === "contract_signing") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연관 매물
            </label>
            <select
              value={formData.property_id}
              onChange={(e) => handleChange("property_id", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">매물 선택 (선택사항)</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.title} - {property.address}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 종일 일정 체크박스 */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="all_day"
            checked={formData.all_day}
            onChange={(e) => handleChange("all_day", e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="all_day" className="text-sm text-gray-700">
            종일 일정
          </label>
        </div>

        {/* 시작 일시 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시작 일시 *
            </label>
            <Input
              type={formData.all_day ? "date" : "datetime-local"}
              value={formData.all_day ? formData.start_date.split('T')[0] : formData.start_date}
              onChange={(e) => {
                const value = formData.all_day ? `${e.target.value}T00:00` : e.target.value;
                handleChange("start_date", value);
              }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              종료 일시 *
            </label>
            <Input
              type={formData.all_day ? "date" : "datetime-local"}
              value={formData.all_day ? formData.end_date.split('T')[0] : formData.end_date}
              onChange={(e) => {
                const value = formData.all_day ? `${e.target.value}T23:59` : e.target.value;
                handleChange("end_date", value);
              }}
              required
            />
          </div>
        </div>

        {/* 장소 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            장소
          </label>
          <Input
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="일정 장소를 입력하세요"
            leftIcon={<MapPin className="w-4 h-4" />}
          />
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={isSubmitting || authLoading}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="tenant"
            disabled={isSubmitting || authLoading}
            onClick={() => console.log("🔘 등록 버튼 클릭됨!")}
          >
            {authLoading ? "인증 확인 중..." : isSubmitting ? "저장 중..." : initialData ? "수정" : "등록"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export { ScheduleForm };