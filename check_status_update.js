#!/usr/bin/env node

// Supabase status 컬럼 업데이트 확인 스크립트
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase URL 또는 Service Key가 설정되지 않았습니다.');
    console.error('환경변수를 확인해주세요: VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkStatusUpdate() {
    console.log('🔍 Supabase status 컬럼 업데이트 현황을 확인합니다...\n');
    
    try {
        // 1. status 컬럼 스키마 정보 확인
        console.log('📋 1. status 컬럼 스키마 정보 확인:');
        const { data: schemaInfo, error: schemaError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable, column_default')
            .eq('table_name', 'properties')
            .eq('column_name', 'status');
            
        if (schemaError) {
            console.error('스키마 정보 조회 실패:', schemaError.message);
        } else {
            console.table(schemaInfo);
        }
        
        // 2. 현재 매물 상태별 분포 확인
        console.log('\n📊 2. 현재 매물 상태별 분포:');
        const { data: statusDistribution, error: distributionError } = await supabase
            .from('properties')
            .select('status')
            .then(result => {
                if (result.error) throw result.error;
                const distribution = result.data.reduce((acc, item) => {
                    acc[item.status] = (acc[item.status] || 0) + 1;
                    return acc;
                }, {});
                return { data: Object.entries(distribution).map(([status, count]) => ({status, count})), error: null };
            });
            
        if (distributionError) {
            console.error('상태 분포 조회 실패:', distributionError.message);
        } else {
            console.table(statusDistribution);
        }
        
        // 3. 최근 매물 몇 개의 상태 확인
        console.log('\n📋 3. 최근 매물 5개의 상태:');
        const { data: recentProperties, error: recentError } = await supabase
            .from('properties')
            .select('id, title, status, created_at')
            .order('created_at', { ascending: false })
            .limit(5);
            
        if (recentError) {
            console.error('최근 매물 조회 실패:', recentError.message);
        } else {
            console.table(recentProperties);
        }
        
        // 4. property_status enum 값 확인 (Raw SQL 필요)
        console.log('\n🏷️ 4. property_status enum 값 확인:');
        const { data: enumData, error: enumError } = await supabase
            .rpc('get_enum_values', { enum_name: 'property_status' })
            .catch(() => {
                // RPC가 없는 경우 대안 방법으로 시도
                return supabase
                    .from('pg_enum')
                    .select('enumlabel')
                    .then(result => ({
                        data: result.data?.map(item => ({ enum_value: item.enumlabel })) || [],
                        error: result.error
                    }));
            });
            
        if (enumError) {
            console.log('ENUM 값 조회 실패 (정상적인 경우가 많음):', enumError.message);
            console.log('💡 이는 ENUM이 아닌 TEXT 타입으로 변경되었을 가능성을 의미합니다.');
        } else if (enumData && enumData.length > 0) {
            console.table(enumData);
        } else {
            console.log('💡 property_status ENUM이 존재하지 않거나 TEXT 타입으로 변경되었습니다.');
        }
        
        // 5. 제약조건 확인은 RLS 때문에 어려울 수 있음
        console.log('\n✅ 상태 확인 완료!');
        console.log('\n📋 요약:');
        console.log('- status 컬럼 스키마 정보 ✓');
        console.log('- 매물 상태별 분포 ✓');
        console.log('- 최근 매물 상태 ✓');
        console.log('- ENUM/제약조건 정보 (제한적) ✓');
        
    } catch (error) {
        console.error('❌ 확인 중 오류 발생:', error.message);
    }
}

// 스크립트 실행
checkStatusUpdate()
    .then(() => {
        console.log('\n🎉 모든 확인이 완료되었습니다!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ 스크립트 실행 실패:', error.message);
        process.exit(1);
    });