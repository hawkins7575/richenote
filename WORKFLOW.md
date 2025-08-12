# 🚀 Git Workflow Guide - 리체 매물장

브랜치 기반 개발 워크플로우 가이드입니다.

## 📋 브랜치 전략

### 메인 브랜치들
- **`main`**: 프로덕션 배포용 브랜치 (항상 안정적인 상태 유지)
- **`develop`**: 개발 통합 브랜치 (다음 릴리즈 준비)

### 작업 브랜치들
- **`feature/*`**: 새로운 기능 개발
- **`bugfix/*`**: 버그 수정
- **`hotfix/*`**: 긴급 수정 (프로덕션 이슈)
- **`refactor/*`**: 리팩토링 작업
- **`docs/*`**: 문서 작업

## 🔄 워크플로우 프로세스

### 1. 새로운 작업 시작
```bash
# develop 브랜치에서 최신 상태로 업데이트
git checkout develop
git pull origin develop

# 새로운 기능 브랜치 생성
git checkout -b feature/새기능명
# 또는
git checkout -b bugfix/버그수정명
```

### 2. 개발 작업
```bash
# 개발 서버 실행 (필요시)
npm run dev

# 파일 수정 후 커밋
git add .
git commit -m "feat: 새로운 기능 추가"

# 정기적으로 원격 브랜치에 푸시
git push -u origin feature/새기능명
```

### 3. 작업 완료 후
```bash
# develop 브랜치로 전환
git checkout develop
git pull origin develop

# 작업 브랜치 머지
git merge feature/새기능명

# develop 브랜치 푸시
git push origin develop

# 작업 브랜치 삭제 (선택적)
git branch -d feature/새기능명
git push origin --delete feature/새기능명
```

### 4. 프로덕션 배포
```bash
# main 브랜치로 전환
git checkout main
git pull origin main

# develop 브랜치 머지
git merge develop

# main 브랜치 푸시
git push origin main

# Vercel 프로덕션 배포
vercel --prod
```

## 📝 커밋 메시지 컨벤션

### 타입별 접두사
- **`feat:`** 새로운 기능 추가
- **`fix:`** 버그 수정
- **`docs:`** 문서 수정
- **`style:`** 코드 스타일 변경 (기능 변경 없음)
- **`refactor:`** 코드 리팩토링
- **`test:`** 테스트 코드 추가/수정
- **`chore:`** 기타 작업 (빌드, 설정 등)

### 커밋 메시지 예시
```
feat: 매물 등록 폼에 공실 체크박스 추가
fix: 매물 가격 입력 시 정밀도 오류 수정
docs: API 문서 업데이트
refactor: 인증 로직 최적화
```

## 🚀 배포 전략

### 개발 환경
- **브랜치**: `develop`
- **자동 배포**: Vercel Preview (선택적)
- **테스트**: 로컬 개발 서버 (`npm run dev`)

### 프로덕션 환경
- **브랜치**: `main`
- **배포 방식**: `vercel --prod`
- **배포 전 체크리스트**:
  - [ ] 빌드 에러 없음 (`npm run build`)
  - [ ] 타입 체크 통과 (`npm run type-check`)
  - [ ] 주요 기능 테스트 완료
  - [ ] SEO 메타태그 확인

## 🛠️ 개발 환경 설정

### 로컬 개발
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드 테스트
npm run build

# 타입 체크
npm run type-check
```

### 환경 변수
```bash
# .env.local 파일 필요 (Supabase 설정)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔧 트러블슈팅

### 흔한 문제들
1. **브랜치 충돌**: `git merge` 시 충돌 발생
   ```bash
   git status  # 충돌 파일 확인
   # 수동으로 충돌 해결 후
   git add .
   git commit
   ```

2. **푸시 거부**: 원격 브랜치가 앞서있는 경우
   ```bash
   git pull origin 브랜치명
   git push origin 브랜치명
   ```

3. **개발 서버 에러**: 포트 충돌
   ```bash
   # 포트 변경 또는 기존 프로세스 종료
   lsof -ti:3000 | xargs kill
   npm run dev
   ```

## 📊 현재 상태

- **메인 브랜치**: `main` (프로덕션)
- **개발 브랜치**: `develop` (개발 통합)
- **현재 버전**: v2.5.0 (SEO 최적화 완료)
- **프로덕션 URL**: https://summi3-nbgx95rfn-daesung75-6440s-projects.vercel.app

---

> 💡 **팁**: 작업 시작 전에는 항상 `develop` 브랜치에서 최신 상태를 받아온 후 새 브랜치를 생성하세요!