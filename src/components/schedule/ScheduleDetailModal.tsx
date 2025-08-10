// ============================================================================
// 스케줄 상세 보기 모달 컴포넌트
// ============================================================================

import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Tag, 
  AlertCircle,
  Edit,
  Trash2,
  X
} from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { Schedule, ScheduleCategory, SchedulePriority } from "@/types/schedule";
import { useIsMobile } from "@/hooks/useMobileDetection";

interface ScheduleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule | null;
  onEdit: (schedule: Schedule) => void;
  onDelete: (scheduleId: string) => void;
}

const ScheduleDetailModal: React.FC<ScheduleDetailModalProps> = ({
  isOpen,
  onClose,
  schedule,
  onEdit,
  onDelete,
}) => {
  const isMobile = useIsMobile();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!schedule) return null;

  // 카테고리별 색상 및 라벨
  const categoryInfo = {
    property_viewing: { label: "매물 보기", color: "bg-blue-500", icon: <MapPin className="w-4 h-4" /> },
    contract_signing: { label: "계약 체결", color: "bg-green-500", icon: <Tag className="w-4 h-4" /> },
    maintenance: { label: "유지보수", color: "bg-yellow-500", icon: <AlertCircle className="w-4 h-4" /> },
    client_meeting: { label: "고객 미팅", color: "bg-purple-500", icon: <User className="w-4 h-4" /> },
    team_meeting: { label: "팀 회의", color: "bg-indigo-500", icon: <User className="w-4 h-4" /> },
    personal: { label: "개인 일정", color: "bg-pink-500", icon: <CalendarIcon className="w-4 h-4" /> },
    other: { label: "기타", color: "bg-gray-500", icon: <Tag className="w-4 h-4" /> },
  };

  const priorityInfo = {
    low: { label: "낮음", color: "text-gray-600 bg-gray-100" },
    medium: { label: "보통", color: "text-blue-600 bg-blue-100" },
    high: { label: "높음", color: "text-orange-600 bg-orange-100" },
    urgent: { label: "긴급", color: "text-red-600 bg-red-100" },
  };

  const statusInfo = {
    scheduled: { label: "예정됨", color: "text-blue-600 bg-blue-100" },
    in_progress: { label: "진행 중", color: "text-yellow-600 bg-yellow-100" },
    completed: { label: "완료됨", color: "text-green-600 bg-green-100" },
    cancelled: { label: "취소됨", color: "text-red-600 bg-red-100" },
    postponed: { label: "연기됨", color: "text-gray-600 bg-gray-100" },
  };

  const formatDateTime = (dateString: string, allDay: boolean) => {
    const date = new Date(dateString);
    if (allDay) {
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      });
    }
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async () => {
    if (!confirm("정말로 이 일정을 삭제하시겠습니까?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(schedule.id);
      onClose();
    } catch (error) {
      console.error("일정 삭제 실패:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const categoryData = categoryInfo[schedule.category];
  const priorityData = priorityInfo[schedule.priority];
  const statusData = statusInfo[schedule.status];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="lg"
    >
      <div className="p-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {schedule.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {/* 카테고리 */}
              <span className={`inline-flex items-center px-2 py-1 rounded text-white text-xs font-medium ${categoryData.color}`}>
                {categoryData.icon}
                <span className="ml-1">{categoryData.label}</span>
              </span>
              
              {/* 우선순위 */}
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${priorityData.color}`}>
                {priorityData.label}
              </span>
              
              {/* 상태 */}
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusData.color}`}>
                {statusData.label}
              </span>
            </div>
          </div>
          
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 ml-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 날짜 및 시간 정보 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center text-gray-700 mb-2">
            <CalendarIcon className="w-5 h-5 mr-2" />
            <span className="font-medium">시작</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            {formatDateTime(schedule.start_date, schedule.all_day)}
          </p>
          
          <div className="flex items-center text-gray-700 mb-2">
            <Clock className="w-5 h-5 mr-2" />
            <span className="font-medium">종료</span>
          </div>
          <p className="text-sm text-gray-600">
            {formatDateTime(schedule.end_date, schedule.all_day)}
          </p>
          
          {schedule.all_day && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-600">
                종일 일정
              </span>
            </div>
          )}
        </div>

        {/* 설명 */}
        {schedule.description && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">상세 내용</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">
                {schedule.description}
              </p>
            </div>
          </div>
        )}

        {/* 장소 */}
        {schedule.location && (
          <div className="mb-6">
            <div className="flex items-center text-gray-700 mb-2">
              <MapPin className="w-5 h-5 mr-2" />
              <span className="font-medium">장소</span>
            </div>
            <p className="text-gray-600 ml-7">{schedule.location}</p>
          </div>
        )}

        {/* 생성 정보 */}
        <div className="mb-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            생성일: {new Date(schedule.created_at).toLocaleDateString("ko-KR")}
          </p>
          {schedule.updated_at !== schedule.created_at && (
            <p className="text-xs text-gray-500">
              수정일: {new Date(schedule.updated_at).toLocaleDateString("ko-KR")}
            </p>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
            size={isMobile ? "sm" : "md"}
          >
            닫기
          </Button>
          
          <Button
            onClick={() => {
              onEdit(schedule);
              onClose();
            }}
            variant="primary"
            leftIcon={<Edit className="w-4 h-4" />}
            size={isMobile ? "sm" : "md"}
          >
            {isMobile ? "수정" : "수정"}
          </Button>
          
          <Button
            onClick={handleDelete}
            variant="danger"
            leftIcon={<Trash2 className="w-4 h-4" />}
            disabled={isDeleting}
            size={isMobile ? "sm" : "md"}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export { ScheduleDetailModal };