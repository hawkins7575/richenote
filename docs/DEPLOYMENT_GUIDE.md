# PropertyDesk 배포 가이드

> v1.0.0-beta Vercel 배포 완전 가이드

## 🚀 배포 개요

PropertyDesk는 **Vercel 플랫폼**에 최적화되어 있으며, 다음과 같은 구성으로 배포됩니다:

- **Frontend**: React + TypeScript (Vercel)
- **Backend**: Supabase (Database + Auth)
- **Domain**: Custom domain 연결 가능
- **SSL**: 자동 HTTPS 적용

## 📋 배포 전 준비사항

### 1. 필수 계정
- [x] **GitHub 계정**: 소스코드 관리
- [x] **Vercel 계정**: 배포 플랫폼
- [x] **Supabase 계정**: 백엔드 서비스

### 2. 환경 설정 확인
```bash
# 필수 환경변수 확인
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. 빌드 테스트
```bash
# 로컬에서 프로덕션 빌드 테스트
npm run build
npm run preview
```

## 🔧 Supabase 설정

### 1. Supabase 프로젝트 생성
1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. **"New Project"** 클릭
3. 프로젝트 정보 입력:
   ```
   Name: PropertyDesk Production
   Database Password: [강력한 비밀번호]
   Region: Northeast Asia (Seoul)
   ```

### 2. 데이터베이스 스키마 설정
다음 SQL을 Supabase SQL Editor에서 실행:

```sql
-- 테넌트 테이블
CREATE TABLE tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 확장 테이블
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 매물 테이블
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  property_type TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  price DECIMAL(15,2),
  deposit DECIMAL(15,2),
  monthly_rent DECIMAL(15,2),
  floor_current INTEGER,
  floor_total INTEGER,
  area_exclusive DECIMAL(10,2),
  rooms INTEGER,
  bathrooms INTEGER,
  description TEXT,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- 테넌트 정책
CREATE POLICY "Users can view their tenant" ON tenants
  FOR ALL USING (
    id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
  );

-- 사용자 프로필 정책  
CREATE POLICY "Users can view profiles in their tenant" ON user_profiles
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
  );

-- 매물 정책
CREATE POLICY "Users can manage properties in their tenant" ON properties
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
  );
```

### 3. Authentication 설정
1. **Authentication** → **Settings** 이동
2. **Site URL** 설정:
   ```
   Site URL: https://your-domain.vercel.app
   ```
3. **Redirect URLs** 추가:
   ```
   https://your-domain.vercel.app/auth/callback
   https://your-domain.vercel.app/**
   ```

### 4. API Keys 복사
1. **Settings** → **API** 이동
2. 다음 정보 복사:
   ```
   Project URL: https://xxx.supabase.co
   anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 🔨 Vercel 배포

### 1. GitHub에 코드 푸시
```bash
# Git 저장소 초기화 (이미 완료됨)
git add .
git commit -m "feat: Production ready v1.0.0-beta"
git push origin main
```

### 2. Vercel 프로젝트 생성

#### 방법 1: Vercel CLI 사용
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 배포
vercel

# 배포 설정
? Set up and deploy "PropertyDesk"? [Y/n] y
? Which scope do you want to deploy to? [개인계정 선택]
? Link to existing project? [N/y] n
? What's your project's name? propertydesk-saas
? In which directory is your code located? ./
```

#### 방법 2: Vercel 웹 대시보드 사용
1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. **"New Project"** 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   ```
   Project Name: propertydesk-saas
   Framework: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   ```

### 3. 환경변수 설정
Vercel 대시보드에서 **Settings** → **Environment Variables**:

```bash
# Production 환경변수
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_ENV=production
VITE_APP_NAME=PropertyDesk
VITE_APP_VERSION=1.0.0-beta
```

### 4. 배포 실행
- 환경변수 설정 후 **"Redeploy"** 클릭
- 약 2-3분 후 배포 완료
- 제공된 URL로 접속 테스트

## 🌐 도메인 설정 (선택사항)

### 1. 커스텀 도메인 연결
1. Vercel 프로젝트 **Settings** → **Domains**
2. **"Add Domain"** 클릭
3. 도메인 입력: `propertydesk.com`
4. DNS 설정 안내 확인

### 2. DNS 설정
도메인 등록업체에서 다음 레코드 추가:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.61
```

### 3. SSL 인증서
- Vercel에서 자동으로 Let's Encrypt SSL 적용
- 24시간 이내 HTTPS 활성화

## ✅ 배포 후 확인사항

### 1. 기능 테스트 체크리스트
```
🔐 인증 시스템
□ 회원가입 작동
□ 로그인 작동  
□ 비밀번호 재설정 작동

🏠 매물 관리
□ 매물 등록 작동
□ 매물 조회 작동
□ 매물 수정/삭제 작동
□ 검색 기능 작동

👥 팀 관리
□ 팀원 초대 작동
□ 권한 시스템 작동
□ 팀 페이지 접근 제어

📊 대시보드
□ 차트 렌더링 확인
□ 통계 데이터 표시
□ 반응형 디자인 확인

📱 모바일
□ 모바일 브라우저 테스트
□ 터치 인터페이스 확인
□ 레이아웃 적응성 확인
```

### 2. 성능 확인
```bash
# Core Web Vitals 확인
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms  
- CLS (Cumulative Layout Shift): < 0.1
```

### 3. 보안 확인
- HTTPS 강제 적용
- Security Headers 활성화
- XSS Protection 활성화

## 🔧 트러블슈팅

### 일반적인 문제들

#### 1. 빌드 실패
```bash
# 에러: "Module not found"
# 해결: 의존성 확인
npm install
npm run build
```

#### 2. 환경변수 미적용
```bash
# 원인: 환경변수 오타 또는 누락
# 해결: Vercel 대시보드에서 재확인
VITE_SUPABASE_URL=https://xxx.supabase.co  # 정확한 URL
VITE_SUPABASE_ANON_KEY=xxx  # 정확한 Key
```

#### 3. Supabase 연결 실패
```bash
# 원인: RLS 정책 또는 API 설정 오류
# 해결: Supabase 대시보드에서 확인
1. Project URL 정확성
2. anon key 정확성  
3. RLS 정책 활성화
4. Authentication 설정
```

#### 4. 도메인 연결 실패
```bash
# 원인: DNS 전파 지연
# 해결: 24-48시간 대기 또는 DNS 재설정
```

### 로그 확인
```bash
# Vercel 배포 로그 확인
vercel logs [deployment-url]

# 브라우저 개발자 도구
F12 → Console → 오류 메시지 확인
```

## 📊 모니터링 설정

### 1. Vercel Analytics
1. Vercel 프로젝트 **Settings** → **Analytics**
2. **"Enable Analytics"** 클릭
3. 방문자 통계, 성능 메트릭 모니터링

### 2. Supabase 모니터링
1. Supabase **Settings** → **Usage**
2. 데이터베이스 사용량, API 호출 수 확인

### 3. 에러 모니터링
```javascript
// 프로덕션 환경에서 에러 로깅
window.addEventListener('error', (event) => {
  console.error('Production Error:', event.error)
  // 에러 리포팅 서비스 연동 가능
})
```

## 🔄 업데이트 배포

### 자동 배포
```bash
# main 브랜치에 푸시하면 자동 배포
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin main
# Vercel에서 자동으로 새 배포 시작
```

### 수동 배포
```bash
# Vercel CLI로 수동 배포
vercel --prod
```

## 📞 지원 및 문의

### 배포 관련 지원
- **Vercel 지원**: [Vercel Support](https://vercel.com/support)
- **Supabase 지원**: [Supabase Support](https://supabase.com/support)

### PropertyDesk 관련
- **기술 문의**: tech-support@propertydesk.com
- **배포 지원**: deployment@propertydesk.com

---

## 📝 배포 완료 체크리스트

```
배포 준비
□ Supabase 프로젝트 생성
□ 데이터베이스 스키마 설정
□ RLS 정책 적용
□ Authentication 설정

Vercel 배포
□ GitHub 저장소 연결
□ 환경변수 설정
□ 프로덕션 빌드 성공
□ 도메인 연결 (선택)

기능 테스트  
□ 회원가입/로그인 테스트
□ 매물 CRUD 테스트
□ 팀 관리 테스트
□ 대시보드 차트 테스트
□ 모바일 반응형 테스트

성능 및 보안
□ Core Web Vitals 확인
□ HTTPS 적용 확인
□ Security Headers 확인
□ 모니터링 설정
```

**🎉 배포 완료! PropertyDesk가 프로덕션 환경에서 실행 중입니다.**