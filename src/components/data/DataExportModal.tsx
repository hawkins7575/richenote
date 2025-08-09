// ============================================================================
// 데이터 내보내기 모달 컴포넌트
// ============================================================================

import React, { useState } from "react";
import { Download, FileText, AlertCircle } from "lucide-react";
import { Button, Modal, Loading, Select } from "@/components/ui";
import { Property } from "@/types";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProperties } from "@/hooks/useProperties";
import {
  exportProperties,
  formatAsCSV,
  formatAsJSON,
  ExportOptions as ServiceExportOptions,
} from "@/services/dataService";

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExportOptions {
  format: "csv" | "excel" | "json";
  includeFields: string[];
  dateRange: "all" | "thisMonth" | "lastMonth" | "custom";
  customDateFrom?: string;
  customDateTo?: string;
  propertyStatus: "all" | "거래중" | "거래완료";
  propertyType: "all" | "아파트" | "오피스텔" | "원룸" | "빌라" | "기타";
}

const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: "csv",
  includeFields: [
    "title",
    "type",
    "transaction_type",
    "status",
    "address",
    "area",
    "floor",
    "total_floors",
    "rooms",
    "bathrooms",
    "parking",
    "elevator",
    "price",
    "deposit",
    "monthly_rent",
    "landlord_name",
    "landlord_phone",
    "exit_date",
    "created_at",
  ],
  dateRange: "all",
  propertyStatus: "all",
  propertyType: "all",
};

const AVAILABLE_FIELDS = [
  { id: "title", label: "매물명", required: true },
  { id: "type", label: "매물유형", required: true },
  { id: "transaction_type", label: "거래유형", required: true },
  { id: "status", label: "매물상태", required: false },
  { id: "address", label: "주소", required: true },
  { id: "detailed_address", label: "상세주소", required: false },
  { id: "area", label: "면적(m²)", required: true },
  { id: "floor", label: "층", required: true },
  { id: "total_floors", label: "총층수", required: true },
  { id: "rooms", label: "방수", required: true },
  { id: "bathrooms", label: "화장실수", required: true },
  { id: "parking", label: "주차가능", required: false },
  { id: "elevator", label: "엘리베이터", required: false },
  { id: "price", label: "매매가(만원)", required: false },
  { id: "deposit", label: "보증금(만원)", required: false },
  { id: "monthly_rent", label: "월세(만원)", required: false },
  { id: "maintenance_fee", label: "관리비(만원)", required: false },
  { id: "landlord_name", label: "임대인명", required: false },
  { id: "landlord_phone", label: "임대인 연락처", required: false },
  { id: "landlord_email", label: "임대인 이메일", required: false },
  { id: "exit_date", label: "퇴실날짜", required: false },
  { id: "available_from", label: "입주가능일", required: false },
  { id: "description", label: "설명", required: false },
  { id: "view_count", label: "조회수", required: false },
  { id: "inquiry_count", label: "문의수", required: false },
  { id: "created_at", label: "등록일", required: false },
  { id: "updated_at", label: "수정일", required: false },
];

export const DataExportModal: React.FC<DataExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();

  // 기본값으로 user.id를 tenant.id로 사용
  let tenant = user?.id ? { id: user.id, name: "PropertyDesk" } : null;
  let tenantLoading = false;

  // useTenant을 안전하게 호출해서 실제 테넌트 정보가 있으면 사용
  try {
    const tenantContext = useTenant();
    if (tenantContext?.tenant?.id) {
      tenant = tenantContext.tenant;
      tenantLoading = tenantContext?.isLoading || false;
    }
  } catch (error) {
    console.log("TenantContext 오류, 사용자 ID를 테넌트 ID로 사용:", error);
    // 이미 위에서 user.id를 설정했으므로 추가 처리 불필요
  }

  const { properties } = useProperties();
  const [exportOptions, setExportOptions] = useState<ExportOptions>(
    DEFAULT_EXPORT_OPTIONS,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 테넌트 정보 디버깅
  console.log("DataExportModal - 테넌트 정보:", {
    tenant: tenant?.id,
    tenantName: tenant?.name,
    tenantLoading,
    isOpen,
    userId: user?.id,
  });

  const updateExportOptions = (updates: Partial<ExportOptions>) => {
    setExportOptions((prev) => ({ ...prev, ...updates }));
  };

  const getFilteredProperties = (): Property[] => {
    // 현재 메모리에 있는 매물 데이터로 미리보기 제공
    // 실제 내보내기는 handleExport에서 서비스를 통해 처리
    if (!properties) return [];

    return properties.filter((property) => {
      // 매물 상태 필터
      if (
        exportOptions.propertyStatus !== "all" &&
        property.status !== exportOptions.propertyStatus
      ) {
        return false;
      }

      // 매물 유형 필터
      if (
        exportOptions.propertyType !== "all" &&
        property.type !== exportOptions.propertyType
      ) {
        return false;
      }

      // 날짜 범위 필터
      if (exportOptions.dateRange !== "all") {
        const createdAt = new Date(property.created_at);
        const today = new Date();

        switch (exportOptions.dateRange) {
          case "thisMonth":
            if (
              createdAt.getMonth() !== today.getMonth() ||
              createdAt.getFullYear() !== today.getFullYear()
            ) {
              return false;
            }
            break;

          case "lastMonth":
            const lastMonth = new Date(
              today.getFullYear(),
              today.getMonth() - 1,
            );
            if (
              createdAt.getMonth() !== lastMonth.getMonth() ||
              createdAt.getFullYear() !== lastMonth.getFullYear()
            ) {
              return false;
            }
            break;

          case "custom":
            if (
              exportOptions.customDateFrom &&
              createdAt < new Date(exportOptions.customDateFrom)
            ) {
              return false;
            }
            if (
              exportOptions.customDateTo &&
              createdAt > new Date(exportOptions.customDateTo + "T23:59:59")
            ) {
              return false;
            }
            break;
        }
      }

      return true;
    });
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string,
  ) => {
    const blob = new Blob(["\ufeff" + content], {
      type: `${mimeType};charset=utf-8;`,
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleExport = async () => {
    // 테넌트 로딩 중이면 대기
    if (tenantLoading) {
      console.log("테넌트 로딩 중입니다.");
      return;
    }

    if (!tenant?.id) {
      console.log("테넌트 정보 확인:", { tenant });
      setError(
        "테넌트 정보가 없습니다. 페이지를 새로고침 후 다시 시도해주세요.",
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("내보내기 시작:", {
        tenant: tenant?.id,
        options: exportOptions,
      });

      // 현재 메모리에 있는 매물 데이터를 기반으로 내보내기
      // (useProperties에서 가져온 데이터와 동일한 소스)
      const filteredProperties = getFilteredProperties();
      console.log("내보낼 매물 수:", filteredProperties.length);

      if (filteredProperties.length === 0) {
        setError(
          "선택한 조건에 맞는 매물이 없습니다. 필터 조건을 확인해보세요.",
        );
        return;
      }

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:-]/g, "")
        .replace("T", "_");
      let filename: string;
      let content: string;
      let mimeType: string;

      switch (exportOptions.format) {
        case "csv":
        case "excel":
          content = formatAsCSV(
            filteredProperties,
            exportOptions.includeFields,
          );
          filename = `매물데이터_${timestamp}.csv`;
          mimeType = "text/csv";
          break;

        case "json":
          content = formatAsJSON(
            filteredProperties,
            exportOptions.includeFields,
          );
          filename = `매물데이터_${timestamp}.json`;
          mimeType = "application/json";
          break;

        default:
          throw new Error("지원하지 않는 파일 형식입니다.");
      }

      downloadFile(content, filename, mimeType);

      // 성공 후 모달 닫기
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "내보내기 중 오류가 발생했습니다.";
      setError(message);
      console.error("Export error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = getFilteredProperties();

  // 테넌트 로딩 중일 때 로딩 화면 표시
  if (tenantLoading) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="데이터 내보내기"
        size="lg"
      >
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loading size="lg" />
          <p className="text-gray-600">테넌트 정보를 불러오는 중...</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="데이터 내보내기" size="lg">
      <div className="space-y-6">
        <div className="text-center">
          <Download className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            매물 데이터 내보내기
          </h3>
          <p className="text-gray-600">
            필요한 매물 정보를 선택하여 파일로 내보내세요
          </p>
        </div>

        <div className="space-y-6">
          {/* 파일 형식 선택 */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              파일 형식
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "csv", label: "CSV", desc: "엑셀에서 열기 가능" },
                { value: "json", label: "JSON", desc: "프로그래밍용" },
                { value: "excel", label: "Excel", desc: "마이크로소프트 엑셀" },
              ].map((format) => (
                <button
                  key={format.value}
                  onClick={() =>
                    updateExportOptions({ format: format.value as any })
                  }
                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                    exportOptions.format === format.value
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium">{format.label}</div>
                  <div className="text-xs text-gray-500">{format.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 날짜 범위 선택 */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              날짜 범위
            </label>
            <Select
              value={exportOptions.dateRange}
              onChange={(e) =>
                updateExportOptions({ dateRange: e.target.value as any })
              }
              options={[
                { value: "all", label: "전체 기간" },
                { value: "thisMonth", label: "이번 달" },
                { value: "lastMonth", label: "지난 달" },
                { value: "custom", label: "사용자 지정" },
              ]}
            />

            {exportOptions.dateRange === "custom" && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={exportOptions.customDateFrom || ""}
                    onChange={(e) =>
                      updateExportOptions({ customDateFrom: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    종료일
                  </label>
                  <input
                    type="date"
                    value={exportOptions.customDateTo || ""}
                    onChange={(e) =>
                      updateExportOptions({ customDateTo: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 필터 옵션 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                매물 상태
              </label>
              <Select
                value={exportOptions.propertyStatus}
                onChange={(e) =>
                  updateExportOptions({ propertyStatus: e.target.value as any })
                }
                options={[
                  { value: "all", label: "전체" },
                  { value: "거래중", label: "거래중" },
                  { value: "거래완료", label: "거래완료" },
                ]}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                매물 유형
              </label>
              <Select
                value={exportOptions.propertyType}
                onChange={(e) =>
                  updateExportOptions({ propertyType: e.target.value as any })
                }
                options={[
                  { value: "all", label: "전체" },
                  { value: "아파트", label: "아파트" },
                  { value: "오피스텔", label: "오피스텔" },
                  { value: "원룸", label: "원룸" },
                  { value: "빌라", label: "빌라" },
                  { value: "기타", label: "기타" },
                ]}
              />
            </div>
          </div>

          {/* 포함할 필드 선택 */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              포함할 정보 선택
            </label>
            <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_FIELDS.map((field) => (
                  <label
                    key={field.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={exportOptions.includeFields.includes(field.id)}
                      disabled={field.required}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateExportOptions({
                            includeFields: [
                              ...exportOptions.includeFields,
                              field.id,
                            ],
                          });
                        } else {
                          updateExportOptions({
                            includeFields: exportOptions.includeFields.filter(
                              (id) => id !== field.id,
                            ),
                          });
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span
                      className={`text-sm ${field.required ? "font-medium text-gray-900" : "text-gray-700"}`}
                    >
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              * 표시는 필수 필드로 항상 포함됩니다
            </p>
          </div>

          {/* 미리보기 정보 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">내보내기 미리보기</p>
                <div className="text-sm text-blue-800 mt-1 space-y-1">
                  <p>• 총 매물 수: {filteredProperties.length}개</p>
                  <p>• 선택된 필드: {exportOptions.includeFields.length}개</p>
                  <p>• 파일 형식: {exportOptions.format.toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">오류</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between space-x-3">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            onClick={handleExport}
            disabled={
              loading ||
              tenantLoading ||
              !tenant?.id ||
              filteredProperties.length === 0
            }
            leftIcon={loading ? <Loading size="sm" /> : <Download size={18} />}
          >
            {loading
              ? "내보내는 중..."
              : tenantLoading
                ? "테넌트 정보 로딩 중..."
                : !tenant?.id
                  ? "테넌트 정보 없음"
                  : `${filteredProperties.length}개 매물 내보내기`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
