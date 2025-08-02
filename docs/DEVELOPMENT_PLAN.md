# PropertyDesk 상세 개발계획서

## 📋 프로젝트 개요

### 프로젝트명
**PropertyDesk** - 부동산 중개업소 전용 매물관리 시스템

### 프로젝트 목표
기존 아날로그 방식의 부동산 매물 관리를 디지털화하여 업무 효율성을 300% 향상시키는 것을 목표로 하는 웹 애플리케이션 개발

### 핵심 차별화 요소
1. **퇴실날짜 중심 설계**: 기존 부동산 앱에 없는 퇴실일 기반 매물 관리
2. **압축형 리스트 뷰**: 한 화면에 최대한 많은 매물 정보 표시
3. **임대인 정보 즉시 표시**: 연락처 정보 바로 확인 가능
4. **직관적 상태 관리**: 색상 기반 매물 상태 구분

## 🎯 검증된 MVP 기반 확장 계획

### MVP 검증 현황 (2025-08-02 확인)
- ✅ 매물 등록/수정/삭제 완료
- ✅ 카드형/리스트형 뷰 전환 완료
- ✅ 검색 & 필터링 완료
- ✅ 매물 상태 관리 완료
- ✅ 반응형 디자인 완료
- ✅ 임대인 정보 관리 완료

## 🏗️ 프로젝트 아키텍처

### 전체 시스템 구조
```
PropertyDesk System
├── Frontend (React + TypeScript)
│   ├── 매물관리 모듈
│   ├── 검색/필터 모듈
│   ├── 사용자 인터페이스 모듈
│   └── 상태관리 모듈
├── Backend (Supabase)
│   ├── 데이터베이스 (PostgreSQL)
│   ├── 인증 시스템
│   ├── 파일 스토리지
│   └── 실시간 동기화
└── Infrastructure
    ├── Vercel (Frontend 배포)
    ├── CDN (이미지 최적화)
    └── 도메인 관리
```

### 기술 스택 상세

#### Frontend Stack
- **React 18.2+**: 함수형 컴포넌트, Hooks, Suspense
- **TypeScript 5.0+**: 완전한 타입 안정성
- **Tailwind CSS 3.3+**: 유틸리티 기반 스타일링
- **Lucide React**: 일관성 있는 아이콘 시스템
- **React Hook Form**: 폼 상태 관리 및 검증
- **Zod**: 런타임 타입 검증
- **React Query**: 서버 상태 관리

#### Backend Stack
- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: 관계형 데이터베이스
- **Row Level Security**: 데이터 보안
- **Real-time subscriptions**: 실시간 데이터 동기화
- **Supabase Storage**: 이미지 파일 관리

#### Development Tools
- **Vite**: 개발 서버 및 빌드 도구
- **ESLint + Prettier**: 코드 품질 관리
- **Husky**: Git hooks
- **Jest + Testing Library**: 단위/통합 테스트
- **Cypress**: E2E 테스트

## 📅 상세 개발 일정

### Phase 1: 프로젝트 기반 구축 (2주)

#### Week 1: 프로젝트 셋업 및 TypeScript 변환
**목표**: MVP 코드를 TypeScript 기반 모듈형 구조로 변환

**Day 1-2: 프로젝트 초기화**
```bash
# 프로젝트 생성 및 의존성 설치
npx create-react-app propertydesk --template typescript
npm install @tailwindcss/forms @headlessui/react lucide-react
npm install react-hook-form zod @hookform/resolvers
npm install -D tailwindcss postcss autoprefixer
```

**Day 3-4: 타입 시스템 구축**
- `src/types/` 폴더에 모든 인터페이스 정의
- Property, User, SearchFilter 등 핵심 타입
- 유틸리티 타입 및 제네릭 타입 정의

**Day 5-6: 컴포넌트 모듈화**
- MVP의 단일 파일을 개별 컴포넌트로 분리
- Props 타입 정의 및 컴포넌트 문서화
- Storybook 셋업 (선택사항)

**Day 7: 테스트 환경 구축**
- Jest + Testing Library 설정
- 기본 컴포넌트 테스트 작성
- CI/CD 파이프라인 기초 설정

#### Week 2: 상태 관리 및 데이터 레이어
**목표**: 확장 가능한 상태 관리 시스템 구축

**Day 1-2: Context API 구현**
```typescript
// PropertyContext, SearchContext, UIContext 구현
// 전역 상태 관리 시스템 설계
```

**Day 3-4: 커스텀 훅 개발**
```typescript
// useProperties, useSearch, useLocalStorage 등
// 재사용 가능한 비즈니스 로직 추상화
```

**Day 5-6: 폼 관리 시스템**
- React Hook Form + Zod 통합
- 동적 폼 검증 로직
- 에러 핸들링 시스템

**Day 7: 성능 최적화**
- React.memo, useMemo, useCallback 적용
- 번들 크기 최적화
- 렌더링 성능 분석

### Phase 2: 백엔드 연동 및 실시간 기능 (3주)

#### Week 3: Supabase 셋업 및 데이터베이스 설계
**목표**: 백엔드 인프라 구축 및 데이터 모델링

**Day 1-2: 데이터베이스 스키마 설계**
```sql
-- properties 테이블
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  property_type property_type_enum NOT NULL,
  transaction_type transaction_type_enum NOT NULL,
  price BIGINT,
  deposit BIGINT,
  monthly_rent INTEGER,
  address TEXT NOT NULL,
  area DECIMAL(6,2),
  floor_number INTEGER,
  total_floors INTEGER,
  rooms INTEGER,
  bathrooms INTEGER,
  parking BOOLEAN DEFAULT false,
  elevator BOOLEAN DEFAULT false,
  status property_status_enum DEFAULT 'available',
  exit_date DATE,
  landlord_name TEXT,
  landlord_phone TEXT,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- 인덱스 최적화
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(property_type, transaction_type);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);
```

**Day 3-4: Row Level Security 설정**
```sql
-- RLS 정책 설정
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- 사용자별 데이터 접근 제어
CREATE POLICY "Users can view own properties" ON properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Day 5-6: Supabase 클라이언트 설정**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
```

**Day 7: 데이터 마이그레이션**
- MVP 샘플 데이터를 Supabase로 이전
- 데이터 검증 및 무결성 확인

#### Week 4: API 통합 및 실시간 동기화
**목표**: 실시간 데이터 동기화 및 CRUD 구현

**Day 1-2: Property CRUD API**
```typescript
// src/services/propertyService.ts
export class PropertyService {
  async getProperties(filters?: PropertyFilters): Promise<Property[]>
  async createProperty(property: CreatePropertyDto): Promise<Property>
  async updateProperty(id: string, updates: UpdatePropertyDto): Promise<Property>
  async deleteProperty(id: string): Promise<void>
  async toggleFavorite(id: string): Promise<Property>
}
```

**Day 3-4: 실시간 구독 시스템**
```typescript
// 실시간 매물 업데이트 구독
useEffect(() => {
  const subscription = supabase
    .channel('properties')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'properties'
    }, handlePropertyChange)
    .subscribe()

  return () => subscription.unsubscribe()
}, [])
```

**Day 5-6: 이미지 업로드 시스템**
```typescript
// 이미지 업로드 및 최적화
const uploadPropertyImage = async (file: File) => {
  const { data, error } = await supabase.storage
    .from('property-images')
    .upload(`${propertyId}/${Date.now()}.jpg`, file)
}
```

**Day 7: 오프라인 지원**
- 로컬 캐싱 시스템
- 오프라인 상태 감지 및 동기화

#### Week 5: 고급 검색 및 필터링
**목표**: 고성능 검색 시스템 구현

**Day 1-2: 전문 검색 시스템**
```sql
-- PostgreSQL Full Text Search
ALTER TABLE properties ADD COLUMN search_vector tsvector;

CREATE INDEX idx_properties_search ON properties USING gin(search_vector);

-- 검색 벡터 자동 업데이트
CREATE OR REPLACE FUNCTION update_properties_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('korean', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('korean', COALESCE(NEW.address, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Day 3-4: 지도 통합**
```typescript
// 네이버 지도 API 통합
import { NaverMap, Marker } from 'react-naver-maps'

const PropertyMap = ({ properties }: { properties: Property[] }) => {
  return (
    <NaverMap
      mapDivId="property-map"
      style={{ width: '100%', height: '400px' }}
    >
      {properties.map(property => (
        <Marker
          key={property.id}
          position={{ lat: property.latitude, lng: property.longitude }}
        />
      ))}
    </NaverMap>
  )
}
```

**Day 5-6: 고급 필터링**
- 가격 범위 슬라이더
- 다중 선택 필터
- 저장된 검색 조건

**Day 7: 검색 성능 최적화**
- 디바운싱 및 스로틀링
- 결과 캐싱 시스템
- 무한 스크롤 구현

### Phase 3: 사용자 경험 향상 (2주)

#### Week 6: 인증 및 사용자 관리
**목표**: 완전한 사용자 관리 시스템

**Day 1-2: 인증 시스템**
```typescript
// Supabase Auth 통합
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// 소셜 로그인 지원
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})
```

**Day 3-4: 사용자 프로필 관리**
- 프로필 사진 업로드
- 중개사무소 정보 관리
- 개인화 설정

**Day 5-6: 권한 관리 시스템**
- 역할 기반 접근 제어 (RBAC)
- 팀원 초대 및 관리
- 매물 공유 권한

**Day 7: 보안 강화**
- 2FA 인증
- 세션 관리
- 보안 로그 시스템

#### Week 7: UI/UX 고도화
**목표**: 프로페셔널 사용자 인터페이스

**Day 1-2: 디자인 시스템 구축**
```typescript
// src/components/ui 라이브러리 구축
export { Button } from './Button'
export { Input } from './Input'
export { Modal } from './Modal'
export { Toast } from './Toast'
export { Loading } from './Loading'
```

**Day 3-4: 애니메이션 시스템**
- Framer Motion 통합
- 페이지 전환 애니메이션
- 마이크로 인터랙션

**Day 5-6: 접근성 개선**
- WCAG 2.1 AA 준수
- 키보드 네비게이션
- 스크린 리더 지원
- 색상 대비 최적화

**Day 7: 모바일 최적화**
- PWA 기능 추가
- 터치 인터랙션 최적화
- 모바일 성능 개선

### Phase 4: 고급 기능 및 최적화 (2주)

#### Week 8: 비즈니스 인텔리전스
**목표**: 데이터 분석 및 리포팅 기능

**Day 1-2: 대시보드 개발**
```typescript
// 매물 통계 대시보드
const PropertyDashboard = () => {
  const { data: stats } = usePropertyStats()
  
  return (
    <div className="grid grid-cols-4 gap-6">
      <StatCard title="총 매물" value={stats.total} />
      <StatCard title="판매중" value={stats.available} />
      <StatCard title="계약 완료" value={stats.sold} />
      <StatCard title="이번 달 등록" value={stats.thisMonth} />
    </div>
  )
}
```

**Day 3-4: 리포팅 시스템**
- PDF 리포트 생성
- 엑셀 데이터 내보내기
- 매출 분석 차트

**Day 5-6: 알림 시스템**
```typescript
// 실시간 알림 시스템
const NotificationSystem = () => {
  useEffect(() => {
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, handleNewNotification)
      .subscribe()
  }, [])
}
```

**Day 7: 자동화 기능**
- 매물 상태 자동 업데이트
- 이메일 자동 발송
- 백업 시스템

#### Week 9: 성능 최적화 및 배포 준비
**목표**: 프로덕션 준비 완료

**Day 1-2: 성능 최적화**
```typescript
// 코드 스플리팅
const PropertyForm = lazy(() => import('./PropertyForm'))
const PropertyMap = lazy(() => import('./PropertyMap'))

// 이미지 최적화
const optimizeImage = async (file: File) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  // 이미지 리사이징 및 압축 로직
}
```

**Day 3-4: 번들 최적화**
- Webpack Bundle Analyzer
- Tree shaking 최적화
- 청크 분할 전략

**Day 5-6: 배포 파이프라인**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - uses: amondnet/vercel-action@v20
```

**Day 7: 최종 테스트**
- E2E 테스트 실행
- 성능 벤치마크
- 보안 점검

## 🎯 성공 지표 및 KPI

### 기술적 지표
- **성능**: Lighthouse 점수 90점 이상
- **번들 크기**: 초기 로딩 500KB 이하
- **응답 시간**: API 응답 200ms 이하
- **가용성**: 99.9% 업타임

### 사용자 지표
- **등록 완료율**: 95% 이상
- **검색 성공률**: 98% 이상
- **사용자 만족도**: 4.5/5.0 이상
- **리텐션**: 월간 80% 이상

### 비즈니스 지표
- **업무 효율성**: 매물 등록 시간 70% 단축
- **고객 응대**: 응답 시간 50% 개선
- **매출 증대**: 매물 회전율 30% 향상

## 🚀 배포 및 운영 계획

### 배포 환경
```
Development → Staging → Production
     ↓           ↓          ↓
   Vercel     Vercel    Vercel
  (Preview)  (Staging)  (Production)
```

### 모니터링 시스템
- **Sentry**: 에러 추적 및 성능 모니터링
- **Google Analytics**: 사용자 행동 분석
- **Supabase Analytics**: 데이터베이스 성능 모니터링

### 백업 및 복구
- **데이터베이스**: 일일 자동 백업
- **이미지 파일**: 다중 지역 복제
- **설정 파일**: Git 버전 관리

## 📚 확장 로드맵

### Q4 2025: 고급 기능
- 매물 추천 시스템 (AI 기반)
- 가상 투어 기능 (360도 이미지)
- 고객 CRM 시스템

### Q1 2026: 플랫폼 확장
- 모바일 앱 (React Native)
- 임대인 전용 포털
- 계약서 전자 서명

### Q2 2026: 시장 확장
- 다중 지점 관리
- 프랜차이즈 시스템
- 오픈 API 제공

이 상세한 개발계획서를 따라 진행하면, 현재 검증된 MVP를 기반으로 체계적이고 확장 가능한 부동산 관리 시스템을 구축할 수 있습니다.