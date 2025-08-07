// ============================================================================
// 팀 초대 수락 컴포넌트
// ============================================================================

import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, X, Users, Building, Mail, Clock } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface InvitationData {
  id: string
  email: string
  role: string
  status: string
  expires_at: string
  tenant_id: string
  inviter_id: string
  tenant?: {
    name: string
  }
  inviter?: {
    name: string
  }
}

export const InvitationAccept: React.FC = () => {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      loadInvitation()
    } else {
      setError('유효하지 않은 초대 링크입니다.')
      setLoading(false)
    }
  }, [token])

  const loadInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('team_invitations')
        .select(`
          id,
          email,
          role,
          status,
          expires_at,
          tenant_id,
          inviter_id
        `)
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .single()

      if (error || !data) {
        setError('초대를 찾을 수 없거나 이미 처리된 초대입니다.')
        return
      }

      // 만료 확인
      if (new Date(data.expires_at) < new Date()) {
        setError('만료된 초대입니다.')
        return
      }

      // 사용자 이메일 확인 (로그인한 사용자의 이메일과 일치하는지)
      if (user?.email !== data.email) {
        setError('초대받은 이메일과 로그인한 계정이 다릅니다.')
        return
      }

      // 팀과 초대자 정보 추가로 가져오기
      const [tenantResponse, inviterResponse] = await Promise.all([
        supabase.from('tenants').select('name').eq('id', data.tenant_id).single(),
        supabase.from('user_profiles').select('name').eq('id', data.inviter_id).single()
      ])

      const invitationWithDetails = {
        ...data,
        tenant: { name: tenantResponse.data?.name || '알 수 없는 팀' },
        inviter: { name: inviterResponse.data?.name || '알 수 없는 사용자' }
      }

      setInvitation(invitationWithDetails)
    } catch (error) {
      console.error('초대 정보 로드 실패:', error)
      setError('초대 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!invitation || !user) return

    try {
      setProcessing(true)

      // 초대 상태를 'accepted'로 변경
      const { error: inviteError } = await supabase
        .from('team_invitations')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitation.id)

      if (inviteError) throw inviteError

      // 초대 데이터에서 tenant_id 직접 사용

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          tenant_id: invitation.tenant_id,
          role: invitation.role,
          joined_at: new Date().toISOString(),
          status: 'active'
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // 활동 로그 기록
      await supabase
        .from('team_activity_logs')
        .insert({
          tenant_id: invitation.tenant_id,
          user_id: user.id,
          action: 'invitation_accepted',
          details: {
            invitation_id: invitation.id,
            role: invitation.role
          }
        })

      alert('팀 초대를 수락했습니다! 잠시 후 대시보드로 이동합니다.')
      
      // 대시보드로 리다이렉트
      setTimeout(() => {
        navigate('/')
      }, 1000)

    } catch (error: any) {
      console.error('초대 수락 실패:', error)
      setError(error.message || '초대 수락에 실패했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  const handleDecline = async () => {
    if (!invitation) return

    if (!confirm('정말로 초대를 거절하시겠습니까?')) return

    try {
      setProcessing(true)

      // 초대 상태를 'declined'로 변경
      const { error } = await supabase
        .from('team_invitations')
        .update({ 
          status: 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitation.id)

      if (error) throw error

      alert('초대를 거절했습니다.')
      navigate('/')

    } catch (error: any) {
      console.error('초대 거절 실패:', error)
      setError(error.message || '초대 거절에 실패했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      owner: '팀 소유자',
      admin: '관리자',
      member: '멤버',
      viewer: '뷰어'
    }
    return labels[role as keyof typeof labels] || role
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">초대 정보를 확인하는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              대시보드로 이동
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!invitation) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">팀 초대</h2>
          <p className="text-gray-600">팀에 합류하도록 초대되었습니다</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Building className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">팀</p>
              <p className="font-medium text-gray-900">{invitation.tenant?.name || '알 수 없는 팀'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">초대자</p>
              <p className="font-medium text-gray-900">{invitation.inviter?.name || '알 수 없는 사용자'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Users className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">역할</p>
              <p className="font-medium text-gray-900">{getRoleLabel(invitation.role)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">만료일</p>
              <p className="font-medium text-gray-900">
                {new Date(invitation.expires_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleDecline}
            disabled={processing}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            거절
          </button>
          <button
            onClick={handleAccept}
            disabled={processing}
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
          >
            {processing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>수락</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          초대를 수락하면 현재 팀에서 나가고 새로운 팀으로 이동됩니다.
        </p>
      </div>
    </div>
  )
}