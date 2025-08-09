// ============================================================================
// 팀 관리 관련 타입 정의
// ============================================================================

export interface TeamMember {
  id: string;
  tenant_id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "owner" | "admin" | "member" | "viewer";
  status: "active" | "inactive" | "suspended";
  joined_at: string;
  invited_by?: string;
  company?: string;
  inviter?: {
    name: string;
  };
}

export interface TeamInvitation {
  id: string;
  tenant_id: string;
  inviter_id: string;
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
  status: "pending" | "accepted" | "declined" | "expired";
  invitation_token: string;
  expires_at: string;
  created_at: string;
  inviter_name?: string;
  inviter?: {
    name: string;
  };
}

export interface CreateInvitationData {
  email: string;
  role: "admin" | "member" | "viewer";
  message?: string;
}

export interface AddExistingMemberData {
  user_id: string;
  role: "admin" | "member" | "viewer";
}

export interface UserSearchResult {
  id: string;
  name: string;
  email?: string;
  company?: string;
}

export const ROLE_LABELS = {
  owner: "팀 소유자",
  admin: "관리자",
  member: "멤버",
  viewer: "뷰어",
} as const;

export const ROLE_DESCRIPTIONS = {
  owner: "팀의 모든 권한을 가집니다",
  admin: "팀원 초대/관리 및 매물 관리가 가능합니다",
  member: "매물 등록/수정/삭제가 가능합니다",
  viewer: "매물 조회만 가능합니다",
} as const;

export const STATUS_LABELS = {
  active: "활성",
  inactive: "비활성",
  suspended: "정지됨",
} as const;

export const INVITATION_STATUS_LABELS = {
  pending: "대기중",
  accepted: "수락됨",
  declined: "거절됨",
  expired: "만료됨",
} as const;
