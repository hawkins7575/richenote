// ============================================================================
// 설정 페이지
// ============================================================================

import React, { useState } from 'react'
import { Save, Upload, Download, Bell, Shield, CreditCard, Palette, RefreshCw } from 'lucide-react'
import { Button, Input, Badge, Modal, InstallButton } from '@/components/ui'
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
          <div className="space-y-8">
            {/* 기본 정보 - 전체 너비 활용 */}
            <div className="bg-gray-50 rounded-xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">기본 정보</h2>
                <Button leftIcon={<Save size={18} />} size="lg" className="h-12 px-6 text-base">
                  변경사항 저장
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
                      회사명
                    </label>
                    <Input 
                      defaultValue={tenant?.name || 'PropertyDesk'}
                      placeholder="회사명을 입력하세요"
                      className="text-base h-12 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
                      도메인 주소
                    </label>
                    <Input 
                      defaultValue={tenant?.slug || 'propertydesk'}
                      placeholder="도메인 주소"
                      readOnly
                      className="bg-gray-100 text-base h-12"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
                    회사 소개
                  </label>
                  <textarea 
                    className="w-full p-4 sm:p-5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-base bg-white"
                    rows={4}
                    placeholder="회사 소개를 입력하세요"
                    defaultValue="부동산 전문 관리 솔루션 PropertyDesk입니다."
                  />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
                      대표 전화번호
                    </label>
                    <Input 
                      placeholder="02-1234-5678"
                      defaultValue="02-1234-5678"
                      className="text-base h-12 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
                      대표 이메일
                    </label>
                    <Input 
                      type="email"
                      placeholder="contact@propertydesk.com"
                      defaultValue="contact@propertydesk.com"
                      className="text-base h-12 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 앱 설치 - 전체 너비 활용 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 sm:p-8 border border-blue-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">앱 설치</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 설치 버튼 영역 */}
                <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-blue-300">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-3">PC에 바로가기 만들기</h3>
                      <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                        리체 매물장을 PC 바탕화면에 설치하여 더 편리하게 사용하세요.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <InstallButton />
                    </div>
                  </div>
                </div>
                
                {/* PWA 혜택 */}
                <div className="bg-white rounded-lg p-6 border border-blue-300">
                  <h4 className="font-bold text-lg text-gray-900 mb-4">💡 PWA 설치 혜택</h4>
                  <ul className="space-y-3 text-base text-gray-700">
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>브라우저 없이 독립 실행</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>더 빠른 로딩 속도</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>오프라인 일부 기능 사용</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>푸시 알림 수신 가능</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 데이터 관리 - 전체 너비 활용 */}
            <div className="bg-gray-50 rounded-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">데이터 관리</h2>
              
              <div className="space-y-6">
                {/* 데이터 작업 버튼들 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    leftIcon={<Upload size={20} />} 
                    size="lg"
                    className="h-16 text-base font-semibold bg-white hover:bg-green-50 border-2 hover:border-green-300"
                  >
                    <div className="text-center">
                      <div>데이터 가져오기</div>
                      <div className="text-xs text-gray-500 mt-1">Excel, CSV 파일 지원</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    leftIcon={<Download size={20} />} 
                    size="lg"
                    className="h-16 text-base font-semibold bg-white hover:bg-blue-50 border-2 hover:border-blue-300"
                  >
                    <div className="text-center">
                      <div>데이터 내보내기</div>
                      <div className="text-xs text-gray-500 mt-1">백업 및 분석용</div>
                    </div>
                  </Button>
                  <Button 
                    variant="destructive" 
                    leftIcon={<RefreshCw size={20} />}
                    onClick={() => setResetModalOpen(true)}
                    size="lg"
                    className="h-16 text-base font-semibold"
                  >
                    <div className="text-center">
                      <div>샘플 데이터 초기화</div>
                      <div className="text-xs text-red-100 mt-1">복구 불가능</div>
                    </div>
                  </Button>
                </div>
                
                {/* 안내 메시지들 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-blue-100 border-l-4 border-blue-500 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <div className="text-blue-600 text-2xl">💡</div>
                      <div>
                        <h4 className="font-bold text-lg text-blue-900 mb-2">샘플 데이터 초기화</h4>
                        <p className="text-base text-blue-800 leading-relaxed">
                          회원가입 시 제공된 샘플 매물 데이터를 모두 삭제하여 깨끗한 상태에서 시작할 수 있습니다.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <div className="text-yellow-600 text-2xl">⚠️</div>
                      <div>
                        <h4 className="font-bold text-lg text-yellow-900 mb-2">중요 주의사항</h4>
                        <p className="text-base text-yellow-800 leading-relaxed">
                          초기화된 데이터는 복구할 수 없습니다. 실제 매물 데이터를 등록하기 전에 진행해주세요.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'billing':
        return (
          <div className="space-y-8">
            {/* 현재 플랜 - 전체 너비 활용 */}
            <div className="bg-gradient-to-r from-primary-50 via-blue-50 to-indigo-50 rounded-xl p-6 sm:p-8 border border-primary-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">현재 플랜</h2>
              
              {tenant && (
                <div className="space-y-6">
                  {/* 플랜 정보 헤더 */}
                  <div className="bg-white rounded-lg p-6 border border-primary-300 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1">
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                          {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)} 플랜
                        </h3>
                        <p className="text-base sm:text-lg text-gray-700">
                          매물 {tenant.limits.max_properties}개 · 팀원 {tenant.limits.max_users}명 · 스토리지 {tenant.limits.max_storage_gb}GB
                        </p>
                      </div>
                      <div className="text-left lg:text-right">
                        <Badge variant="tenant" size="lg" className="text-base px-4 py-2">
                          {tenant.status === 'trial' ? '체험 중' : '활성 상태'}
                        </Badge>
                        {tenant.trial_ends_at && (
                          <p className="text-sm sm:text-base text-gray-600 mt-2">
                            체험 종료: {new Date(tenant.trial_ends_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 사용량 통계 */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="text-center p-6 sm:p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">156</div>
                      <p className="text-base sm:text-lg font-semibold text-gray-800 mb-1">사용 중인 매물</p>
                      <p className="text-sm sm:text-base text-gray-500">/ {tenant.limits.max_properties}개 제한</p>
                      <div className="mt-3 bg-gray-200 rounded-full h-2">
                        <div className="bg-primary-600 h-2 rounded-full" style={{width: `${(156/tenant.limits.max_properties)*100}%`}}></div>
                      </div>
                    </div>
                    <div className="text-center p-6 sm:p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">8</div>
                      <p className="text-base sm:text-lg font-semibold text-gray-800 mb-1">팀원 수</p>
                      <p className="text-sm sm:text-base text-gray-500">/ {tenant.limits.max_users}명 제한</p>
                      <div className="mt-3 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: `${(8/tenant.limits.max_users)*100}%`}}></div>
                      </div>
                    </div>
                    <div className="text-center p-6 sm:p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">2.3</div>
                      <p className="text-base sm:text-lg font-semibold text-gray-800 mb-1">스토리지 사용량</p>
                      <p className="text-sm sm:text-base text-gray-500">/ {tenant.limits.max_storage_gb}GB 제한</p>
                      <div className="mt-3 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: `${(2.3/tenant.limits.max_storage_gb)*100}%`}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 플랜 변경 - 전체 너비 활용 */}
            <div className="bg-gray-50 rounded-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">플랜 변경</h2>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {planOptions.map(plan => (
                  <div 
                    key={plan.value}
                    className={`p-6 sm:p-8 border-2 rounded-xl cursor-pointer transition-all duration-200 bg-white ${
                      tenant?.plan === plan.value
                        ? 'border-primary-500 shadow-lg ring-2 ring-primary-100'
                        : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-xl sm:text-2xl text-gray-900">
                        {plan.label.split(' (')[0]}
                      </h3>
                      {tenant?.plan === plan.value && (
                        <Badge variant="primary" size="lg" className="text-sm px-3 py-1">현재 플랜</Badge>
                      )}
                    </div>
                    <div className="mb-6">
                      <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                        {plan.price.toLocaleString()}원
                      </span>
                      <span className="text-lg text-gray-500 ml-1">/월</span>
                    </div>
                    {tenant?.plan !== plan.value && (
                      <Button size="lg" variant="outline" className="w-full h-12 text-base font-semibold">
                        이 플랜으로 변경
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 결제 정보 - 전체 너비 활용 */}
            <div className="bg-gray-50 rounded-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">결제 정보</h2>
              
              <div className="space-y-6">
                {/* 등록된 카드 정보 */}
                <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                        <CreditCard size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="font-bold text-lg text-gray-900">등록된 카드</span>
                          <Badge variant="success" size="sm" className="text-sm">활성</Badge>
                        </div>
                        <p className="text-gray-600 text-lg font-mono">•••• •••• •••• 4567</p>
                        <p className="text-base text-gray-500">만료일: 12/25</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 결제 관리 버튼들 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="h-14 text-base font-semibold bg-white hover:bg-blue-50 border-2 hover:border-blue-300"
                  >
                    <CreditCard size={20} className="mr-2" />
                    결제 수단 변경
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="h-14 text-base font-semibold bg-white hover:bg-green-50 border-2 hover:border-green-300"
                  >
                    <Download size={20} className="mr-2" />
                    결제 내역 보기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'branding':
        return (
          <div className="space-y-8">
            {/* 브랜드 설정 - 전체 너비 활용 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 sm:p-8 border border-purple-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">브랜드 설정</h2>
                <Button leftIcon={<Save size={20} />} size="lg" className="h-12 px-6 text-base">
                  브랜드 설정 저장
                </Button>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* 로고 업로드 섹션 */}
                <div className="bg-white rounded-lg p-6 sm:p-8 border border-purple-200 shadow-sm">
                  <label className="block text-lg sm:text-xl font-bold text-gray-800 mb-4">
                    로고 업로드
                  </label>
                  <div className="border-3 border-dashed border-purple-300 rounded-xl p-8 sm:p-10 text-center hover:border-purple-400 transition-colors cursor-pointer">
                    <Upload className="mx-auto h-16 w-16 sm:h-20 sm:w-20 text-purple-400 mb-4" />
                    <p className="text-base sm:text-lg text-gray-700 font-medium mb-2">
                      이미지를 드래그하거나 클릭하여 업로드
                    </p>
                    <p className="text-sm sm:text-base text-gray-500">
                      PNG, JPG 파일 / 최대 2MB
                    </p>
                  </div>
                </div>
                
                {/* 브랜드 컬러 섹션 */}
                <div className="bg-white rounded-lg p-6 sm:p-8 border border-purple-200 shadow-sm">
                  <label className="block text-lg sm:text-xl font-bold text-gray-800 mb-4">
                    브랜드 컬러
                  </label>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-3">주 컬러</label>
                      <div className="flex items-center space-x-4">
                        <input 
                          type="color" 
                          defaultValue="#3b82f6"
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-gray-300 cursor-pointer"
                        />
                        <Input 
                          defaultValue="#3b82f6"
                          placeholder="#3b82f6"
                          className="flex-1 text-base h-12 bg-gray-50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-3">보조 컬러</label>
                      <div className="flex items-center space-x-4">
                        <input 
                          type="color" 
                          defaultValue="#1d4ed8"
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-gray-300 cursor-pointer"
                        />
                        <Input 
                          defaultValue="#1d4ed8"
                          placeholder="#1d4ed8"
                          className="flex-1 text-base h-12 bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 미리보기 섹션 */}
              <div className="mt-8 bg-white rounded-lg p-6 sm:p-8 border border-purple-200 shadow-sm">
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-4">브랜드 미리보기</h3>
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 sm:p-8 border border-primary-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg">
                      P
                    </div>
                    <div>
                      <p className="font-bold text-xl sm:text-2xl text-gray-900">PropertyDesk</p>
                      <p className="text-base sm:text-lg text-gray-600 mt-1">새로운 브랜드 스타일 적용</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-8">
            {/* 알림 설정 - 전체 너비 활용 */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 sm:p-8 border border-green-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">알림 설정</h2>
                <Button leftIcon={<Save size={20} />} size="lg" className="h-12 px-6 text-base">
                  알림 설정 저장
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* 알림 항목들 */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white rounded-lg p-6 sm:p-8 border border-green-200 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex items-start space-x-3">
                        <Bell className="w-6 h-6 text-green-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-1">새로운 매물 등록</h3>
                          <p className="text-base sm:text-lg text-gray-600">매물이 새로 등록될 때 알림을 받습니다</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded w-5 h-5 text-green-600" />
                          <span className="text-base font-medium">이메일</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded w-5 h-5 text-green-600" />
                          <span className="text-base font-medium">앱 알림</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 sm:p-8 border border-green-200 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex items-start space-x-3">
                        <Bell className="w-6 h-6 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-1">계약 완료</h3>
                          <p className="text-base sm:text-lg text-gray-600">계약이 완료될 때 알림을 받습니다</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded w-5 h-5 text-blue-600" />
                          <span className="text-base font-medium">이메일</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input type="checkbox" className="rounded w-5 h-5 text-blue-600" />
                          <span className="text-base font-medium">앱 알림</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 sm:p-8 border border-green-200 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex items-start space-x-3">
                        <Bell className="w-6 h-6 text-purple-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-1">팀원 초대</h3>
                          <p className="text-base sm:text-lg text-gray-600">새로운 팀원이 초대될 때 알림을 받습니다</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded w-5 h-5 text-purple-600" />
                          <span className="text-base font-medium">이메일</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded w-5 h-5 text-purple-600" />
                          <span className="text-base font-medium">앱 알림</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 sm:p-8 border border-green-200 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex items-start space-x-3">
                        <Bell className="w-6 h-6 text-orange-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-1">시스템 업데이트</h3>
                          <p className="text-base sm:text-lg text-gray-600">시스템 업데이트 및 유지보수 알림을 받습니다</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded w-5 h-5 text-orange-600" />
                          <span className="text-base font-medium">이메일</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input type="checkbox" className="rounded w-5 h-5 text-orange-600" />
                          <span className="text-base font-medium">앱 알림</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 알림 시간 설정 */}
                <div className="bg-white rounded-lg p-6 sm:p-8 border border-green-200 shadow-sm">
                  <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-6">알림 시간 설정</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
                        알림 시작 시간
                      </label>
                      <Input 
                        type="time" 
                        defaultValue="09:00" 
                        className="text-base h-14 bg-gray-50 text-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
                        알림 종료 시간
                      </label>
                      <Input 
                        type="time" 
                        defaultValue="18:00" 
                        className="text-base h-14 bg-gray-50 text-lg font-mono"
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-base text-blue-800">
                      💡 <strong>알림 시간 안내:</strong> 설정된 시간 외에는 긴급하지 않은 알림이 발송되지 않습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-none space-y-6">
      {/* 페이지 헤더 - 전체 너비 활용 */}
      <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">설정</h1>
            <p className="text-base sm:text-lg text-gray-600 mt-2">
              시스템 설정을 관리하고 커스터마이징할 수 있습니다
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="success" size="lg" className="text-sm">
              {tenant?.status === 'trial' ? '체험 중' : '활성 상태'}
            </Badge>
            <Badge variant="primary" size="lg" className="text-sm">
              {tenant?.plan || 'Professional'} 플랜
            </Badge>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 - 전체 너비 최적화 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto px-6 sm:px-8 scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-5 px-4 sm:px-6 border-b-2 font-medium text-base sm:text-lg transition-colors whitespace-nowrap min-w-max touch-target ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 bg-primary-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={22} className="flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-sm font-medium">{tab.label.split(' ')[0]}</span>
                </button>
              )
            })}
          </nav>
        </div>
        
        {/* 컨텐츠 영역 - 전체 너비 활용 */}
        <div className="px-6 sm:px-8 py-6 sm:py-8">
          {renderTabContent()}
        </div>
      </div>

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