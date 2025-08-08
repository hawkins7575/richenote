#!/usr/bin/env node

// Status 컬럼 마이그레이션 실행 스크립트
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase URL 또는 Service Key가 설정되지 않았습니다.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    console.log('🚀 Status 컬럼 마이그레이션을 시작합니다...\n');
    
    try {
        // SQL 파일 읽기
        const sqlFilePath = join(__dirname, 'complete_status_migration.sql');
        const sqlScript = readFileSync(sqlFilePath, 'utf8');
        
        console.log('📋 SQL 스크립트를 읽었습니다.');
        console.log('🔧 마이그레이션을 실행합니다...\n');
        
        // SQL 실행
        const { data, error } = await supabase.rpc('exec_sql', { 
            sql_query: sqlScript 
        });
        
        if (error) {
            console.error('❌ 마이그레이션 실행 실패:', error.message);
            
            // 대안: 직접 쿼리 실행 시도
            console.log('🔄 대안 방법으로 단계별 실행을 시도합니다...\n');
            await runStepByStep();
        } else {
            console.log('✅ 마이그레이션이 성공적으로 완료되었습니다!');
            if (data) {
                console.log('결과:', data);
            }
        }
        
    } catch (error) {
        console.error('❌ 마이그레이션 중 오류 발생:', error.message);
        
        // 대안: 단계별 실행
        console.log('🔄 단계별 실행을 시도합니다...\n');
        await runStepByStep();
    }
}

async function runStepByStep() {
    console.log('📋 단계별 마이그레이션을 실행합니다...\n');
    
    try {
        // 1. status 컬럼 존재 여부 확인
        console.log('1️⃣ status 컬럼 존재 여부 확인...');
        const { data: columnCheck } = await supabase
            .from('information_schema.columns')
            .select('column_name')
            .eq('table_name', 'properties')
            .eq('column_name', 'status');
            
        const statusExists = columnCheck && columnCheck.length > 0;
        console.log(statusExists ? '✅ status 컬럼이 이미 존재합니다.' : '❌ status 컬럼이 존재하지 않습니다.');
        
        if (!statusExists) {
            // 2. status 컬럼 추가 (PostgreSQL 함수 호출 방식)
            console.log('2️⃣ status 컬럼을 추가합니다...');
            
            // 원시 SQL 실행을 위한 RPC 함수 생성 (이미 있으면 무시됨)
            try {
                await supabase.rpc('add_status_column');
            } catch (err) {
                // RPC 함수가 없는 경우, 다른 방법 시도
                console.log('⚠️ RPC 함수를 사용할 수 없습니다. Supabase 대시보드에서 SQL 실행이 필요합니다.');
                console.log('\n📝 다음 SQL을 Supabase 대시보드의 SQL Editor에서 실행하세요:\n');
                
                const addColumnSQL = `
-- Status 컬럼 추가
ALTER TABLE properties 
ADD COLUMN status TEXT DEFAULT '거래중' NOT NULL;

-- 체크 제약조건 추가
ALTER TABLE properties 
ADD CONSTRAINT properties_status_check 
CHECK (status IN ('거래중', '거래완료'));
                `;
                
                console.log('```sql');
                console.log(addColumnSQL);
                console.log('```\n');
                
                return;
            }
        }
        
        // 3. 기존 데이터 업데이트
        console.log('3️⃣ 기존 데이터를 업데이트합니다...');
        const { data: updateResult, error: updateError } = await supabase
            .from('properties')
            .update({ status: '거래중' })
            .is('status', null);
            
        if (updateError) {
            console.log('⚠️ 업데이트 중 오류:', updateError.message);
        } else {
            console.log('✅ 기존 매물들을 거래중 상태로 업데이트했습니다.');
        }
        
        // 4. 최종 확인
        console.log('4️⃣ 최종 상태를 확인합니다...');
        const { data: finalCheck, error: finalError } = await supabase
            .from('properties')
            .select('status')
            .limit(5);
            
        if (finalError) {
            console.log('⚠️ 최종 확인 중 오류:', finalError.message);
        } else {
            console.log('✅ 샘플 매물들의 상태:', finalCheck?.map(p => p.status));
        }
        
    } catch (error) {
        console.error('❌ 단계별 실행 중 오류:', error.message);
        
        console.log('\n🔧 수동 실행이 필요합니다.');
        console.log('📋 다음 과정을 따라 진행하세요:');
        console.log('1. Supabase 대시보드 (https://supabase.com) 로그인');
        console.log('2. SQL Editor 섹션으로 이동');
        console.log('3. complete_status_migration.sql 파일의 내용을 복사하여 실행');
        console.log('4. 실행 후 check_status_update.js 스크립트로 결과 확인\n');
    }
}

// 스크립트 실행
runMigration()
    .then(() => {
        console.log('\n🎉 마이그레이션 프로세스가 완료되었습니다!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ 마이그레이션 프로세스 실패:', error.message);
        process.exit(1);
    });