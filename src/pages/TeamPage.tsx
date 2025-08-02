// ============================================================================
// 팀 관리 페이지
// ============================================================================

import React, { useState } from 'react'
import { Plus, Mail, Phone, Settings, Shield, UserCheck, UserX } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Input, Select } from '@/components/ui'
import { useTenant } from '@/contexts/TenantContext'

const TeamPage: React.FC = () => {
  const { tenant } = useTenant()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('전체')

  // 임시 팀원 데이터
  const teamMembers = [
    {
      id: 1,
      name: '김대표',
      email: 'ceo@propertydesk.com',
      phone: '010-1234-5678',
      role: 'admin',
      status: 'active',
      joinedAt: '2023-01-15',
      lastLogin: '2시간 전',
      avatar: null,
    },
    {
      id: 2,
      name: '이팀장',
      email: 'manager@propertydesk.com',
      phone: '010-2345-6789',
      role: 'manager',
      status: 'active',
      joinedAt: '2023-03-20',
      lastLogin: '1일 전',
      avatar: null,
    },
    {
      id: 3,
      name: '박사원',
      email: 'agent@propertydesk.com',
      phone: '010-3456-7890',
      role: 'agent',
      status: 'inactive',
      joinedAt: '2023-06-10',
      lastLogin: '1주 전',
      avatar: null,
    },
  ]

  const roleOptions = [
    { value: '전체', label: '전체' },
    { value: 'admin', label: '관리자' },
    { value: 'manager', label: '팀장' },
    { value: 'agent', label: '상담원' },
  ]

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: '관리자',
      manager: '팀장',
      agent: '상담원',
    }
    return roleMap[role] || role
  }

  const getRoleBadgeVariant = (role: string) => {
    const variantMap: Record<string, any> = {
      admin: 'destructive',
      manager: 'warning',
      agent: 'secondary',
    }
    return variantMap[role] || 'secondary'
  }

  const getStatusBadgeVariant = (status: string) => {
    return status === 'active' ? 'success' : 'secondary'
  }

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === '전체' || member.role === selectedRole
    
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">팀 관리</h1>
          <p className="text-gray-600 mt-1">
            총 <span className="font-semibold text-primary-600">{filteredMembers.length}</span>명의 팀원
          </p>
        </div>
        <Button leftIcon={<Plus size={18} />}>
          팀원 초대
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="이름, 이메일로 검색하세요..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Mail size={20} />}
            />
          </div>
          <Select
            options={roleOptions}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-40"
          />
        </div>
      </Card>

      {/* 플랜 제한 정보 */}
      {tenant && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)} 플랜
                  </p>
                  <p className="text-sm text-gray-600">
                    최대 {tenant.limits.max_users}명까지 팀원 추가 가능
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  현재 {teamMembers.length}명 / {tenant.limits.max_users}명
                </p>
                <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(teamMembers.length / tenant.limits.max_users) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 팀원 리스트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMembers.map(member => (
          <Card key={member.id} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getRoleBadgeVariant(member.role)} size="sm">
                    {getRoleLabel(member.role)}
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(member.status)} size="sm">
                    {member.status === 'active' ? '활성' : '비활성'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Phone size={16} />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <UserCheck size={16} />
                  <span>가입일: {member.joinedAt}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <UserCheck size={16} />
                  <span>마지막 로그인: {member.lastLogin}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                <Button size="sm" variant="outline" className="flex-1">
                  <Settings size={14} className="mr-1" />
                  권한 설정
                </Button>
                {member.status === 'active' ? (
                  <Button size="sm" variant="outline" className="flex-1">
                    <UserX size={14} className="mr-1" />
                    비활성화
                  </Button>
                ) : (
                  <Button size="sm" variant="primary" className="flex-1">
                    <UserCheck size={14} className="mr-1" />
                    활성화
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 빈 상태 */}
      {filteredMembers.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Shield size={48} className="mx-auto" />
          </div>
          <p className="text-gray-500">검색 조건에 맞는 팀원이 없습니다.</p>
        </Card>
      )}
    </div>
  )
}

export { TeamPage }