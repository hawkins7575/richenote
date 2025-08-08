#!/usr/bin/env node

// Supabase 테이블 구조 확인 스크립트
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase URL 또는 Service Key가 설정되지 않았습니다.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableStructure() {
    console.log('🔍 테이블 구조 및 현재 상태를 확인합니다...\n');
    
    try {
        // 1. properties 테이블이 존재하는지 확인
        console.log('📋 1. properties 테이블 존재 확인:');
        const { data: tableExists, error: tableError } = await supabase
            .from('properties')
            .select('id')
            .limit(1);
            
        if (tableError) {
            console.error('❌ properties 테이블 확인 실패:', tableError.message);
            
            // 테이블 목록 확인해보기
            console.log('\n📋 사용 가능한 테이블 목록 확인을 시도합니다...');
            try {
                const { data: tablesData } = await supabase
                    .from('pg_tables')
                    .select('tablename')
                    .eq('schemaname', 'public');
                    
                if (tablesData && tablesData.length > 0) {
                    console.log('사용 가능한 테이블:', tablesData.map(t => t.tablename));
                } else {
                    console.log('테이블 목록을 가져올 수 없습니다.');
                }
            } catch (err) {
                console.log('테이블 목록 조회 실패');
            }
            return;
        } else {
            console.log('✅ properties 테이블이 존재합니다.');
        }
        
        // 2. properties 테이블의 모든 컬럼 확인
        console.log('\n📋 2. properties 테이블의 컬럼 구조 확인:');
        const { data: sampleData, error: sampleError } = await supabase
            .from('properties')
            .select('*')
            .limit(1);
            
        if (sampleError) {
            console.error('❌ 테이블 구조 확인 실패:', sampleError.message);
        } else if (sampleData && sampleData.length > 0) {
            console.log('📊 테이블 컬럼들:', Object.keys(sampleData[0]));
            
            // status 컬럼 특별히 확인
            if ('status' in sampleData[0]) {
                console.log('✅ status 컬럼이 존재합니다!');
                console.log('현재 status 값:', sampleData[0].status);
            } else {
                console.log('❌ status 컬럼이 존재하지 않습니다!');
                console.log('대신 존재하는 컬럼들:', Object.keys(sampleData[0]));
            }
        } else {
            console.log('⚠️ properties 테이블이 존재하지만 데이터가 없습니다.');
        }
        
        // 3. 전체 매물 수 확인
        console.log('\n📊 3. 전체 매물 수:');
        const { count, error: countError } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true });
            
        if (countError) {
            console.error('❌ 매물 수 확인 실패:', countError.message);
        } else {
            console.log(`총 매물 수: ${count}개`);
        }
        
        // 4. 몇 개 샘플 데이터 확인
        if (!sampleError && sampleData && sampleData.length > 0) {
            console.log('\n📋 4. 최근 매물 3개 샘플:');
            const { data: samples, error: samplesError } = await supabase
                .from('properties')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(3);
                
            if (!samplesError && samples) {
                samples.forEach((property, index) => {
                    console.log(`\n--- 매물 ${index + 1} ---`);
                    console.log('ID:', property.id);
                    console.log('제목:', property.title);
                    console.log('모든 컬럼:', Object.keys(property));
                    if ('status' in property) {
                        console.log('상태:', property.status);
                    }
                    if ('transaction_status' in property) {
                        console.log('거래상태:', property.transaction_status);
                    }
                });
            }
        }
        
    } catch (error) {
        console.error('❌ 확인 중 오류 발생:', error.message);
    }
}

// 스크립트 실행
checkTableStructure()
    .then(() => {
        console.log('\n🎉 테이블 구조 확인이 완료되었습니다!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ 스크립트 실행 실패:', error.message);
        process.exit(1);
    });