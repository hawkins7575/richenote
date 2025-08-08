-- ============================================================================
-- Properties 테이블 status 컬럼 추가 - 최종 실행 SQL
-- ============================================================================
-- 실행 방법: Supabase Dashboard > SQL Editor에서 전체 복사하여 실행
-- URL: https://supabase.com/dashboard/project/wlrsoyujrmeviczczfsh/sql
-- ============================================================================

-- 시작 메시지
SELECT '🚀 Properties 테이블 status 컬럼 마이그레이션을 시작합니다...' AS message;

-- 현재 상태 확인
SELECT 
    'Properties 테이블 현재 상태' AS "섹션",
    COUNT(*) AS "총_매물수"
FROM properties;

SELECT 
    'status 컬럼 존재 여부' AS "섹션",
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'properties' AND column_name = 'status'
        ) 
        THEN 'status 컬럼이 이미 존재함' 
        ELSE 'status 컬럼이 존재하지 않음 - 추가 필요' 
    END AS "상태";

-- ============================================================================
-- 1단계: status 컬럼 추가
-- ============================================================================
SELECT '📋 1단계: status 컬럼을 추가합니다...' AS message;

-- status 컬럼 추가 (TEXT 타입, 기본값: '거래중', NOT NULL)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS status TEXT DEFAULT '거래중' NOT NULL;

SELECT '✅ status 컬럼이 성공적으로 추가되었습니다.' AS message;

-- ============================================================================
-- 2단계: 체크 제약조건 추가
-- ============================================================================
SELECT '📋 2단계: 체크 제약조건을 추가합니다...' AS message;

-- 기존 제약조건이 있다면 삭제 (오류 방지)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'properties' 
          AND c.conname = 'properties_status_check'
    ) THEN
        ALTER TABLE properties DROP CONSTRAINT properties_status_check;
        RAISE NOTICE 'Dropped existing properties_status_check constraint';
    END IF;
END $$;

-- 새로운 체크 제약조건 추가 (거래중, 거래완료만 허용)
ALTER TABLE properties ADD CONSTRAINT properties_status_check 
    CHECK (status IN ('거래중', '거래완료'));

SELECT '✅ 체크 제약조건이 성공적으로 추가되었습니다.' AS message;

-- ============================================================================
-- 3단계: 기존 데이터 업데이트
-- ============================================================================
SELECT '📋 3단계: 기존 데이터를 업데이트합니다...' AS message;

-- 기존 매물들을 모두 '거래중' 상태로 설정
UPDATE properties 
SET status = '거래중' 
WHERE status IS NULL OR status = '' OR status NOT IN ('거래중', '거래완료');

-- 업데이트된 레코드 수 확인
SELECT 
    '업데이트 완료' AS "섹션",
    COUNT(*) AS "거래중_상태_매물수"
FROM properties 
WHERE status = '거래중';

SELECT '✅ 기존 데이터가 성공적으로 업데이트되었습니다.' AS message;

-- ============================================================================
-- 4단계: 마이그레이션 결과 검증
-- ============================================================================
SELECT '📊 4단계: 마이그레이션 결과를 검증합니다...' AS message;

-- status 컬럼 정보 확인
SELECT 
    '=== STATUS 컬럼 정보 ===' AS "섹션",
    column_name AS "컬럼명", 
    data_type AS "데이터타입", 
    is_nullable AS "NULL허용", 
    column_default AS "기본값"
FROM information_schema.columns 
WHERE table_name = 'properties' AND column_name = 'status';

-- 매물별 상태 분포 확인
SELECT 
    '=== 매물별 상태 분포 ===' AS "섹션",
    status AS "상태", 
    COUNT(*) AS "매물수"
FROM properties 
GROUP BY status 
ORDER BY status;

-- 제약조건 확인
SELECT 
    '=== 제약조건 확인 ===' AS "섹션",
    conname as "제약조건명",
    pg_get_constraintdef(c.oid) as "제약조건정의"
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'properties' 
  AND c.contype = 'c'
  AND pg_get_constraintdef(c.oid) LIKE '%status%';

-- 테이블 전체 컬럼 목록 확인
SELECT 
    '=== 전체 컬럼 목록 ===' AS "섹션",
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS "모든_컬럼들"
FROM information_schema.columns 
WHERE table_name = 'properties';

-- ============================================================================
-- 완료 메시지
-- ============================================================================
SELECT '🎉 Properties 테이블 status 컬럼 마이그레이션이 성공적으로 완료되었습니다!' AS message;
SELECT '✅ 이제 매물 등록/수정 시 "거래중", "거래완료" 두 가지 상태를 사용할 수 있습니다.' AS message;
SELECT '📋 프론트엔드에서 매물 상태 기능을 테스트해보세요.' AS message;

-- ============================================================================
-- 마이그레이션 완료 - 다음 단계 안내
-- ============================================================================
/*
🎯 다음 단계:
1. 이 SQL을 Supabase Dashboard에서 실행 완료
2. 터미널에서 검증: node check_status_update.js
3. 프론트엔드 테스트: 매물 등록/수정 폼에서 새로운 상태 옵션 확인
4. 필터링 테스트: 매물 리스트에서 상태별 필터링 작동 확인
5. GitHub/Vercel 배포로 변경사항 반영
*/