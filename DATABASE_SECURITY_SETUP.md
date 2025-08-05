# 🔒 데이터베이스 보안 설정 가이드

## 🚨 중요한 보안 문제 발견

**현재 상황**: 모든 사용자가 다른 사용자의 데이터를 볼 수 있는 심각한 보안 문제가 있습니다.

**원인**: Supabase 데이터베이스의 Row Level Security (RLS) 정책이 설정되지 않아 있습니다.

## 📊 현재 데이터베이스 상태

```
- tenants 테이블: RLS 비활성화 ❌
- user_profiles 테이블: RLS 비활성화 ❌  
- properties 테이블: RLS 비활성화 ❌
```

## 🛠️ 수정 방법

Supabase 대시보드에서 다음 SQL을 실행해주세요:

### 1단계: RLS 활성화

```sql
-- 모든 테이블에 RLS 활성화
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
```

### 2단계: 보안 정책 생성

```sql
-- ============================================================================
-- TENANTS 테이블 RLS 정책
-- ============================================================================

-- 사용자는 자신이 속한 테넌트만 조회 가능
CREATE POLICY "Users can view their own tenant" ON tenants
    FOR SELECT
    USING (
        id IN (
            SELECT tenant_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- 테넌트 생성은 서비스 역할에서만 가능 (회원가입 시)
CREATE POLICY "Service role can insert tenants" ON tenants
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- 테넌트 수정은 해당 테넌트의 Owner만 가능
CREATE POLICY "Owners can update their tenant" ON tenants
    FOR UPDATE
    USING (
        id IN (
            SELECT tenant_id 
            FROM user_profiles 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- ============================================================================
-- USER_PROFILES 테이블 RLS 정책
-- ============================================================================

-- 사용자는 자신의 프로필만 조회 가능
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT
    USING (id = auth.uid());

-- 같은 테넌트 내 사용자들의 프로필 조회 가능 (팀 관리용)
CREATE POLICY "Users can view profiles in their tenant" ON user_profiles
    FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- 프로필 생성은 서비스 역할에서만 가능 (회원가입 시)
CREATE POLICY "Service role can insert user profiles" ON user_profiles
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE
    USING (id = auth.uid());

-- Owner는 같은 테넌트의 다른 사용자 프로필 수정 가능
CREATE POLICY "Owners can update profiles in their tenant" ON user_profiles
    FOR UPDATE
    USING (
        tenant_id IN (
            SELECT tenant_id 
            FROM user_profiles 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- ============================================================================
-- PROPERTIES 테이블 RLS 정책 (가장 중요!)
-- ============================================================================

-- 사용자는 자신의 테넌트 매물만 조회 가능
CREATE POLICY "Users can view properties in their tenant" ON properties
    FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- 인증된 사용자는 자신의 테넌트에 매물 생성 가능
CREATE POLICY "Users can insert properties in their tenant" ON properties
    FOR INSERT
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
        AND user_id = auth.uid()
    );

-- 사용자는 자신의 테넌트 매물만 수정 가능
CREATE POLICY "Users can update properties in their tenant" ON properties
    FOR UPDATE
    USING (
        tenant_id IN (
            SELECT tenant_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- 사용자는 자신의 테넌트 매물만 삭제 가능
CREATE POLICY "Users can delete properties in their tenant" ON properties
    FOR DELETE
    USING (
        tenant_id IN (
            SELECT tenant_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );
```

### 3단계: 유틸리티 함수 생성

```sql
-- 현재 사용자의 tenant_id를 반환하는 함수
CREATE OR REPLACE FUNCTION get_current_user_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT tenant_id 
        FROM user_profiles 
        WHERE id = auth.uid()
    );
END;
$$;
```

## 🔧 설정 방법

1. **Supabase 대시보드** 접속
2. **SQL Editor** 메뉴로 이동
3. 위의 SQL 코드를 순서대로 실행
4. **애플리케이션 재시작**

## ✅ 설정 완료 후 확인사항

RLS 설정 후 다음과 같이 동작해야 합니다:

- ✅ 사용자 A는 사용자 A의 매물만 조회 가능
- ✅ 사용자 B는 사용자 B의 매물만 조회 가능  
- ✅ 같은 회사(테넌트) 내 사용자들은 서로 데이터 공유
- ✅ 다른 회사 데이터는 완전히 격리

## 🚨 주의사항

- **반드시 모든 정책을 설정**해야 합니다
- **기존 테스트 데이터**는 정책 설정 후 조회되지 않을 수 있습니다
- **새로운 계정으로 테스트** 해보시기 바랍니다

## 📞 문제 발생 시

RLS 설정 후 데이터가 조회되지 않거나 오류가 발생하면:

1. 사용자가 올바른 `tenant_id`를 가지고 있는지 확인
2. `user_profiles` 테이블에 사용자 정보가 올바르게 있는지 확인
3. 브라우저 새로고침 후 다시 로그인

---

**이 설정을 완료하면 사용자별 데이터 분리가 완벽하게 작동합니다!** 🎉