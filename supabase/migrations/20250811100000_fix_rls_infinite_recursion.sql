-- ============================================================================
-- RLS 정책 무한 순환 문제 해결
-- ============================================================================

-- 1. 기존 RLS 정책 모두 삭제
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON user_profiles;
DROP POLICY IF EXISTS "Service role can insert user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Owners can update profiles in their tenant" ON user_profiles;

-- 2. 단순하고 안전한 RLS 정책으로 재설정
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 기본: 인증된 사용자는 자신의 프로필만 모든 권한
CREATE POLICY "users_full_access_own_profile" ON user_profiles
    FOR ALL
    USING (auth.uid() = id);

-- 회원가입용: 서비스 역할에서 INSERT 허용 (회원가입 시 필요)
CREATE POLICY "service_role_insert_profiles" ON user_profiles
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- 읽기 전용: 인증된 사용자는 다른 사용자 프로필 기본 정보 읽기 가능 
-- (팀 관리 기능을 위해 - 단, 무한 순환 방지를 위해 단순한 조건만 사용)
CREATE POLICY "authenticated_users_read_profiles" ON user_profiles
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- 3. tenants 테이블 RLS 설정 (기존에 없었을 수 있음)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제
DROP POLICY IF EXISTS "users_tenant_access" ON tenants;
DROP POLICY IF EXISTS "service_role_tenant_insert" ON tenants;

-- 단순한 정책으로 생성
CREATE POLICY "users_tenant_access" ON tenants
    FOR ALL
    USING (auth.uid() = id);

CREATE POLICY "service_role_tenant_insert" ON tenants  
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- 4. 기본 권한 확인용 함수 생성 (무한 순환 방지)
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM tenants WHERE id = auth.uid() LIMIT 1;
$$;

-- 5. 기본 사용자 역할 확인 함수 
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE  
AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 6. 인덱스 재생성 (성능 최적화)
DROP INDEX IF EXISTS idx_user_profiles_tenant_id;
DROP INDEX IF EXISTS idx_user_profiles_email; 
DROP INDEX IF EXISTS idx_user_profiles_role;

CREATE INDEX idx_user_profiles_tenant_id ON user_profiles(tenant_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_auth_id ON user_profiles(id);

-- 7. 테스트를 위한 임시 서비스 역할 권한 부여
GRANT ALL ON user_profiles TO service_role;
GRANT ALL ON tenants TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;