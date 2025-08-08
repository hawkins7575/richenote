-- ============================================================================
-- Properties 테이블에 status 컬럼 추가 및 설정
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행
-- ============================================================================

-- 시작 메시지
SELECT '🚀 Properties 테이블에 status 컬럼을 추가합니다...' AS message;

-- 1. status 컬럼 추가 (TEXT 타입으로)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS status TEXT DEFAULT '거래중' NOT NULL;

-- 2. 체크 제약조건 추가 (거래중, 거래완료만 허용)
ALTER TABLE properties ADD CONSTRAINT properties_status_check 
    CHECK (status IN ('거래중', '거래완료'));

-- 3. 기존 데이터에 기본값 설정
UPDATE properties SET status = '거래중' WHERE status IS NULL OR status = '';

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

-- 매물별 상태 분포 확인
SELECT 
    '=== 매물별 상태 분포 ===' AS section,
    status AS "상태", 
    COUNT(*) AS "매물수"
FROM properties 
GROUP BY status 
ORDER BY status;

-- 제약조건 확인
SELECT 
    '=== 제약조건 확인 ===' AS section,
    conname as "제약조건명",
    pg_get_constraintdef(c.oid) as "제약조건정의"
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'properties' 
  AND c.contype = 'c'
  AND pg_get_constraintdef(c.oid) LIKE '%status%';

-- 완료 메시지
SELECT '🎉 status 컬럼 추가가 완료되었습니다!' AS message;