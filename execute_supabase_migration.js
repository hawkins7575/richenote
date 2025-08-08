#!/usr/bin/env node

// Supabase에서 직접 SQL 실행을 위한 스크립트
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function executeDirectMigration() {
    console.log('🚀 Supabase status 컬럼 마이그레이션을 실행합니다...\n');
    
    try {
        // 1. 현재 상태 확인
        console.log('📋 1. 현재 테이블 상태 확인...');
        const { data: currentData, error: currentError } = await supabase
            .from('properties')
            .select('*')
            .limit(1);
            
        if (currentError) {
            console.error('현재 상태 확인 실패:', currentError.message);
            return;
        }
        
        const hasStatus = currentData && currentData.length > 0 && 'status' in currentData[0];
        console.log(hasStatus ? '✅ status 컬럼 이미 존재' : '❌ status 컬럼 없음 - 추가 필요');
        
        if (hasStatus) {
            console.log('⚠️ status 컬럼이 이미 존재합니다. 검증을 진행합니다.');
            await verifyMigration();
            return;
        }
        
        // 2. RPC를 통한 SQL 실행 시도
        console.log('\n📋 2. SQL 마이그레이션 실행 시도...');
        
        // 복합 SQL을 단계별로 실행해야 함
        const migrations = [
            // Step 1: 컬럼 추가
            "ALTER TABLE properties ADD COLUMN status TEXT DEFAULT '거래중' NOT NULL",
            
            // Step 2: 제약조건 추가  
            "ALTER TABLE properties ADD CONSTRAINT properties_status_check CHECK (status IN ('거래중', '거래완료'))",
            
            // Step 3: 기존 데이터 업데이트
            "UPDATE properties SET status = '거래중' WHERE status IS NULL OR status = ''"
        ];
        
        // SQL을 하나씩 실행 (RPC 사용)
        for (let i = 0; i < migrations.length; i++) {
            console.log(`단계 ${i + 1}: ${migrations[i].substring(0, 50)}...`);
            
            try {
                const { data, error } = await supabase.rpc('exec_sql', { 
                    sql_query: migrations[i] 
                });
                
                if (error) {
                    console.log(`RPC 실행 실패: ${error.message}`);
                    console.log('SQL Editor를 통한 수동 실행이 필요합니다.');
                    break;
                } else {
                    console.log(`✅ 단계 ${i + 1} 완료`);
                }
            } catch (err) {
                console.log(`RPC 함수가 없거나 권한 부족: ${err.message}`);
                console.log('SQL Editor를 통한 수동 실행이 필요합니다.');
                break;
            }
        }
        
        // 3. 결과 확인
        console.log('\n📋 3. 마이그레이션 결과 확인...');
        await verifyMigration();
        
    } catch (error) {
        console.error('❌ 마이그레이션 실행 중 오류:', error.message);
        
        // 수동 실행 가이드 제공
        console.log('\n=== 수동 실행이 필요합니다 ===');
        console.log('Supabase Dashboard > SQL Editor에서 다음 SQL을 실행하세요:\n');
        
        const manualSql = `-- Properties 테이블 status 컬럼 추가
ALTER TABLE properties ADD COLUMN status TEXT DEFAULT '거래중' NOT NULL;

-- 체크 제약조건 추가
ALTER TABLE properties ADD CONSTRAINT properties_status_check 
    CHECK (status IN ('거래중', '거래완료'));

-- 기존 데이터 업데이트
UPDATE properties SET status = '거래중' WHERE status IS NULL OR status = '';`;
        
        console.log(manualSql);
        console.log('\n실행 후 이 스크립트를 다시 실행하여 확인하세요.');
    }
}

async function verifyMigration() {
    console.log('\n🔍 마이그레이션 검증 중...');
    
    try {
        // 테이블 구조 확인
        const { data: testData, error: testError } = await supabase
            .from('properties')
            .select('*')
            .limit(1);
            
        if (testError) {
            console.error('검증 실패:', testError.message);
            return;
        }
        
        if (testData && testData.length > 0) {
            const columns = Object.keys(testData[0]);
            const hasStatus = columns.includes('status');
            
            console.log('✅ 테이블 컬럼:', columns.join(', '));
            console.log(hasStatus ? '✅ status 컬럼 존재함' : '❌ status 컬럼 없음');
            
            if (hasStatus) {
                console.log('📊 첫 번째 레코드의 status 값:', testData[0].status);
            }
        }
        
        // 전체 상태 분포 확인
        const { data: allProperties, error: allError } = await supabase
            .from('properties')
            .select('status');
            
        if (!allError && allProperties) {
            const statusCounts = allProperties.reduce((acc, prop) => {
                const status = prop.status || 'NULL';
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});
            
            console.log('📊 상태별 분포:', statusCounts);
        }
        
    } catch (error) {
        console.error('검증 중 오류:', error.message);
    }
}

// 실행
executeDirectMigration()
    .then(() => {
        console.log('\n🎉 마이그레이션 프로세스 완료!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ 프로세스 실행 실패:', error.message);
        process.exit(1);
    });