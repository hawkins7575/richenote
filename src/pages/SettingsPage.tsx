// ============================================================================
// 설정 페이지
// ============================================================================

import React, { useState } from 'react'
import { Save, Upload, Download, Trash2, Bell, Shield, CreditCard, Palette } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge } from '@/components/ui'
import { useTenant } from '@/contexts/TenantContext'

const SettingsPage: React.FC = () => {
  const { tenant } = useTenant()
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', label: '일반 설정', icon: Shield },
    { id: 'billing', label: '결제 및 요금제', icon: CreditCard },
    { id: 'branding', label: '브랜딩', icon: Palette },
    { id: 'notifications', label: '알림 설정', icon: Bell },
  ]

  const planOptions = [
    { value: 'starter', label: '스타터 (19,000원/월)', price: 19000 },
    { value: 'professional', label: '프로페셔널 (39,000원/월)', price: 39000 },
    { value: 'business', label: '비즈니스 (69,000원/월)', price: 69000 },
    { value: 'enterprise', label: '엔터프라이즈 (99,000원/월)', price: 99000 },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      회사명
                    </label>
                    <Input 
                      defaultValue={tenant?.name || 'PropertyDesk'}
                      placeholder="회사명을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      도메인 주소
                    </label>
                    <Input 
                      defaultValue={tenant?.slug || 'propertydesk'}
                      placeholder="도메인 주소"
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    회사 소개
                  </label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    rows={3}
                    placeholder="회사 소개를 입력하세요"
                    defaultValue="부동산 전문 관리 솔루션 PropertyDesk입니다."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      대표 전화번호
                    </label>
                    <Input 
                      placeholder="02-1234-5678"
                      defaultValue="02-1234-5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      대표 이메일
                    </label>
                    <Input 
                      type="email"
                      placeholder="contact@propertydesk.com"
                      defaultValue="contact@propertydesk.com"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button leftIcon={<Save size={16} />}>
                    변경사항 저장
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 데이터 관리 */}
            <Card>
              <CardHeader>
                <CardTitle>데이터 관리</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" leftIcon={<Upload size={16} />}>
                    데이터 가져오기
                  </Button>
                  <Button variant="outline" leftIcon={<Download size={16} />}>
                    데이터 내보내기
                  </Button>
                  <Button variant="destructive" leftIcon={<Trash2 size={16} />}>
                    모든 데이터 삭제
                  </Button>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>주의:</strong> 데이터 삭제는 되돌릴 수 없습니다. 신중하게 진행해주세요.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'billing':
        return (
          <div className="space-y-6">
            {/* 현재 플랜 */}
            <Card>
              <CardHeader>
                <CardTitle>현재 플랜</CardTitle>
              </CardHeader>
              <CardContent>
                {tenant && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)} 플랜
                        </h3>
                        <p className="text-gray-600">
                          매물 {tenant.limits.max_properties}개 · 팀원 {tenant.limits.max_users}명 · 스토리지 {tenant.limits.max_storage_gb}GB
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="tenant" size="lg">
                          {tenant.status === 'trial' ? '체험 중' : '활성'}
                        </Badge>
                        {tenant.trial_ends_at && (
                          <p className="text-xs text-gray-600 mt-1">
                            체험 종료: {new Date(tenant.trial_ends_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">사용 중인 매물</p>
                        <p className="text-2xl font-bold text-gray-900">156</p>
                        <p className="text-xs text-gray-500">/ {tenant.limits.max_properties}개</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">팀원 수</p>
                        <p className="text-2xl font-bold text-gray-900">8</p>
                        <p className="text-xs text-gray-500">/ {tenant.limits.max_users}명</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">스토리지 사용량</p>
                        <p className="text-2xl font-bold text-gray-900">2.3</p>
                        <p className="text-xs text-gray-500">/ {tenant.limits.max_storage_gb}GB</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 플랜 변경 */}
            <Card>
              <CardHeader>
                <CardTitle>플랜 변경</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {planOptions.map(plan => (
                    <div 
                      key={plan.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        tenant?.plan === plan.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {plan.label.split(' (')[0]}
                        </h3>
                        {tenant?.plan === plan.value && (
                          <Badge variant="primary" size="sm">현재 플랜</Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.price.toLocaleString()}원<span className="text-sm font-normal text-gray-500">/월</span>
                      </p>
                      {tenant?.plan !== plan.value && (
                        <Button size="sm" variant="outline" className="w-full">
                          플랜 변경
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 결제 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>결제 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">등록된 카드</span>
                    <Badge variant="success" size="sm">활성</Badge>
                  </div>
                  <p className="text-gray-600">•••• •••• •••• 4567</p>
                  <p className="text-sm text-gray-500">만료일: 12/25</p>
                </div>
                
                <div className="flex space-x-4">
                  <Button variant="outline" className="flex-1">
                    결제 수단 변경
                  </Button>
                  <Button variant="outline" className="flex-1">
                    결제 내역 보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'branding':
        return (
          <div className="space-y-6">
            {/* 브랜드 설정 */}
            <Card>
              <CardHeader>
                <CardTitle>브랜드 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      로고 업로드
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        이미지를 드래그하거나 클릭하여 업로드
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG 최대 2MB
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      브랜드 커러
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">주 커러</label>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="color" 
                            defaultValue="#3b82f6"
                            className="w-10 h-10 rounded border border-gray-300"
                          />
                          <Input 
                            defaultValue="#3b82f6"
                            placeholder="#3b82f6"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">보조 커러</label>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="color" 
                            defaultValue="#1d4ed8"
                            className="w-10 h-10 rounded border border-gray-300"
                          />
                          <Input 
                            defaultValue="#1d4ed8"
                            placeholder="#1d4ed8"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">미리보기</h4>
                  <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        P
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">PropertyDesk</p>
                        <p className="text-sm text-gray-600">새로운 브랜드 스타일</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button leftIcon={<Save size={16} />}>
                    브랜드 설정 저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            {/* 알림 설정 */}
            <Card>
              <CardHeader>
                <CardTitle>알림 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">새로운 매물 등록</h4>
                      <p className="text-sm text-gray-600">매물이 새로 등록될 때 알림</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">이메일</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">앱 알림</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">계약 완료</h4>
                      <p className="text-sm text-gray-600">계약이 완료될 때 알림</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">이메일</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">앱 알림</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">팀원 초대</h4>
                      <p className="text-sm text-gray-600">새로운 팀원이 초대될 때 알림</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">이메일</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">앱 알림</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">시스템 업데이트</h4>
                      <p className="text-sm text-gray-600">시스템 업데이트 및 유지보수 알림</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">이메일</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">앱 알림</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">알림 시간 설정</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        알림 시작 시간
                      </label>
                      <Input type="time" defaultValue="09:00" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        알림 종료 시간
                      </label>
                      <Input type="time" defaultValue="18:00" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button leftIcon={<Save size={16} />}>
                    알림 설정 저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-gray-600 mt-1">
          시스템 설정을 관리하고 커스터마이징할 수 있습니다
        </p>
      </div>

      {/* 탭 메뉴 */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </Card>
    </div>
  )
}

export { SettingsPage }