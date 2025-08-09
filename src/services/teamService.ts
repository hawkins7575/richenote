// ============================================================================
// 팀 관리 서비스 - Supabase 통합
// ============================================================================

import { supabase } from "./supabase";
import { logger } from "@/utils/logger";

// 이메일 전송 인터페이스
interface EmailInvitationData {
  invitationToken: string;
  recipientEmail: string;
  inviterName: string;
  teamName: string;
  role: string;
  message?: string;
}

// 초대 이메일 전송 함수
const sendInvitationEmail = async (data: EmailInvitationData) => {
  const { data: result, error } = await supabase.functions.invoke(
    "send-team-invitation",
    {
      body: data,
    },
  );

  if (error) {
    logger.error("Email sending failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      component: "teamService",
      action: "sendInvitationEmail",
    });
    throw error;
  }

  return result;
};

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

export interface UpdateMemberData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
}

// 팀 멤버 목록 조회
export const getTeamMembers = async (userId: string) => {
  try {
    // 사용자의 tenant_id 조회
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("tenant_id")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    // 팀 멤버들 조회 (이메일 포함)
    const { data: members, error } = await supabase
      .from("user_profiles")
      .select(
        `
        id,
        tenant_id,
        name,
        email,
        phone,
        role,
        status,
        joined_at,
        invited_by,
        company
      `,
      )
      .eq("tenant_id", userProfile.tenant_id)
      .order("joined_at", { ascending: false });

    if (error) throw error;

    return members || [];
  } catch (error) {
    logger.error("Failed to fetch team members", {
      error: error instanceof Error ? error.message : "Unknown error",
      component: "teamService",
      action: "getTeamMembers",
    });
    throw error;
  }
};

// 팀 초대 목록 조회
export const getTeamInvitations = async (userId: string) => {
  try {
    // 사용자의 tenant_id 조회
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("tenant_id")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    // 팀 초대들 조회
    const { data: invitations, error } = await supabase
      .from("team_invitations")
      .select(
        `
        id,
        tenant_id,
        inviter_id,
        email,
        role,
        status,
        invitation_token,
        expires_at,
        created_at
      `,
      )
      .eq("tenant_id", userProfile.tenant_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // 초대자 이름들을 별도로 가져오기
    if (invitations && invitations.length > 0) {
      const inviterIds = [...new Set(invitations.map((inv) => inv.inviter_id))];
      const { data: inviters } = await supabase
        .from("user_profiles")
        .select("id, name")
        .in("id", inviterIds);

      const inviterMap =
        inviters?.reduce(
          (acc, inviter) => {
            acc[inviter.id] = inviter.name;
            return acc;
          },
          {} as Record<string, string>,
        ) || {};

      return invitations.map((inv) => ({
        ...inv,
        inviter_name: inviterMap[inv.inviter_id] || "알 수 없는 사용자",
      }));
    }

    return [];
  } catch (error) {
    logger.error("Failed to fetch team invitations", {
      error: error instanceof Error ? error.message : "Unknown error",
      component: "teamService",
      action: "getTeamInvitations",
    });
    throw error;
  }
};

// 이메일로 팀원 초대
export const inviteTeamMember = async (
  userId: string,
  invitationData: CreateInvitationData,
) => {
  try {
    // 사용자의 tenant_id와 권한 확인 (팀 정보 포함)
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select(
        `
        tenant_id, 
        role, 
        name,
        tenant:tenant_id(name)
      `,
      )
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    // 권한 확인 (owner 또는 admin만 초대 가능)
    if (userProfile.role !== "owner" && userProfile.role !== "admin") {
      throw new Error("팀원을 초대할 권한이 없습니다.");
    }

    // 이미 팀의 멤버인지 확인
    const { data: existingMember } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("tenant_id", userProfile.tenant_id)
      .eq("email", invitationData.email)
      .single();

    if (existingMember) {
      throw new Error("이미 팀에 속한 회원입니다.");
    }

    // 이미 초대된 이메일인지 확인
    const { data: existingInvitation } = await supabase
      .from("team_invitations")
      .select("id, status")
      .eq("tenant_id", userProfile.tenant_id)
      .eq("email", invitationData.email)
      .eq("status", "pending")
      .single();

    if (existingInvitation) {
      throw new Error("이미 초대된 이메일입니다.");
    }

    // 새 초대 생성
    const { data: invitation, error: inviteError } = await supabase
      .from("team_invitations")
      .insert({
        tenant_id: userProfile.tenant_id,
        inviter_id: userId,
        email: invitationData.email,
        role: invitationData.role,
      })
      .select()
      .single();

    if (inviteError) throw inviteError;

    // 이메일 전송
    try {
      await sendInvitationEmail({
        invitationToken: invitation.invitation_token,
        recipientEmail: invitationData.email,
        inviterName: userProfile.name,
        teamName:
          (userProfile && "tenant" in userProfile && userProfile.tenant
            ? (userProfile.tenant as any)?.name
            : null) || "팀",
        role: invitationData.role,
        message: invitationData.message,
      });
    } catch (emailError) {
      logger.warn("Email sending failed but invitation created", {
        error:
          emailError instanceof Error ? emailError.message : "Unknown error",
        component: "teamService",
        action: "inviteTeamMember",
      });
      // 이메일 전송 실패해도 초대는 생성되도록 함
    }

    // 활동 로그 기록
    await supabase.from("team_activity_logs").insert({
      tenant_id: userProfile.tenant_id,
      user_id: userId,
      action: "invitation_sent",
      details: {
        invited_email: invitationData.email,
        role: invitationData.role,
        message: invitationData.message,
      },
    });

    return {
      ...invitation,
      inviteUrl: `${typeof window !== "undefined" ? window.location.origin : "https://summi3-2mk8sy7pu-daesung75-6440s-projects.vercel.app"}/team/invite?token=${invitation.invitation_token}`,
    };
  } catch (error) {
    logger.error("Failed to invite team member", {
      error: error instanceof Error ? error.message : "Unknown error",
      component: "teamService",
      action: "inviteTeamMember",
    });
    throw error;
  }
};

// 기존 회원을 팀에 추가
export const addExistingMember = async (
  userId: string,
  memberData: AddExistingMemberData,
) => {
  try {
    // 사용자의 tenant_id와 권한 확인
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("tenant_id, role")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    // 권한 확인
    if (userProfile.role !== "owner" && userProfile.role !== "admin") {
      throw new Error("팀원을 추가할 권한이 없습니다.");
    }

    // 추가하려는 사용자가 존재하는지 확인
    const { data: targetUser, error: targetError } = await supabase
      .from("user_profiles")
      .select("id, name, email, tenant_id")
      .eq("id", memberData.user_id)
      .single();

    if (targetError) {
      throw new Error("존재하지 않는 사용자입니다.");
    }

    // 이미 팀의 멤버인지 확인
    if (targetUser.tenant_id === userProfile.tenant_id) {
      throw new Error("이미 팀에 속한 회원입니다.");
    }

    // 다른 팀에 속해있는지 확인 (한 번에 하나의 팀만 가능)
    if (targetUser.tenant_id) {
      throw new Error("이미 다른 팀에 속한 회원입니다.");
    }

    // 팀에 추가
    const { data: updatedMember, error: updateError } = await supabase
      .from("user_profiles")
      .update({
        tenant_id: userProfile.tenant_id,
        role: memberData.role,
        invited_by: userId,
        joined_at: new Date().toISOString(),
      })
      .eq("id", memberData.user_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 활동 로그 기록
    await supabase.from("team_activity_logs").insert({
      tenant_id: userProfile.tenant_id,
      user_id: userId,
      action: "member_added",
      details: {
        added_user_id: memberData.user_id,
        added_user_name: targetUser.name,
        role: memberData.role,
      },
    });

    return updatedMember;
  } catch (error) {
    logger.error("Failed to add team member", {
      error: error instanceof Error ? error.message : "Unknown error",
      component: "teamService",
      action: "addTeamMember",
    });
    throw error;
  }
};

// 팀원 역할 변경
export const updateMemberRole = async (
  userId: string,
  memberId: string,
  newRole: TeamMember["role"],
) => {
  try {
    // 사용자의 tenant_id와 권한 확인
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("tenant_id, role")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    // 권한 확인 (owner만 역할 변경 가능, 또는 admin이 member/viewer 변경 가능)
    if (
      userProfile.role !== "owner" &&
      !(userProfile.role === "admin" && ["member", "viewer"].includes(newRole))
    ) {
      throw new Error("역할을 변경할 권한이 없습니다.");
    }

    // 자기 자신의 역할은 변경할 수 없음
    if (userId === memberId) {
      throw new Error("자신의 역할은 변경할 수 없습니다.");
    }

    // 멤버 역할 업데이트
    const { data: updatedMember, error: updateError } = await supabase
      .from("user_profiles")
      .update({ role: newRole })
      .eq("id", memberId)
      .eq("tenant_id", userProfile.tenant_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 활동 로그 기록
    await supabase.from("team_activity_logs").insert({
      tenant_id: userProfile.tenant_id,
      user_id: userId,
      action: "role_changed",
      details: {
        target_user_id: memberId,
        new_role: newRole,
      },
    });

    return updatedMember;
  } catch (error) {
    logger.error("Failed to change member role", {
      error: error instanceof Error ? error.message : "Unknown error",
      component: "teamService",
      action: "changeMemberRole",
    });
    throw error;
  }
};

// 팀에서 멤버 제거
export const removeMember = async (userId: string, memberId: string) => {
  try {
    // 사용자의 tenant_id와 권한 확인
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("tenant_id, role")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    // 권한 확인 (owner 또는 admin만 제거 가능)
    if (userProfile.role !== "owner" && userProfile.role !== "admin") {
      throw new Error("팀원을 제거할 권한이 없습니다.");
    }

    // 자기 자신은 제거할 수 없음
    if (userId === memberId) {
      throw new Error("자신을 팀에서 제거할 수 없습니다.");
    }

    // 제거할 멤버 정보 조회
    const { data: memberToRemove, error: memberError } = await supabase
      .from("user_profiles")
      .select("name, role")
      .eq("id", memberId)
      .eq("tenant_id", userProfile.tenant_id)
      .single();

    if (memberError) {
      throw new Error("팀에서 해당 멤버를 찾을 수 없습니다.");
    }

    // owner는 제거할 수 없음
    if (memberToRemove.role === "owner") {
      throw new Error("팀 소유자는 제거할 수 없습니다.");
    }

    // 새 개인 테넌트 생성
    const { data: newTenant, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        name: `${memberToRemove.name}의 부동산`,
      })
      .select()
      .single();

    if (tenantError) throw tenantError;

    // 멤버를 새 테넌트로 이동
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        tenant_id: newTenant.id,
        role: "owner",
        invited_by: null,
      })
      .eq("id", memberId);

    if (updateError) throw updateError;

    // 활동 로그 기록
    await supabase.from("team_activity_logs").insert({
      tenant_id: userProfile.tenant_id,
      user_id: userId,
      action: "member_removed",
      details: {
        removed_user_id: memberId,
        removed_user_name: memberToRemove.name,
      },
    });

    return true;
  } catch (error) {
    logger.error("Failed to remove team member", {
      error: error instanceof Error ? error.message : "Unknown error",
      component: "teamService",
      action: "removeTeamMember",
    });
    throw error;
  }
};

// 초대 취소
export const cancelInvitation = async (
  userId: string,
  invitationId: string,
) => {
  try {
    // 사용자의 tenant_id와 권한 확인
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("tenant_id, role")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    // 권한 확인
    if (userProfile.role !== "owner" && userProfile.role !== "admin") {
      throw new Error("초대를 취소할 권한이 없습니다.");
    }

    // 초대 삭제
    const { error } = await supabase
      .from("team_invitations")
      .delete()
      .eq("id", invitationId)
      .eq("tenant_id", userProfile.tenant_id);

    if (error) throw error;

    return true;
  } catch (error) {
    logger.error("Failed to cancel invitation", {
      error: error instanceof Error ? error.message : "Unknown error",
      component: "teamService",
      action: "cancelInvitation",
    });
    throw error;
  }
};

// 사용자 검색 (기존 회원 추가용)
export const searchUsers = async (query: string, currentUserId: string) => {
  try {
    // 현재 사용자의 tenant_id 조회
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("tenant_id")
      .eq("id", currentUserId)
      .single();

    if (userError) throw userError;

    // 이메일 또는 이름으로 검색 (현재 팀에 속하지 않은 사용자만)
    const { data: users, error } = await supabase
      .from("user_profiles")
      .select("id, name, email, company")
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .or(`tenant_id.is.null,tenant_id.neq.${userProfile.tenant_id}`)
      .neq("id", currentUserId)
      .limit(10);

    if (error) throw error;

    return users || [];
  } catch (error) {
    logger.error("Failed to search users", {
      error: error instanceof Error ? error.message : "Unknown error",
      component: "teamService",
      action: "searchUsers",
    });
    throw error;
  }
};

// 팀원 정보 업데이트
export const updateMemberInfo = async (
  userId: string,
  memberId: string,
  updateData: UpdateMemberData,
) => {
  try {
    // 사용자의 tenant_id와 권한 확인
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("tenant_id, role")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    // 권한 확인 (owner 또는 admin만 다른 멤버 정보 수정 가능, 본인은 언제나 가능)
    if (
      userId !== memberId &&
      userProfile.role !== "owner" &&
      userProfile.role !== "admin"
    ) {
      throw new Error("팀원 정보를 수정할 권한이 없습니다.");
    }

    // 멤버 정보 업데이트
    const { data: updatedMember, error: updateError } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("id", memberId)
      .eq("tenant_id", userProfile.tenant_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 활동 로그 기록 (본인이 아닌 경우에만)
    if (userId !== memberId) {
      await supabase.from("team_activity_logs").insert({
        tenant_id: userProfile.tenant_id,
        user_id: userId,
        action: "member_info_updated",
        details: {
          target_user_id: memberId,
          updated_fields: Object.keys(updateData),
        },
      });
    }

    return updatedMember;
  } catch (error) {
    logger.error("Failed to update member info", {
      error: error instanceof Error ? error.message : "Unknown error",
      component: "teamService",
      action: "updateMemberInfo",
    });
    throw error;
  }
};

// 팀원 상태 변경 (활성/비활성/정지)
export const updateMemberStatus = async (
  userId: string,
  memberId: string,
  newStatus: TeamMember["status"],
) => {
  try {
    // 사용자의 tenant_id와 권한 확인
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("tenant_id, role")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    // 권한 확인 (owner 또는 admin만 상태 변경 가능)
    if (userProfile.role !== "owner" && userProfile.role !== "admin") {
      throw new Error("팀원 상태를 변경할 권한이 없습니다.");
    }

    // 자기 자신의 상태는 변경할 수 없음
    if (userId === memberId) {
      throw new Error("자신의 상태는 변경할 수 없습니다.");
    }

    // 멤버 상태 업데이트
    const { data: updatedMember, error: updateError } = await supabase
      .from("user_profiles")
      .update({ status: newStatus })
      .eq("id", memberId)
      .eq("tenant_id", userProfile.tenant_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 활동 로그 기록
    await supabase.from("team_activity_logs").insert({
      tenant_id: userProfile.tenant_id,
      user_id: userId,
      action: "member_status_changed",
      details: {
        target_user_id: memberId,
        new_status: newStatus,
      },
    });

    return updatedMember;
  } catch (error) {
    logger.error("Failed to change member status", {
      error: error instanceof Error ? error.message : "Unknown error",
      component: "teamService",
      action: "changeMemberStatus",
    });
    throw error;
  }
};

// 팀 활동 로그 조회
export const getTeamActivityLogs = async (
  userId: string,
  limit: number = 50,
) => {
  try {
    // 사용자의 tenant_id 조회
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("tenant_id, role")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    // 권한 확인 (owner 또는 admin만 활동 로그 조회 가능)
    if (userProfile.role !== "owner" && userProfile.role !== "admin") {
      throw new Error("활동 로그를 조회할 권한이 없습니다.");
    }

    // 활동 로그 조회
    const { data: logs, error } = await supabase
      .from("team_activity_logs")
      .select(
        `
        id,
        action,
        details,
        created_at,
        user_id
      `,
      )
      .eq("tenant_id", userProfile.tenant_id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    // 사용자 이름들을 별도로 가져오기
    if (logs && logs.length > 0) {
      const userIds = [...new Set(logs.map((log) => log.user_id))];
      const { data: users } = await supabase
        .from("user_profiles")
        .select("id, name")
        .in("id", userIds);

      const userMap =
        users?.reduce(
          (acc, user) => {
            acc[user.id] = user.name;
            return acc;
          },
          {} as Record<string, string>,
        ) || {};

      return logs.map((log) => ({
        ...log,
        user_name: userMap[log.user_id] || "알 수 없는 사용자",
      }));
    }

    return [];
  } catch (error) {
    logger.error("Failed to fetch team activity logs", {
      error: error instanceof Error ? error.message : "Unknown error",
      component: "teamService",
      action: "getTeamActivityLogs",
    });
    throw error;
  }
};
