// ============================================================================
// 차트 데이터 서비스 - 실제 매물 데이터 기반 차트 통계 제공
// ============================================================================

import { supabase } from "@/lib/supabase";
import { ServiceError } from "@/utils/serviceError";

// 차트 데이터 타입 정의
export interface PropertyTrendData {
  month: string;
  등록: number;
  판매완료: number;
  거래중: number;
  총계: number;
}

export interface PropertyTypeData {
  type: string;
  count: number;
  percentage: number;
}

export interface MonthlyStats {
  month: string;
  year: number;
  registered: number;
  sold: number;
  in_progress: number;
  total: number;
}

class ChartService {
  /**
   * 매물 트렌드 데이터 조회 (최근 6개월)
   */
  async getPropertyTrendData(tenantId: string): Promise<PropertyTrendData[]> {
    try {
      console.log("📊 매물 트렌드 데이터 조회 시작:", { tenantId });

      // 최근 6개월 날짜 계산
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      
      console.log("📅 트렌드 조회 기간:", {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // 매물 데이터 조회 (임시로 모든 매물 조회)
      const { data: properties, error } = await supabase
        .from("properties")
        .select("created_at, status, transaction_type")
        .eq("tenant_id", tenantId)
        // .gte("created_at", startDate.toISOString()) // 임시 주석
        // .lte("created_at", endDate.toISOString())   // 임시 주석
        .order("created_at", { ascending: true });

      if (error) {
        throw new ServiceError({
          code: "CHART_TREND_FETCH_ERROR",
          message: "매물 트렌드 데이터를 불러오는 중 오류가 발생했습니다.",
          details: error as Record<string, any>
        });
      }

      console.log("📊 조회된 매물 데이터:", properties?.length || 0, "개");
      console.log("📊 매물 데이터 샘플:", properties?.slice(0, 3));

      // 월별 데이터 집계
      const monthlyData: { [key: string]: MonthlyStats } = {};
      
      // 최근 6개월 초기화
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('ko-KR', { month: 'long' });
        
        monthlyData[monthKey] = {
          month: monthName,
          year: date.getFullYear(),
          registered: 0,
          sold: 0,
          in_progress: 0,
          total: 0
        };
      }

      // 실제 데이터로 집계
      properties?.forEach(property => {
        const date = new Date(property.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].registered++;
          monthlyData[monthKey].total++;
          
          // 한국어 상태값으로 집계
          if (property.status === '거래완료') {
            monthlyData[monthKey].sold++;
          } else if (property.status === '거래중') {
            monthlyData[monthKey].in_progress++;
          }
        }
      });

      // 차트 데이터 형식으로 변환
      const trendData: PropertyTrendData[] = Object.values(monthlyData).map(data => ({
        month: data.month,
        등록: data.registered,
        판매완료: data.sold,
        거래중: data.in_progress,
        총계: data.total
      }));

      console.log("📊 집계된 트렌드 데이터:", trendData);
      return trendData;

    } catch (error) {
      console.error("❌ 매물 트렌드 데이터 조회 실패:", error);
      
      if (error instanceof ServiceError) throw error;
      
      throw new ServiceError({
        code: "CHART_TREND_UNEXPECTED_ERROR",
        message: "매물 트렌드 데이터를 불러오는 중 예상치 못한 오류가 발생했습니다.",
        details: error as Record<string, any>
      });
    }
  }

  /**
   * 매물 유형별 분포 데이터 조회
   */
  async getPropertyTypeData(tenantId: string): Promise<PropertyTypeData[]> {
    try {
      console.log("📊 매물 유형 분포 데이터 조회 시작:", { tenantId });

      // 매물 유형별 데이터 조회 (한국어 상태값 사용)
      const { data: properties, error } = await supabase
        .from("properties")
        .select("type")  // property_type -> type으로 변경
        .eq("tenant_id", tenantId)
        .in("status", ["거래중", "거래완료"]); // 한국어 상태값 사용

      if (error) {
        throw new ServiceError({
          code: "CHART_TYPE_FETCH_ERROR",
          message: "매물 유형 분포 데이터를 불러오는 중 오류가 발생했습니다.",
          details: error as Record<string, any>
        });
      }

      console.log("📊 조회된 매물 유형 데이터:", properties?.length || 0, "개");
      console.log("📊 매물 유형 데이터 샘플:", properties?.slice(0, 3));

      // 유형별 집계
      const typeCounts: { [key: string]: number } = {};
      const totalCount = properties?.length || 0;

      properties?.forEach(property => {
        const type = property.type || '기타';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      // 차트 데이터 형식으로 변환
      const typeData: PropertyTypeData[] = Object.entries(typeCounts)
        .map(([type, count]) => ({
          type,
          count,
          percentage: totalCount > 0 ? Math.round((count / totalCount) * 1000) / 10 : 0
        }))
        .sort((a, b) => b.count - a.count); // 많은 순으로 정렬

      console.log("📊 집계된 유형 분포 데이터:", typeData);

      // 데이터가 없으면 기본값 반환
      if (typeData.length === 0) {
        return [
          { type: "아파트", count: 0, percentage: 0 }
        ];
      }

      return typeData;

    } catch (error) {
      console.error("❌ 매물 유형 분포 데이터 조회 실패:", error);
      
      if (error instanceof ServiceError) throw error;
      
      throw new ServiceError({
        code: "CHART_TYPE_UNEXPECTED_ERROR",
        message: "매물 유형 분포 데이터를 불러오는 중 예상치 못한 오류가 발생했습니다.",
        details: error as Record<string, any>
      });
    }
  }

  /**
   * 대시보드 차트 데이터 한번에 조회
   */
  async getDashboardChartData(tenantId: string): Promise<{
    trendData: PropertyTrendData[];
    typeData: PropertyTypeData[];
  }> {
    try {
      console.log("📊 대시보드 차트 데이터 일괄 조회 시작");

      const [trendData, typeData] = await Promise.all([
        this.getPropertyTrendData(tenantId),
        this.getPropertyTypeData(tenantId)
      ]);

      console.log("📊 대시보드 차트 데이터 일괄 조회 완료");
      
      return {
        trendData,
        typeData
      };

    } catch (error) {
      console.error("❌ 대시보드 차트 데이터 일괄 조회 실패:", error);
      
      // 실패해도 빈 데이터로라도 차트를 표시
      return {
        trendData: this.getDefaultTrendData(),
        typeData: this.getDefaultTypeData()
      };
    }
  }

  /**
   * 기본 트렌드 데이터 (데이터가 없을 때)
   */
  private getDefaultTrendData(): PropertyTrendData[] {
    const data: PropertyTrendData[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('ko-KR', { month: 'long' });
      
      data.push({
        month: monthName,
        등록: 0,
        판매완료: 0,
        거래중: 0,
        총계: 0
      });
    }
    
    return data;
  }

  /**
   * 기본 유형 데이터 (데이터가 없을 때)
   */
  private getDefaultTypeData(): PropertyTypeData[] {
    return [
      { type: "아파트", count: 0, percentage: 0 }
    ];
  }
}

// 싱글톤 인스턴스 생성 및 export
export const chartService = new ChartService();