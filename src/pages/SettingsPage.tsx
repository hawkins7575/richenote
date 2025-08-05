// ============================================================================
// 설정 페이지
// ============================================================================

import React, { useState } from 'react'
import { Save, Upload, Download, Bell, Shield, CreditCard, Palette, RefreshCw } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge, Modal, InstallButton } from '@/components/ui'
import { useTenant } from '@/contexts/TenantContext'
import { useProperties } from '@/hooks/useProperties'
import { supabase } from '@/services/supabase'

const SettingsPage: React.FC = () => {
  const { tenant } = useTenant()
  const { refreshProperties } = useProperties()
  const [activeTab, setActiveTab] = useState('general')
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

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

  const handleResetSampleData = async () => {
    if (!tenant?.id) {
      alert('테넌트 정보가 없습니다.')
      return
    }

    try {
      setResetLoading(true)
      console.log('🧹 샘플 데이터 초기화 시작:', tenant.id)
      
      // 1. 로컬 저장소에서 매물 상태 정보 모두 삭제
      console.log('🗑️ 로컬 저장소 상태 정보 삭제 중...')
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('property_status_')) {
          localStorage.removeItem(key)
          console.log('삭제된 키:', key)
        }
      })

      // 2. 현재 매물 개수 확인
      const { data: properties, error: fetchError } = await supabase
        .from('properties')
        .select('id')
        .eq('tenant_id', tenant.id)

      if (fetchError) {
        console.error('❌ 매물 조회 실패:', fetchError)
        throw new Error(`매물 조회 실패: ${fetchError.message}`)
      }

      console.log('📊 삭제할 매물 개수:', properties?.length || 0)

      if (!properties || properties.length === 0) {
        alert('삭제할 매물이 없습니다.')
        setResetModalOpen(false)
        return
      }

      // 3. 매물 데이터 삭제 (Supabase)
      console.log('🗑️ Supabase에서 매물 데이터 삭제 중...')
      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('tenant_id', tenant.id)

      if (deleteError) {
        console.error('❌ 매물 삭제 실패:', deleteError)
        throw new Error(`매물 삭제 실패: ${deleteError.message}`)
      }

      console.log('✅ 매물 데이터 삭제 완료')

      // 4. 데이터 새로고침
      console.log('🔄 데이터 새로고침 중...')
      await refreshProperties()
      
      setResetModalOpen(false)
      alert(`✅ ${properties.length}개의 샘플 매물이 성공적으로 삭제되었습니다!`)
      
    } catch (error) {
      console.error('💥 초기화 실패:', error)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      alert(`❌ 데이터 초기화 실패: ${errorMessage}`)
    } finally {
      setResetLoading(false)
    }
  }

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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      회사명
                    </label>
                    <Input 
                      defaultValue={tenant?.name || 'PropertyDesk'}
                      placeholder="회사명을 입력하세요"
                      className="text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      도메인 주소
                    </label>
                    <Input 
                      defaultValue={tenant?.slug || 'propertydesk'}
                      placeholder="도메인 주소"
                      readOnly
                      className="bg-gray-50 text-base"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                    회사 소개
                  </label>
                  <textarea 
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-base"
                    rows={3}
                    placeholder="회사 소개를 입력하세요"
                    defaultValue="부동산 전문 관리 솔루션 PropertyDesk입니다."
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      대표 전화번호
                    </label>
                    <Input 
                      placeholder="02-1234-5678"
                      defaultValue="02-1234-5678"
                      className="text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      대표 이메일
                    </label>
                    <Input 
                      type="email"
                      placeholder="contact@propertydesk.com"
                      defaultValue="contact@propertydesk.com"
                      className="text-base"
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

            {/* 앱 설치 */}
            <Card>
              <CardHeader>
                <CardTitle>앱 설치</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-base sm:text-lg text-gray-900 mb-2">PC에 바로가기 만들기</h4>
                      <p className="text-sm sm:text-base text-gray-600">
                        리체 매물장을 PC 바탕화면에 설치하여 더 편리하게 사용하세요.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <InstallButton />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>💡 PWA 설치 혜택:</strong>
                  </p>
                  <ul className="mt-2 text-sm text-gray-600 space-y-1">
                    <li>• 브라우저 없이 독립 실행</li>
                    <li>• 더 빠른 로딩 속도</li>
                    <li>• 오프라인에서도 일부 기능 사용</li>
                    <li>• 푸시 알림 수신 가능</li>
                  </ul>
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
                  <Button variant="outline" leftIcon={<Upload size={18} />} className="h-12 text-base">
                    데이터 가져오기
                  </Button>
                  <Button variant="outline" leftIcon={<Download size={18} />} className="h-12 text-base">
                    데이터 내보내기
                  </Button>
                  <Button 
                    variant="destructive" 
                    leftIcon={<RefreshCw size={18} />}
                    onClick={() => setResetModalOpen(true)}
                    className="h-12 text-base"
                  >
                    샘플 데이터 초기화
                  </Button>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm sm:text-base text-blue-800">
                    <strong>💡 샘플 데이터 초기화:</strong> 회원가입 시 제공된 샘플 매물 데이터를 모두 삭제하여 깨끗한 상태에서 시작할 수 있습니다.
                  </p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm sm:text-base text-yellow-800">
                    <strong>주의:</strong> 초기화된 데이터는 복구할 수 없습니다. 실제 매물 데이터를 등록하기 전에 진행해주세요.
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200 space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                          {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)} 플랜
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">
                          매물 {tenant.limits.max_properties}개 · 팀원 {tenant.limits.max_users}명 · 스토리지 {tenant.limits.max_storage_gb}GB
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <Badge variant="tenant" size="lg" className="text-sm">
                          {tenant.status === 'trial' ? '체험 중' : '활성'}
                        </Badge>
                        {tenant.trial_ends_at && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            체험 종료: {new Date(tenant.trial_ends_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 sm:p-6 bg-gray-50 rounded-lg">
                        <p className="text-sm sm:text-base text-gray-600">사용 중인 매물</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">156</p>
                        <p className="text-xs sm:text-sm text-gray-500">/ {tenant.limits.max_properties}개</p>
                      </div>
                      <div className="text-center p-4 sm:p-6 bg-gray-50 rounded-lg">
                        <p className="text-sm sm:text-base text-gray-600">팀원 수</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">8</p>
                        <p className="text-xs sm:text-sm text-gray-500">/ {tenant.limits.max_users}명</p>
                      </div>
                      <div className="text-center p-4 sm:p-6 bg-gray-50 rounded-lg">
                        <p className="text-sm sm:text-base text-gray-600">스토리지 사용량</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">2.3</p>
                        <p className="text-xs sm:text-sm text-gray-500">/ {tenant.limits.max_storage_gb}GB</p>
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
                      className={`p-4 sm:p-6 border rounded-lg cursor-pointer transition-colors ${
                        tenant?.plan === plan.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                          {plan.label.split(' (')[0]}
                        </h3>
                        {tenant?.plan === plan.value && (
                          <Badge variant="primary" size="sm" className="text-xs sm:text-sm">현재 플랜</Badge>
                        )}
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                        {plan.price.toLocaleString()}원<span className="text-sm font-normal text-gray-500">/월</span>
                      </p>
                      {tenant?.plan !== plan.value && (
                        <Button size="sm" variant="outline" className="w-full h-10 text-base">
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
                <div className="p-4 sm:p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-base">등록된 카드</span>
                    <Badge variant="success" size="sm" className="text-xs sm:text-sm">활성</Badge>
                  </div>
                  <p className="text-gray-600 text-base sm:text-lg">•••• •••• •••• 4567</p>
                  <p className="text-sm sm:text-base text-gray-500">만료일: 12/25</p>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Button variant="outline" className="flex-1 h-12 text-base">
                    결제 수단 변경
                  </Button>
                  <Button variant="outline" className="flex-1 h-12 text-base">
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
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      로고 업로드
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center">
                      <Upload className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                      <p className="mt-2 text-sm sm:text-base text-gray-600">
                        이미지를 드래그하거나 클릭하여 업로드
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        PNG, JPG 최대 2MB
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      브랜드 커러
                    </label>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm text-gray-600 mb-1">주 커러</label>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="color" 
                            defaultValue="#3b82f6"
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded border border-gray-300"
                          />
                          <Input 
                            defaultValue="#3b82f6"
                            placeholder="#3b82f6"
                            className="flex-1 text-base"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm text-gray-600 mb-1">보조 커러</label>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="color" 
                            defaultValue="#1d4ed8"
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded border border-gray-300"
                          />
                          <Input 
                            defaultValue="#1d4ed8"
                            placeholder="#1d4ed8"
                            className="flex-1 text-base"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-base sm:text-lg text-gray-900 mb-3">미리보기</h4>
                  <div className="p-4 sm:p-6 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-base">
                        P
                      </div>
                      <div>
                        <p className="font-semibold text-base sm:text-lg text-gray-900">PropertyDesk</p>
                        <p className="text-sm sm:text-base text-gray-600">새로운 브랜드 스타일</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button leftIcon={<Save size={18} />} className="h-12 text-base">
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
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 bg-gray-50 rounded-lg space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-base sm:text-lg text-gray-900">새로운 매물 등록</h4>
                      <p className="text-sm sm:text-base text-gray-600">매물이 새로 등록될 때 알림</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
                        <span className="text-sm sm:text-base">이메일</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
                        <span className="text-sm sm:text-base">앱 알림</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 bg-gray-50 rounded-lg space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-base sm:text-lg text-gray-900">계약 완료</h4>
                      <p className="text-sm sm:text-base text-gray-600">계약이 완료될 때 알림</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
                        <span className="text-sm sm:text-base">이메일</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded w-4 h-4" />
                        <span className="text-sm sm:text-base">앱 알림</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 bg-gray-50 rounded-lg space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-base sm:text-lg text-gray-900">팀원 초대</h4>
                      <p className="text-sm sm:text-base text-gray-600">새로운 팀원이 초대될 때 알림</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
                        <span className="text-sm sm:text-base">이메일</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
                        <span className="text-sm sm:text-base">앱 알림</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 bg-gray-50 rounded-lg space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-base sm:text-lg text-gray-900">시스템 업데이트</h4>
                      <p className="text-sm sm:text-base text-gray-600">시스템 업데이트 및 유지보수 알림</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
                        <span className="text-sm sm:text-base">이메일</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded w-4 h-4" />
                        <span className="text-sm sm:text-base">앱 알림</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-base sm:text-lg text-gray-900 mb-3">알림 시간 설정</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                        알림 시작 시간
                      </label>
                      <Input type="time" defaultValue="09:00" className="text-base h-12" />
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                        알림 종료 시간
                      </label>
                      <Input type="time" defaultValue="18:00" className="text-base h-12" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button leftIcon={<Save size={18} />} className="h-12 text-base">
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">설정</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          시스템 설정을 관리하고 커스터마이징할 수 있습니다
        </p>
      </div>

      {/* 탭 메뉴 - 모바일 최적화 */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto px-4 sm:px-6 scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-3 sm:px-4 border-b-2 font-medium text-sm sm:text-base transition-colors whitespace-nowrap min-w-max ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
                </button>
              )
            })}
          </nav>
        </div>
        
        <div className="p-4 sm:p-6">
          {renderTabContent()}
        </div>
      </Card>

      {/* 샘플 데이터 초기화 확인 모달 */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="샘플 데이터 초기화"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <RefreshCw className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                정말로 샘플 데이터를 초기화하시겠습니까?
              </h3>
              <div className="mt-2 text-sm text-gray-600">
                <p>이 작업을 수행하면:</p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>모든 샘플 매물 데이터가 삭제됩니다</li>
                  <li>매물 상태 정보가 초기화됩니다</li>
                  <li>삭제된 데이터는 복구할 수 없습니다</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>참고:</strong> 초기화 후에는 깨끗한 상태에서 실제 매물 데이터를 등록할 수 있습니다.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setResetModalOpen(false)}
              disabled={resetLoading}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleResetSampleData}
              disabled={resetLoading}
              leftIcon={resetLoading ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            >
              {resetLoading ? '초기화 중...' : '초기화 실행'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export { SettingsPage }