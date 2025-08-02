-- ============================================================================
-- PropertyDesk SaaS 데이터베이스 스키마
-- 멀티테넌트 아키텍처 + Row Level Security (RLS)
-- ============================================================================

-- Extensions 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ENUMS 정의
-- ============================================================================

-- 구독 플랜
CREATE TYPE subscription_plan AS ENUM ('starter', 'professional', 'business', 'enterprise');

-- 테넌트 상태
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'trial', 'inactive');

-- 사용자 역할
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'agent', 'viewer');

-- 사용자 상태
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending', 'suspended');

-- 매물 타입
CREATE TYPE property_type AS ENUM ('아파트', '오피스텔', '원룸', '빌라', '단독주택', '상가', '사무실', '기타');

-- 거래 타입
CREATE TYPE transaction_type AS ENUM ('매매', '전세', '월세', '단기임대');

-- 매물 상태
CREATE TYPE property_status AS ENUM ('판매중', '예약중', '거래완료', '임시보관', '만료됨');

-- 구독 상태
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'incomplete');

-- 결제 주기
CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');

-- 동기화 상태
CREATE TYPE sync_status AS ENUM ('pending', 'synced', 'error');

-- ============================================================================
-- 2. 테넌트 (중개업소) 테이블
-- ============================================================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    domain TEXT UNIQUE,
    
    -- 구독 정보
    plan subscription_plan NOT NULL DEFAULT 'starter',
    status tenant_status NOT NULL DEFAULT 'trial',
    trial_ends_at TIMESTAMPTZ,
    subscription_ends_at TIMESTAMPTZ,
    
    -- 비즈니스 정보
    business_registration_number TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- 브랜딩 설정 (JSON)
    branding JSONB NOT NULL DEFAULT '{
        "primary_color": "#3b82f6",
        "secondary_color": "#6b7280",
        "accent_color": "#f59e0b"
    }'::jsonb,
    
    -- 사용량 제한 (JSON)
    limits JSONB NOT NULL DEFAULT '{
        "max_properties": 50,
        "max_users": 2,
        "max_storage_gb": 1,
        "max_api_calls_per_month": 1000,
        "features_enabled": []
    }'::jsonb,
    
    -- 설정 (JSON)
    settings JSONB NOT NULL DEFAULT '{
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
    }'::jsonb,
    
    -- 메타데이터
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- 인덱스 생성
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_domain ON tenants(domain);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_plan ON tenants(plan);

-- ============================================================================
-- 3. 사용자 테이블 (auth.users 확장)
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- 기본 정보
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    
    -- 역할 및 권한
    role user_role NOT NULL DEFAULT 'agent',
    status user_status NOT NULL DEFAULT 'pending',
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- 업무 정보
    employee_id TEXT,
    department TEXT,
    hire_date DATE,
    
    -- 설정 (JSON)
    preferences JSONB NOT NULL DEFAULT '{
        "theme": "light",
        "language": "ko",
        "timezone": "Asia/Seoul",
        "notification_settings": {
            "email": true,
            "sms": false,
            "browser": true,
            "frequency": "instant"
        },
        "property_view_mode": "card",
        "items_per_page": 20
    }'::jsonb,
    
    -- 메타데이터
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    invited_by UUID REFERENCES users(id)
);

-- 인덱스 생성
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ============================================================================
-- 4. 매물 테이블
-- ============================================================================

CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    
    -- 기본 정보
    title TEXT NOT NULL,
    type property_type NOT NULL,
    transaction_type transaction_type NOT NULL,
    status property_status NOT NULL DEFAULT '판매중',
    
    -- 가격 정보 (만원 단위)
    price BIGINT, -- 매매가
    deposit BIGINT, -- 보증금
    monthly_rent INTEGER, -- 월세
    maintenance_fee INTEGER, -- 관리비
    
    -- 위치 정보
    address TEXT NOT NULL,
    detailed_address TEXT,
    district TEXT, -- 구/군
    neighborhood TEXT, -- 동
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- 물리적 정보
    area DECIMAL(6, 2) NOT NULL, -- 전용면적 (m²)
    area_common DECIMAL(6, 2), -- 공용면적 (m²)
    floor INTEGER NOT NULL,
    total_floors INTEGER NOT NULL,
    rooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    
    -- 편의시설
    parking BOOLEAN NOT NULL DEFAULT false,
    parking_spaces INTEGER,
    elevator BOOLEAN NOT NULL DEFAULT false,
    
    -- 추가 옵션 (JSON 배열)
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- 임대인 정보
    landlord_name TEXT,
    landlord_phone TEXT,
    landlord_email TEXT,
    
    -- 중요 날짜
    exit_date DATE, -- 퇴실날짜 (MVP 핵심 기능)
    available_from DATE, -- 입주 가능일
    contract_end_date DATE, -- 계약 만료일
    
    -- 미디어 (JSON 배열)
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    videos JSONB DEFAULT '[]'::jsonb,
    virtual_tour_url TEXT,
    
    -- 설명 및 메모
    description TEXT,
    private_notes TEXT, -- 내부용 메모
    
    -- 마케팅 정보
    highlight_features JSONB DEFAULT '[]'::jsonb, -- 특징 배열
    tags JSONB DEFAULT '[]'::jsonb, -- 태그 배열
    
    -- 상태 관리
    view_count INTEGER NOT NULL DEFAULT 0,
    inquiry_count INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_urgent BOOLEAN NOT NULL DEFAULT false,
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    
    -- SaaS 확장 기능
    custom_fields JSONB DEFAULT '{}'::jsonb, -- 테넌트별 커스텀 필드
    sync_status sync_status,
    external_listings JSONB DEFAULT '[]'::jsonb, -- 외부 플랫폼 연동
    
    -- 메타데이터
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- 인덱스 생성
CREATE INDEX idx_properties_tenant_id ON properties(tenant_id);
CREATE INDEX idx_properties_created_by ON properties(created_by);
CREATE INDEX idx_properties_assigned_to ON properties(assigned_to);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(type, transaction_type);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX idx_properties_exit_date ON properties(exit_date);
CREATE INDEX idx_properties_location ON properties(district, neighborhood);
CREATE INDEX idx_properties_price ON properties(price, deposit, monthly_rent);
CREATE INDEX idx_properties_area ON properties(area);

-- 전문 검색을 위한 인덱스
CREATE INDEX idx_properties_search ON properties USING gin(to_tsvector('korean', title || ' ' || address));

-- ============================================================================
-- 5. 구독 테이블
-- ============================================================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- 플랜 정보
    plan_id TEXT NOT NULL, -- 'starter', 'professional', etc.
    status subscription_status NOT NULL DEFAULT 'trialing',
    billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',
    
    -- 날짜
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    canceled_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    
    -- Stripe 관련
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    
    -- 사용량 추적 (JSON)
    usage JSONB NOT NULL DEFAULT '{
        "properties_count": 0,
        "users_count": 0,
        "storage_used_gb": 0,
        "api_calls_this_month": 0
    }'::jsonb,
    
    -- 메타데이터
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_subscriptions_tenant_id ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- ============================================================================
-- 6. 사용자 활동 로그 테이블
-- ============================================================================

CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- 활동 정보
    action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'viewed', etc.
    resource TEXT NOT NULL, -- 'property', 'user', 'tenant', etc.
    resource_id UUID,
    
    -- 추가 정보
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    
    -- 메타데이터
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_tenant_id ON user_activities(tenant_id);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX idx_user_activities_action ON user_activities(action);
CREATE INDEX idx_user_activities_resource ON user_activities(resource, resource_id);

-- ============================================================================
-- 7. 테넌트별 데이터 격리를 위한 RLS 정책
-- ============================================================================

-- RLS 활성화
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- 현재 테넌트 ID를 저장하는 설정 함수
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_tenant_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 테넌트 설정 함수
CREATE OR REPLACE FUNCTION set_current_tenant_id(tenant_id UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', tenant_id::TEXT, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 테넌트 해제 함수
CREATE OR REPLACE FUNCTION clear_current_tenant_id()
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', '', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. RLS 정책 생성
-- ============================================================================

-- TENANTS 테이블 정책
CREATE POLICY "Users can view their own tenant" ON tenants
    FOR SELECT USING (
        id = current_tenant_id() OR
        id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can update their own tenant" ON tenants
    FOR UPDATE USING (
        id = current_tenant_id() AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND tenant_id = tenants.id 
            AND role IN ('owner', 'manager')
        )
    );

-- USERS 테이블 정책
CREATE POLICY "Users can view team members" ON users
    FOR SELECT USING (tenant_id = current_tenant_id());

CREATE POLICY "Users can insert team members" ON users
    FOR INSERT WITH CHECK (
        tenant_id = current_tenant_id() AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND tenant_id = users.tenant_id 
            AND role IN ('owner', 'manager')
        )
    );

CREATE POLICY "Users can update team members" ON users
    FOR UPDATE USING (
        tenant_id = current_tenant_id() AND
        (
            id = auth.uid() OR -- 자신의 정보는 수정 가능
            EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() 
                AND tenant_id = users.tenant_id 
                AND role IN ('owner', 'manager')
            )
        )
    );

-- PROPERTIES 테이블 정책
CREATE POLICY "Users can view tenant properties" ON properties
    FOR SELECT USING (tenant_id = current_tenant_id());

CREATE POLICY "Users can insert properties" ON properties
    FOR INSERT WITH CHECK (
        tenant_id = current_tenant_id() AND
        created_by = auth.uid()
    );

CREATE POLICY "Users can update properties" ON properties
    FOR UPDATE USING (
        tenant_id = current_tenant_id() AND
        (
            created_by = auth.uid() OR
            assigned_to = auth.uid() OR
            EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() 
                AND tenant_id = properties.tenant_id 
                AND role IN ('owner', 'manager')
            )
        )
    );

CREATE POLICY "Users can delete properties" ON properties
    FOR DELETE USING (
        tenant_id = current_tenant_id() AND
        (
            created_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() 
                AND tenant_id = properties.tenant_id 
                AND role IN ('owner', 'manager')
            )
        )
    );

-- SUBSCRIPTIONS 테이블 정책
CREATE POLICY "Users can view tenant subscription" ON subscriptions
    FOR SELECT USING (tenant_id = current_tenant_id());

CREATE POLICY "Owners can manage subscription" ON subscriptions
    FOR ALL USING (
        tenant_id = current_tenant_id() AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND tenant_id = subscriptions.tenant_id 
            AND role = 'owner'
        )
    );

-- USER_ACTIVITIES 테이블 정책
CREATE POLICY "Users can view tenant activities" ON user_activities
    FOR SELECT USING (tenant_id = current_tenant_id());

CREATE POLICY "Users can insert activities" ON user_activities
    FOR INSERT WITH CHECK (
        tenant_id = current_tenant_id() AND
        user_id = auth.uid()
    );

-- ============================================================================
-- 9. 업데이트 트리거 함수
-- ============================================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. 유틸리티 함수
-- ============================================================================

-- 테넌트 통계 조회 함수
CREATE OR REPLACE FUNCTION get_tenant_stats(tenant_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_properties', (
            SELECT COUNT(*) FROM properties WHERE properties.tenant_id = get_tenant_stats.tenant_id
        ),
        'active_properties', (
            SELECT COUNT(*) FROM properties 
            WHERE properties.tenant_id = get_tenant_stats.tenant_id 
            AND status = '판매중'
        ),
        'total_users', (
            SELECT COUNT(*) FROM users WHERE users.tenant_id = get_tenant_stats.tenant_id
        ),
        'active_users', (
            SELECT COUNT(*) FROM users 
            WHERE users.tenant_id = get_tenant_stats.tenant_id 
            AND status = 'active'
        ),
        'storage_used_mb', 0, -- TODO: 실제 스토리지 계산
        'api_calls_this_month', 0, -- TODO: API 사용량 계산
        'created_this_month', (
            SELECT COUNT(*) FROM properties 
            WHERE properties.tenant_id = get_tenant_stats.tenant_id 
            AND created_at >= date_trunc('month', CURRENT_DATE)
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 11. 기본 데이터 삽입
-- ============================================================================

-- 시스템 관리자용 테넌트 (개발/테스트용)
INSERT INTO tenants (
    id,
    name,
    slug,
    plan,
    status,
    created_by
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'PropertyDesk Admin',
    'admin',
    'enterprise',
    'active',
    '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (id) DO NOTHING;