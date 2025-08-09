// ============================================================================
// 사용설명서 페이지 - 모든 기능 소개와 사용법 안내
// ============================================================================

import React, { useState } from "react";
import {
  BookOpen,
  Home,
  Plus,
  Search,
  Edit,
  Settings,
  Users,
  CreditCard,
  Bell,
  Grid,
  AlignLeft,
  TrendingUp,
  Building2,
  Monitor,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

const UserGuidePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "개요", icon: Home },
    { id: "dashboard", title: "대시보드", icon: TrendingUp },
    { id: "properties", title: "매물 관리", icon: Building2 },
    { id: "team", title: "팀 관리", icon: Users },
    { id: "settings", title: "설정", icon: Settings },
    { id: "tips", title: "사용 팁", icon: BookOpen },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 border border-blue-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                리체 매물장에 오신 것을 환영합니다! 🏠
              </h2>
              <p className="text-sm sm:text-base text-gray-700 mb-4">
                리체 매물장은 부동산 매물을 효율적으로 관리할 수 있는 전문 SaaS
                플랫폼입니다. 매물 등록부터 계약 관리까지 모든 업무를 하나의
                시스템에서 처리할 수 있습니다.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-white p-4 sm:p-5 rounded-lg border border-blue-100">
                  <div className="flex items-center mb-2">
                    <Building2 className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                      매물 관리
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    매물 등록, 수정, 삭제 및 상태 관리
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">실시간 통계</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    매물 현황 및 트렌드 분석
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 text-purple-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">팀 협업</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    팀원 초대 및 권한 관리
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-orange-100">
                  <div className="flex items-center mb-2">
                    <Monitor className="w-5 h-5 text-orange-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">PWA 지원</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    PC 앱으로 설치하여 사용
                  </p>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  주요 특징
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      🎯 핵심 기능
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• 매물 등록 및 관리</li>
                      <li>• 실시간 대시보드</li>
                      <li>• 통계 및 차트 분석</li>
                      <li>• 팀원 관리 및 권한 설정</li>
                      <li>• 데이터 가져오기/내보내기</li>
                      <li>• PWA 지원 (앱 설치 가능)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      💡 편의 기능
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• 샘플 데이터 자동 입력</li>
                      <li>• 다양한 검색 및 필터</li>
                      <li>• 카드형/리스트형 보기 전환</li>
                      <li>• 반응형 디자인 (모바일 지원)</li>
                      <li>• 브랜딩 커스터마이징</li>
                      <li>• 알림 설정</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "dashboard":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  대시보드 사용법
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    📊 통계 카드
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    총 매물, 활성 매물, 팀원 수, 이번 달 등록 매물 수를 한눈에
                    확인할 수 있습니다.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-white p-3 rounded border text-center">
                      <div className="text-blue-600 font-bold">156</div>
                      <div className="text-xs text-gray-500">총 매물</div>
                    </div>
                    <div className="bg-white p-3 rounded border text-center">
                      <div className="text-green-600 font-bold">142</div>
                      <div className="text-xs text-gray-500">활성 매물</div>
                    </div>
                    <div className="bg-white p-3 rounded border text-center">
                      <div className="text-purple-600 font-bold">8</div>
                      <div className="text-xs text-gray-500">팀원</div>
                    </div>
                    <div className="bg-white p-3 rounded border text-center">
                      <div className="text-orange-600 font-bold">23</div>
                      <div className="text-xs text-gray-500">이번 달</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    📈 차트 분석
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    매물 트렌드와 유형별 분포를 시각적으로 확인할 수 있습니다.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                      • <strong>매물 트렌드 차트</strong>: 월별 매물 등록 추이
                    </li>
                    <li>
                      • <strong>매물 유형 차트</strong>: 아파트, 오피스텔, 원룸,
                      빌라 비율
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    🏠 최근 등록 매물
                  </h4>
                  <p className="text-sm text-gray-600">
                    최근에 등록된 매물 4개를 카드 형태로 보여줍니다. 매물 카드를
                    클릭하면 상세 정보를 확인하고 편집/삭제할 수 있습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "properties":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  매물 관리 사용법
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 매물 등록 */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Plus className="w-4 h-4 mr-2 text-blue-600" />
                    매물 등록하기
                  </h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>우상단 "매물 등록" 버튼 클릭</li>
                    <li>기본 정보 입력 (제목, 주소, 유형, 거래유형)</li>
                    <li>상세 정보 입력 (면적, 층수, 룸 구조)</li>
                    <li>가격 정보 입력 (매매가, 전세금, 월세)</li>
                    <li>임대인 정보 및 기타 옵션 설정</li>
                    <li>"매물 등록" 버튼으로 완료</li>
                  </ol>
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                    💡 <strong>팁:</strong> "샘플 데이터 입력" 버튼을 사용하면
                    예시 데이터가 자동으로 입력됩니다.
                  </div>
                </div>

                {/* 검색 및 필터 */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Search className="w-4 h-4 mr-2 text-green-600" />
                    검색 및 필터링
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>검색:</strong> 매물명이나 주소로 실시간 검색 가능
                    </p>
                    <p>
                      <strong>필터:</strong>
                    </p>
                    <ul className="ml-4 space-y-1">
                      <li>• 거래유형: 매매, 전세, 월세</li>
                      <li>• 매물유형: 아파트, 오피스텔, 원룸, 빌라</li>
                      <li>• 상태: 거래중, 거래완료</li>
                    </ul>
                  </div>
                </div>

                {/* 보기 모드 */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Grid className="w-4 h-4 mr-2 text-purple-600" />
                    보기 모드 전환
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="flex items-center mb-1">
                        <Grid className="w-3 h-3 mr-1" />
                        <strong>카드형 보기</strong>
                      </p>
                      <p>매물을 카드 형태로 시각적으로 표시</p>
                    </div>
                    <div>
                      <p className="flex items-center mb-1">
                        <AlignLeft className="w-3 h-3 mr-1" />
                        <strong>리스트형 보기</strong>
                      </p>
                      <p>매물을 테이블 형태로 간략하게 표시</p>
                    </div>
                  </div>
                </div>

                {/* 매물 관리 */}
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Edit className="w-4 h-4 mr-2 text-orange-600" />
                    매물 편집 및 삭제
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>상세보기:</strong> 매물 카드 클릭 → 상세 정보 모달
                      표시
                    </p>
                    <p>
                      <strong>편집:</strong> 상세보기 모달에서 편집 버튼 클릭
                    </p>
                    <p>
                      <strong>삭제:</strong> 상세보기 모달에서 삭제 버튼 클릭
                      (확인 필요)
                    </p>
                  </div>
                  <div className="mt-2 p-2 bg-orange-50 rounded text-xs text-orange-700">
                    ⚠️ <strong>주의:</strong> 삭제된 매물은 복구할 수 없습니다.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "team":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />팀 관리 사용법
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>🚧 개발 예정:</strong> 팀 관리 기능은 현재 개발
                    중입니다. 향후 업데이트를 통해 팀원 초대, 권한 관리, 역할
                    설정 등의 기능을 제공할 예정입니다.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">예정된 기능:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• 팀원 초대 및 관리</li>
                    <li>• 권한 설정 (관리자, 일반 사용자)</li>
                    <li>• 역할별 접근 제어</li>
                    <li>• 팀원 활동 로그</li>
                    <li>• 협업 도구 연동</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  설정 사용법
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 일반 설정 */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Settings className="w-4 h-4 mr-2 text-blue-600" />
                    일반 설정
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                      • <strong>기본 정보:</strong> 회사명, 도메인, 연락처 설정
                    </li>
                    <li>
                      • <strong>PWA 설치:</strong> PC에 앱으로 설치하여 사용
                    </li>
                    <li>
                      • <strong>데이터 관리:</strong> 가져오기/내보내기, 샘플
                      데이터 초기화
                    </li>
                  </ul>
                </div>

                {/* 요금제 관리 */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-green-600" />
                    결제 및 요금제
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                      • <strong>현재 플랜:</strong> 사용 중인 요금제 및 제한사항
                      확인
                    </li>
                    <li>
                      • <strong>플랜 변경:</strong> 스타터, 프로페셔널,
                      비즈니스, 엔터프라이즈
                    </li>
                    <li>
                      • <strong>결제 정보:</strong> 결제 수단 관리 및 결제 내역
                      확인
                    </li>
                  </ul>
                </div>

                {/* 브랜딩 */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <MonitorIcon className="w-4 h-4 mr-2 text-purple-600" />
                    브랜딩
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                      • <strong>로고 업로드:</strong> 회사 로고 설정 (PNG, JPG
                      최대 2MB)
                    </li>
                    <li>
                      • <strong>브랜드 컬러:</strong> 주 컬러와 보조 컬러 설정
                    </li>
                    <li>
                      • <strong>미리보기:</strong> 적용된 브랜드 스타일 확인
                    </li>
                  </ul>
                </div>

                {/* 알림 설정 */}
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Bell className="w-4 h-4 mr-2 text-orange-600" />
                    알림 설정
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                      • <strong>이메일 알림:</strong> 새 매물, 계약 완료, 팀원
                      초대 등
                    </li>
                    <li>
                      • <strong>앱 알림:</strong> 실시간 푸시 알림 설정
                    </li>
                    <li>
                      • <strong>알림 시간:</strong> 알림 수신 시간대 설정
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "tips":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  사용 팁 및 노하우
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    💡 효율적인 매물 관리 팁
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      • <strong>일관된 제목 규칙:</strong> "지역명 + 매물유형 +
                      특징" 형태로 작성
                    </li>
                    <li>
                      • <strong>상세한 주소 입력:</strong> 정확한 위치 정보로
                      고객 신뢰도 향상
                    </li>
                    <li>
                      • <strong>퇴실예정일 활용:</strong> 임차인 관리 및 계약
                      갱신 준비
                    </li>
                    <li>
                      • <strong>정기적인 상태 업데이트:</strong> 매물 상태를
                      실시간으로 관리
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    🚀 생산성 향상 방법
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      • <strong>PWA 설치:</strong> 바탕화면에서 바로 접근하여
                      업무 효율성 증대
                    </li>
                    <li>
                      • <strong>샘플 데이터 활용:</strong> 새 매물 등록 시 기존
                      정보를 참고하여 빠른 입력
                    </li>
                    <li>
                      • <strong>필터 활용:</strong> 원하는 조건의 매물을 빠르게
                      찾기
                    </li>
                    <li>
                      • <strong>리스트형 보기:</strong> 많은 매물을 한 번에
                      비교할 때 유용
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    🔧 유용한 단축키 및 기능
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      • <strong>빠른 검색:</strong> 검색창에서 실시간으로 결과
                      확인
                    </li>
                    <li>
                      • <strong>카드 클릭:</strong> 매물 카드를 클릭하여 바로
                      상세보기
                    </li>
                    <li>
                      • <strong>모달에서 편집:</strong> 상세보기에서 바로 편집
                      모드로 전환
                    </li>
                    <li>
                      • <strong>초기화 기능:</strong> 설정에서 샘플 데이터 일괄
                      삭제
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    📱 모바일 사용 팁
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      • <strong>반응형 디자인:</strong> 모바일에서도 모든 기능
                      완벽 지원
                    </li>
                    <li>
                      • <strong>터치 최적화:</strong> 버튼과 링크가 터치하기
                      쉽게 설계됨
                    </li>
                    <li>
                      • <strong>빠른 로딩:</strong> 모바일 환경에 최적화된 성능
                    </li>
                    <li>
                      • <strong>홈 화면 추가:</strong> 브라우저에서 홈 화면에
                      추가하여 앱처럼 사용
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // MonitorIcon 컴포넌트 정의 (임시)
  const MonitorIcon = Monitor;

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 border border-blue-200">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600" />
          사용설명서
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          리체 매물장의 모든 기능과 사용법을 자세히 안내해드립니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 좌측 메뉴 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">목차</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-4 text-sm sm:text-base font-medium transition-colors touch-target ${
                        activeSection === section.id
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="text-left">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* 우측 콘텐츠 */}
        <div className="lg:col-span-3">{renderSectionContent()}</div>
      </div>

      {/* 하단 개발회사 정보 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 text-center">
        <div className="space-y-2">
          <p className="text-sm sm:text-base text-gray-600">
            <strong>개발회사:</strong> 리체부동산
          </p>
          <p className="text-sm sm:text-base text-gray-600">
            <strong>대표:</strong> 김선미 공인중개사
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-300">
          <p className="text-xs sm:text-sm text-gray-500">
            © 2024 리체부동산. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export { UserGuidePage };
