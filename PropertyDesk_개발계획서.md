# PropertyDesk 개발 시작 가이드

## 1. 프로젝트 셋업

### 1.1 초기 프로젝트 구조 생성

```bash
# 새 React 프로젝트 생성
npx create-react-app propertydesk --template typescript
cd propertydesk

# 필요한 패키지 설치
npm install @tailwindcss/forms @headlessui/react lucide-react
npm install -D tailwindcss postcss autoprefixer @types/node

# Tailwind CSS 초기화
npx tailwindcss init -p
```

### 1.2 권장 폴더 구조

```
propertydesk/
├── public/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── ui/             # 기본 UI 컴포넌트
│   │   ├── forms/          # 폼 관련 컴포넌트
│   │   └── layout/         # 레이아웃 컴포넌트
│   ├── pages/              # 페이지 컴포넌트
│   ├── hooks/              # 커스텀 훅
│   ├── utils/              # 유틸리티 함수
│   ├── types/              # TypeScript 타입 정의
│   ├── constants/          # 상수 정의
│   └── styles/             # 글로벌 스타일
├── docs/                   # 개발 문서
│   ├── DEVELOPMENT_PLAN.md
│   ├── API_SPEC.md
│   └── DESIGN_SYSTEM.md
└── README.md
```

## 2. Claude Code 활용 전략

### 2.1 Claude Code 설치 및 설정

```bash
# Claude Code 설치
npm install -g @anthropic/claude-code

# 프로젝트 폴더에서 Claude Code 초기화
claude-code init
```

### 2.2 효율적인 Claude Code 사용법

#### **A. 개발계획서 전달**
```bash
# 개발계획서를 docs 폴더에 저장
# Claude Code가 프로젝트 컨텍스트를 이해할 수 있도록 구조화

claude-code "docs 폴더에 있는 DEVELOPMENT_PLAN.md를 참고해서 
이 프로젝트의 전체 구조를 이해하고, 
첫 번째 단계인 프로젝트 셋업부터 시작해줘"
```

#### **B. MVP 코드 변환 요청**
```bash
# 현재 artifact의 코드를 실제 React 컴포넌트로 변환
claude-code "아티팩트에 있는 PropertyDesk MVP 코드를 
다음과 같이 변환해줘:
1. src/components/PropertyCard.tsx
2. src/components/PropertyTextItem.tsx  
3. src/components/PropertyForm.tsx
4. src/pages/Dashboard.tsx
5. src/types/Property.ts
각 파일을 TypeScript로 모듈화해서 생성해줘"
```

#### **C. 단계별 개발 진행**
```bash
# Phase별로 체계적 개발
claude-code "DEVELOPMENT_PLAN.md의 Phase 1, Week 1-2 작업을 
진행해줘. 프로젝트 기본 구조와 TypeScript 설정부터 시작해서
Tailwind CSS 설정까지 완료해줘"
```

## 3. 파일별 전달 방법

### 3.1 개발계획서 파일 생성

```bash
# docs 폴더 생성 및 파일 복사
mkdir docs
```

**docs/DEVELOPMENT_PLAN.md**에 이전에 생성한 개발계획서 전체 내용을 저장

**docs/MVP_REQUIREMENTS.md**에 현재 MVP 기능 명세 저장:
```markdown
# MVP 핵심 기능

## 구현된 기능
1. 매물 등록 폼 (퇴실날짜, 임대인성명, 연락처 포함)
2. 매물 리스트 (카드형/텍스트형 전환)
3. 검색 및 필터링 (거래유형, 매물유형)
4. 계약완료 기능
5. 즐겨찾기 기능
6. 반응형 디자인

## UI/UX 특징
- 세련된 그라데이션 디자인
- 직관적인 필터 시스템
- 한줄 압축 레이아웃 (텍스트형)
- 2단 카드 배치 (카드형)
```

### 3.2 MVP 코드 모듈화 요청

**Claude Code 명령어 예시:**

```bash
# 1. 타입 정의 생성
claude-code "다음 Property 인터페이스를 src/types/Property.ts로 생성해줘:
- id, title, type, transactionType, price, deposit, monthlyRent
- address, area, floor, totalFloors, rooms, bathrooms
- parking, elevator, status, exitDate, landlordName, landlordPhone
- createdAt, isFavorite, image"

# 2. 컴포넌트 분리
claude-code "현재 MVP의 PropertyCard 컴포넌트를 
src/components/PropertyCard.tsx로 분리해서 생성해줘.
Props 타입도 정의하고, 모든 기능이 동작하도록 해줘"

# 3. 메인 대시보드 생성
claude-code "전체 매물장 UI를 src/pages/Dashboard.tsx로 생성해줘.
상단 메뉴, 검색, 필터, 매물 리스트를 모두 포함해서"
```

## 4. 단계별 개발 진행

### 4.1 Phase 1: 기본 구조 (Week 1-2)

```bash
# 프로젝트 초기 설정
claude-code "package.json에 필요한 의존성을 추가하고,
tsconfig.json을 프로젝트에 맞게 설정해줘"

# Tailwind 설정
claude-code "tailwind.config.js를 현재 MVP 디자인에 맞게 설정해줘.
그라데이션, 색상 팔레트, 커스텀 클래스를 포함해서"

# 컴포넌트 구조 생성
claude-code "src/components 폴더에 다음 컴포넌트들을 생성해줘:
- ui/Button.tsx (재사용 가능한 버튼)
- ui/Input.tsx (재사용 가능한 인풋)
- ui/Select.tsx (재사용 가능한 셀렉트)
- layout/Header.tsx (상단 헤더)
- layout/Layout.tsx (전체 레이아웃)"
```

### 4.2 Phase 1: 핵심 기능 (Week 3-4)

```bash
# 상태 관리 설정
claude-code "src/hooks 폴더에 다음 커스텀 훅들을 생성해줘:
- useProperties.ts (매물 관리)
- useSearch.ts (검색 및 필터)
- useLocalStorage.ts (로컬 스토리지 관리)"

# 더미 데이터 관리
claude-code "src/constants/mockData.ts에 현재 MVP의 
샘플 데이터를 TypeScript 형태로 정리해줘"
```

### 4.3 Phase 1: UI 완성 (Week 5-6)

```bash
# 반응형 디자인 적용
claude-code "모든 컴포넌트에 모바일 반응형을 적용해줘.
특히 상단 메뉴와 매물 카드 레이아웃을 중점적으로"

# 애니메이션 및 상호작용
claude-code "현재 MVP의 호버 효과, 전환 애니메이션을 
모든 컴포넌트에 적용해줘. duration-200 기준으로"
```

## 5. 효율적인 작업 흐름

### 5.1 일일 작업 패턴

```bash
# 1. 아침 작업 시작
claude-code "오늘 할 작업을 DEVELOPMENT_PLAN.md를 참고해서 
우선순위 순으로 정리해줘"

# 2. 기능 개발
claude-code "매물 등록 폼의 유효성 검사 기능을 추가해줘.
React Hook Form과 Zod를 사용해서"

# 3. 코드 리뷰 및 개선
claude-code "현재 작성된 코드를 리뷰하고, 
TypeScript 타입 안정성과 성능을 개선해줘"

# 4. 테스트 작성
claude-code "PropertyCard 컴포넌트에 대한 
Jest + React Testing Library 테스트를 작성해줘"
```

### 5.2 주간 마일스톤 체크

```bash
# 주간 진행상황 점검
claude-code "이번 주 완료된 기능들을 정리하고,
다음 주 계획을 DEVELOPMENT_PLAN.md 기준으로 세워줘"

# 코드 품질 체크
claude-code "전체 프로젝트의 코드 품질을 분석하고,
리팩토링이 필요한 부분을 식별해줘"
```

## 6. 협업 및 문서화

### 6.1 README 업데이트

```bash
claude-code "프로젝트 README.md를 작성해줘.
설치 방법, 실행 방법, 기능 설명을 포함해서"
```

### 6.2 API 문서 생성

```bash
claude-code "향후 백엔드 연동을 위한 API 스펙을 
docs/API_SPEC.md로 작성해줘. OpenAPI 형식으로"
```

## 7. 트러블슈팅 가이드

### 7.1 자주 발생하는 이슈

```bash
# TypeScript 타입 에러
claude-code "TypeScript 타입 에러가 발생했어. 
이 에러를 분석하고 해결 방법을 제시해줘: [에러 메시지]"

# 스타일링 이슈  
claude-code "Tailwind CSS 클래스가 제대로 적용되지 않아.
현재 설정을 확인하고 수정해줘"

# 컴포넌트 렌더링 이슈
claude-code "이 컴포넌트가 예상대로 렌더링되지 않아.
코드를 분석하고 문제점을 찾아서 수정해줘"
```

## 8. 다음 단계 준비

### 8.1 백엔드 연동 준비

```bash
claude-code "프론트엔드가 완성되면 Supabase 연동을 위한 
준비 작업을 해줘. API 서비스 레이어를 설계해줘"
```

### 8.2 배포 준비

```bash
claude-code "Vercel 배포를 위한 설정 파일들을 생성해줘.
환경변수 설정과 빌드 최적화도 포함해서"
```

---

## 🚀 시작하기

1. **프로젝트 생성**: 위의 초기 셋업 명령어 실행
2. **문서 작성**: docs 폴더에 개발계획서와 MVP 요구사항 저장  
3. **Claude Code 활용**: 단계별로 컴포넌트 분리 및 기능 구현
4. **점진적 발전**: MVP → 실제 서비스로 진화

이 가이드를 따라하면 현재 MVP를 기반으로 체계적이고 효율적인 개발을 진행할 수 있습니다! 💪