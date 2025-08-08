# Properties Table Status Column Migration Guide

## 현재 상황
- `properties` 테이블에 `status` 컬럼이 **존재하지 않음**
- 총 15개의 매물이 있으나 상태 관리 기능이 없음
- 목표: 2가지 상태만 지원 (`거래중`, `거래완료`)

## 마이그레이션 방법

### 방법 1: Supabase Dashboard 사용 (권장)

1. **Supabase Dashboard 로그인**
   - https://supabase.com 접속
   - 프로젝트 선택

2. **SQL Editor 실행**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭
   - "New query" 버튼 클릭

3. **마이그레이션 SQL 실행**
   ```sql
   -- Status 컬럼 추가 및 제약조건 설정
   ALTER TABLE properties 
   ADD COLUMN status TEXT DEFAULT '거래중' NOT NULL;

   -- 체크 제약조건 추가 (거래중, 거래완료만 허용)
   ALTER TABLE properties 
   ADD CONSTRAINT properties_status_check 
   CHECK (status IN ('거래중', '거래완료'));

   -- 결과 확인
   SELECT 
       column_name, 
       data_type, 
       is_nullable, 
       column_default
   FROM information_schema.columns 
   WHERE table_name = 'properties' AND column_name = 'status';
   ```

4. **실행 및 확인**
   - "Run" 버튼 클릭
   - 성공 메시지 확인

### 방법 2: 완전한 마이그레이션 스크립트 실행

전체 `complete_status_migration.sql` 파일 내용을 SQL Editor에 복사하여 실행하면 더 상세한 확인과 함께 마이그레이션이 진행됩니다.

## 실행 후 확인

마이그레이션 완료 후 다음 스크립트로 결과를 확인하세요:

```bash
node check_status_update.js
```

## 예상 결과

마이그레이션 성공 시:
- ✅ `status` 컬럼이 추가됨
- ✅ 기본값이 '거래중'으로 설정됨
- ✅ 모든 기존 매물이 '거래중' 상태가 됨
- ✅ '거래중', '거래완료' 외의 값은 입력 불가
- ✅ NOT NULL 제약조건으로 빈 값 방지

## 문제 해결

### 권한 오류 발생 시
- Service Key 환경변수 확인
- Supabase Dashboard에서 직접 실행 권장

### 컬럼이 이미 존재한다는 오류 시
```sql
-- 기존 컬럼 확인
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'properties' AND column_name = 'status';
```

### 제약조건 충돌 시
```sql
-- 기존 제약조건 제거
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check;
```

## 다음 단계

마이그레이션 완료 후:
1. 프론트엔드 코드에서 status 필드 사용
2. 매물 상태 업데이트 API 구현
3. UI에서 상태 선택/표시 기능 추가