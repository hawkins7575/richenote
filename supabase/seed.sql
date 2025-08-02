-- ============================================================================
-- PropertyDesk SaaS 초기 시드 데이터
-- 개발 및 테스트용 샘플 데이터
-- ============================================================================

-- 테스트용 테넌트 생성
INSERT INTO tenants (
    id,
    name,
    slug,
    plan,
    status,
    created_at,
    trial_ends_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'PropertyDesk 데모',
    'propertydesk-demo',
    'professional',
    'trial',
    NOW(),
    NOW() + INTERVAL '30 days'
);

-- 테스트용 사용자 프로필 생성 (인증된 사용자에 대한 프로필)
-- 실제 사용시에는 인증 시스템에서 자동 생성
INSERT INTO user_profiles (
    id,
    email,
    name,
    role,
    status,
    tenant_id,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'demo@propertydesk.com',
    '데모 관리자',
    'owner',
    'active',
    '00000000-0000-0000-0000-000000000001',
    NOW()
);

-- 샘플 매물 데이터
INSERT INTO properties (
    id,
    tenant_id,
    created_by,
    title,
    property_type,
    transaction_type,
    status,
    price,
    deposit,
    monthly_rent,
    address,
    detailed_address,
    area,
    floor,
    total_floors,
    rooms,
    bathrooms,
    parking,
    elevator,
    landlord_name,
    landlord_phone,
    exit_date,
    description,
    created_at
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '강남구 신사동 럭셔리 아파트',
    '아파트',
    '매매',
    '판매중',
    350000,
    NULL,
    NULL,
    '서울시 강남구 역삼동 123-10',
    '123동 456호',
    85.0,
    15,
    25,
    3,
    2,
    true,
    true,
    '김임대',
    '010-1234-5678',
    '2025-08-31',
    '역세권 신축 럭셔리 아파트입니다. 남향, 고층, 풀옵션.',
    NOW()
),
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '경기도 성남시 분당구 정자동',
    '아파트',
    '전세',
    '예약중',
    NULL,
    210000,
    NULL,
    '경기도 성남시 분당구 정자동 456-78',
    '456동 789호',
    60.0,
    8,
    20,
    2,
    1,
    true,
    true,
    '박소유',
    '010-9876-5432',
    '',
    '분당 정자동 카페거리 근처, 교통 편리.',
    NOW()
),
(
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '홍대 신축 오피스텔',
    '오피스텔',
    '월세',
    '판매중',
    NULL,
    10000,
    65,
    '서울시 마포구 상수동 789-12',
    '789동 101호',
    25.0,
    5,
    15,
    1,
    1,
    false,
    true,
    '이주인',
    '010-5555-6666',
    '',
    '홍대입구역 5분 거리, 신축 오피스텔.',
    NOW()
),
(
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '종로구 학동 원룸',
    '원룸',
    '월세',
    '판매중',
    NULL,
    5000,
    35,
    '서울시 종로구 학동 123-45',
    '2층',
    20.0,
    2,
    5,
    1,
    1,
    false,
    false,
    '최관리',
    '010-7777-8888',
    '2025-09-15',
    '대학로 근처, 지하철 5분 거리. 깔끔한 원룸.',
    NOW() - INTERVAL '5 days'
),
(
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '서초구 양재동 빌라',
    '빌라',
    '전세',
    '거래완료',
    NULL,
    180000,
    NULL,
    '서울시 서초구 양재동 234-56',
    '1층',
    45.0,
    1,
    3,
    2,
    1,
    true,
    false,
    '정주인',
    '010-2222-3333',
    '',
    '양재동 조용한 주거지역, 마당 있음.',
    NOW() - INTERVAL '10 days'
);

-- 구독 정보 (테스트용)
INSERT INTO subscriptions (
    id,
    tenant_id,
    plan,
    status,
    billing_cycle,
    current_period_start,
    current_period_end,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'professional',
    'trialing',
    'monthly',
    NOW(),
    NOW() + INTERVAL '30 days',
    NOW()
);

-- 테넌트 설정 (브랜딩 및 제한)
INSERT INTO tenant_settings (
    tenant_id,
    branding,
    limits,
    features,
    custom_fields,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '{
        "primary_color": "#3b82f6",
        "secondary_color": "#1d4ed8",
        "logo_url": "",
        "favicon_url": "",
        "custom_domain": ""
    }'::jsonb,
    '{
        "max_properties": 1000,
        "max_users": 10,
        "max_storage_gb": 10,
        "max_api_calls_per_month": 50000,
        "max_email_per_month": 5000
    }'::jsonb,
    '{
        "advanced_analytics": true,
        "api_access": true,
        "custom_fields": true,
        "integrations": ["naver", "zigbang"],
        "whitelabel": false,
        "priority_support": true
    }'::jsonb,
    '{}'::jsonb,
    NOW(),
    NOW()
);