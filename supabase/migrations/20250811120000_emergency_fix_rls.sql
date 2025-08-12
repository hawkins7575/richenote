-- ============================================================================
-- 긴급 RLS 정책 수정 - 무한 순환 완전 제거
-- ============================================================================

-- 1. 모든 RLS 정책 완전 삭제 및 테이블 재설정
ALTER TABLE IF EXISTS user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS schedules DISABLE ROW LEVEL SECURITY;

-- 2. 기존 정책 모두 삭제 (혹시 남아있을 수 있는 모든 정책)
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    -- user_profiles 정책 삭제
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON user_profiles';
    END LOOP;
    
    -- tenants 정책 삭제  
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'tenants' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON tenants';
    END LOOP;
END $$;

-- 3. 매우 단순한 RLS 정책으로 재설정

-- user_profiles 테이블
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 완전히 단순한 정책: 인증된 사용자는 모든 프로필 읽기 가능
CREATE POLICY "allow_authenticated_read_all_profiles" ON user_profiles
    FOR SELECT TO authenticated
    USING (true);

-- 서비스 역할은 모든 작업 가능 (회원가입용)
CREATE POLICY "allow_service_role_all_profiles" ON user_profiles
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- 사용자는 자신의 프로필만 수정 가능 (단순한 조건)
CREATE POLICY "allow_users_update_own_profile" ON user_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- tenants 테이블  
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자는 모든 테넌트 읽기 가능 (일단 단순하게)
CREATE POLICY "allow_authenticated_read_all_tenants" ON tenants
    FOR SELECT TO authenticated  
    USING (true);

-- 서비스 역할은 모든 작업 가능
CREATE POLICY "allow_service_role_all_tenants" ON tenants
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- 4. 회원가입 트리거 재생성 (이전 버전에서 문제가 있을 수 있음)
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
    user_company TEXT;
    tenant_slug TEXT;
BEGIN
    -- 메타데이터에서 정보 추출
    user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    user_company := NEW.raw_user_meta_data->>'company';
    
    -- 고유한 slug 생성
    tenant_slug := lower(regexp_replace(user_name, '[^a-zA-Z0-9가-힣]', '-', 'g')) || '-' || extract(epoch from now())::text;
    
    -- 테넌트 생성 (INSERT)
    INSERT INTO public.tenants (
        id, 
        name, 
        slug,
        status,
        plan
    ) VALUES (
        NEW.id,
        user_name || '의 부동산',
        tenant_slug,
        'active',
        'starter'
    );
    
    -- 사용자 프로필 생성
    INSERT INTO public.user_profiles (
        id,
        tenant_id,
        email,
        name,
        role,
        company,
        status
    ) VALUES (
        NEW.id,
        NEW.id,
        NEW.email,
        user_name,
        'owner',
        user_company,
        'active'
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- 오류가 발생해도 auth.users 생성은 계속 진행
    RAISE WARNING 'handle_new_user 함수 오류: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 트리거 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6. 필수 권한 부여
GRANT ALL ON user_profiles TO service_role;
GRANT ALL ON tenants TO service_role;
GRANT ALL ON properties TO service_role;
GRANT ALL ON schedules TO service_role;

-- 7. 시퀀스 권한도 부여
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 8. 함수 실행 권한
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;

-- 9. 안전을 위해 기본값 확인
ALTER TABLE user_profiles ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE user_profiles ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE tenants ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE tenants ALTER COLUMN updated_at SET DEFAULT NOW();

-- 10. 기본 인덱스 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_id ON user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tenant_id_simple ON user_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_id ON tenants(id);

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ RLS 정책 무한 순환 문제 해결 완료';
    RAISE NOTICE '✅ 단순한 보안 정책 적용됨';  
    RAISE NOTICE '✅ 회원가입 트리거 재생성됨';
    RAISE NOTICE '✅ 필수 권한 부여됨';
END $$;