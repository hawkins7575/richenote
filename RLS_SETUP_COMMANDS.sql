-- ============================================================================
-- Supabase RLS 보안 정책 설정 - 수동 실행용
-- ============================================================================
-- 이 파일을 Supabase 대시보드 > SQL Editor에서 실행하세요

-- 1단계: RLS 활성화
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- 확인 쿼리 (실행 후 모두 true가 되어야 함)
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tenants', 'user_profiles', 'properties');

-- ============================================================================
-- 2단계: TENANTS 테이블 RLS 정책
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
-- 3단계: USER_PROFILES 테이블 RLS 정책
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
-- 4단계: PROPERTIES 테이블 RLS 정책 (가장 중요!)
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

-- ============================================================================
-- 5단계: 유틸리티 함수 생성
-- ============================================================================

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

-- ============================================================================
-- 6단계: 설정 완료 확인
-- ============================================================================

-- RLS 활성화 확인
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public' 
AND tablename IN ('tenants', 'user_profiles', 'properties')
ORDER BY tablename;

-- 정책 목록 확인
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('tenants', 'user_profiles', 'properties')
ORDER BY tablename, policyname;

-- ============================================================================
-- 완료!
-- ============================================================================
-- 모든 설정이 완료되면:
-- 1. RLS가 모든 테이블에서 활성화됨 (true)
-- 2. 각 테이블에 적절한 정책이 생성됨
-- 3. 사용자별 데이터 격리가 완전히 작동함
-- ============================================================================