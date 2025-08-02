# Supabase Authentication 설정 가이드

## 🔐 인증 시스템 설정

### 1. Authentication 기본 설정

1. **Supabase Dashboard** → **Authentication** → **Settings** 이동

2. **Site URL 설정**:
   ```
   Site URL: https://propertydesk-saas-rbkfizen2-daesung75-6440s-projects.vercel.app
   ```

3. **Additional Redirect URLs 추가**:
   ```
   https://propertydesk-saas-rbkfizen2-daesung75-6440s-projects.vercel.app/auth/callback
   https://propertydesk-saas-rbkfizen2-daesung75-6440s-projects.vercel.app/**
   ```

### 2. 이메일 템플릿 설정

**Authentication** → **Email Templates** 이동:

#### 회원가입 확인 이메일
```html
<h2>PropertyDesk 회원가입을 완료해주세요</h2>
<p>안녕하세요! PropertyDesk에 가입해주셔서 감사합니다.</p>
<p>아래 링크를 클릭하여 이메일 인증을 완료해주세요:</p>
<p><a href="{{ .ConfirmationURL }}">이메일 인증하기</a></p>
<p>PropertyDesk 팀 드림</p>
```

#### 비밀번호 재설정 이메일
```html
<h2>PropertyDesk 비밀번호 재설정</h2>
<p>비밀번호 재설정을 요청하셨습니다.</p>
<p>아래 링크를 클릭하여 새 비밀번호를 설정해주세요:</p>
<p><a href="{{ .ConfirmationURL }}">비밀번호 재설정하기</a></p>
<p>PropertyDesk 팀 드림</p>
```

### 3. API Keys 확인

**Settings** → **API** 이동하여 다음 정보 복사:

```bash
# 이 정보들을 Vercel 환경변수에 설정해야 함
Project URL: https://[project-id].supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (보안상 사용 안 함)
```

## ⚠️ 중요 보안 설정

### RLS (Row Level Security) 확인
- 모든 테이블에 RLS가 활성화되어 있는지 확인
- 정책이 올바르게 적용되었는지 확인

### CORS 설정
기본적으로 Supabase는 모든 도메인을 허용하지만, 프로덕션에서는 제한 권장:

```
허용된 Origin: https://propertydesk-saas-rbkfizen2-daesung75-6440s-projects.vercel.app
```

## 🔧 테스트 체크리스트

### 인증 기능 테스트
- [ ] 회원가입 작동
- [ ] 이메일 인증 작동  
- [ ] 로그인 작동
- [ ] 비밀번호 재설정 작동
- [ ] 자동 로그인 유지

### RLS 정책 테스트
- [ ] 테넌트별 데이터 분리
- [ ] 권한별 접근 제어
- [ ] 무단 접근 차단

## 📞 문제 해결

### 일반적인 오류들

#### "Invalid login credentials"
- 이메일 인증이 완료되지 않음
- 잘못된 비밀번호

#### "Authentication required"  
- RLS 정책 설정 오류
- 세션 만료

#### "Access denied"
- 권한 부족
- 잘못된 테넌트 접근

### 디버깅 방법
1. Supabase Dashboard → **Authentication** → **Users**에서 사용자 상태 확인
2. **Logs** 섹션에서 오류 로그 확인
3. 브라우저 개발자 도구에서 네트워크 요청 확인