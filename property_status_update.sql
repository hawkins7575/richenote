-- ============================================================================
-- Properties 테이블 status 컬럼 업데이트 SQL 스크립트
-- 
-- 실행 방법:
-- 1. Supabase Dashboard > SQL Editor에서 실행
-- 2. 또는 psql을 통해 직접 연결하여 실행
-- ============================================================================

-- 시작 메시지
SELECT '🚀 Properties 테이블 status 컬럼 업데이트를 시작합니다...' AS message;

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
        RAISE NOTICE '✅ property_status ENUM에 ''거래중'' 값이 추가되었습니다.';
    ELSE
        RAISE NOTICE '⚠️ property_status ENUM에 ''거래중'' 값이 이미 존재합니다.';
    END IF;
END $$;

-- 2. status 컬럼의 기본값을 '거래중'으로 변경
ALTER TABLE properties ALTER COLUMN status SET DEFAULT '거래중';
SELECT '✅ status 컬럼의 기본값을 ''거래중''으로 변경했습니다.' AS message;

-- 3. 기존 '판매중' 상태를 '거래중'으로 업데이트 (선택사항)
-- 필요에 따라 주석을 해제하여 사용하세요
-- UPDATE properties SET status = '거래중' WHERE status = '판매중';
-- SELECT '✅ 기존 ''판매중'' 상태를 ''거래중''으로 업데이트했습니다.' AS message;

-- 4. 변경사항 확인
SELECT '📊 변경사항을 확인합니다...' AS message;

-- status 컬럼 정보 확인
SELECT 
    '=== STATUS 컬럼 정보 ===' AS section,
    column_name AS "컬럼명", 
    data_type AS "데이터타입", 
    is_nullable AS "NULL허용", 
    column_default AS "기본값"
FROM information_schema.columns 
WHERE table_name = 'properties' AND column_name = 'status';

-- property_status ENUM 값들 확인
SELECT 
    '=== PROPERTY_STATUS ENUM 값들 ===' AS section,
    enumlabel AS "사용가능한상태"
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'property_status'
)
ORDER BY enumsortorder;

-- 매물별 상태 분포 확인
SELECT 
    '=== 매물별 상태 분포 ===' AS section,
    status AS "상태", 
    COUNT(*) AS "매물수"
FROM properties 
GROUP BY status 
ORDER BY status;

-- 완료 메시지
SELECT '🎉 스크립트 실행이 완료되었습니다!' AS message;