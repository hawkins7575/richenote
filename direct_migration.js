#!/usr/bin/env node

// PostgreSQL 직접 연결을 통한 마이그레이션
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Supabase PostgreSQL 연결 정보
const client = new Client({
    host: 'aws-0-ap-northeast-2.pooler.supabase.co',
    port: 6543,
    database: 'postgres',
    user: 'postgres.wlrsoyujrmeviczczfsh',
    password: 'qsc1445!',
    ssl: {
        rejectUnauthorized: false
    }
});

async function executeDirectMigration() {
    console.log('🚀 PostgreSQL 직접 연결을 통한 status 컬럼 마이그레이션을 시작합니다...\n');
    
    try {
        // 연결
        await client.connect();
        console.log('✅ Supabase PostgreSQL에 연결되었습니다.\n');
        
        // 1. 현재 상태 확인
        console.log('📋 1. 현재 테이블 상태 확인...');
        const checkResult = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'properties' AND column_name = 'status'
        `);
        
        if (checkResult.rows.length > 0) {
            console.log('✅ status 컬럼이 이미 존재합니다.');
            await verifyMigration(client);
            return;
        }
        
        console.log('❌ status 컬럼이 존재하지 않습니다. 추가합니다.\n');
        
        // 2. 트랜잭션으로 마이그레이션 실행
        console.log('📋 2. 트랜잭션으로 마이그레이션 실행...');
        await client.query('BEGIN');
        
        try {
            // Step 1: status 컬럼 추가
            console.log('단계 1: status 컬럼 추가...');
            await client.query(`
                ALTER TABLE properties 
                ADD COLUMN status TEXT DEFAULT '거래중' NOT NULL
            `);
            console.log('✅ status 컬럼이 추가되었습니다.');
            
            // Step 2: 체크 제약조건 추가
            console.log('단계 2: 체크 제약조건 추가...');
            await client.query(`
                ALTER TABLE properties 
                ADD CONSTRAINT properties_status_check 
                CHECK (status IN ('거래중', '거래완료'))
            `);
            console.log('✅ 체크 제약조건이 추가되었습니다.');
            
            // Step 3: 기존 데이터 업데이트
            console.log('단계 3: 기존 데이터 업데이트...');
            const updateResult = await client.query(`
                UPDATE properties 
                SET status = '거래중' 
                WHERE status IS NULL OR status = ''
            `);
            console.log(`✅ ${updateResult.rowCount}개 레코드가 업데이트되었습니다.`);
            
            // 커밋
            await client.query('COMMIT');
            console.log('✅ 트랜잭션이 커밋되었습니다.\n');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        
        // 3. 검증
        console.log('📋 3. 마이그레이션 결과 검증...');
        await verifyMigration(client);
        
    } catch (error) {
        console.error('❌ 마이그레이션 실행 중 오류:', error.message);
    } finally {
        await client.end();
        console.log('📋 데이터베이스 연결이 종료되었습니다.');
    }
}

async function verifyMigration(client) {
    try {
        // 컬럼 정보 확인
        console.log('\n🔍 status 컬럼 정보:');
        const columnInfo = await client.query(`
            SELECT 
                column_name, 
                data_type, 
                is_nullable, 
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'properties' AND column_name = 'status'
        `);
        
        if (columnInfo.rows.length > 0) {
            console.table(columnInfo.rows);
        } else {
            console.log('❌ status 컬럼이 존재하지 않습니다.');
        }
        
        // 제약조건 확인
        console.log('\n🔍 제약조건 정보:');
        const constraintInfo = await client.query(`
            SELECT 
                conname as constraint_name,
                pg_get_constraintdef(c.oid) as constraint_definition
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            WHERE t.relname = 'properties' 
              AND c.contype = 'c'
              AND pg_get_constraintdef(c.oid) LIKE '%status%'
        `);
        
        if (constraintInfo.rows.length > 0) {
            console.table(constraintInfo.rows);
        } else {
            console.log('❌ status 관련 제약조건이 존재하지 않습니다.');
        }
        
        // 상태별 분포 확인
        console.log('\n🔍 매물별 상태 분포:');
        const statusDistribution = await client.query(`
            SELECT 
                status, 
                COUNT(*) as count
            FROM properties 
            GROUP BY status 
            ORDER BY status
        `);
        
        if (statusDistribution.rows.length > 0) {
            console.table(statusDistribution.rows);
        } else {
            console.log('❌ 매물 데이터가 없습니다.');
        }
        
        // 전체 매물 수 확인
        const totalCount = await client.query('SELECT COUNT(*) as total FROM properties');
        console.log(`\n📊 총 매물 수: ${totalCount.rows[0].total}개`);
        
    } catch (error) {
        console.error('검증 중 오류:', error.message);
    }
}

// 실행
executeDirectMigration()
    .then(() => {
        console.log('\n🎉 마이그레이션이 완료되었습니다!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ 마이그레이션 실패:', error.message);
        process.exit(1);
    });