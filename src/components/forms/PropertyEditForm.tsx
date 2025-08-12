// ============================================================================
// 매물 수정 폼 컴포넌트
// ============================================================================

import React, { useState, useCallback, useEffect } from "react";
import { X, Save } from "lucide-react";
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Modal,
} from "@/components/ui";
import type {
  Property,
  PropertyType,
  TransactionType,
  PropertyStatus,
  UpdatePropertyData,
} from "@/types";

interface PropertyEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdatePropertyData) => Promise<void>;
  property: Property;
  loading?: boolean;
}

const PROPERTY_TYPES: PropertyType[] = [
  "아파트",
  "오피스텔",
  "원룸",
  "빌라",
  "단독주택",
  "상가",
  "사무실",
  "기타",
];

const TRANSACTION_TYPES: TransactionType[] = [
  "매매",
  "전세",
  "월세",
  "단기임대",
];

const PROPERTY_STATUS: PropertyStatus[] = ["거래중", "거래완료"];

export const PropertyEditForm: React.FC<PropertyEditFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  property,
  loading = false,
}) => {
  const [formData, setFormData] = useState<UpdatePropertyData>({});
  const [errors, setErrors] = useState<
    Partial<Record<keyof UpdatePropertyData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVacant, setIsVacant] = useState(false); // 공실 상태 관리

  // 프로퍼티가 변경될 때 폼 데이터 초기화
  useEffect(() => {
    if (property && isOpen) {
      setFormData({
        title: property.title,
        type: property.type,
        transaction_type: property.transaction_type,
        status: property.status,
        address: property.address,
        detailed_address: property.detailed_address || "",
        area: property.area,
        floor: property.floor,
        total_floors: property.total_floors,
        rooms: property.rooms,
        bathrooms: property.bathrooms,
        parking: property.parking,
        elevator: property.elevator,
        price: property.price,
        deposit: property.deposit,
        monthly_rent: property.monthly_rent,
        description: property.description || "",
        landlord_name: property.landlord_name || "",
        landlord_phone: property.landlord_phone || "",
        exit_date: property.exit_date || "",
      });
      // 공실 상태 초기화 (퇴실날짜가 없으면 공실로 간주)
      setIsVacant(!property.exit_date);
      setErrors({});
    }
  }, [property, isOpen]);

  // 공실 체크박스 핸들러
  const handleVacantChange = useCallback((checked: boolean) => {
    setIsVacant(checked);
    if (checked) {
      // 공실 체크 시 퇴실날짜 초기화
      handleInputChange("exit_date", "");
    }
  }, []);

  const handleInputChange = useCallback(
    (field: keyof UpdatePropertyData, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // 퇴실날짜가 입력되면 공실 체크 해제
      if (field === "exit_date" && value) {
        setIsVacant(false);
      }

      // 에러 제거
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    },
    [errors],
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdatePropertyData, string>> = {};

    if (!formData.title?.trim()) {
      newErrors.title = "제목을 입력해주세요";
    }

    if (!formData.address?.trim()) {
      newErrors.address = "주소를 입력해주세요";
    }

    if (!formData.area || formData.area <= 0) {
      newErrors.area = "면적은 0보다 커야 합니다";
    }

    // 층수가 입력된 경우에만 검증
    if (formData.floor && formData.floor < 1) {
      newErrors.floor = "층수는 1층 이상이어야 합니다";
    }

    // 전체 층수가 입력된 경우에만 검증
    if (
      formData.total_floors &&
      formData.floor &&
      formData.total_floors < formData.floor
    ) {
      newErrors.total_floors = "전체 층수는 해당 층수보다 크거나 같아야 합니다";
    }

    if (!formData.rooms || formData.rooms < 1) {
      newErrors.rooms = "방 개수는 1개 이상이어야 합니다";
    }

    if (!formData.bathrooms || formData.bathrooms < 1) {
      newErrors.bathrooms = "화장실 개수는 1개 이상이어야 합니다";
    }

    // 거래 유형별 가격 검증
    if (
      formData.transaction_type === "매매" &&
      (!formData.price || formData.price <= 0)
    ) {
      newErrors.price = "매매가를 입력해주세요";
    }

    if (
      formData.transaction_type === "전세" &&
      (!formData.deposit || formData.deposit <= 0)
    ) {
      newErrors.deposit = "전세금을 입력해주세요";
    }

    if (formData.transaction_type === "월세") {
      if (!formData.deposit || formData.deposit <= 0) {
        newErrors.deposit = "보증금을 입력해주세요";
      }
      if (!formData.monthly_rent || formData.monthly_rent <= 0) {
        newErrors.monthly_rent = "월세를 입력해주세요";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) return;

    // 개발 환경에서 수정 데이터 확인
    if (import.meta.env.DEV) {
      console.log("🔄 매물 수정 제출:", {
        매물ID: property.id,
        제목: formData.title,
        전체데이터: formData,
      });
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      alert("✅ 매물이 성공적으로 수정되었습니다!");
      onClose();
    } catch (error) {
      console.error("매물 수정 실패:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      alert(`❌ 매물 수정 실패: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>매물 정보 수정</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-8 w-8"
            >
              <X size={16} />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">기본 정보</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="매물 제목"
                    value={formData.title || ""}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    error={errors.title}
                    placeholder="예: 강남구 신사동 럭셔리 아파트"
                    required
                  />
                </div>

                <Select
                  label="매물 유형"
                  value={formData.type || ""}
                  onChange={(e) =>
                    handleInputChange("type", e.target.value as PropertyType)
                  }
                  options={PROPERTY_TYPES.map((type) => ({
                    value: type,
                    label: type,
                  }))}
                  required
                />

                <Select
                  label="거래 유형"
                  value={formData.transaction_type || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "transaction_type",
                      e.target.value as TransactionType,
                    )
                  }
                  options={TRANSACTION_TYPES.map((type) => ({
                    value: type,
                    label: type,
                  }))}
                  required
                />

                <Select
                  label="매물 상태"
                  value={formData.status || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "status",
                      e.target.value as PropertyStatus,
                    )
                  }
                  options={PROPERTY_STATUS.map((status) => ({
                    value: status,
                    label: status,
                  }))}
                  required
                />
              </div>
            </div>

            {/* 위치 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">위치 정보</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="주소"
                    value={formData.address || ""}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    error={errors.address}
                    placeholder="예: 서울시 강남구 신사동 123-45"
                    required
                  />
                </div>

                <Input
                  label="상세 주소"
                  value={formData.detailed_address || ""}
                  onChange={(e) =>
                    handleInputChange("detailed_address", e.target.value)
                  }
                  placeholder="예: 123동 456호"
                />
              </div>
            </div>

            {/* 매물 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">매물 정보</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input
                  label="면적 (m²)"
                  type="number"
                  value={formData.area || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      handleInputChange("area", 0);
                    } else {
                      const numValue = Number(value);
                      handleInputChange("area", isNaN(numValue) ? 0 : numValue);
                    }
                  }}
                  error={errors.area}
                  placeholder="85.0"
                  min="0"
                  step="0.1"
                  required
                />

                <Input
                  label="층수"
                  type="number"
                  value={formData.floor || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      handleInputChange("floor", undefined);
                    } else {
                      const numValue = Math.floor(Number(value));
                      handleInputChange("floor", isNaN(numValue) ? undefined : numValue);
                    }
                  }}
                  error={errors.floor}
                  placeholder="15"
                  min="1"
                  required
                />

                <Input
                  label="전체 층수"
                  type="number"
                  value={formData.total_floors || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "total_floors",
                      (() => {
                        const value = e.target.value;
                        if (value === "") return undefined;
                        const numValue = Math.floor(Number(value));
                        return isNaN(numValue) ? undefined : numValue;
                      })()
                    )
                  }
                  error={errors.total_floors}
                  placeholder="25"
                  min="1"
                  required
                />

                <Input
                  label="방 개수"
                  type="number"
                  value={formData.rooms || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = Math.floor(Number(value));
                    handleInputChange("rooms", isNaN(numValue) ? 1 : numValue);
                  }}
                  error={errors.rooms}
                  placeholder="3"
                  min="1"
                  required
                />

                <Input
                  label="화장실 개수"
                  type="number"
                  value={formData.bathrooms || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "bathrooms",
                      (() => {
                        const value = e.target.value;
                        if (value === "") return 1;
                        const numValue = Math.floor(Number(value));
                        return isNaN(numValue) ? 1 : numValue;
                      })()
                    )
                  }
                  error={errors.bathrooms}
                  placeholder="2"
                  min="1"
                  required
                />
              </div>

              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.parking || false}
                    onChange={(e) =>
                      handleInputChange("parking", e.target.checked)
                    }
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    주차 가능
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.elevator || false}
                    onChange={(e) =>
                      handleInputChange("elevator", e.target.checked)
                    }
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    엘리베이터
                  </span>
                </label>
              </div>
            </div>

            {/* 가격 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">가격 정보</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.transaction_type === "매매" && (
                  <Input
                    label="매매가 (만원)"
                    type="number"
                    value={formData.price || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        handleInputChange("price", undefined);
                      } else {
                        const numValue = Number(value);
                        handleInputChange("price", isNaN(numValue) ? undefined : numValue);
                      }
                    }}
                    error={errors.price}
                    placeholder="35000"
                    min="0"
                    required
                  />
                )}

                {(formData.transaction_type === "전세" ||
                  formData.transaction_type === "월세") && (
                  <Input
                    label={
                      formData.transaction_type === "전세"
                        ? "전세금 (만원)"
                        : "보증금 (만원)"
                    }
                    type="number"
                    value={formData.deposit || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        handleInputChange("deposit", undefined);
                      } else {
                        const numValue = Number(value);
                        handleInputChange("deposit", isNaN(numValue) ? undefined : numValue);
                      }
                    }
                    }
                    error={errors.deposit}
                    placeholder="21000"
                    min="0"
                    required
                  />
                )}

                {formData.transaction_type === "월세" && (
                  <Input
                    label="월세 (만원)"
                    type="number"
                    value={formData.monthly_rent || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        handleInputChange("monthly_rent", undefined);
                      } else {
                        const numValue = Number(value);
                        handleInputChange("monthly_rent", isNaN(numValue) ? undefined : numValue);
                      }
                    }}
                    error={errors.monthly_rent}
                    placeholder="65"
                    min="0"
                    required
                  />
                )}
              </div>
            </div>

            {/* 임대인 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">임대인 정보</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="임대인 이름"
                  value={formData.landlord_name || ""}
                  onChange={(e) =>
                    handleInputChange("landlord_name", e.target.value)
                  }
                  placeholder="홍길동"
                />

                <Input
                  label="임대인 연락처"
                  value={formData.landlord_phone || ""}
                  onChange={(e) =>
                    handleInputChange("landlord_phone", e.target.value)
                  }
                  placeholder="010-1234-5678"
                />
              </div>
            </div>

            {/* 기타 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">기타 정보</h3>

              <div className="space-y-4">
                {/* 공실 체크박스 */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVacant}
                      onChange={(e) => handleVacantChange(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      ✨ 현재 공실 (즉시 입주 가능)
                    </span>
                  </label>
                  
                  {/* 상태 표시 배지 */}
                  <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                    isVacant || !formData.exit_date
                      ? "bg-green-100 text-green-800 border border-green-200" 
                      : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                  }`}>
                    {isVacant || !formData.exit_date ? "즉시 입주 가능" : "퇴실 예정"}
                  </div>
                </div>

                {/* 퇴실날짜 입력 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="퇴실 예정일"
                    type="date"
                    value={formData.exit_date || ""}
                    onChange={(e) =>
                      handleInputChange("exit_date", e.target.value)
                    }
                    disabled={isVacant}
                    className={isVacant ? "opacity-50 cursor-not-allowed" : ""}
                  />
                  
                  {/* 안내 텍스트 */}
                  <div className="flex items-center justify-center md:justify-start">
                    <p className="text-sm text-gray-500 text-center md:text-left">
                      {isVacant 
                        ? "공실로 체크되어 날짜 입력이 비활성화됩니다"
                        : "퇴실 예정일이 있으면 입력하세요"
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  매물 설명
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="매물에 대한 상세한 설명을 입력해주세요"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* 폼 액션 */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading || isSubmitting}
                leftIcon={<Save size={16} />}
              >
                수정 완료
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Modal>
  );
};
