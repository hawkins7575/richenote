# PropertyDesk SaaS 개발 환경 설정 가이드

## 개요

PropertyDesk SaaS는 Supabase를 백엔드로 사용하는 멀티테넌트 부동산 관리 플랫폼입니다.

## 사전 요구사항

- **Node.js** 18+ 버전
- **Docker Desktop** (로컬 Supabase 개발용)
- **Git**

## 개발 환경 설정 (2가지 옵션)

### 옵션 1: 로컬 개발 환경 (Docker 필요)

#### 1단계: 프로젝트 클론 및 설치

```bash
# 프로젝트 클론
git clone <repository-url>
cd summi_3

# 의존성 설치
npm install
```

#### 2단계: Docker Desktop 시작

1. Docker Desktop 설치: https://docs.docker.com/desktop/
2. Docker Desktop 실행
3. Docker가 정상 작동하는지 확인:

```bash
docker --version
```

#### 3단계: Supabase 로컬 인스턴스 시작

```bash
# Supabase 로컬 인스턴스 시작
./supabase-cli start

# 초기 마이그레이션 실행 (스키마 생성)
./supabase-cli db reset
```

### 옵션 2: 클라우드 개발 환경 (Docker 불필요)

Docker 설치가 어려운 경우 Supabase 클라우드를 사용할 수 있습니다.

#### 1단계: 프로젝트 클론 및 설치

```bash
# 프로젝트 클론
git clone <repository-url>
cd summi_3

# 의존성 설치
npm install
```

#### 2단계: Supabase 클라우드 프로젝트 생성

1. https://supabase.com 에서 계정 생성
2. 새 프로젝트 생성
3. 프로젝트 설정에서 API 키 복사

#### 3단계: 환경변수 설정

`.env` 파일을 수정하여 클라우드 프로젝트 정보로 변경:

```env
# Supabase 설정 (클라우드용)
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

성공적으로 실행되면 다음과 같은 정보가 표시됩니다:

```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
  S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
        JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
           anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4단계: 개발 서버 시작

```bash
# 프론트엔드 개발 서버 시작
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하여 애플리케이션을 확인할 수 있습니다.

## 테스트 데이터

로컬 개발 환경에는 다음과 같은 테스트 데이터가 자동으로 생성됩니다:

### 테스트 체험단
- **체험단 이름**: PropertyDesk 데모
- **플랜**: Professional (체험판)
- **기간**: 30일 체험

### 테스트 사용자
- **이메일**: demo@propertydesk.com
- **이름**: 데모 관리자
- **역할**: 소유자 (Owner)

### 샘플 매물
- 5개의 다양한 매물 (아파트, 오피스텔, 원룸, 빌라)
- 서로 다른 거래 유형 (매매, 전세, 월세)
- 다양한 상태 (판매중, 예약중, 거래완료)

## Supabase Studio 사용법

로컬 Supabase 인스턴스가 실행 중이면 `http://127.0.0.1:54323`에서 Supabase Studio에 접속할 수 있습니다.

### 주요 기능
- **테이블 에디터**: 데이터베이스 데이터 직접 편집
- **SQL 에디터**: SQL 쿼리 실행
- **인증 관리**: 사용자 계정 관리
- **API 로그**: API 호출 모니터링

## 환경 변수 설정

### 로컬 개발
기본적으로 `.env` 파일이 로캬 Supabase 인스턴스를 사용하도록 설정되어 있습니다.

### 프로덕션 대비
프로덕션 배포를 위해서는 `.env` 파일의 다음 값들을 실제 Supabase 프로젝트 값으로 교체해야 합니다:

```env
VITE_SUPABASE_URL=https://your-actual-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

## 개발 명령어

```bash
# 개발 서버 시작
npm run dev

# 빌드
npm run build

# 린트 및 타입 검사
npm run lint
npm run type-check

# Supabase 로컬 인스턴스 관리
./supabase-cli start    # 시작
./supabase-cli stop     # 중지
./supabase-cli status   # 상태 확인
./supabase-cli db reset # 데이터베이스 초기화
```

## 문제 해결

### Docker 오류
```
Cannot connect to the Docker daemon
```
- Docker Desktop이 실행 중인지 확인
- Docker Desktop을 재시작

### Supabase 시작 오류
```
failed to start container
```
- 포트 충돌 확인 (54321-54327 포트)
- 다른 Supabase 인스턴스가 실행 중인지 확인

### 데이터베이스 연결 오류
- `.env` 파일의 Supabase URL과 키 확인
- Supabase 인스턴스가 정상 실행 중인지 확인

## 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [React 공식 문서](https://react.dev/)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)