-- ============================================================================
-- 2단계: 스키마 수정 - status 컬럼 제약조건 업데이트
-- ============================================================================

-- 현재 status 컬럼 정보 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'properties' AND column_name = 'status';

-- 기존 체크 제약조건 확인
SELECT 
    conname as constraint_name,
    consrc as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'properties' 
  AND c.contype = 'c'
  AND consrc LIKE '%status%';

-- 기존 제약조건 삭제 (있다면)
DO $$ 
BEGIN
    -- properties_status_check 제약조건이 존재하면 삭제
    IF EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'properties' 
          AND c.conname = 'properties_status_check'
    ) THEN
        ALTER TABLE properties DROP CONSTRAINT properties_status_check;
        RAISE NOTICE 'Dropped existing properties_status_check constraint';
    END IF;
    
    -- 다른 status 관련 제약조건들도 확인 및 삭제
    FOR constraint_name IN 
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'properties' 
          AND c.contype = 'c'
          AND c.consrc LIKE '%status%'
    LOOP
        EXECUTE 'ALTER TABLE properties DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END LOOP;
END $$;