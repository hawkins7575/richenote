# 📋 Properties 테이블 Status 컬럼 마이그레이션 가이드

## 🎯 목표
properties 테이블에 status 컬럼을 추가하여 '거래중'과 '거래완료' 두 가지 상태만 허용하도록 설정

## 📊 현재 상황
- ✅ properties 테이블: 15개 매물 존재
- ❌ status 컬럼: 존재하지 않음 (추가 필요)
- 🔧 필요한 작업: 컬럼 추가 + 제약조건 설정

## 🚀 실행 방법

### 방법 1: Supabase Dashboard (권장)

1. **Supabase Dashboard 접속**
   ```
   https://supabase.com/dashboard
   ```

2. **프로젝트 선택**
   - 로그인 후 해당 프로젝트 선택

3. **SQL Editor 접속**
   - 좌측 메뉴에서 "SQL Editor" 클릭

4. **SQL 실행**
   아래 SQL을 복사하여 붙여넣고 "RUN" 클릭:

```sql
-- ============================================================================
-- Properties 테이블 status 컬럼 추가 마이그레이션
-- ============================================================================

-- 시작 메시지
SELECT '🚀 Properties 테이블 status 컬럼 마이그레이션을 시작합니다...' AS message;

-- 1. status 컬럼 추가 (TEXT 타입, 기본값: 거래중, NOT NULL)
ALTER TABLE properties ADD COLUMN status TEXT DEFAULT '거래중' NOT NULL;

-- 2. 체크 제약조건 추가 (거래중, 거래완료만 허용)
ALTER TABLE properties ADD CONSTRAINT properties_status_check 
    CHECK (status IN ('거래중', '거래완료'));

-- 3. 기존 데이터에 기본값 설정 (혹시 모를 NULL 값 처리)
UPDATE properties SET status = '거래중' WHERE status IS NULL OR status = '';

-- 4. 변경사항 확인
SELECT '📊 변경사항 확인 중...' AS message;

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
SELECT '🎉 status 컬럼 마이그레이션이 성공적으로 완료되었습니다!' AS message;
```

### 방법 2: CLI를 통한 검증

마이그레이션 실행 후 터미널에서 검증:

```bash
cd "/Users/gimdaeseong/summi 3"
node check_status_update.js
```

## ✅ 예상 결과

### 마이그레이션 후 상태:
- **status 컬럼**: 추가됨 (TEXT 타입, NOT NULL, 기본값: '거래중')
- **제약조건**: '거래중', '거래완료'만 허용
- **기존 매물 15개**: 모두 '거래중' 상태로 설정
- **새 매물**: 자동으로 '거래중' 상태로 생성

### 검증 결과 예시:
```
=== STATUS 컬럼 정보 ===
컬럼명: status
데이터타입: text
NULL허용: NO
기본값: '거래중'::text

=== 매물별 상태 분포 ===
상태: 거래중
매물수: 15

=== 제약조건 확인 ===
제약조건명: properties_status_check
제약조건정의: CHECK ((status = ANY (ARRAY['거래중'::text, '거래완료'::text])))
```

## 🔧 문제 해결

### 1. 권한 오류가 발생하는 경우
- Supabase 프로젝트의 소유자 권한 확인
- Service Key가 올바르게 설정되었는지 확인

### 2. 제약조건 충돌이 발생하는 경우
```sql
-- 기존 제약조건이 있다면 먼저 삭제
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check;
```

### 3. 컬럼이 이미 존재하는 경우
```sql
-- 컬럼 존재 여부 확인
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'properties' AND column_name = 'status';
```

## 🎯 다음 단계

마이그레이션 완료 후:
1. **Frontend 테스트**: 매물 등록/수정 폼에서 새 상태 옵션 확인
2. **필터링 테스트**: 매물 리스트에서 상태별 필터링 작동 확인
3. **배포**: GitHub/Vercel에 변경사항 배포

---

❓ **질문이나 문제가 있으시면 언제든 연락주세요!**