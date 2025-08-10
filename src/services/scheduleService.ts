// ============================================================================
// 스케줄 관리 서비스
// ============================================================================

import { supabase } from "@/lib/supabase";
import { Schedule, ScheduleFormData, ScheduleFilters } from "@/types/schedule";
import { ServiceError } from "@/utils/serviceError";

class ScheduleService {
  /**
   * 모든 스케줄 조회 (필터 적용)
   */
  async getSchedules(
    tenantId: string,
    filters?: ScheduleFilters
  ): Promise<Schedule[]> {
    try {
      let query = supabase
        .from("schedules")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("start_date", { ascending: true });

      // 필터 적용
      if (filters) {
        if (filters.category) {
          query = query.eq("category", filters.category);
        }
        
        if (filters.priority) {
          query = query.eq("priority", filters.priority);
        }

        if (filters.status) {
          query = query.eq("status", filters.status);
        }

        if (filters.date_range) {
          query = query
            .gte("start_date", filters.date_range.start)
            .lte("end_date", filters.date_range.end);
        }

        if (filters.created_by) {
          query = query.eq("created_by", filters.created_by);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw new ServiceError({
          code: "SCHEDULE_FETCH_ERROR",
          message: "스케줄 목록을 불러오는 중 오류가 발생했습니다.",
          details: error as Record<string, any>
        });
      }

      return data || [];
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      
      throw new ServiceError({
        code: "SCHEDULE_FETCH_UNEXPECTED_ERROR",
        message: "스케줄 목록을 불러오는 중 예상치 못한 오류가 발생했습니다.",
        details: error as Record<string, any>
      });
    }
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
    try {
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw new ServiceError({
          code: "SCHEDULE_GET_ERROR",
          message: "스케줄을 불러오는 중 오류가 발생했습니다.",
          details: error as Record<string, any>
        });
      }

      return data;
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      
      throw new ServiceError({
        code: "SCHEDULE_GET_UNEXPECTED_ERROR",
        message: "스케줄을 불러오는 중 예상치 못한 오류가 발생했습니다.",
        details: error as Record<string, any>
      });
    }
  }

  /**
   * 스케줄 생성
   */
  async createSchedule(
    tenantId: string,
    userId: string,
    formData: ScheduleFormData
  ): Promise<Schedule> {
    try {
      console.log("🔄 scheduleService.createSchedule 시작:", {
        tenantId,
        userId,
        formData
      });

      // UUID 필드 처리: 빈 문자열은 undefined로 변환 (DB에서는 NULL)
      const cleanedFormData = { ...formData };
      
      // property_id가 빈 문자열이거나 undefined이면 제거 (DB에서 NULL로 처리됨)
      if (!cleanedFormData.property_id || cleanedFormData.property_id.trim() === '') {
        delete cleanedFormData.property_id;
      }
      
      // attendees가 빈 배열이면 제거 (DB에서 NULL로 처리됨)
      if (Array.isArray(cleanedFormData.attendees) && cleanedFormData.attendees.length === 0) {
        delete cleanedFormData.attendees;
      }

      const scheduleData = {
        ...cleanedFormData,
        tenant_id: tenantId,
        created_by: userId,
        status: "scheduled" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("📝 Supabase에 삽입할 데이터:", scheduleData);

      // RLS 디버깅을 위한 현재 사용자 확인
      const { data: { user: currentAuthUser } } = await supabase.auth.getUser();
      console.log("🔐 현재 인증된 사용자 (RLS 확인):", {
        userId: currentAuthUser?.id,
        email: currentAuthUser?.email,
        tenant_id_in_data: scheduleData.tenant_id,
        created_by_in_data: scheduleData.created_by,
        match_tenant: scheduleData.tenant_id === currentAuthUser?.id,
        match_created_by: scheduleData.created_by === currentAuthUser?.id
      });

      const { data, error } = await supabase
        .from("schedules")
        .insert([scheduleData])
        .select()
        .single();

      console.log("📊 Supabase 응답:", { data, error });

      if (error) {
        console.error("❌ Supabase 삽입 오류:", error);
        throw new ServiceError({
          code: "SCHEDULE_CREATE_ERROR",
          message: `스케줄 등록 중 오류가 발생했습니다: ${error.message}`,
          details: error as Record<string, any>
        });
      }

      console.log("✅ 스케줄 생성 성공:", data);
      return data;
    } catch (error) {
      console.error("❌ scheduleService.createSchedule 오류:", error);
      
      if (error instanceof ServiceError) throw error;
      
      throw new ServiceError({
        code: "SCHEDULE_CREATE_UNEXPECTED_ERROR",
        message: "스케줄 등록 중 예상치 못한 오류가 발생했습니다.",
        details: error as Record<string, any>
      });
    }
  }

  /**
   * 스케줄 업데이트 - 권한 검사 포함
   */
  async updateSchedule(
    id: string,
    updates: Partial<ScheduleFormData>,
    currentUserId?: string // 옵션: 현재 사용자 ID 전달받기
  ): Promise<Schedule> {
    try {
      console.log("🔄 스케줄 수정 시작:", { id, updates });

      // 1. 현재 사용자 확인 - 전달받은 userId 사용 또는 Supabase에서 확인
      let userId: string;
      
      if (currentUserId) {
        console.log("🔐 전달받은 사용자 ID 사용:", currentUserId);
        userId = currentUserId;
      } else {
        console.log("🔐 Supabase에서 현재 사용자 확인 중...");
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        console.log("🔐 Supabase 인증 상태:", {
          hasUser: !!currentUser,
          userId: currentUser?.id,
          email: currentUser?.email,
          userError: userError
        });
        
        if (userError || !currentUser) {
          console.error("❌ Supabase 인증 실패:", userError);
          throw new ServiceError({
            code: "SCHEDULE_UPDATE_AUTH_ERROR",
            message: "인증이 필요합니다.",
            details: userError as Record<string, any>
          });
        }
        
        userId = currentUser.id;
      }

      // 2. 기존 스케줄 확인 및 권한 검사 (본인 것만 조회)
      const { data: existingSchedule, error: fetchError } = await supabase
        .from("schedules")
        .select("*")
        .eq("id", id)
        .eq("created_by", userId) // 추가 보안: 본인 것만 조회
        .eq("tenant_id", userId)  // 추가 보안: 본인 테넌트 데이터만 조회
        .single();

      console.log("📊 기존 스케줄 조회 결과:", {
        hasData: !!existingSchedule,
        fetchError,
        scheduleId: id,
        queryFilters: {
          id,
          created_by: userId,
          tenant_id: userId
        }
      });

      if (fetchError || !existingSchedule) {
        console.error("❌ 스케줄 조회 실패:", fetchError);
        throw new ServiceError({
          code: "SCHEDULE_NOT_FOUND",
          message: "수정할 스케줄을 찾을 수 없거나 권한이 없습니다.",
          details: fetchError as Record<string, any>
        });
      }

      // 3. 권한 확인은 이미 쿼리에서 처리됨 (이중 확인)
      if (existingSchedule.created_by !== userId || existingSchedule.tenant_id !== userId) {
        console.error("❌ 권한 확인 실패:", {
          scheduleCreatedBy: existingSchedule.created_by,
          scheduleTenantId: existingSchedule.tenant_id,
          currentUserId: userId
        });
        throw new ServiceError({
          code: "SCHEDULE_UPDATE_PERMISSION_ERROR",
          message: "이 스케줄을 수정할 권한이 없습니다.",
          details: { scheduleCreatedBy: existingSchedule.created_by, currentUserId: userId }
        });
      }

      // 4. 업데이트 데이터 정리 (UUID 필드 처리)
      const cleanedUpdates = { ...updates };
      
      // property_id가 빈 문자열이면 제거
      if (cleanedUpdates.property_id !== undefined && (!cleanedUpdates.property_id || cleanedUpdates.property_id.trim() === '')) {
        delete cleanedUpdates.property_id;
      }
      
      // attendees가 빈 배열이면 제거
      if (Array.isArray(cleanedUpdates.attendees) && cleanedUpdates.attendees.length === 0) {
        delete cleanedUpdates.attendees;
      }

      const updateData = {
        ...cleanedUpdates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("schedules")
        .update(updateData)
        .eq("id", id)
        .eq("created_by", userId) // 추가 보안: 본인 데이터만 수정
        .eq("tenant_id", userId)  // 추가 보안: 본인 테넌트 데이터만 수정
        .select()
        .single();

      if (error) {
        throw new ServiceError({
          code: "SCHEDULE_UPDATE_ERROR",
          message: "스케줄 수정 중 오류가 발생했습니다.",
          details: error as Record<string, any>
        });
      }

      console.log("✅ 스케줄 수정 완료:", data);
      return data;
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      
      throw new ServiceError({
        code: "SCHEDULE_UPDATE_UNEXPECTED_ERROR",
        message: "스케줄 수정 중 예상치 못한 오류가 발생했습니다.",
        details: error as Record<string, any>
      });
    }
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
   * 스케줄 삭제 - 권한 검사 포함
   */
  async deleteSchedule(id: string, currentUserId?: string): Promise<void> {
    try {
      console.log("🗑️ 스케줄 삭제 시작:", { id });

      // 1. 현재 사용자 확인 - 전달받은 userId 사용 또는 Supabase에서 확인
      let userId: string;
      
      if (currentUserId) {
        console.log("🔐 전달받은 사용자 ID 사용 (삭제):", currentUserId);
        userId = currentUserId;
      } else {
        console.log("🔐 Supabase에서 현재 사용자 확인 중 (삭제)...");
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        if (userError || !currentUser) {
          console.error("❌ 삭제 시 인증 실패:", userError);
          throw new ServiceError({
            code: "SCHEDULE_DELETE_AUTH_ERROR",
            message: "인증이 필요합니다.",
            details: userError as Record<string, any>
          });
        }
        userId = currentUser.id;
      }

      // 2. 스케줄 삭제 (권한 확인 포함 - 본인 것만 삭제)
      const { error } = await supabase
        .from("schedules")
        .delete()
        .eq("id", id)
        .eq("created_by", userId) // 추가 보안: 본인 데이터만 삭제
        .eq("tenant_id", userId); // 추가 보안: 본인 테넌트 데이터만 삭제

      console.log("🗑️ 스케줄 삭제 쿼리 실행:", {
        scheduleId: id,
        userId,
        error
      });

      if (error) {
        throw new ServiceError({
          code: "SCHEDULE_DELETE_ERROR",
          message: "스케줄 삭제 중 오류가 발생했습니다.",
          details: error as Record<string, any>
        });
      }

      console.log("✅ 스케줄 삭제 완료");
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      
      throw new ServiceError({
        code: "SCHEDULE_DELETE_UNEXPECTED_ERROR",
        message: "스케줄 삭제 중 예상치 못한 오류가 발생했습니다.",
        details: error as Record<string, any>
      });
    }
  }

  /**
   * 당일 스케줄 조회 (대시보드용)
   */
  async getTodaySchedules(
    tenantId: string,
    limit: number = 3
  ): Promise<Schedule[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("tenant_id", tenantId)
        .gte("start_date", startOfDay.toISOString())
        .lte("start_date", endOfDay.toISOString())
        .in("status", ["scheduled", "in_progress"])
        .order("start_date", { ascending: true })
        .limit(limit);

      if (error) {
        throw new ServiceError({
          code: "SCHEDULE_TODAY_ERROR",
          message: "당일 일정을 불러오는 중 오류가 발생했습니다.",
          details: error as Record<string, any>
        });
      }

      return data || [];
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      
      throw new ServiceError({
        code: "SCHEDULE_TODAY_UNEXPECTED_ERROR",
        message: "당일 일정을 불러오는 중 예상치 못한 오류가 발생했습니다.",
        details: error as Record<string, any>
      });
    }
  }

  /**
   * 다가오는 스케줄 조회 (대시보드용 - 내일부터)
   */
  async getUpcomingSchedules(
    tenantId: string,
    limit: number = 3
  ): Promise<Schedule[]> {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("tenant_id", tenantId)
        .gte("start_date", tomorrow.toISOString())
        .in("status", ["scheduled", "in_progress"])
        .order("start_date", { ascending: true })
        .limit(limit);

      if (error) {
        throw new ServiceError({
          code: "SCHEDULE_UPCOMING_ERROR",
          message: "다가오는 일정을 불러오는 중 오류가 발생했습니다.",
          details: error as Record<string, any>
        });
      }

      return data || [];
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      
      throw new ServiceError({
        code: "SCHEDULE_UPCOMING_UNEXPECTED_ERROR",
        message: "다가오는 일정을 불러오는 중 예상치 못한 오류가 발생했습니다.",
        details: error as Record<string, any>
      });
    }
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
    try {
      const { data: allSchedules, error } = await supabase
        .from("schedules")
        .select("status, start_date, end_date")
        .eq("tenant_id", tenantId);

      if (error) {
        throw new ServiceError({
          code: "SCHEDULE_STATS_ERROR",
          message: "스케줄 통계를 불러오는 중 오류가 발생했습니다.",
          details: error as Record<string, any>
        });
      }

      const now = new Date();
      const schedules = allSchedules || [];

      const stats = {
        total: schedules.length,
        scheduled: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
      };

      schedules.forEach(schedule => {
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
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      
      throw new ServiceError({
        code: "SCHEDULE_STATS_UNEXPECTED_ERROR",
        message: "스케줄 통계를 불러오는 중 예상치 못한 오류가 발생했습니다.",
        details: error as Record<string, any>
      });
    }
  }
}

// 싱글톤 인스턴스 생성 및 export
export const scheduleService = new ScheduleService();