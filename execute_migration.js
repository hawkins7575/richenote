#!/usr/bin/env node

// Supabase에서 status 컬럼 마이그레이션 실행
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase URL 또는 Service Key가 설정되지 않았습니다.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeMigration() {
    console.log('🚀 Supabase status 컬럼 마이그레이션을 시작합니다...\n');
    
    try {
        // 1. 현재 상태 확인
        console.log('📋 1. 현재 테이블 상태 확인...');
        const { data: beforeData, error: beforeError } = await supabase
            .from('properties')
            .select('*')
            .limit(1);
            
        if (beforeError) {
            console.error('현재 상태 확인 실패:', beforeError.message);
            return;
        }
        
        const hasStatusColumn = beforeData && beforeData.length > 0 && 'status' in beforeData[0];
        console.log(hasStatusColumn ? '✅ status 컬럼이 이미 존재합니다.' : '❌ status 컬럼이 존재하지 않습니다.');
        
        if (hasStatusColumn) {
            console.log('⚠️ 이미 status 컬럼이 존재합니다. 스크립트를 종료합니다.');
            return;
        }
        
        // 2. status 컬럼 추가
        console.log('\n📋 2. status 컬럼을 추가합니다...');
        
        // ALTER TABLE을 실행하기 위해 RPC 또는 raw SQL이 필요
        // Supabase client에서는 DDL을 직접 실행할 수 없으므로 
        // RPC를 통해 실행하거나 Dashboard의 SQL Editor를 사용해야 함
        
        console.log('❗ 중요: Supabase JavaScript 클라이언트에서는 ALTER TABLE 등의 DDL 명령을 직접 실행할 수 없습니다.');
        console.log('다음 방법 중 하나를 사용해야 합니다:\n');
        
        console.log('=== 방법 1: Supabase Dashboard SQL Editor (권장) ===');
        console.log('1. https://supabase.com/dashboard 로그인');
        console.log('2. 프로젝트 선택');
        console.log('3. 좌측 메뉴에서 "SQL Editor" 클릭');
        console.log('4. 다음 SQL을 복사하여 붙여넣기:\n');
        
        // SQL 내용 출력
        console.log('--- SQL 시작 ---');
        console.log(`
-- status 컬럼 추가
ALTER TABLE properties ADD COLUMN status TEXT DEFAULT '거래중' NOT NULL;

-- 체크 제약조건 추가
ALTER TABLE properties ADD CONSTRAINT properties_status_check 
    CHECK (status IN ('거래중', '거래완료'));

-- 기존 데이터 업데이트
UPDATE properties SET status = '거래중' WHERE status IS NULL OR status = '';

-- 확인 쿼리
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'properties' AND column_name = 'status';

SELECT status, COUNT(*) as count FROM properties GROUP BY status;
`);
        console.log('--- SQL 끝 ---\n');
        
        console.log('5. "RUN" 버튼 클릭하여 실행');
        console.log('6. 실행 후 이 스크립트를 다시 실행하여 확인\n');
        
        console.log('=== 방법 2: psql CLI 사용 ===');
        console.log('1. Supabase 프로젝트 설정에서 Database URL 확인');
        console.log('2. psql을 사용하여 직접 연결');
        console.log('3. 위의 SQL 명령 실행\n');
        
    } catch (error) {
        console.error('❌ 마이그레이션 중 오류 발생:', error.message);
    }
}

// 스크립트 실행
executeMigration()
    .then(() => {
        console.log('\n📋 마이그레이션 가이드 완료!');
        console.log('위의 방법을 사용하여 SQL을 실행한 후, check_status_update.js를 실행하여 확인하세요.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ 스크립트 실행 실패:', error.message);
        process.exit(1);
    });