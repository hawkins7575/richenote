-- ============================================================================
-- 회원가입 시 자동 프로필/테넌트 생성 트리거
-- ============================================================================

-- 1. 회원가입 시 자동으로 프로필과 테넌트를 생성하는 함수
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
    user_company TEXT;
BEGIN
    -- 사용자 메타데이터에서 이름과 회사 정보 추출
    user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    user_company := NEW.raw_user_meta_data->>'company';
    
    -- 1. 테넌트 생성 (외래키 때문에 먼저)
    INSERT INTO public.tenants (
        id, 
        name, 
        slug,
        status
    ) VALUES (
        NEW.id,
        user_name || '의 부동산',
        lower(regexp_replace(user_name, '[^a-zA-Z0-9가-힣]', '-', 'g')) || '-' || extract(epoch from now())::bigint,
        'active'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- 2. 사용자 프로필 생성
    INSERT INTO public.user_profiles (
        id,
        tenant_id,
        email,
        name,
        role,
        company,
        status,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.id,
        NEW.email,
        user_name,
        'owner',
        user_company,
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. auth.users 테이블에 트리거 설정
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. 기본 사용량 제한 및 설정을 위한 함수
CREATE OR REPLACE FUNCTION set_default_tenant_limits()
RETURNS TRIGGER AS $$
BEGIN
    -- 기본 제한사항 설정 (starter 플랜)
    IF NEW.limits IS NULL THEN
        NEW.limits = '{
            "max_properties": 50,
            "max_users": 2,
            "max_storage_gb": 1,
            "max_api_calls_per_month": 1000,
            "features_enabled": ["basic_properties", "basic_schedule", "basic_reports"]
        }'::jsonb;
    END IF;
    
    -- 기본 설정
    IF NEW.settings IS NULL THEN
        NEW.settings = '{
            "timezone": "Asia/Seoul",
            "date_format": "YYYY-MM-DD",
            "currency": "KRW", 
            "language": "ko",
            "default_property_status": "판매중",
            "require_exit_date": true,
            "require_landlord_info": true,
            "email_notifications": true,
            "sms_notifications": false,
            "browser_notifications": true,
            "require_2fa": false,
            "session_timeout_minutes": 480
        }'::jsonb;
    END IF;
    
    -- 기본 브랜딩 설정
    IF NEW.branding IS NULL THEN
        NEW.branding = '{
            "primary_color": "#3b82f6",
            "secondary_color": "#6b7280", 
            "accent_color": "#f59e0b"
        }'::jsonb;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. tenants 테이블에 기본값 설정 트리거
DROP TRIGGER IF EXISTS set_tenant_defaults ON tenants;
CREATE TRIGGER set_tenant_defaults
    BEFORE INSERT ON tenants
    FOR EACH ROW EXECUTE FUNCTION set_default_tenant_limits();

-- 5. 회원가입 완료 후 환영 데이터 생성 함수 (선택적)
CREATE OR REPLACE FUNCTION create_welcome_data()
RETURNS TRIGGER AS $$
BEGIN
    -- 환영 매물 샘플 생성 (선택적)
    INSERT INTO properties (
        tenant_id,
        title,
        property_type,
        transaction_type, 
        address,
        price,
        deposit,
        monthly_rent,
        area_m2,
        rooms,
        bathrooms,
        description,
        status,
        is_featured,
        created_by
    ) VALUES (
        NEW.id,
        '환영합니다! 첫 번째 매물 등록 예시',
        '아파트',
        '월세',
        '서울시 강남구 테헤란로 123',
        0,
        10000000,
        1200000,
        84.5,
        3,
        2, 
        '리체 매물장을 시작하신 것을 축하합니다! 이 매물은 예시입니다. 실제 매물을 등록하시고 이 매물은 삭제하세요.',
        '임시보관',
        false,
        NEW.id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 환영 데이터 생성 트리거 (user_profiles 생성 후)
DROP TRIGGER IF EXISTS create_user_welcome_data ON user_profiles;
CREATE TRIGGER create_user_welcome_data
    AFTER INSERT ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION create_welcome_data();

-- 7. 필요한 권한 부여
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION set_default_tenant_limits() TO service_role;
GRANT EXECUTE ON FUNCTION create_welcome_data() TO service_role;