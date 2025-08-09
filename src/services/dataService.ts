// ============================================================================
// 데이터 가져오기/내보내기 서비스
// ============================================================================

import { supabase } from "./supabase";
import { Property, CreatePropertyData, PropertyStatus } from "@/types";

export interface ImportResult {
  success: number;
  failed: number;
  errors: ImportError[];
  importedProperties: Property[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: CreatePropertyData;
}

export interface ExportOptions {
  format: "csv" | "excel" | "json";
  includeFields: string[];
  filters?: {
    dateRange?: "all" | "thisMonth" | "lastMonth" | "custom";
    customDateFrom?: string;
    customDateTo?: string;
    propertyStatus?: "all" | PropertyStatus;
    propertyType?: string;
  };
}

/**
 * 매물 데이터 가져오기
 */
export const importProperties = async (
  properties: CreatePropertyData[],
  tenantId: string,
  createdBy: string,
): Promise<ImportResult> => {
  const errors: ImportError[] = [];
  const importedProperties: Property[] = [];

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];

    try {
      // 데이터 검증
      const validationError = validatePropertyData(property, i + 1);
      if (validationError) {
        errors.push(validationError);
        continue;
      }

      // Supabase에 매물 데이터 삽입
      const { data, error } = await supabase
        .from("properties")
        .insert({
          tenant_id: tenantId,
          created_by: createdBy,
          ...property,
          view_count: 0,
          inquiry_count: 0,
          is_featured: false,
          is_urgent: false,
          is_favorite: false,
        })
        .select()
        .single();

      if (error) {
        errors.push({
          row: i + 1,
          message: `데이터베이스 오류: ${error.message}`,
          data: property,
        });
        continue;
      }

      if (data) {
        importedProperties.push(data as Property);
      }
    } catch (err) {
      errors.push({
        row: i + 1,
        message: `처리 중 오류: ${err instanceof Error ? err.message : "알 수 없는 오류"}`,
        data: property,
      });
    }
  }

  return {
    success: importedProperties.length,
    failed: properties.length - importedProperties.length,
    errors,
    importedProperties,
  };
};

/**
 * 매물 데이터 내보내기
 */
export const exportProperties = async (
  tenantId: string,
  options: ExportOptions,
): Promise<Property[]> => {
  console.log("🔍 내보내기 요청:", { tenantId, options });

  let query = supabase.from("properties").select("*").eq("tenant_id", tenantId);

  // 먼저 전체 매물 수 확인
  const { data: allProperties } = await supabase
    .from("properties")
    .select("*")
    .eq("tenant_id", tenantId);

  console.log("📊 전체 매물 수:", allProperties?.length || 0);
  console.log("📊 전체 매물 샘플:", allProperties?.slice(0, 3));

  // 필터 적용
  if (options.filters) {
    const { filters } = options;
    console.log("🔧 적용할 필터:", filters);

    // 매물 상태 필터
    if (filters.propertyStatus && filters.propertyStatus !== "all") {
      console.log("🏷️ 상태 필터 적용:", filters.propertyStatus);
      query = query.eq("status", filters.propertyStatus);
    }

    // 매물 유형 필터
    if (filters.propertyType && filters.propertyType !== "all") {
      console.log("🏠 유형 필터 적용:", filters.propertyType);
      query = query.eq("type", filters.propertyType);
    }

    // 날짜 범위 필터
    if (filters.dateRange && filters.dateRange !== "all") {
      const now = new Date();
      console.log("📅 날짜 필터 적용:", filters.dateRange);

      switch (filters.dateRange) {
        case "thisMonth":
          const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          console.log("📅 이번 달 시작:", thisMonthStart.toISOString());
          query = query.gte("created_at", thisMonthStart.toISOString());
          break;

        case "lastMonth":
          const lastMonthStart = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1,
          );
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          console.log("📅 지난 달:", lastMonthStart.toISOString(), "~", lastMonthEnd.toISOString());
          query = query
            .gte("created_at", lastMonthStart.toISOString())
            .lte("created_at", lastMonthEnd.toISOString());
          break;

        case "custom":
          if (filters.customDateFrom) {
            console.log("📅 사용자 지정 시작:", filters.customDateFrom);
            query = query.gte("created_at", filters.customDateFrom);
          }
          if (filters.customDateTo) {
            const endDate = filters.customDateTo + "T23:59:59";
            console.log("📅 사용자 지정 끝:", endDate);
            query = query.lte("created_at", endDate);
          }
          break;
      }
    }
  }

  // 생성일 기준 내림차순 정렬
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  console.log("📊 필터링된 매물 수:", data?.length || 0);
  console.log("📊 필터링된 매물 샘플:", data?.slice(0, 3));

  if (error) {
    console.error("❌ 데이터베이스 오류:", error);
    throw new Error(`데이터 내보내기 실패: ${error.message}`);
  }

  return data || [];
};

/**
 * CSV 형식으로 데이터 변환
 */
export const formatAsCSV = (
  properties: Property[],
  includeFields: string[],
): string => {
  const fieldLabels: Record<string, string> = {
    title: "매물명",
    type: "매물유형",
    transaction_type: "거래유형",
    status: "매물상태",
    address: "주소",
    detailed_address: "상세주소",
    area: "면적(m²)",
    floor: "층",
    total_floors: "총층수",
    rooms: "방수",
    bathrooms: "화장실수",
    parking: "주차가능",
    elevator: "엘리베이터",
    price: "매매가(만원)",
    deposit: "보증금(만원)",
    monthly_rent: "월세(만원)",
    maintenance_fee: "관리비(만원)",
    landlord_name: "임대인명",
    landlord_phone: "임대인 연락처",
    landlord_email: "임대인 이메일",
    exit_date: "퇴실날짜",
    available_from: "입주가능일",
    description: "설명",
    view_count: "조회수",
    inquiry_count: "문의수",
    created_at: "등록일",
    updated_at: "수정일",
  };

  // 헤더 생성
  const headers = includeFields.map((field) => fieldLabels[field] || field);

  // 데이터 행 생성
  const rows = properties.map((property) => {
    return includeFields.map((field) => {
      const value = formatFieldValue(property, field);
      // CSV에서 특수문자 이스케이프
      return `"${String(value).replace(/"/g, '""')}"`;
    });
  });

  // CSV 문자열 생성
  return [headers, ...rows].map((row) => row.join(",")).join("\n");
};

/**
 * JSON 형식으로 데이터 변환
 */
export const formatAsJSON = (
  properties: Property[],
  includeFields: string[],
): string => {
  const fieldLabels: Record<string, string> = {
    title: "매물명",
    type: "매물유형",
    transaction_type: "거래유형",
    status: "매물상태",
    address: "주소",
    detailed_address: "상세주소",
    area: "면적",
    floor: "층",
    total_floors: "총층수",
    rooms: "방수",
    bathrooms: "화장실수",
    parking: "주차가능",
    elevator: "엘리베이터",
    price: "매매가",
    deposit: "보증금",
    monthly_rent: "월세",
    maintenance_fee: "관리비",
    landlord_name: "임대인명",
    landlord_phone: "임대인 연락처",
    landlord_email: "임대인 이메일",
    exit_date: "퇴실날짜",
    available_from: "입주가능일",
    description: "설명",
    view_count: "조회수",
    inquiry_count: "문의수",
    created_at: "등록일",
    updated_at: "수정일",
  };

  interface ExportItem {
    [key: string]: string | number | boolean | Date;
  }

  const exportData = properties.map((property) => {
    const exportItem: ExportItem = {};
    includeFields.forEach((field) => {
      const label = fieldLabels[field] || field;
      exportItem[label] = formatFieldValue(property, field);
    });
    return exportItem;
  });

  return JSON.stringify(
    {
      exportDate: new Date().toISOString(),
      totalRecords: exportData.length,
      data: exportData,
    },
    null,
    2,
  );
};

/**
 * 필드 값 포맷팅
 */
const formatFieldValue = (
  property: Property,
  fieldId: string,
): string | number | boolean => {
  const value = property[fieldId as keyof Property];

  if (value === null || value === undefined) {
    return "";
  }

  switch (fieldId) {
    case "parking":
    case "elevator":
      return typeof value === "boolean" ? (value ? "있음" : "없음") : "";

    case "price":
    case "deposit":
    case "monthly_rent":
    case "maintenance_fee":
      return typeof value === "number" ? value.toLocaleString() : "";

    case "created_at":
    case "updated_at":
    case "exit_date":
    case "available_from":
      return typeof value === "string"
        ? new Date(value).toLocaleDateString("ko-KR")
        : "";

    default:
      // 복잡한 타입(배열, 객체)은 문자열로 변환
      if (typeof value === "object" && value !== null) {
        return Array.isArray(value) ? value.join(", ") : JSON.stringify(value);
      }
      return typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
        ? value
        : String(value);
  }
};

/**
 * 매물 데이터 검증
 */
const validatePropertyData = (
  data: CreatePropertyData,
  row: number,
): ImportError | null => {
  const requiredFields = [
    "title",
    "type",
    "transaction_type",
    "address",
    "area",
    "floor",
    "total_floors",
    "rooms",
    "bathrooms",
  ];

  for (const field of requiredFields) {
    const value = data[field as keyof CreatePropertyData];
    if (value === undefined || value === null || value === "") {
      return {
        row,
        field,
        message: `필수 필드 '${field}'가 누락되었습니다.`,
      };
    }
  }

  // 숫자 필드 검증
  const numericFields: (keyof CreatePropertyData)[] = [
    "area",
    "floor",
    "total_floors",
    "rooms",
    "bathrooms",
    "price",
    "deposit",
    "monthly_rent",
  ];
  for (const field of numericFields) {
    const value = data[field];
    if (value !== undefined && value !== null && value !== "") {
      if (typeof value !== "number" || isNaN(value) || value < 0) {
        return {
          row,
          field,
          message: `'${field}'는 유효한 양수여야 합니다.`,
        };
      }
    }
  }

  // 매물 유형 검증
  const validPropertyTypes = [
    "아파트",
    "오피스텔",
    "원룸",
    "빌라",
    "단독주택",
    "상가",
    "사무실",
    "기타",
  ];
  if (!validPropertyTypes.includes(data.type)) {
    return {
      row,
      field: "type",
      message: `매물 유형은 다음 중 하나여야 합니다: ${validPropertyTypes.join(", ")}`,
    };
  }

  // 거래 유형 검증
  const validTransactionTypes = ["매매", "전세", "월세", "단기임대"];
  if (!validTransactionTypes.includes(data.transaction_type)) {
    return {
      row,
      field: "transaction_type",
      message: `거래 유형은 다음 중 하나여야 합니다: ${validTransactionTypes.join(", ")}`,
    };
  }

  // 날짜 형식 검증
  if (data.exit_date) {
    const date = new Date(data.exit_date);
    if (isNaN(date.getTime())) {
      return {
        row,
        field: "exit_date",
        message: `퇴실날짜는 유효한 날짜 형식이어야 합니다. (예: 2024-12-31)`,
      };
    }
  }

  return null;
};

/**
 * 파일 크기 검증
 */
export const validateFileSize = (
  file: File,
  maxSizeMB: number = 10,
): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * 파일 형식 검증
 */
export const validateFileFormat = (file: File): boolean => {
  const allowedTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "text/tab-separated-values",
  ];
  const allowedExtensions = [".csv", ".tsv", ".txt"];

  return (
    allowedTypes.includes(file.type) ||
    allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
  );
};

/**
 * 템플릿 CSV 생성
 */
export const generateTemplateCSV = (): string => {
  const headers = [
    "매물명",
    "매물유형",
    "거래유형",
    "주소",
    "상세주소",
    "면적",
    "층",
    "총층수",
    "방수",
    "화장실수",
    "주차",
    "엘리베이터",
    "매매가",
    "보증금",
    "월세",
    "임대인명",
    "연락처",
    "퇴실일",
    "설명",
  ];

  const sampleData = [
    "강남 신축 아파트",
    "아파트",
    "전세",
    "서울시 강남구 역삼동",
    "123-45",
    "84.5",
    "15",
    "25",
    "3",
    "2",
    "있음",
    "있음",
    "",
    "50000",
    "",
    "홍길동",
    "010-1234-5678",
    "2024-12-31",
    "역세권 3분거리 신축아파트",
  ];

  return [headers, sampleData]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
};
