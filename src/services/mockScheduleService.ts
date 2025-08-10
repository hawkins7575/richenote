// ============================================================================
// 임시 모크 스케줄 서비스 (데이터베이스 테이블 생성 전까지 사용)
// ============================================================================

import { Schedule, ScheduleFormData, ScheduleFilters } from "@/types/schedule";

class MockScheduleService {
  private schedules: Schedule[] = [
    {
      id: "1",
      title: "강남 아파트 매물 보기",
      description: "고객과 함께 강남 아파트 내부 확인 예정",
      start_date: "2024-12-20T14:00:00+09:00",
      end_date: "2024-12-20T15:00:00+09:00",
      all_day: false,
      category: "property_viewing",
      priority: "high",
      status: "scheduled",
      property_id: "prop-1",
      attendees: [],
      location: "서울시 강남구",
      created_by: "user-1",
      created_at: "2024-12-19T10:00:00Z",
      updated_at: "2024-12-19T10:00:00Z",
      tenant_id: "tenant-1",
    },
    {
      id: "2", 
      title: "팀 회의",
      description: "월간 매물 현황 검토 및 목표 설정",
      start_date: "2024-12-21T10:00:00+09:00",
      end_date: "2024-12-21T11:30:00+09:00",
      all_day: false,
      category: "team_meeting",
      priority: "medium",
      status: "scheduled",
      attendees: ["user-1", "user-2"],
      location: "회의실 A",
      created_by: "user-1",
      created_at: "2024-12-19T11:00:00Z",
      updated_at: "2024-12-19T11:00:00Z",
      tenant_id: "tenant-1",
    },
  ];

  /**
   * 모든 스케줄 조회 (필터 적용)
   */
  async getSchedules(
    tenantId: string,
    filters?: ScheduleFilters
  ): Promise<Schedule[]> {
    // 임시로 딜레이 추가 (실제 API 호출 시뮬레이션)
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredSchedules = [...this.schedules];

    // 필터 적용
    if (filters) {
      if (filters.category) {
        filteredSchedules = filteredSchedules.filter(s => s.category === filters.category);
      }
      
      if (filters.priority) {
        filteredSchedules = filteredSchedules.filter(s => s.priority === filters.priority);
      }

      if (filters.status) {
        filteredSchedules = filteredSchedules.filter(s => s.status === filters.status);
      }

      if (filters.created_by) {
        filteredSchedules = filteredSchedules.filter(s => s.created_by === filters.created_by);
      }

      if (filters.date_range) {
        const startDate = new Date(filters.date_range.start);
        const endDate = new Date(filters.date_range.end);
        
        filteredSchedules = filteredSchedules.filter(s => {
          const scheduleStart = new Date(s.start_date);
          return scheduleStart >= startDate && scheduleStart <= endDate;
        });
      }
    }

    return filteredSchedules.sort((a, b) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
  }

  /**
   * 특정 기간의 스케줄 조회
   */
  async getSchedulesByDateRange(
    tenantId: string,
    startDate: string,
    endDate: string
  ): Promise<Schedule[]> {
    return this.getSchedules(tenantId, {
      date_range: { start: startDate, end: endDate }
    });
  }

  /**
   * 특정 날짜의 스케줄 조회
   */
  async getSchedulesByDate(tenantId: string, date: string): Promise<Schedule[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getSchedulesByDateRange(
      tenantId,
      startOfDay.toISOString(),
      endOfDay.toISOString()
    );
  }

  /**
   * 단일 스케줄 조회
   */
  async getSchedule(id: string): Promise<Schedule | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.schedules.find(s => s.id === id) || null;
  }

  /**
   * 스케줄 생성
   */
  async createSchedule(
    tenantId: string,
    userId: string,
    formData: ScheduleFormData
  ): Promise<Schedule> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const newSchedule: Schedule = {
      id: `schedule-${Date.now()}`, // 임시 ID
      ...formData,
      status: "scheduled",
      tenant_id: tenantId,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.schedules.push(newSchedule);
    
    console.log("✅ 새 일정이 생성되었습니다:", newSchedule);
    return newSchedule;
  }

  /**
   * 스케줄 업데이트
   */
  async updateSchedule(
    id: string,
    updates: Partial<ScheduleFormData>
  ): Promise<Schedule> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = this.schedules.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error("스케줄을 찾을 수 없습니다.");
    }

    this.schedules[index] = {
      ...this.schedules[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    console.log("✅ 일정이 수정되었습니다:", this.schedules[index]);
    return this.schedules[index];
  }

  /**
   * 스케줄 상태 변경
   */
  async updateScheduleStatus(
    id: string,
    status: Schedule["status"]
  ): Promise<Schedule> {
    return this.updateSchedule(id, { status } as any);
  }

  /**
   * 스케줄 삭제
   */
  async deleteSchedule(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.schedules.findIndex(s => s.id === id);
    if (index !== -1) {
      this.schedules.splice(index, 1);
      console.log("✅ 일정이 삭제되었습니다:", id);
    }
  }

  /**
   * 다가오는 스케줄 조회 (대시보드용)
   */
  async getUpcomingSchedules(
    tenantId: string,
    limit: number = 5
  ): Promise<Schedule[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const now = new Date();
    
    return this.schedules
      .filter(s => 
        new Date(s.start_date) >= now && 
        (s.status === "scheduled" || s.status === "in_progress")
      )
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, limit);
  }

  /**
   * 스케줄 통계 조회
   */
  async getScheduleStats(tenantId: string): Promise<{
    total: number;
    scheduled: number;
    inProgress: number;
    completed: number;
    overdue: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const now = new Date();
    
    const stats = {
      total: this.schedules.length,
      scheduled: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
    };

    this.schedules.forEach(schedule => {
      const endDate = new Date(schedule.end_date);
      
      switch (schedule.status) {
        case "scheduled":
          if (endDate < now) {
            stats.overdue++;
          } else {
            stats.scheduled++;
          }
          break;
        case "in_progress":
          stats.inProgress++;
          break;
        case "completed":
          stats.completed++;
          break;
      }
    });

    return stats;
  }
}

// 싱글톤 인스턴스 생성 및 export
export const mockScheduleService = new MockScheduleService();