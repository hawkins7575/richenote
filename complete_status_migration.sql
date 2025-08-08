-- ============================================================================
-- Complete Status Column Migration Script
-- 이 스크립트는 properties 테이블에 status 컬럼을 추가하고 제약조건을 설정합니다
-- ============================================================================

SELECT '🚀 Properties 테이블 status 컬럼 마이그레이션을 시작합니다...' AS message;

-- 1. 현재 테이블 구조 확인
SELECT '📋 현재 properties 테이블 구조를 확인합니다...' AS message;

SELECT 
    column_name AS "컬럼명", 
    data_type AS "데이터타입", 
    is_nullable AS "NULL허용", 
    column_default AS "기본값"
FROM information_schema.columns 
WHERE table_name = 'properties' 
ORDER BY ordinal_position;

-- 2. status 컬럼 존재 여부 확인 및 추가
DO $$ 
BEGIN
    -- status 컬럼이 존재하지 않는 경우 추가
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'status'
    ) THEN
        -- status 컬럼 추가 (기본값: '거래중')
        ALTER TABLE properties 
        ADD COLUMN status TEXT DEFAULT '거래중' NOT NULL;
        
        RAISE NOTICE '✅ status 컬럼을 추가했습니다 (기본값: 거래중)';
    ELSE
        RAISE NOTICE '⚠️ status 컬럼이 이미 존재합니다. 기존 컬럼을 사용합니다.';
    END IF;
END $$;

-- 3. 기존 제약조건 확인 및 정리
SELECT '🔧 기존 status 관련 제약조건을 확인하고 정리합니다...' AS message;

DO $$ 
DECLARE
    constraint_name TEXT;
BEGIN
    -- 기존 status 관련 제약조건들 삭제
    FOR constraint_name IN 
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'properties' 
          AND c.contype = 'c'
          AND c.consrc LIKE '%status%'
    LOOP
        EXECUTE 'ALTER TABLE properties DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE '🗑️ 기존 제약조건 제거: %', constraint_name;
    END LOOP;
END $$;

-- 4. 새로운 제약조건 적용
SELECT '✅ 새로운 제약조건을 적용합니다...' AS message;

-- status 컬럼에 새로운 체크 제약조건 추가 (거래중, 거래완료만 허용)
ALTER TABLE properties 
ADD CONSTRAINT properties_status_check 
CHECK (status IN ('거래중', '거래완료'));

-- 기본값을 '거래중'으로 설정 (이미 설정되어 있을 수도 있음)
ALTER TABLE properties 
ALTER COLUMN status SET DEFAULT '거래중';

-- NOT NULL 제약조건 설정 (이미 설정되어 있을 수도 있음)
ALTER TABLE properties 
ALTER COLUMN status SET NOT NULL;

-- 5. 기존 데이터 업데이트 (모든 기존 매물을 '거래중'으로 설정)
UPDATE properties 
SET status = '거래중' 
WHERE status IS NULL OR status NOT IN ('거래중', '거래완료');

SELECT '📊 기존 매물들의 상태를 ''거래중''으로 업데이트했습니다.' AS message;

-- 6. 변경사항 확인
SELECT '🔍 마이그레이션 결과를 확인합니다...' AS message;

-- status 컬럼 정보 확인
SELECT 
    '=== STATUS 컬럼 정보 ===' AS section,
    column_name AS "컬럼명", 
    data_type AS "데이터타입", 
    is_nullable AS "NULL허용", 
    column_default AS "기본값"
FROM information_schema.columns 
WHERE table_name = 'properties' AND column_name = 'status';

-- 제약조건 확인
SELECT 
    '=== STATUS 제약조건 ===' AS section,
    conname as "제약조건명",
    consrc as "제약조건정의"
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'properties' 
  AND c.contype = 'c'
  AND consrc LIKE '%status%';

-- 매물별 상태 분포 확인
SELECT 
    '=== 매물별 상태 분포 ===' AS section,
    status AS "상태", 
    COUNT(*) AS "매물수"
FROM properties 
GROUP BY status 
ORDER BY status;

-- 전체 매물 수 확인
SELECT 
    '=== 전체 통계 ===' AS section,
    COUNT(*) AS "총매물수"
FROM properties;

-- 완료 메시지
SELECT '🎉 Status 컬럼 마이그레이션이 성공적으로 완료되었습니다!' AS message;
SELECT '📝 이제 매물 상태는 ''거래중'', ''거래완료'' 두 가지만 사용할 수 있습니다.' AS note;