-- ============================================================================
-- 3단계: 새로운 제약조건 적용
-- ============================================================================

-- status 컬럼을 text 타입으로 변경 (이미 text라면 무시됨)
ALTER TABLE properties ALTER COLUMN status TYPE text;

-- 새로운 체크 제약조건 추가 (거래중, 거래완료만 허용)
ALTER TABLE properties ADD CONSTRAINT properties_status_check 
CHECK (status IN ('거래중', '거래완료'));

-- 기본값을 '거래중'으로 설정
ALTER TABLE properties ALTER COLUMN status SET DEFAULT '거래중';

-- NOT NULL 제약조건 추가 (이미 있다면 무시됨)
ALTER TABLE properties ALTER COLUMN status SET NOT NULL;

-- 변경사항 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'properties' AND column_name = 'status';

-- 새로운 제약조건 확인
SELECT 
    conname as constraint_name,
    consrc as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'properties' 
  AND c.contype = 'c'
  AND consrc LIKE '%status%';

-- 테스트용 더미 데이터 삽입해보기 (선택사항)
/*
INSERT INTO properties (
    tenant_id,
    created_by, 
    title,
    type,
    transaction_type,
    status,
    address,
    area,
    floor,
    total_floors,
    rooms,
    bathrooms,
    parking,
    elevator,
    view_count,
    inquiry_count,
    is_featured,
    is_urgent,
    is_favorite,
    images
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '테스트 매물 - 거래중',
    '아파트',
    '매매',
    '거래중',  -- 새로운 상태값
    '서울시 테스트구 테스트동 123-45',
    85.0,
    10,
    15,
    3,
    2,
    true,
    true,
    0,
    0,
    false,
    false,
    false,
    '[]'::jsonb
);

-- 거래완료 상태 테스트
INSERT INTO properties (
    tenant_id,
    created_by, 
    title,
    type,
    transaction_type,
    status,
    address,
    area,
    floor,
    total_floors,
    rooms,
    bathrooms,
    parking,
    elevator,
    view_count,
    inquiry_count,
    is_featured,
    is_urgent,
    is_favorite,
    images
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '테스트 매물 - 거래완료',
    '아파트',
    '매매',
    '거래완료',  -- 새로운 상태값
    '서울시 테스트구 테스트동 123-46',
    75.0,
    5,
    10,
    2,
    1,
    false,
    true,
    0,
    0,
    false,
    false,
    false,
    '[]'::jsonb
);
*/