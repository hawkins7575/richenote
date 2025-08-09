// ============================================================================
// 데이터 가져오기 모달 컴포넌트
// ============================================================================

import React, { useState, useRef } from "react";
import {
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button, Modal, Loading } from "@/components/ui";
import { Property, CreatePropertyData } from "@/types";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  importProperties,
  validateFileSize,
  validateFileFormat,
} from "@/services/dataService";

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (importedProperties: Property[]) => void;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: ImportError[];
  importedProperties: Property[];
}

interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: any;
}

interface ParsedProperty {
  row: number;
  data: CreatePropertyData;
  errors: string[];
}

const REQUIRED_FIELDS = [
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

const FIELD_MAPPING = {
  매물명: "title",
  제목: "title",
  매물유형: "type",
  유형: "type",
  거래유형: "transaction_type",
  거래: "transaction_type",
  주소: "address",
  상세주소: "detailed_address",
  면적: "area",
  전용면적: "area",
  층: "floor",
  해당층: "floor",
  총층수: "total_floors",
  전체층: "total_floors",
  방수: "rooms",
  방: "rooms",
  화장실수: "bathrooms",
  화장실: "bathrooms",
  주차: "parking",
  주차가능: "parking",
  엘리베이터: "elevator",
  엘베: "elevator",
  매매가: "price",
  가격: "price",
  보증금: "deposit",
  월세: "monthly_rent",
  월임대료: "monthly_rent",
  임대인명: "landlord_name",
  임대인: "landlord_name",
  연락처: "landlord_phone",
  전화번호: "landlord_phone",
  퇴실일: "exit_date",
  퇴실날짜: "exit_date",
  설명: "description",
  비고: "description",
};

const PROPERTY_TYPES = [
  "아파트",
  "오피스텔",
  "원룸",
  "빌라",
  "단독주택",
  "상가",
  "사무실",
  "기타",
];
const TRANSACTION_TYPES = ["매매", "전세", "월세", "단기임대"];

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<
    "upload" | "preview" | "importing" | "complete"
  >("upload");
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedProperty[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // 파일 크기 검증
      if (!validateFileSize(selectedFile, 10)) {
        setError("파일 크기는 10MB를 초과할 수 없습니다.");
        return;
      }

      // 파일 형식 검증
      if (!validateFileFormat(selectedFile)) {
        setError("CSV 파일만 지원합니다.");
        return;
      }

      setFile(selectedFile);
      setError(null);
      parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      let rows: string[][];

      if (file.name.endsWith(".csv")) {
        rows = parseCSV(text);
      } else if (file.name.endsWith(".tsv") || file.name.endsWith(".txt")) {
        rows = parseTSV(text);
      } else {
        throw new Error(
          "지원하지 않는 파일 형식입니다. CSV 파일만 지원합니다.",
        );
      }

      if (rows.length < 2) {
        throw new Error(
          "데이터가 부족합니다. 헤더와 최소 1개의 데이터 행이 필요합니다.",
        );
      }

      const headers = rows[0].map((h) => h.trim());
      const dataRows = rows.slice(1);

      console.log("📊 파싱된 헤더:", headers);
      console.log("📊 데이터 행 수:", dataRows.length);

      const parsed = dataRows.map((row, index) =>
        parsePropertyRow(row, headers, index + 2),
      );
      setParsedData(parsed);
      setStep("preview");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "파일 파싱 중 오류가 발생했습니다.";
      setError(message);
      console.error("파일 파싱 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    const lines = text.split(/\r?\n/);

    for (const line of lines) {
      if (line.trim()) {
        // 간단한 CSV 파싱 (따옴표 지원)
        const row: string[] = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];

          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            row.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }

        row.push(current.trim());
        rows.push(row);
      }
    }

    return rows;
  };

  const parseTSV = (text: string): string[][] => {
    return text
      .split(/\r?\n/)
      .filter((line) => line.trim())
      .map((line) => line.split("\t").map((cell) => cell.trim()));
  };

  const parsePropertyRow = (
    row: string[],
    headers: string[],
    rowNumber: number,
  ): ParsedProperty => {
    const errors: string[] = [];
    const data: Partial<CreatePropertyData> = {
      status: "거래중", // 기본값
    };

    // 헤더-데이터 매핑
    headers.forEach((header, index) => {
      const value = row[index]?.trim();
      if (!value) return;

      const mappedField = FIELD_MAPPING[header as keyof typeof FIELD_MAPPING];
      if (!mappedField) return;

      try {
        switch (mappedField) {
          case "type":
            if (PROPERTY_TYPES.includes(value)) {
              data.type = value as any;
            } else {
              errors.push(
                `매물유형 '${value}'는 유효하지 않습니다. (${PROPERTY_TYPES.join(", ")})`,
              );
            }
            break;

          case "transaction_type":
            if (TRANSACTION_TYPES.includes(value)) {
              data.transaction_type = value as any;
            } else {
              errors.push(
                `거래유형 '${value}'는 유효하지 않습니다. (${TRANSACTION_TYPES.join(", ")})`,
              );
            }
            break;

          case "area":
          case "floor":
          case "total_floors":
          case "rooms":
          case "bathrooms":
          case "price":
          case "deposit":
          case "monthly_rent":
            const numValue = parseFloat(value.replace(/[,\s]/g, ""));
            if (!isNaN(numValue) && numValue > 0) {
              (data as any)[mappedField] = numValue;
            } else {
              errors.push(`${header} '${value}'는 유효한 숫자가 아닙니다.`);
            }
            break;

          case "parking":
          case "elevator":
            const boolValue = [
              "true",
              "1",
              "yes",
              "y",
              "있음",
              "가능",
              "o",
              "O",
            ].includes(value.toLowerCase());
            (data as any)[mappedField] = boolValue;
            break;

          case "exit_date":
            if (isValidDate(value)) {
              data.exit_date = formatDate(value);
            } else {
              errors.push(
                `퇴실일 '${value}'는 유효한 날짜 형식이 아닙니다. (YYYY-MM-DD 형식 사용)`,
              );
            }
            break;

          default:
            (data as any)[mappedField] = value;
            break;
        }
      } catch (err) {
        errors.push(`${header} 처리 중 오류: ${err}`);
      }
    });

    // 필수 필드 검증
    REQUIRED_FIELDS.forEach((field) => {
      if (!(data as any)[field]) {
        errors.push(`필수 필드 '${field}'가 누락되었습니다.`);
      }
    });

    return {
      row: rowNumber,
      data: data as CreatePropertyData,
      errors,
    };
  };

  const isValidDate = (dateString: string): boolean => {
    // YYYY-MM-DD, YYYY/MM/DD, MM/DD/YYYY 등 다양한 형식 지원
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleImport = async () => {
    if (tenantLoading) {
      console.log("테넌트 로딩 중입니다.");
      return;
    }

    if (!tenant?.id || !user?.id) {
      setError("인증 정보가 없습니다.");
      return;
    }

    setStep("importing");
    setLoading(true);

    try {
      const validProperties = parsedData
        .filter((p) => p.errors.length === 0)
        .map((p) => p.data);

      const result = await importProperties(
        validProperties,
        tenant.id,
        user.id,
      );

      setImportResult(result);
      setStep("complete");

      if (result.importedProperties.length > 0) {
        onImportComplete(result.importedProperties);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "가져오기 중 오류가 발생했습니다.";
      setError(message);
      console.error("Import error:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    import("@/services/dataService").then(({ generateTemplateCSV }) => {
      const csvContent = generateTemplateCSV();
      const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "매물_가져오기_템플릿.csv";
      link.click();
      URL.revokeObjectURL(link.href);
    });
  };

  const resetModal = () => {
    setStep("upload");
    setFile(null);
    setParsedData([]);
    setImportResult(null);
    setError(null);
    setLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const renderContent = () => {
    switch (step) {
      case "upload":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                매물 데이터 가져오기
              </h3>
              <p className="text-gray-600">
                CSV 파일을 업로드하여 여러 매물을 한번에 등록하세요
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.tsv,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<FileText size={20} />}
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "파일 분석 중..." : "CSV 파일 선택"}
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  CSV 파일만 지원합니다 (최대 10MB)
                </p>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  leftIcon={<Download size={18} />}
                >
                  템플릿 다운로드
                </Button>
              </div>
            </div>

            {file && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">{file.name}</p>
                    <p className="text-sm text-blue-600">
                      크기: {(file.size / 1024).toFixed(1)}KB
                    </p>
                  </div>
                </div>
              </div>
            )}

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

            {loading && (
              <div className="text-center py-4">
                <Loading size="md" text="파일을 분석하고 있습니다..." />
              </div>
            )}
          </div>
        );

      case "preview":
        const validProperties = parsedData.filter((p) => p.errors.length === 0);
        const invalidProperties = parsedData.filter((p) => p.errors.length > 0);

        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                데이터 미리보기
              </h3>
              <p className="text-gray-600">
                {parsedData.length}개 행을 분석했습니다
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {validProperties.length}
                </div>
                <div className="text-sm text-green-800">
                  가져올 수 있는 매물
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {invalidProperties.length}
                </div>
                <div className="text-sm text-red-800">오류가 있는 매물</div>
              </div>
            </div>

            {invalidProperties.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-900">오류 내역:</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                  {invalidProperties.slice(0, 10).map((property, index) => (
                    <div key={index} className="text-sm text-red-800 mb-2">
                      <strong>행 {property.row}:</strong>{" "}
                      {property.errors.join(", ")}
                    </div>
                  ))}
                  {invalidProperties.length > 10 && (
                    <div className="text-sm text-red-600">
                      ...외 {invalidProperties.length - 10}개 오류
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between space-x-3">
              <Button variant="outline" onClick={() => setStep("upload")}>
                다시 선택
              </Button>
              <Button
                onClick={handleImport}
                disabled={
                  validProperties.length === 0 || loading || tenantLoading
                }
                leftIcon={
                  loading ? <Loading size="sm" /> : <Upload size={18} />
                }
              >
                {tenantLoading
                  ? "테넌트 정보 로딩 중..."
                  : `${validProperties.length}개 매물 가져오기`}
              </Button>
            </div>
          </div>
        );

      case "importing":
        return (
          <div className="space-y-6 text-center py-8">
            <Loading size="lg" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                매물을 가져오는 중...
              </h3>
              <p className="text-gray-600">
                잠시만 기다려주세요. 매물 데이터를 처리하고 있습니다.
              </p>
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                가져오기 완료
              </h3>
            </div>

            {importResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {importResult.success}
                    </div>
                    <div className="text-sm text-green-800">성공</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {importResult.failed}
                    </div>
                    <div className="text-sm text-red-800">실패</div>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-900">오류 내역:</h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                      {importResult.errors.slice(0, 10).map((error, index) => (
                        <div key={index} className="text-sm text-red-800 mb-2">
                          <strong>행 {error.row}:</strong> {error.message}
                        </div>
                      ))}
                      {importResult.errors.length > 10 && (
                        <div className="text-sm text-red-600">
                          ...외 {importResult.errors.length - 10}개 오류
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleClose}>완료</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="데이터 가져오기"
      size="lg"
    >
      {renderContent()}
    </Modal>
  );
};
