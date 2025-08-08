-- ============================================================================
-- 매물 상태 단순화를 위한 데이터베이스 정리 및 재구성
-- ============================================================================

-- 1단계: 기존 매물 데이터 완전 삭제 (백업 후 진행)
DELETE FROM properties WHERE tenant_id IS NOT NULL;

-- 2단계: properties 테이블의 status 컬럼 제약조건 삭제 (있다면)
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check;

-- 3단계: status 컬럼을 새로운 enum으로 수정
-- 먼저 컬럼을 텍스트로 변경
ALTER TABLE properties ALTER COLUMN status TYPE text;

-- 4단계: 새로운 체크 제약조건 추가
ALTER TABLE properties ADD CONSTRAINT properties_status_check 
CHECK (status IN ('거래중', '거래완료'));

-- 5단계: 기본값 설정
ALTER TABLE properties ALTER COLUMN status SET DEFAULT '거래중';

-- 6단계: 기존 잘못된 상태값이 있다면 정리 (안전장치)
UPDATE properties SET status = '거래중' WHERE status NOT IN ('거래중', '거래완료');

-- 7단계: NOT NULL 제약조건 추가
ALTER TABLE properties ALTER COLUMN status SET NOT NULL;