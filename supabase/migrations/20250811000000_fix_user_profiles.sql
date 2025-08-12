-- ============================================================================
-- 회원가입 문제 해결을 위한 마이그레이션
-- ============================================================================

-- 1. user_profiles 테이블 생성 (애플리케이션 코드와 일치)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'agent', 'viewer')),
    company TEXT,
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 기존 users 테이블 데이터를 user_profiles로 마이그레이션
INSERT INTO user_profiles (id, tenant_id, email, name, role, company, avatar_url, status, created_at, updated_at)
SELECT 
    u.id,
    u.tenant_id,
    u.email,
    u.full_name as name,
    CASE 
        WHEN u.role = 'owner' THEN 'owner'
        WHEN u.role = 'manager' THEN 'manager'
        WHEN u.role = 'agent' THEN 'agent'
        ELSE 'viewer'
    END as role,
    u.department as company,
    u.avatar_url,
    CASE 
        WHEN u.status = 'active' THEN 'active'
        WHEN u.status = 'inactive' THEN 'inactive'
        WHEN u.status = 'pending' THEN 'pending'
        ELSE 'suspended'
    END as status,
    u.created_at,
    u.updated_at
FROM users u
ON CONFLICT (id) DO NOTHING;

-- 3. 회원가입 우회 함수 생성
CREATE OR REPLACE FUNCTION create_user_bypass(
    user_email TEXT,
    user_password TEXT,
    user_name TEXT,
    user_company TEXT DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    user_id UUID,
    error_message TEXT
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    new_user_id UUID;
    new_tenant_id UUID;
BEGIN
    -- 고유한 사용자 ID 생성
    new_user_id := gen_random_uuid();
    
    -- 이미 존재하는 이메일인지 확인
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, '이미 등록된 이메일 주소입니다.';
        RETURN;
    END IF;
    
    -- auth.users 테이블에 직접 삽입 (우회 모드)
    BEGIN
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token
        ) VALUES (
            new_user_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            user_email,
            crypt(user_password, gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            jsonb_build_object('name', user_name, 'company', user_company),
            NOW(),
            NOW(),
            '',
            ''
        );
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, '사용자 생성 실패: ' || SQLERRM;
        RETURN;
    END;
    
    -- 성공 반환
    RETURN QUERY SELECT TRUE, new_user_id, NULL::TEXT;
    
END;
$$;

-- 4. RLS 정책 설정
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필 조회 가능
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT
    USING (id = auth.uid());

-- 같은 테넌트 내 사용자들의 프로필 조회 가능 (팀 관리용)
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON user_profiles;
CREATE POLICY "Users can view profiles in their tenant" ON user_profiles
    FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- 서비스 역할에서 프로필 생성 가능 (회원가입 시)
DROP POLICY IF EXISTS "Service role can insert user profiles" ON user_profiles;
CREATE POLICY "Service role can insert user profiles" ON user_profiles
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- 사용자는 자신의 프로필만 수정 가능
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE
    USING (id = auth.uid());

-- Owner는 같은 테넌트의 다른 사용자 프로필 수정 가능
DROP POLICY IF EXISTS "Owners can update profiles in their tenant" ON user_profiles;
CREATE POLICY "Owners can update profiles in their tenant" ON user_profiles
    FOR UPDATE
    USING (
        tenant_id IN (
            SELECT tenant_id 
            FROM user_profiles 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_profiles_tenant_id ON user_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- 6. 업데이트 트리거 생성
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();