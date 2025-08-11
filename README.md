# PropertyDesk - 부동산 중개업소 전용 매물관리 SaaS

> 현대적이고 효율적인 부동산 매물 관리를 위한 멀티테넌트 SaaS 플랫폼

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

## 🚀 프로젝트 개요

PropertyDesk는 부동산 중개업소를 위한 현대적인 매물 관리 시스템입니다. 멀티테넌트 SaaS 아키텍처로 구축되어 여러 업체가 독립적으로 매물을 관리할 수 있습니다.

### ✨ 주요 기능 (v1.0 Beta)

- 🏢 **멀티테넌트 시스템**: 업체별 독립적인 데이터 관리
- 👥 **역할 기반 권한 제어**: 4단계 권한 시스템 (업체 대표, 팀장/실장, 중개사, 조회자)
- 🏠 **매물 관리**: 완전한 CRUD 기능 (등록, 수정, 삭제, 조회)
- 🔍 **실시간 검색**: 주소, 가격, 매물 유형별 실시간 필터링
- 📊 **대시보드**: 인터랙티브 차트 및 매물 현황 시각화
- 👥 **팀 관리**: 팀원 초대, 역할 관리, 권한 기반 UI
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 완벽 지원

## 🎯 베타 버전 특징

### 현재 제공되는 기능
- ✅ 완전한 매물 관리 시스템
- ✅ 멀티테넌트 지원
- ✅ 권한 기반 팀 관리
- ✅ 실시간 대시보드
- ✅ 반응형 디자인

### 제한사항
- ❌ 이미지 업로드 (텍스트 정보만)
- ❌ 지도 연동
- ❌ 고급 리포팅
- ❌ 결제 시스템

## 🛠 기술 스택

### Frontend
- **React 18**: 함수형 컴포넌트, Hooks
- **TypeScript**: 완전한 타입 안정성
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Vite**: 빠른 개발 서버 및 빌드

### Backend
- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: 관계형 데이터베이스
- **Row Level Security**: 데이터 보안

### Deployment
- **Vercel**: 프론트엔드 배포
- **Git**: 버전 관리

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/propertydesk-saas.git
cd propertydesk-saas
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
```bash
cp .env.example .env
```

`.env` 파일에서 Supabase 설정을 입력하세요:
```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

## 📦 빌드 및 배포

### 프로덕션 빌드
```bash
npm run build
```

### Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

## 📖 사용법

### 1. 회원가입 및 업체 등록
1. 로그인 페이지에서 "회원가입" 클릭
2. 업체 정보 입력 및 계정 생성
3. 이메일 인증 완료

### 2. 매물 등록
1. 대시보드 → "매물 등록" 버튼 클릭
2. 매물 정보 입력 (주소, 가격, 면적 등)
3. 저장하여 매물 등록 완료

### 3. 팀원 관리
1. 팀 관리 페이지 접속
2. "팀원 초대" 버튼 클릭
3. 이메일과 역할 설정 후 초대 발송

## 🏗 아키텍처

```
PropertyDesk System
├── Frontend (React + TypeScript)
│   ├── 매물관리 모듈
│   ├── 팀 관리 모듈
│   ├── 대시보드 모듈
│   └── 권한 시스템
├── Backend (Supabase)
│   ├── 데이터베이스 (PostgreSQL)
│   ├── 인증 시스템
│   └── Row Level Security
└── Infrastructure
    └── Vercel (배포)
```

## 👥 팀 역할 시스템

| 역할 | 권한 | 설명 |
|------|------|------|
| **업체 대표** | 모든 권한 | 업체 소유자, 전체 관리 |
| **팀장/실장** | 팀 관리, 매물 관리 | 팀원 관리 및 매물 전체 관리 |
| **중개사** | 매물 관리 | 매물 등록, 수정 |
| **조회자** | 읽기 전용 | 매물 조회만 가능 |

## 📋 개발 로드맵

### 🎯 Phase 2 (2-3개월)
- 📸 이미지 업로드 시스템
- 🗺 네이버 지도 연동
- 📧 알림 시스템

### 🎯 Phase 3 (4-6개월)
- 📊 고급 리포팅 (PDF/Excel)
- 👥 CRM 기능
- 📱 PWA 지원

### 🎯 Phase 4 (6-12개월)
- 💳 TossPayments 결제 시스템
- 🤖 AI 매물 추천
- 🔌 오픈 API

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

- **이메일**: daesung75@gmail.com
- **문서**: [개발 가이드](./docs/DEVELOPMENT_PLAN.md)
- **이슈**: [GitHub Issues](https://github.com/your-username/propertydesk-saas/issues)

---

⭐ PropertyDesk가 도움이 되셨다면 스타를 눌러주세요!
