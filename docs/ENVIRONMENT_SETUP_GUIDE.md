# 🔧 PropertyDesk 완전 설정 가이드

## 1단계: Supabase 프로젝트 생성 (필수)

### Supabase 대시보드 접속
1. **브라우저에서 https://supabase.com/dashboard 접속**
2. **GitHub 계정으로 로그인**
3. **"New Project" 버튼 클릭**

### 프로젝트 설정
```
✅ Organization: Personal (또는 기존 조직 선택)
✅ Project Name: PropertyDesk Production
✅ Database Password: [강력한 비밀번호 생성 - 기록해두세요!]
✅ Region: Northeast Asia (Seoul) - 한국 사용자용 최적화
✅ Pricing Plan: Free Plan (베타 테스트용 충분)
```

### 프로젝트 생성 완료 대기
- ⏱️ 약 2-3분 소요
- 🔄 "Setting up your project..." 메시지 표시
- ✅ 완료되면 프로젝트 대시보드로 이동

## 2단계: 데이터베이스 스키마 설정

### SQL Editor 접속
1. **좌측 메뉴에서 "SQL Editor" 클릭**
2. **"New query" 버튼 클릭**

### 스키마 실행
**아래 SQL 코드를 복사해서 붙여넣고 실행하세요:**

\`\`\`sql
-- ============================================================================
-- PropertyDesk Production Database Schema v1.0.0-beta
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TENANTS TABLE (멀티테넌트 업체 관리)
-- ============================================================================
CREATE TABLE tenants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. USER PROFILES TABLE (사용자 확장 정보)
-- ============================================================================
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'manager', 'agent', 'viewer')),
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. PROPERTIES TABLE (매물 관리)
-- ============================================================================
CREATE TABLE properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 기본 정보
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('아파트', '오피스텔', '빌라', '원룸', '투룸', '기타')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('매매', '전세', '월세')),
  
  -- 가격 정보 (단위: 만원)
  price DECIMAL(15,2),
  deposit DECIMAL(15,2),
  monthly_rent DECIMAL(15,2),
  
  -- 상세 정보
  floor_current INTEGER,
  floor_total INTEGER,
  area_exclusive DECIMAL(10,2), -- 전용면적 (㎡)
  rooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  
  -- 추가 정보
  description TEXT,
  images TEXT[] DEFAULT '{}',
  
  -- 메타데이터
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) 정책
-- ============================================================================

-- RLS 활성화
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- TENANTS 정책
CREATE POLICY "Users can view their own tenant" ON tenants
  FOR SELECT USING (
    id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
  );

-- USER_PROFILES 정책
CREATE POLICY "Users can view profiles in their tenant" ON user_profiles
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Managers can insert new profiles" ON user_profiles
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND role IN ('owner', 'manager')
    )
  );

-- PROPERTIES 정책
CREATE POLICY "Users can view properties in their tenant" ON properties
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Agents can insert properties" ON properties
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND role IN ('owner', 'manager', 'agent')
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own properties" ON properties
  FOR UPDATE USING (
    user_id = auth.uid() 
    OR tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Users can delete their own properties" ON properties
  FOR DELETE USING (
    user_id = auth.uid() 
    OR tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND role IN ('owner', 'manager')
    )
  );

-- ============================================================================
-- 5. UTILITY FUNCTIONS
-- ============================================================================

-- 텐넌트 생성 시 첫 사용자를 Owner로 설정하는 함수
CREATE OR REPLACE FUNCTION create_tenant_and_owner(
  tenant_name TEXT,
  user_name TEXT,
  user_company TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  -- 새 테넌트 생성
  INSERT INTO tenants (name) 
  VALUES (tenant_name) 
  RETURNING id INTO new_tenant_id;
  
  -- 현재 사용자를 Owner로 설정
  INSERT INTO user_profiles (id, tenant_id, name, role, company)
  VALUES (auth.uid(), new_tenant_id, user_name, 'owner', user_company);
  
  RETURN new_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. INDEXES (성능 최적화)
-- ============================================================================
CREATE INDEX idx_user_profiles_tenant_id ON user_profiles(tenant_id);
CREATE INDEX idx_properties_tenant_id ON properties(tenant_id);
CREATE INDEX idx_properties_active ON properties(is_active);

-- 스키마 버전 정보
CREATE TABLE schema_version (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO schema_version (version) VALUES ('1.0.0-beta');
\`\`\`

### 실행 확인
- **"RUN" 버튼 클릭**
- ✅ "Success. No rows returned" 메시지 확인
- 🎉 데이터베이스 스키마 설정 완료!

## 3단계: Authentication 설정

### Settings 접속
1. **좌측 메뉴에서 "Authentication" → "Settings" 클릭**

### Site URL 설정
**Site URL 입력:**
\`\`\`
https://propertydesk-saas-rbkfizen2-daesung75-6440s-projects.vercel.app
\`\`\`

### Redirect URLs 설정
**Additional Redirect URLs 추가:**
\`\`\`
https://propertydesk-saas-rbkfizen2-daesung75-6440s-projects.vercel.app/auth/callback
https://propertydesk-saas-rbkfizen2-daesung75-6440s-projects.vercel.app/**
\`\`\`

### 설정 저장
- **"Save" 버튼 클릭**
- ✅ Authentication 설정 완료!

## 4단계: API Keys 복사

### API 정보 접속
1. **좌측 메뉴에서 "Settings" → "API" 클릭**

### 정보 복사
**다음 정보를 메모장에 복사해두세요:**
\`\`\`
Project URL: https://[프로젝트-ID].supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

⚠️ **service_role key는 복사하지 마세요 (보안상 필요 없음)**

## 5단계: Vercel 환경변수 설정

### 방법 1: Vercel 웹 대시보드 (추천)

1. **https://vercel.com/daesung75-6440s-projects/propertydesk-saas/settings/environment-variables 접속**

2. **다음 환경변수들을 하나씩 추가:**

| Variable Name | Environment | Value |
|---------------|-------------|-------|
| VITE_SUPABASE_URL | Production | https://[프로젝트-ID].supabase.co |
| VITE_SUPABASE_ANON_KEY | Production | [anon-key-값] |
| VITE_APP_ENV | Production | production |
| VITE_APP_NAME | Production | PropertyDesk |
| VITE_APP_VERSION | Production | 1.0.0-beta |

3. **"Save" 클릭 후 "Redeploy" 실행**

### 방법 2: CLI 사용 (선택사항)

\`\`\`bash
cd "/Users/gimdaeseong/summi 3"

# 각 환경변수 개별 설정
vercel env add VITE_SUPABASE_URL production "https://[프로젝트-ID].supabase.co" --yes
vercel env add VITE_SUPABASE_ANON_KEY production "[anon-key-값]" --yes
vercel env add VITE_APP_ENV production "production" --yes
vercel env add VITE_APP_NAME production "PropertyDesk" --yes
vercel env add VITE_APP_VERSION production "1.0.0-beta" --yes

# 재배포
vercel --prod
\`\`\`

## 6단계: 배포 완료 및 테스트

### 재배포 확인
- ⏱️ 약 3-5분 소요
- 🔄 Vercel에서 자동 재배포 진행
- ✅ 새 배포 완료 확인

### 사이트 접속 테스트
**https://propertydesk-saas-rbkfizen2-daesung75-6440s-projects.vercel.app 접속**

### 기능 테스트 체크리스트
\`\`\`
🔐 인증 기능
□ 회원가입 페이지 로딩 ✅
□ 회원가입 실행 → 이메일 인증
□ 로그인 페이지 로딩 ✅
□ 로그인 실행 → 대시보드 이동

🏠 매물 관리
□ 대시보드 차트 표시 ✅
□ 매물 목록 페이지 접속 ✅
□ 매물 등록 폼 열기 ✅
□ 매물 등록 실행
□ 매물 검색 기능

👥 팀 관리  
□ 팀 관리 페이지 접속 ✅
□ 팀원 초대 폼 열기 ✅
□ 권한별 UI 표시 ✅

📱 반응형
□ 모바일 브라우저 테스트 ✅
□ 태블릿 화면 테스트 ✅
\`\`\`

## 🎉 설정 완료!

### 성공 지표
- ✅ **UI 로딩**: 모든 페이지가 정상 표시
- ✅ **인증 연결**: 회원가입/로그인 작동
- ✅ **데이터베이스**: 매물 CRUD 작동
- ✅ **권한 시스템**: 역할별 기능 제한
- ✅ **반응형**: 모바일/데스크톱 완벽 지원

### 다음 단계
1. **베타 테스터 모집**: 실제 부동산 중개업소 직원들
2. **피드백 수집**: 사용성, 성능, 기능 요청사항
3. **Phase 2 개발**: 이미지 업로드, 지도 연동 등

**🎯 PropertyDesk v1.0.0-beta가 완전히 준비되었습니다!**

베타 테스트를 시작하세요! 🚀