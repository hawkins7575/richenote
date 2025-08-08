-- ============================================================================
-- Properties 테이블 status 컬럼에 '거래중' 값 추가
-- ============================================================================

-- 1. property_status ENUM에 '거래중' 값 추가
DO $$ 
BEGIN
    -- ENUM 값이 존재하지 않는 경우에만 추가
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = '거래중' 
        AND enumtypid = (
            SELECT oid 
            FROM pg_type 
            WHERE typname = 'property_status'
        )
    ) THEN
        ALTER TYPE property_status ADD VALUE '거래중';
        RAISE NOTICE 'property_status ENUM에 ''거래중'' 값이 추가되었습니다.';
    ELSE
        RAISE NOTICE 'property_status ENUM에 ''거래중'' 값이 이미 존재합니다.';
    END IF;
END $$;

-- 2. status 컬럼의 기본값을 '거래중'으로 변경
ALTER TABLE properties ALTER COLUMN status SET DEFAULT '거래중';

-- 3. 기존 '판매중' 상태를 '거래중'으로 업데이트 (선택사항)
-- 필요에 따라 주석 해제하여 사용
-- UPDATE properties SET status = '거래중' WHERE status = '판매중';

-- 4. 변경사항 로그
DO $$
DECLARE
    status_info RECORD;
    enum_values TEXT[];
    status_counts RECORD;
BEGIN
    -- 컬럼 정보 출력
    SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
    INTO status_info
    FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'status';
    
    RAISE NOTICE '=== STATUS 컬럼 정보 ===';
    RAISE NOTICE '컬럼명: %', status_info.column_name;
    RAISE NOTICE '데이터 타입: %', status_info.data_type;
    RAISE NOTICE 'NULL 허용: %', status_info.is_nullable;
    RAISE NOTICE '기본값: %', status_info.column_default;
    
    -- ENUM 값들 출력
    SELECT ARRAY(
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (
            SELECT oid 
            FROM pg_type 
            WHERE typname = 'property_status'
        )
        ORDER BY enumsortorder
    ) INTO enum_values;
    
    RAISE NOTICE '=== PROPERTY_STATUS ENUM 값들 ===';
    RAISE NOTICE '사용 가능한 상태: %', array_to_string(enum_values, ', ');
    
    -- 매물별 상태 분포 출력
    RAISE NOTICE '=== 매물별 상태 분포 ===';
    FOR status_counts IN 
        SELECT status, COUNT(*) as count 
        FROM properties 
        GROUP BY status 
        ORDER BY status
    LOOP
        RAISE NOTICE '% : % 건', status_counts.status, status_counts.count;
    END LOOP;
END $$;