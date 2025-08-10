// ============================================================================
// 팀 관리 메인 컴포넌트
// ============================================================================

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Search,
  Crown,
  Shield,
  User,
  Eye,
  Trash2,
  X,
  Edit,
  Activity,
  MoreVertical,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import * as teamService from "@/services/teamService";
import type {
  TeamMember,
  TeamInvitation,
  UserSearchResult,
} from "@/types/team";
import {
  ROLE_LABELS,
  STATUS_LABELS,
  INVITATION_STATUS_LABELS,
} from "@/types/team";
import { MemberEditModal } from "./MemberEditModal";
import { TeamActivityLog } from "./TeamActivityLog";
import { InviteLinkModal } from "./InviteLinkModal";

export const TeamManagement: React.FC = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteType, setInviteType] = useState<"email" | "existing">("email");

  // 이메일 초대 상태
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "viewer">(
    "member",
  );
  const [inviteMessage, setInviteMessage] = useState("");

  // 기존 회원 추가 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null,
  );
  const [memberRole, setMemberRole] = useState<"admin" | "member" | "viewer">(
    "member",
  );

  const [actionLoading, setActionLoading] = useState(false);

  // 새로운 모달 상태
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [memberMenuOpen, setMemberMenuOpen] = useState<string | null>(null);
  const [showInviteLinkModal, setShowInviteLinkModal] = useState(false);
  const [inviteLinkData, setInviteLinkData] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 현재 사용자의 역할 확인
  const currentUserRole = members.find((m) => m.id === user?.id)?.role;

  useEffect(() => {
    if (user?.id) {
      loadTeamData();
    }
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = () => {
      setMemberMenuOpen(null);
    };

    if (memberMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }

    return undefined;
  }, [memberMenuOpen]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const [membersData, invitationsData] = await Promise.all([
        teamService.getTeamMembers(user!.id),
        teamService.getTeamInvitations(user!.id),
      ]);

      setMembers(membersData);
      setInvitations(invitationsData);
    } catch (error) {
      console.error("팀 데이터 로드 실패:", error);
      alert("팀 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailInvite = async () => {
    if (!inviteEmail.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    try {
      setActionLoading(true);
      const result = await teamService.inviteTeamMember(user!.id, {
        email: inviteEmail,
        role: inviteRole,
        message: inviteMessage,
      });

      // 초대 링크 모달 표시
      setInviteLinkData({
        email: inviteEmail,
        inviteUrl: (result as any).inviteUrl,
        role: inviteRole,
        teamName: "리체 매물장", // 실제 팀 이름으로 변경 가능
      });
      setShowInviteLinkModal(true);
      setShowInviteModal(false);
      resetInviteForm();
      loadTeamData();
    } catch (error: any) {
      alert(error.message || "초대 발송에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddExistingMember = async () => {
    if (!selectedUser) {
      alert("추가할 회원을 선택해주세요.");
      return;
    }

    try {
      setActionLoading(true);
      await teamService.addExistingMember(user!.id, {
        user_id: selectedUser.id,
        role: memberRole,
      });

      alert("팀원이 추가되었습니다.");
      setShowInviteModal(false);
      resetAddMemberForm();
      loadTeamData();
    } catch (error: any) {
      alert(error.message || "팀원 추가에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await teamService.searchUsers(query, user!.id);
      setSearchResults(results);
    } catch (error) {
      console.error("사용자 검색 실패:", error);
    }
  };

  const handleRemoveMemberClick = (memberId: string, memberName: string) => {
    // 추가 안전 검사
    const memberToRemove = members.find((m) => m.id === memberId);

    if (!memberToRemove) {
      alert("삭제할 팀원을 찾을 수 없습니다.");
      return;
    }

    // Owner는 삭제할 수 없음
    if (memberToRemove.role === "owner") {
      alert("Owner는 팀에서 제거할 수 없습니다.");
      return;
    }

    // 자기 자신은 삭제할 수 없음
    if (memberId === user?.id) {
      alert("자신을 팀에서 제거할 수 없습니다.");
      return;
    }

    // 권한 확인
    if (currentUserRole !== "owner" && currentUserRole !== "admin") {
      alert("팀원을 제거할 권한이 없습니다.");
      return;
    }

    // 삭제 확인 모달 표시
    setMemberToDelete({ id: memberId, name: memberName });
    setShowDeleteConfirm(true);
  };

  const handleConfirmRemoveMember = async () => {
    if (!memberToDelete) return;

    try {
      setActionLoading(true);
      await teamService.removeMember(user!.id, memberToDelete.id);
      alert(`✅ ${memberToDelete.name}님이 팀에서 제거되었습니다.`);
      loadTeamData();
      setShowDeleteConfirm(false);
      setMemberToDelete(null);
    } catch (error: any) {
      console.error("팀원 제거 실패:", error);
      alert(
        `❌ 팀원 제거에 실패했습니다.\n\n오류: ${error.message || "알 수 없는 오류"}`,
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm("초대를 취소하시겠습니까?")) return;

    try {
      setActionLoading(true);
      await teamService.cancelInvitation(user!.id, invitationId);
      alert("초대가 취소되었습니다.");
      loadTeamData();
    } catch (error: any) {
      alert(error.message || "초대 취소에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const resetInviteForm = () => {
    setInviteEmail("");
    setInviteRole("member");
    setInviteMessage("");
  };

  const resetAddMemberForm = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(null);
    setMemberRole("member");
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setShowEditModal(true);
    setMemberMenuOpen(null);
  };

  const handleMemberInfoUpdate = async (memberId: string, updateData: any) => {
    await teamService.updateMemberInfo(user!.id, memberId, updateData);
    loadTeamData();
  };

  const handleMemberRoleChange = async (
    memberId: string,
    newRole: TeamMember["role"],
  ) => {
    await teamService.updateMemberRole(user!.id, memberId, newRole);
    loadTeamData();
  };

  const handleMemberStatusChange = async (
    memberId: string,
    newStatus: TeamMember["status"],
  ) => {
    await teamService.updateMemberStatus(user!.id, memberId, newStatus);
    loadTeamData();
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

  const canManageTeam =
    currentUserRole === "owner" || currentUserRole === "admin";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">팀 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-20 sm:pb-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* 헤더 - 모바일 최적화 */}
        <div className="border-b border-gray-200 p-4 sm:px-6 sm:py-4">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">팀 관리</h1>
                <p className="text-sm text-gray-600 hidden sm:block">팀원 초대 및 관리</p>
              </div>
            </div>

            {canManageTeam && (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={() => setShowActivityLog(true)}
                  className="text-gray-600 hover:text-gray-800 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2 touch-target"
                >
                  <Activity className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm sm:text-base hidden sm:inline">활동 로그</span>
                  <span className="text-sm sm:hidden">로그</span>
                </button>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 touch-target"
                >
                  <UserPlus className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm sm:text-base">초대</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 팀원 목록 - 모바일 최적화 */}
        <div className="p-4 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">
              팀원 <span className="text-blue-600">({members.length}명)</span>
            </h2>
          </div>

          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-gray-50 rounded-lg p-3 sm:p-4"
              >
                {/* 모바일 최적화된 팀원 카드 레이아웃 */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* 첫 번째 줄: 이름, 역할 아이콘, 상태 */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {member.name}
                        </h3>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          {getRoleIcon(member.role)}
                          <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
                            {ROLE_LABELS[member.role]}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                          member.status === "active"
                            ? "bg-green-100 text-green-800"
                            : member.status === "inactive"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {STATUS_LABELS[member.status]}
                      </span>
                    </div>
                    
                    {/* 두 번째 줄: 이메일 (있는 경우) */}
                    {member.email && (
                      <p className="text-xs sm:text-sm text-gray-500 mb-1 truncate">{member.email}</p>
                    )}
                    
                    {/* 세 번째 줄: 가입일 + 역할 라벨 (모바일용) */}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        {new Date(member.joined_at).toLocaleDateString("ko-KR", {
                          year: "2-digit",
                          month: "short",
                          day: "numeric"
                        })}{" "}
                        가입
                      </p>
                      <span className="text-xs text-gray-600 sm:hidden">
                        {ROLE_LABELS[member.role]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼들 - 모바일 최적화 */}
                <div className="flex items-center justify-end space-x-1 mt-3 pt-3 border-t border-gray-200">
                  {/* 수정 버튼 */}
                  <button
                    onClick={() => handleEditMember(member)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-target"
                    title="정보 수정"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* 삭제 버튼 - 더 명확한 조건으로 표시 */}
                  {(currentUserRole === "owner" ||
                    currentUserRole === "admin") &&
                  member.role !== "owner" &&
                  member.id !== user?.id ? (
                    <button
                      onClick={() =>
                        handleRemoveMemberClick(member.id, member.name)
                      }
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-target"
                      title="팀에서 제거"
                      disabled={actionLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : null}

                  {/* 더보기 메뉴 (모바일에서는 숨김) */}
                  <div className="relative hidden sm:block">
                    <button
                      onClick={() =>
                        setMemberMenuOpen(
                          memberMenuOpen === member.id ? null : member.id,
                        )
                      }
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="추가 옵션"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {memberMenuOpen === member.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              // 추가 기능이 필요한 경우 여기에 구현
                              setMemberMenuOpen(null);
                              alert("추가 기능은 준비 중입니다.");
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <MoreVertical className="w-4 h-4" />
                            <span>추가 옵션</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 초대 목록 - 모바일 최적화 */}
        {invitations.length > 0 && (
          <div className="border-t border-gray-200 p-4 sm:px-6 sm:py-4">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
              대기 중인 초대 <span className="text-yellow-600">({invitations.length}개)</span>
            </h2>

            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="bg-yellow-50 rounded-lg p-3 sm:p-4"
                >
                  {/* 모바일 최적화된 초대 카드 레이아웃 */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* 첫 번째 줄: 이메일, 역할 아이콘, 상태 */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            {invitation.email}
                          </h3>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            {getRoleIcon(invitation.role)}
                            <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
                              {ROLE_LABELS[invitation.role]}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                            invitation.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : invitation.status === "accepted"
                                ? "bg-green-100 text-green-800"
                                : invitation.status === "declined"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {INVITATION_STATUS_LABELS[invitation.status]}
                        </span>
                      </div>
                      
                      {/* 두 번째 줄: 초대자 정보 */}
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">
                        {invitation.inviter_name}님이 초대 •{" "}
                        {new Date(invitation.created_at).toLocaleDateString(
                          "ko-KR",
                          { month: "short", day: "numeric" }
                        )}
                      </p>
                      
                      {/* 세 번째 줄: 만료일 + 역할 라벨 (모바일용) */}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          만료일:{" "}
                          {new Date(invitation.expires_at).toLocaleDateString(
                            "ko-KR",
                            { month: "short", day: "numeric" }
                          )}
                        </p>
                        <span className="text-xs text-gray-600 sm:hidden">
                          {ROLE_LABELS[invitation.role]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼 - 모바일 최적화 */}
                  {canManageTeam && invitation.status === "pending" && (
                    <div className="flex justify-end mt-3 pt-3 border-t border-yellow-200">
                      <button
                        onClick={() => handleCancelInvitation(invitation.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-target"
                        title="초대 취소"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 초대 모달 - 모바일 최적화 */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold">팀원 초대</h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 touch-target"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-4 space-y-4">
              {/* 초대 방식 선택 - 모바일 최적화 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  초대 방식 선택
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors touch-target ${
                      inviteType === "email"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="inviteType"
                      value="email"
                      checked={inviteType === "email"}
                      onChange={(e) => setInviteType(e.target.value as "email")}
                      className="mr-3 mt-1 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-sm sm:text-base">📧 이메일 초대</div>
                      <div className="text-xs text-gray-600 mt-1">
                        새로운 사용자를 초대
                      </div>
                    </div>
                  </label>
                  <label
                    className={`flex items-start p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors touch-target ${
                      inviteType === "existing"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="inviteType"
                      value="existing"
                      checked={inviteType === "existing"}
                      onChange={(e) =>
                        setInviteType(e.target.value as "existing")
                      }
                      className="mr-3 mt-1 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-sm sm:text-base">👥 기존 회원 추가</div>
                      <div className="text-xs text-gray-600 mt-1">
                        이미 가입한 회원 검색
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {inviteType === "email" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이메일
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="초대할 이메일을 입력하세요"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      역할
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) =>
                        setInviteRole(e.target.value as typeof inviteRole)
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="member">멤버 - 매물 관리 가능</option>
                      <option value="admin">
                        관리자 - 팀원 관리 및 매물 관리 가능
                      </option>
                      <option value="viewer">뷰어 - 매물 조회만 가능</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      초대 메시지 (선택)
                    </label>
                    <textarea
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      placeholder="초대 메시지를 입력하세요"
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      회원 검색
                    </label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <div className="flex items-start space-x-2">
                        <div className="text-blue-600 mt-0.5">💡</div>
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">기존 회원 추가:</p>
                          <p>• 이름 또는 이메일을 2글자 이상 입력하세요</p>
                          <p>• 이미 다른 팀에 속한 회원도 추가할 수 있습니다</p>
                          <p>• 해당 회원은 이 팀으로 이동하게 됩니다</p>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          handleSearchUsers(e.target.value);
                        }}
                        placeholder="이름 또는 이메일로 검색 (2글자 이상 입력)"
                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {searchResults.length > 0 && (
                      <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                        {searchResults.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => {
                              setSelectedUser(user);
                              setSearchQuery(user.name);
                              setSearchResults([]);
                            }}
                            className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium">{user.name}</div>
                            {user.email && (
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            )}
                            {user.company && (
                              <div className="text-xs text-gray-400">
                                {user.company}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedUser && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium text-blue-900">
                          선택됨: {selectedUser.name}
                        </div>
                        {selectedUser.email && (
                          <div className="text-sm text-blue-700">
                            {selectedUser.email}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      역할
                    </label>
                    <select
                      value={memberRole}
                      onChange={(e) =>
                        setMemberRole(e.target.value as typeof memberRole)
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="member">멤버 - 매물 관리 가능</option>
                      <option value="admin">
                        관리자 - 팀원 관리 및 매물 관리 가능
                      </option>
                      <option value="viewer">뷰어 - 매물 조회만 가능</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors touch-target"
              >
                취소
              </button>
              <button
                onClick={
                  inviteType === "email"
                    ? handleEmailInvite
                    : handleAddExistingMember
                }
                disabled={
                  actionLoading ||
                  (inviteType === "email" ? !inviteEmail.trim() : !selectedUser)
                }
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target"
              >
                {actionLoading
                  ? "처리중..."
                  : inviteType === "email"
                    ? "초대 발송"
                    : "팀원 추가"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 편집 모달 */}
      {selectedMember && (
        <MemberEditModal
          member={selectedMember}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMember(null);
          }}
          onUpdate={handleMemberInfoUpdate}
          onRoleChange={handleMemberRoleChange}
          onStatusChange={handleMemberStatusChange}
          currentUserRole={currentUserRole || "viewer"}
          canEdit={canManageTeam || selectedMember.id === user?.id}
        />
      )}

      {/* 팀 활동 로그 */}
      <TeamActivityLog
        isOpen={showActivityLog}
        onClose={() => setShowActivityLog(false)}
      />

      {/* 초대 링크 모달 */}
      {inviteLinkData && (
        <InviteLinkModal
          isOpen={showInviteLinkModal}
          onClose={() => {
            setShowInviteLinkModal(false);
            setInviteLinkData(null);
          }}
          inviteData={inviteLinkData}
        />
      )}

      {/* 팀원 삭제 확인 모달 - 모바일 최적화 */}
      {showDeleteConfirm && memberToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    팀원 제거 확인
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setMemberToDelete(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 touch-target"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-4">
              <div className="mb-4">
                {/* 제거될 팀원 정보 - 모바일 최적화 */}
                <div className="flex items-center space-x-3 p-3 sm:p-4 bg-red-50 rounded-lg mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-red-900 text-sm sm:text-base">
                      {memberToDelete.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-red-700">제거할 팀원</p>
                  </div>
                </div>

                {/* 주의사항 - 모바일 최적화 */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-yellow-400 text-base sm:text-lg">⚠️</span>
                    </div>
                    <div className="ml-3 min-w-0">
                      <p className="text-xs sm:text-sm text-yellow-800 mb-2">
                        <strong>주의사항:</strong>
                      </p>
                      <ul className="text-xs sm:text-sm text-yellow-700 space-y-1">
                        <li className="flex items-start">
                          <span className="mr-2 mt-0.5">•</span>
                          <span>제거된 팀원은 더 이상 이 팀의 데이터에 접근할 수 없습니다.</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-0.5">•</span>
                          <span>이 작업은 되돌릴 수 없습니다.</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-0.5">•</span>
                          <span>필요시 나중에 다시 초대할 수 있습니다.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 확인 메시지 - 모바일 최적화 */}
                <p className="text-gray-600 text-center text-sm sm:text-base leading-relaxed">
                  <strong className="text-red-800">{memberToDelete.name}님</strong>을 정말로 팀에서 제거하시겠습니까?
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setMemberToDelete(null);
                }}
                className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors touch-target"
                disabled={actionLoading}
              >
                취소
              </button>
              <button
                onClick={handleConfirmRemoveMember}
                disabled={actionLoading}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 touch-target"
              >
                {actionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm sm:text-base">제거중...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm sm:text-base">팀에서 제거</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
