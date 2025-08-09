// ============================================================================
// 초대 링크 모달 컴포넌트
// ============================================================================

import React, { useState } from "react";
import { X, Copy, Mail, Check } from "lucide-react";

interface InviteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteData: {
    email: string;
    inviteUrl: string;
    role: string;
    teamName?: string;
  };
}

export const InviteLinkModal: React.FC<InviteLinkModalProps> = ({
  isOpen,
  onClose,
  inviteData,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteData.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("클립보드 복사 실패:", error);
    }
  };

  const handleEmailShare = () => {
    const subject = `[${inviteData.teamName || "팀"}] 초대 - ${getRoleLabel(inviteData.role)} 역할`;
    const body = `안녕하세요!

${inviteData.teamName || "팀"}에서 ${getRoleLabel(inviteData.role)} 역할로 초대드립니다.

아래 링크를 클릭하여 초대를 수락해주세요:
${inviteData.inviteUrl}

감사합니다.`;

    const mailtoUrl = `mailto:${inviteData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: "관리자",
      member: "멤버",
      viewer: "뷰어",
    };
    return labels[role as keyof typeof labels] || role;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        {/* 헤더 */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">초대 링크 생성 완료</h2>
              <p className="text-sm text-gray-600">
                팀원에게 링크를 전송해주세요
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6">
          <div className="space-y-4">
            {/* 초대 정보 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">초대 정보</span>
              </div>
              <div className="text-sm text-blue-700">
                <p>
                  <strong>이메일:</strong> {inviteData.email}
                </p>
                <p>
                  <strong>역할:</strong> {getRoleLabel(inviteData.role)}
                </p>
                {inviteData.teamName && (
                  <p>
                    <strong>팀:</strong> {inviteData.teamName}
                  </p>
                )}
              </div>
            </div>

            {/* 초대 링크 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                초대 링크
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={inviteData.inviteUrl}
                  readOnly
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-3 border border-l-0 border-gray-300 rounded-r-lg transition-colors ${
                    copied
                      ? "bg-green-100 text-green-700 border-green-300"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                  title="클립보드에 복사"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-sm text-green-600 mt-1">
                  ✅ 클립보드에 복사되었습니다!
                </p>
              )}
            </div>

            {/* 안내 메시지 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <div className="text-yellow-600">⚠️</div>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">링크 보안 안내</p>
                  <ul className="space-y-1 text-xs">
                    <li>• 이 링크는 7일 후 만료됩니다</li>
                    <li>• 초대받은 이메일 계정으로만 수락 가능합니다</li>
                    <li>• 안전한 방법으로 전달해주세요</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="border-t border-gray-200 px-6 py-4 flex space-x-3">
          <button
            onClick={handleEmailShare}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Mail className="w-4 h-4" />
            <span>이메일로 전송</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
};
