-- Properties 테이블 status 컬럼 추가 마이그레이션
-- 실행: psql로 직접 연결하여 실행

\echo '🚀 Properties 테이블 status 컬럼 마이그레이션을 시작합니다...'

-- 1. status 컬럼 추가 (TEXT 타입, 기본값: 거래중, NOT NULL)
ALTER TABLE properties ADD COLUMN status TEXT DEFAULT '거래중' NOT NULL;
\echo '✅ status 컬럼이 추가되었습니다.'

-- 2. 체크 제약조건 추가 (거래중, 거래완료만 허용)
ALTER TABLE properties ADD CONSTRAINT properties_status_check 
    CHECK (status IN ('거래중', '거래완료'));
\echo '✅ 체크 제약조건이 추가되었습니다.'

-- 3. 기존 데이터에 기본값 설정
UPDATE properties SET status = '거래중' WHERE status IS NULL OR status = '';
\echo '✅ 기존 데이터가 업데이트되었습니다.'

-- 4. 변경사항 확인
\echo '📊 변경사항을 확인합니다...'

-- status 컬럼 정보 확인
SELECT 
    column_name AS "컬럼명", 
    data_type AS "데이터타입", 
    is_nullable AS "NULL허용", 
    column_default AS "기본값"
FROM information_schema.columns 
WHERE table_name = 'properties' AND column_name = 'status';

-- 매물별 상태 분포 확인
SELECT 
    status AS "상태", 
    COUNT(*) AS "매물수"
FROM properties 
GROUP BY status 
ORDER BY status;

\echo '🎉 status 컬럼 마이그레이션이 성공적으로 완료되었습니다!'