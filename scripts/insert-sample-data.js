#!/usr/bin/env node

// ============================================================================
// Supabase에 샘플 데이터를 직접 삽입하는 Node.js 스크립트
// 사용법: node scripts/insert-sample-data.js
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경변수 로드
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🏠 리체 매물장 - Supabase 샘플 데이터 삽입 시작')
console.log('📍 Supabase URL:', supabaseUrl)
console.log('🔑 API Key:', supabaseKey ? '✅ 설정됨' : '❌ 없음')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.')
  console.error('VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 .env 파일에 설정해주세요.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// 샘플 매물 데이터
const sampleProperties = [
  {
    tenant_id: '00000000-0000-0000-0000-000000000001',
    user_id: null,
    title: '강남구 신사동 럭셔리 아파트',
    property_type: '아파트',
    transaction_type: '매매',
    price: 350000,
    deposit: null,
    monthly_rent: null,
    maintenance_fee: 15,
    address: '서울시 강남구 역삼동 123-10',
    detailed_address: '123동 456호',
    district: '강남구',
    neighborhood: '신사동',
    latitude: 37.5219,
    longitude: 127.0274,
    area_exclusive: 85,
    floor_current: 15,
    floor_total: 25,
    rooms: 3,
    bathrooms: 2,
    parking: true,
    parking_spaces: 1,
    elevator: true,
    landlord_name: '김임대',
    landlord_phone: '010-1234-5678',
    landlord_email: 'landlord1@example.com',
    exit_date: '2025-08-31',
    available_from: '2025-09-01',
    images: [
      {
        id: 'img-1',
        url: 'https://via.placeholder.com/400x300?text=Property+1',
        order: 1,
        is_primary: true
      },
      {
        id: 'img-2',
        url: 'https://via.placeholder.com/400x300?text=Property+1-2',
        order: 2,
        is_primary: false
      }
    ],
    description: '역세권 신축 럭셔리 아파트입니다. 남향, 고층, 풀옵션.',
    private_notes: '우수 매물, 추천',
    highlight_features: ['역세권', '신축', '럭셔리', '남향'],
    tags: ['추천매물', '급매'],
    view_count: 45,
    inquiry_count: 12,
    is_featured: true,
    is_urgent: false,
    is_favorite: false,
    status: '판매중',
  },
  {
    tenant_id: '00000000-0000-0000-0000-000000000001',
    user_id: null,
    title: '경기도 성남시 분당구 정자동',
    property_type: '아파트',
    transaction_type: '전세',
    price: null,
    deposit: 210000,
    monthly_rent: null,
    maintenance_fee: 8,
    address: '경기도 성남시 분당구 정자동 456-78',
    detailed_address: '456동 789호',
    district: '분당구',
    neighborhood: '정자동',
    area_exclusive: 60,
    floor_current: 8,
    floor_total: 20,
    rooms: 2,
    bathrooms: 1,
    parking: true,
    parking_spaces: 1,
    elevator: true,
    landlord_name: '박소유',
    landlord_phone: '010-9876-5432',
    description: '분당 정자동 카페거리 근처, 교통 편리.',
    highlight_features: ['분당', '정자동', '교통편리'],
    tags: [],
    view_count: 32,
    inquiry_count: 8,
    is_featured: false,
    is_urgent: false,
    is_favorite: false,
    status: '예약중',
    is_active: true,
    images: []
  },
  {
    tenant_id: '00000000-0000-0000-0000-000000000001',
    user_id: null,
    title: '홍대 신축 오피스텔',
    property_type: '오피스텔',
    transaction_type: '월세',
    price: null,
    deposit: 10000,
    monthly_rent: 65,
    maintenance_fee: 5,
    address: '서울시 마포구 상수동 789-12',
    detailed_address: '789동 101호',
    district: '마포구',
    neighborhood: '상수동',
    area_exclusive: 25,
    floor_current: 5,
    floor_total: 15,
    rooms: 1,
    bathrooms: 1,
    parking: false,
    elevator: true,
    landlord_name: '이주인',
    landlord_phone: '010-5555-6666',
    description: '홍대입구역 5분 거리, 신축 오피스텔.',
    highlight_features: ['홍대', '신축', '역세권'],
    tags: ['원룸', '신축'],
    view_count: 67,
    inquiry_count: 15,
    is_featured: false,
    is_urgent: true,
    is_favorite: true,
    status: '판매중',
    is_active: true,
    images: []
  },
  {
    tenant_id: '00000000-0000-0000-0000-000000000001',
    user_id: null,
    title: '잠실 리버뷰 아파트',
    property_type: '아파트',
    transaction_type: '매매',
    price: 280000,
    deposit: null,
    monthly_rent: null,
    maintenance_fee: 12,
    address: '서울시 송파구 잠실동 567-89',
    detailed_address: '567동 1203호',
    district: '송파구',
    neighborhood: '잠실동',
    area_exclusive: 75,
    floor_current: 12,
    floor_total: 20,
    rooms: 3,
    bathrooms: 2,
    parking: true,
    parking_spaces: 1,
    elevator: true,
    landlord_name: '최부동산',
    landlord_phone: '010-7777-8888',
    description: '한강뷰가 보이는 잠실 신축 아파트입니다.',
    highlight_features: ['한강뷰', '잠실', '신축'],
    tags: ['추천매물'],
    view_count: 78,
    inquiry_count: 22,
    is_featured: true,
    is_urgent: false,
    is_favorite: false,
    status: '판매중',
    is_active: true,
    images: []
  },
  {
    tenant_id: '00000000-0000-0000-0000-000000000001',
    user_id: null,
    title: '이태원 빌라 투룸',
    property_type: '빌라',
    transaction_type: '월세',
    price: null,
    deposit: 5000,
    monthly_rent: 80,
    maintenance_fee: 3,
    address: '서울시 용산구 이태원동 234-56',
    detailed_address: '3층',
    district: '용산구',
    neighborhood: '이태원동',
    area_exclusive: 45,
    floor_current: 3,
    floor_total: 4,
    rooms: 2,
    bathrooms: 1,
    parking: false,
    elevator: false,
    landlord_name: '김빌라',
    landlord_phone: '010-9999-0000',
    description: '이태원 중심가 투룸 빌라입니다.',
    highlight_features: ['이태원', '투룸'],
    tags: ['빌라'],
    view_count: 34,
    inquiry_count: 7,
    is_featured: false,
    is_urgent: false,
    is_favorite: false,
    status: '거래완료',
    images: []
  }
]

async function insertSampleData() {
  try {
    console.log('\n📊 기존 데이터 확인 중...')
    
    // 기존 데이터 확인
    const { data: existingData, error: selectError } = await supabase
      .from('properties')
      .select('id, title')
      .limit(5)
    
    if (selectError) {
      console.error('❌ 기존 데이터 조회 실패:', selectError)
      return
    }
    
    console.log(`📈 기존 데이터 개수: ${existingData?.length || 0}개`)
    
    if (existingData && existingData.length > 0) {
      console.log('⚠️ 기존 데이터가 있습니다.')
      console.log('기존 매물:', existingData.map(d => `- ${d.title}`).join('\n'))
      
      const readline = await import('readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      
      const answer = await new Promise(resolve => {
        rl.question('\n계속 진행하시겠습니까? (y/N): ', resolve)
      })
      rl.close()
      
      if (answer.toLowerCase() !== 'y') {
        console.log('👋 작업을 취소했습니다.')
        return
      }
    }
    
    console.log('\n💾 샘플 매물 데이터 삽입 중...')
    
    // 샘플 데이터 삽입
    const { data, error } = await supabase
      .from('properties')
      .insert(sampleProperties)
      .select('id, title, property_type, transaction_type')
    
    if (error) {
      console.error('❌ 샘플 데이터 삽입 실패:', error)
      return
    }
    
    console.log('\n✅ 샘플 데이터 삽입 성공!')
    console.log(`📊 삽입된 데이터 개수: ${data?.length || 0}개`)
    console.log('\n📋 삽입된 매물 목록:')
    data?.forEach((property, index) => {
      console.log(`  ${index + 1}. ${property.title} (${property.property_type}, ${property.transaction_type})`)
    })
    
    console.log('\n🎉 모든 작업이 완료되었습니다!')
    console.log('💡 이제 브라우저에서 http://localhost:3001 으로 접속하여 확인해보세요.')
    
  } catch (error) {
    console.error('\n💥 작업 중 오류 발생:', error)
  }
}

// 스크립트 실행
insertSampleData()