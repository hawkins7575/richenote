// ============================================================================
// 팀 활동 로그 컴포넌트
// ============================================================================

import React, { useState, useEffect } from "react";
import { Activity, ChevronDown, ChevronUp } from "lucide-react";
import { getTeamActivityLogs } from "@/services/teamService";
import { useAuth } from "@/contexts/AuthContext";

interface ActivityLog {
  id: string;
  action: string;
  details: any;
  created_at: string;
  user_id: string;
  user_name: string;
}

const ACTION_LABELS: Record<string, string> = {
  invitation_sent: "팀원 초대",
  invitation_accepted: "초대 수락",
  invitation_declined: "초대 거절",
  invitation_cancelled: "초대 취소",
  member_added: "팀원 추가",
  member_removed: "팀원 제거",
  role_changed: "역할 변경",
  member_info_updated: "정보 수정",
  member_status_changed: "상태 변경",
};

interface TeamActivityLogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamActivityLog: React.FC<TeamActivityLogProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user?.id) {
      loadActivityLogs();
    }
  }, [isOpen, user?.id]);

  const loadActivityLogs = async () => {
    try {
      setLoading(true);
      const data = await getTeamActivityLogs(user!.id);
      setLogs(data);
    } catch (error) {
      console.error("활동 로그 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "방금 전";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}일 전`;

    return date.toLocaleDateString("ko-KR");
  };

  const getActionDescription = (log: ActivityLog) => {
    const baseAction = ACTION_LABELS[log.action] || log.action;

    switch (log.action) {
      case "role_changed":
        return `${log.details.target_user_name || "팀원"}의 역할을 변경했습니다`;
      case "member_status_changed":
        return `${log.details.target_user_name || "팀원"}의 상태를 변경했습니다`;
      case "member_info_updated":
        return `${log.details.target_user_name || "팀원"}의 정보를 수정했습니다`;
      case "member_removed":
        return `${log.details.target_user_name || "팀원"}을 팀에서 제거했습니다`;
      case "invitation_sent":
        return `${log.details.email}로 초대를 발송했습니다`;
      default:
        return baseAction;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold">팀 활동 로그</h2>
                <p className="text-sm text-gray-600">
                  팀의 모든 활동을 확인할 수 있습니다
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">활동 로그가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border border-gray-200 rounded-lg">
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() =>
                      setExpandedLog(expandedLog === log.id ? null : log.id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Activity className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {getActionDescription(log)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {log.user_name} • {formatTimeAgo(log.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                        {expandedLog === log.id ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedLog === log.id && (
                    <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-2">상세 정보:</p>
                        <div className="space-y-1">
                          <p>
                            • 시간:{" "}
                            {new Date(log.created_at).toLocaleString("ko-KR")}
                          </p>
                          <p>• 실행자: {log.user_name}</p>
                          {log.details &&
                            Object.keys(log.details).length > 0 && (
                              <div className="mt-2">
                                <p className="font-medium">추가 정보:</p>
                                <div className="mt-1 pl-4 space-y-1">
                                  {Object.entries(log.details).map(
                                    ([key, value]) => (
                                      <p key={key} className="text-xs">
                                        • {key}:{" "}
                                        {typeof value === "object"
                                          ? JSON.stringify(value)
                                          : String(value)}
                                      </p>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
