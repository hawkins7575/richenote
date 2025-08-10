// ============================================================================
// 스케줄 관련 타입 정의
// ============================================================================

export interface Schedule {
  id: string;
  title: string;
  description?: string;
  start_date: string; // ISO string format
  end_date: string; // ISO string format
  all_day: boolean;
  category: ScheduleCategory;
  priority: SchedulePriority;
  status: ScheduleStatus;
  property_id?: string; // 연관된 매물 ID (선택사항)
  attendees?: string[]; // 참석자 user IDs
  location?: string;
  created_by: string; // user ID
  created_at: string;
  updated_at: string;
  tenant_id: string;
}

export type ScheduleCategory = 
  | "property_viewing" // 매물 보기
  | "contract_signing" // 계약 체결
  | "maintenance" // 유지보수
  | "client_meeting" // 고객 미팅  
  | "team_meeting" // 팀 회의
  | "personal" // 개인 일정
  | "other"; // 기타

export type SchedulePriority = "low" | "medium" | "high" | "urgent";

export type ScheduleStatus = 
  | "scheduled" // 예정됨
  | "in_progress" // 진행 중
  | "completed" // 완료됨
  | "cancelled" // 취소됨
  | "postponed"; // 연기됨

export interface ScheduleFormData {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  category: ScheduleCategory;
  priority: SchedulePriority;
  property_id?: string;
  attendees?: string[];
  location?: string;
}

export interface ScheduleFilters {
  category?: ScheduleCategory;
  priority?: SchedulePriority;
  status?: ScheduleStatus;
  date_range?: {
    start: string;
    end: string;
  };
  created_by?: string;
}

// 캘린더 뷰 타입
export type CalendarView = "month" | "week" | "day" | "agenda";

// 캘린더 이벤트 (react-calendar 등에서 사용)
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource?: Schedule; // 원본 스케줄 데이터
  color?: string; // 카테고리별 색상
}