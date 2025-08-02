// ============================================================================
// 팀원 초대 모달 컴포넌트
// ============================================================================

import React, { useState } from 'react'
import { X, Mail, UserCheck, AlertCircle } from 'lucide-react'
import { 
  Button, 
  Input, 
  Select, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui'
import { usePermissions } from '@/hooks/usePermissions'
import { useTenant } from '@/contexts/TenantContext'
import { ROLE_DEFINITIONS, type UserRole, type UserInvitation } from '@/types'

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: (invitation: Omit<UserInvitation, 'id' | 'tenant_id' | 'invited_by' | 'status' | 'invited_at' | 'expires_at'>) => Promise<void>
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  onInvite
}) => {
  const { can, canManageRole } = usePermissions()
  const { tenant } = useTenant()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    role: 'agent' as UserRole,
    message: ''
  })

  // 초대 가능한 역할 목록 (자신보다 하위 역할만)
  const availableRoles = Object.values(ROLE_DEFINITIONS).filter(role => 
    canManageRole(role.role)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!can.inviteUser) {
      setError('팀원을 초대할 권한이 없습니다.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onInvite({
        email: formData.email,
        role: formData.role
      })
      
      // 성공 시 폼 초기화 및 모달 닫기
      setFormData({ email: '', role: 'agent', message: '' })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '초대 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5" />
            <span>팀원 초대</span>
          </CardTitle>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 오류 메시지 */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* 이메일 입력 */}
            <div>
              <Input
                type="email"
                placeholder="초대할 사용자의 이메일 주소"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                leftIcon={<Mail size={20} />}
                required
              />
            </div>

            {/* 역할 선택 */}
            <div>
              <Select
                label="역할"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                options={availableRoles.map(role => ({
                  value: role.role,
                  label: `${role.name} - ${role.description}`
                }))}
                required
              />
            </div>

            {/* 선택된 역할의 권한 정보 */}
            {formData.role && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  {ROLE_DEFINITIONS[formData.role].name} 권한
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  {ROLE_DEFINITIONS[formData.role].permissions.slice(0, 5).map((permission, index) => (
                    <li key={index}>• {permission}</li>
                  ))}
                  {ROLE_DEFINITIONS[formData.role].permissions.length > 5 && (
                    <li className="text-blue-600">
                      외 {ROLE_DEFINITIONS[formData.role].permissions.length - 5}개 권한
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* 초대 메시지 (선택사항) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                초대 메시지 (선택사항)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder={`${tenant?.name || 'PropertyDesk'} 팀에 합류해주세요!`}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            {/* 버튼 */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={!formData.email || !can.inviteUser}
                className="flex-1"
              >
                초대 보내기
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}