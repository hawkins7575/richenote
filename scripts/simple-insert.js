#!/usr/bin/env node

// ============================================================================
// 간단한 샘플 데이터 삽입 스크립트
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

// 실제 데이터베이스 구조에 맞는 간단한 샘플 데이터
const sampleProperties = [
  {
    tenant_id: '00000000-0000-0000-0000-000000000001',
    user_id: null,
    title: '강남구 신사동 럭셔리 아파트',
    address: '서울시 강남구 역삼동 123-10',
    property_type: '아파트',
    transaction_type: '매매',
    price: 350000,
    deposit: null,
    monthly_rent: null,
    floor_current: 15,
    floor_total: 25,
    area_exclusive: 85,
    rooms: 3,
    bathrooms: 2,
    description: '역세권 신축 럭셔리 아파트입니다.'
  },
  {
    tenant_id: '00000000-0000-0000-0000-000000000001',
    user_id: null,
    title: '분당구 정자동 전세 아파트',
    address: '경기도 성남시 분당구 정자동 456-78',
    property_type: '아파트',
    transaction_type: '전세',
    price: null,
    deposit: 210000,
    monthly_rent: null,
    floor_current: 8,
    floor_total: 20,
    area_exclusive: 60,
    rooms: 2,
    bathrooms: 1,
    description: '분당 정자동 카페거리 근처, 교통 편리.'
  },
  {
    tenant_id: '00000000-0000-0000-0000-000000000001',
    user_id: null,
    title: '홍대 신축 오피스텔',
    address: '서울시 마포구 상수동 789-12',
    property_type: '오피스텔',
    transaction_type: '월세',
    price: null,
    deposit: 10000,
    monthly_rent: 65,
    floor_current: 5,
    floor_total: 15,
    area_exclusive: 25,
    rooms: 1,
    bathrooms: 1,
    description: '홍대입구역 5분 거리, 신축 오피스텔.'
  }
]

async function insertSampleData() {
  try {
    console.log('🏠 간단한 샘플 데이터 삽입 시작...')
    
    const { data, error } = await supabase
      .from('properties')
      .insert(sampleProperties)
      .select('id, title, property_type, transaction_type')
    
    if (error) {
      console.error('❌ 데이터 삽입 실패:', error)
      return
    }
    
    console.log('✅ 샘플 데이터 삽입 성공!')
    console.log(`📊 삽입된 데이터 개수: ${data?.length || 0}개`)
    data?.forEach((property, index) => {
      console.log(`  ${index + 1}. ${property.title} (${property.property_type}, ${property.transaction_type})`)
    })
    
  } catch (error) {
    console.error('💥 오류 발생:', error)
  }
}

insertSampleData()