// ============================================================================
// 매물 관리 커스텀 훅
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getProperties,
  getPropertyStats,
  createProperty,
  updateProperty,
  deleteProperty,
} from "@/services";
import type {
  Property,
  SimplePropertyFilters,
  CreatePropertyData,
  UpdatePropertyData,
} from "@/types";

export const useProperties = (filters?: SimplePropertyFilters) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setError(null);
      setProperties([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 개발환경에서는 모사 데이터 사용 (환경변수가 없을 때만)
      if (!import.meta.env.VITE_SUPABASE_URL) {
        console.log("🔧 개발환경: 모사 매물 데이터 사용");
        const mockProperties: Property[] = [
          {
            id: "prop-1",
            tenant_id: user.id,
            created_by: user.id,
            title: "강남구 신축 아파트",
            type: "아파트" as any,
            transaction_type: "매매" as any,
            status: "active" as any,
            price: 800000000,
            address: "서울시 강남구 역삼동",
            area: 84,
            floor: 15,
            total_floors: 25,
            rooms: 3,
            bathrooms: 2,
            description: "신축 아파트입니다.",
            parking: true,
            elevator: true,
            images: [],
            view_count: 0,
            options: [],
            is_favorite: false,
            inquiry_count: 0,
            is_featured: false,
            is_urgent: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "prop-2", 
            tenant_id: user.id,
            created_by: user.id,
            title: "서초구 오피스텔",
            type: "오피스텔" as any,
            transaction_type: "전세" as any,
            status: "active" as any,
            price: 300000000,
            address: "서울시 서초구 서초동",
            area: 42,
            floor: 8,
            total_floors: 15,
            rooms: 1,
            bathrooms: 1,
            description: "깨끗한 오피스텔입니다.",
            parking: true,
            elevator: true,
            images: [],
            view_count: 0,
            options: [],
            is_favorite: false,
            inquiry_count: 0,
            is_featured: false,
            is_urgent: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ];
        
        setProperties(mockProperties);
        setLoading(false);
        return;
      }

      // 프로덕션 환경에서만 실제 API 호출
      const data = await getProperties(user.id, filters);
      setProperties((data as Property[]) || []);
    } catch (err) {
      console.error("❌ 데이터 로딩 실패:", err);
      setError("매물을 불러오는 중 오류가 발생했습니다.");
      // 에러 발생시 빈 배열로 설정
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const createNewProperty = useCallback(
    async (propertyData: CreatePropertyData) => {
      if (!user?.id) {
        throw new Error("사용자 인증 정보가 없습니다. 다시 로그인 해주세요.");
      }

      try {
        const newProperty = await createProperty(
          propertyData,
          user.id,
          user.id,
        );

        setProperties((prev) => [newProperty, ...prev]);
        return newProperty;
      } catch (err) {
        console.error("❌ useProperties.createNewProperty 실패:", err);
        console.error("❌ 에러 타입:", typeof err);
        console.error(
          "❌ 에러 상세:",
          err instanceof Error
            ? {
                name: err.name,
                message: err.message,
                stack: err.stack,
              }
            : err,
        );

        // 더 구체적인 에러 메시지 제공
        if (err instanceof Error) {
          throw err; // 원본 에러 메시지 사용
        } else {
          throw new Error("매물 생성 중 알 수 없는 오류가 발생했습니다.");
        }
      }
    },
    [user?.id],
  );

  const updateExistingProperty = useCallback(
    async (propertyId: string, propertyData: UpdatePropertyData) => {
      if (!user?.id) {
        throw new Error("사용자 정보가 없습니다.");
      }

      try {
        const updatedProperty = await updateProperty(
          propertyId,
          propertyData,
          user.id,
        );
        setProperties((prev) =>
          prev
            .map((p) => (p.id === propertyId ? updatedProperty : p))
            .filter((p): p is Property => p !== null),
        );
        return updatedProperty;
      } catch (err) {
        console.error("Error updating property:", err);
        throw new Error("매물 수정 중 오류가 발생했습니다.");
      }
    },
    [user?.id],
  );

  const deleteExistingProperty = useCallback(
    async (propertyId: string) => {
      if (!user?.id) {
        throw new Error("사용자 정보가 없습니다.");
      }

      try {
        await deleteProperty(propertyId, user.id);
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      } catch (err) {
        console.error("Error deleting property:", err);
        throw new Error("매물 삭제 중 오류가 발생했습니다.");
      }
    },
    [user?.id],
  );

  // 매물 상태 업데이트 기능 삭제됨

  return {
    properties,
    loading,
    error,
    refreshProperties: fetchProperties,
    createProperty: createNewProperty,
    updateProperty: updateExistingProperty,
    deleteProperty: deleteExistingProperty,
    // updatePropertyStatus: 매물 상태 업데이트 기능 삭제됨
  };
};

export const usePropertyStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);
        
        // 개발환경에서는 모사 데이터 사용 (환경변수가 없을 때만)
        if (!import.meta.env.VITE_SUPABASE_URL) {
          console.log("🔧 개발환경: 모사 통계 데이터 사용");
          const mockStats = {
            total: 2,
            active: 2,
            reserved: 0,
            sold: 0,
            this_month: 2,
            total_users: 1,
            active_users: 1,
            by_transaction_type: {
              sale: 1,
              jeonse: 1,
              monthly: 0,
            },
          };
          setStats(mockStats);
          setLoading(false);
          return;
        }
        
        const data = await getPropertyStats(user.id);
        setStats(data);
      } catch (err) {
        console.error("Error fetching property stats:", err);
        // 오류 발생시 모사 데이터로 fallback
        console.log("🔧 오류로 인한 모사 통계 데이터 사용");
        const mockStats = {
          total: 2,
          active: 2,
          reserved: 0,
          sold: 0,
          this_month: 2,
          total_users: 1,
          active_users: 1,
          by_transaction_type: {
            sale: 1,
            jeonse: 1,
            monthly: 0,
          },
        };
        setStats(mockStats);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  return { stats, loading, error };
};
