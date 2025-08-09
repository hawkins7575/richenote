// ============================================================================
// 팀원 정보 수정 모달 컴포넌트
// ============================================================================

import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Building,
  Crown,
  Shield,
  Eye,
} from "lucide-react";
import type { TeamMember } from "@/types/team";
import { ROLE_LABELS } from "@/types/team";

interface MemberEditModalProps {
  member: TeamMember;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (memberId: string, data: any) => Promise<void>;
  onRoleChange: (
    memberId: string,
    newRole: TeamMember["role"],
  ) => Promise<void>;
  onStatusChange: (
    memberId: string,
    newStatus: TeamMember["status"],
  ) => Promise<void>;
  currentUserRole: string;
  canEdit: boolean;
}

export const MemberEditModal: React.FC<MemberEditModalProps> = ({
  member,
  isOpen,
  onClose,
  onUpdate,
  onRoleChange,
  onStatusChange,
  currentUserRole,
  canEdit,
}) => {
  const [activeTab, setActiveTab] = useState<"info" | "role" | "status">(
    "info",
  );
  const [loading, setLoading] = useState(false);

  // 정보 수정 상태
  const [editData, setEditData] = useState({
    name: member.name || "",
    email: member.email || "",
    phone: member.phone || "",
    company: member.company || "",
  });

  if (!isOpen) return null;

  const handleInfoUpdate = async () => {
    try {
      setLoading(true);
      await onUpdate(member.id, editData);
      onClose();
    } catch (error: any) {
      alert(error.message || "정보 업데이트에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole: TeamMember["role"]) => {
    if (
      !confirm(
        `${member.name}님의 역할을 ${ROLE_LABELS[newRole]}로 변경하시겠습니까?`,
      )
    )
      return;

    try {
      setLoading(true);
      await onRoleChange(member.id, newRole);
      onClose();
    } catch (error: any) {
      alert(error.message || "역할 변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: TeamMember["status"]) => {
    if (!confirm(`${member.name}님의 상태를 변경하시겠습니까?`)) return;

    try {
      setLoading(true);
      await onStatusChange(member.id, newStatus);
      onClose();
    } catch (error: any) {
      alert(error.message || "상태 변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "admin":
        return <Shield className="w-4 h-4 text-blue-500" />;
      case "member":
        return <User className="w-4 h-4 text-green-500" />;
      case "viewer":
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const canChangeRole = (targetRole: string) => {
    if (currentUserRole === "owner") return true;
    if (
      currentUserRole === "admin" &&
      ["member", "viewer"].includes(targetRole)
    )
      return true;
    return false;
  };

  const canChangeStatus =
    currentUserRole === "owner" || currentUserRole === "admin";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{member.name}</h2>
                <div className="flex items-center space-x-2">
                  {getRoleIcon(member.role)}
                  <span className="text-sm text-gray-600">
                    {ROLE_LABELS[member.role]}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("info")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "info"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              기본 정보
            </button>
            {canEdit && (
              <>
                <button
                  onClick={() => setActiveTab("role")}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "role"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  역할 관리
                </button>
                <button
                  onClick={() => setActiveTab("status")}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === "status"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  상태 관리
                </button>
              </>
            )}
          </nav>
        </div>

        {/* 탭 내용 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* 기본 정보 탭 */}
          {activeTab === "info" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="이름을 입력하세요"
                    readOnly={!canEdit}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) =>
                      setEditData({ ...editData, email: e.target.value })
                    }
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="이메일을 입력하세요"
                    readOnly={!canEdit}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) =>
                      setEditData({ ...editData, phone: e.target.value })
                    }
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="전화번호를 입력하세요"
                    readOnly={!canEdit}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  회사명
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={editData.company}
                    onChange={(e) =>
                      setEditData({ ...editData, company: e.target.value })
                    }
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="회사명을 입력하세요"
                    readOnly={!canEdit}
                  />
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p>
                  가입일:{" "}
                  {new Date(member.joined_at).toLocaleDateString("ko-KR")}
                </p>
              </div>
            </div>
          )}

          {/* 역할 관리 탭 */}
          {activeTab === "role" && canEdit && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                현재 역할:{" "}
                <span className="font-medium">{ROLE_LABELS[member.role]}</span>
              </p>

              <div className="grid grid-cols-1 gap-3">
                {(["viewer", "member", "admin", "owner"] as const).map(
                  (role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      disabled={
                        !canChangeRole(role) || member.role === role || loading
                      }
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        member.role === role
                          ? "border-blue-500 bg-blue-50"
                          : canChangeRole(role)
                            ? "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {getRoleIcon(role)}
                        <div>
                          <div className="font-medium">{ROLE_LABELS[role]}</div>
                          <div className="text-sm text-gray-500">
                            {role === "owner" &&
                              "모든 권한을 가지며 팀을 관리할 수 있습니다."}
                            {role === "admin" &&
                              "팀원을 관리하고 매물을 관리할 수 있습니다."}
                            {role === "member" &&
                              "매물을 등록하고 수정할 수 있습니다."}
                            {role === "viewer" &&
                              "매물을 조회만 할 수 있습니다."}
                          </div>
                        </div>
                      </div>
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          {/* 상태 관리 탭 */}
          {activeTab === "status" && canEdit && canChangeStatus && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                현재 상태:{" "}
                <span className="font-medium">
                  {member.status === "active"
                    ? "활성"
                    : member.status === "inactive"
                      ? "비활성"
                      : "정지"}
                </span>
              </p>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleStatusChange("active")}
                  disabled={member.status === "active" || loading}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    member.status === "active"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">활성</div>
                      <div className="text-sm text-gray-500">
                        팀원이 정상적으로 활동할 수 있습니다.
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleStatusChange("inactive")}
                  disabled={member.status === "inactive" || loading}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    member.status === "inactive"
                      ? "border-gray-500 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">비활성</div>
                      <div className="text-sm text-gray-500">
                        팀원이 일시적으로 비활성 상태입니다.
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleStatusChange("suspended")}
                  disabled={member.status === "suspended" || loading}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    member.status === "suspended"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">정지</div>
                      <div className="text-sm text-gray-500">
                        팀원의 접근이 정지됩니다.
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 버튼 영역 */}
        {activeTab === "info" && canEdit && (
          <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleInfoUpdate}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
