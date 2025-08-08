// ============================================================================
// Properties 테이블 status 컬럼 업데이트 스크립트
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경변수 로드
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY 또는 VITE_SUPABASE_ANON_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

// Supabase 클라이언트 생성 (서비스 키 사용)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeSQL(query, description) {
  console.log(`\n🔄 ${description}...`)
  console.log(`SQL: ${query}`)
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { query })
    
    if (error) {
      console.error(`❌ 오류 발생:`, error)
      return false
    }
    
    console.log(`✅ 성공:`, data)
    return true
  } catch (err) {
    console.error(`❌ 예외 발생:`, err)
    return false
  }
}

async function main() {
  console.log('🚀 Properties 테이블 status 컬럼 업데이트를 시작합니다...\n')
  
  // 1. property_status ENUM에 '거래중' 값 추가
  await executeSQL(
    "ALTER TYPE property_status ADD VALUE IF NOT EXISTS '거래중';",
    "property_status ENUM에 '거래중' 값 추가"
  )
  
  // 2. 기본값을 '거래중'으로 변경
  await executeSQL(
    "ALTER TABLE properties ALTER COLUMN status SET DEFAULT '거래중';",
    "status 컬럼 기본값을 '거래중'으로 변경"
  )
  
  // 3. 기존 '판매중' 상태를 '거래중'으로 업데이트 (선택사항)
  const updateResult = await executeSQL(
    "UPDATE properties SET status = '거래중' WHERE status = '판매중';",
    "기존 '판매중' 상태를 '거래중'으로 업데이트"
  )
  
  // 4. 변경사항 확인
  await executeSQL(
    `SELECT 
      column_name, 
      data_type, 
      is_nullable, 
      column_default
    FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'status';`,
    "status 컬럼 정보 확인"
  )
  
  // 5. ENUM 값들 확인
  await executeSQL(
    `SELECT enumlabel 
    FROM pg_enum 
    WHERE enumtypid = (
      SELECT oid 
      FROM pg_type 
      WHERE typname = 'property_status'
    )
    ORDER BY enumsortorder;`,
    "property_status ENUM 값들 확인"
  )
  
  // 6. 매물별 상태 분포 확인
  await executeSQL(
    "SELECT status, COUNT(*) as count FROM properties GROUP BY status;",
    "매물별 상태 분포 확인"
  )
  
  console.log('\n🎉 스크립트 실행이 완료되었습니다!')
}

// 스크립트 실행
main().catch(console.error)