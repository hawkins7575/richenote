-- ============================================================================
-- 1단계: 기존 데이터 확인 및 삭제
-- ============================================================================

-- 현재 매물 데이터 확인 (백업용)
SELECT id, title, status, created_at 
FROM properties 
ORDER BY created_at DESC 
LIMIT 20;

-- 현재 상태별 통계 확인
SELECT status, COUNT(*) as count
FROM properties 
GROUP BY status;

-- 기존 매물 데이터 완전 삭제 (⚠️ 주의: 되돌릴 수 없음)
-- DELETE FROM properties WHERE tenant_id IS NOT NULL;

-- 삭제 확인용
-- SELECT COUNT(*) as remaining_properties FROM properties;