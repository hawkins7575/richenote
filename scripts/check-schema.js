#!/usr/bin/env node

// ============================================================================
// 데이터베이스 스키마 확인 스크립트
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경변수 로드
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  try {
    console.log('🔍 Properties 테이블 스키마 확인 중...')
    
    // 기존 데이터 하나를 조회해서 실제 구조 확인
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ 데이터 조회 실패:', error)
      return
    }
    
    if (data && data.length > 0) {
      console.log('✅ 실제 테이블 구조:')
      console.log('컬럼명들:', Object.keys(data[0]))
      console.log('\n📊 샘플 데이터:')
      console.log(JSON.stringify(data[0], null, 2))
    } else {
      console.log('⚠️ 테이블에 데이터가 없습니다.')
    }
    
  } catch (error) {
    console.error('💥 오류 발생:', error)
  }
}

checkSchema()