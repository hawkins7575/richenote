// ============================================================================
// 테스트 매물 데이터 Supabase 직접 삽입 스크립트
// ============================================================================

import { createClient } from '@supabase/supabase-js'

// Supabase 클라이언트 설정
const supabaseUrl = 'https://huyxfygwwwlhzrgnvhqw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1eXhmeWd3d3dsaHpyZ252aHF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMjYwNDc0NCwiZXhwIjoyMDM4MTgwNzQ0fQ.qCk7VDabiR-NzlPBJv7_g3W0zVULn6hGHBOYMzJPrNM' // Service role key 필요

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 테스트 매물 데이터
const testProperties = [
  {
    tenant_id: '00000000-0000-0000-0000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: '강남역 신축 오피스텔',
    address: '서울시 강남구 강남대로 123',
    property_type: '오피스텔',
    transaction_type: '월세',
    price: null,
    deposit: 2000,
    monthly_rent: 120,
    floor_current: 15,
    floor_total: 20,
    area_exclusive: 33.0,
    rooms: 1,
    bathrooms: 1,
    description: '강남역 도보 3분 거리의 신축 오피스텔입니다. 깨끗하고 편리한 시설을 갖추고 있습니다.',
    images: ['https://via.placeholder.com/400x300?text=강남역+오피스텔'],
    is_active: true,
    featured: true,
    view_count: 0
  },
  {
    tenant_id: '00000000-0000-0000-0000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: '홍대입구 투룸 원룸',
    address: '서울시 마포구 와우산로 45',
    property_type: '원룸',
    transaction_type: '전세',
    price: null,
    deposit: 15000,
    monthly_rent: null,
    floor_current: 3,
    floor_total: 5,
    area_exclusive: 42.0,
    rooms: 2,
    bathrooms: 1,
    description: '홍대입구역 근처 조용한 주택가의 투룸 원룸입니다. 대학생이나 직장인에게 적합합니다.',
    images: ['https://via.placeholder.com/400x300?text=홍대+투룸'],
    is_active: true,
    featured: false,
    view_count: 0
  },
  {
    tenant_id: '00000000-0000-0000-0000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: '잠실 리체타워 아파트',
    address: '서울시 송파구 잠실로 789',
    property_type: '아파트',
    transaction_type: '매매',
    price: 65000,
    deposit: null,
    monthly_rent: null,
    floor_current: 12,
    floor_total: 25,
    area_exclusive: 84.0,
    rooms: 3,
    bathrooms: 2,
    description: '잠실 롯데타워 인근의 고급 아파트입니다. 한강뷰와 우수한 교통편을 자랑합니다.',
    images: ['https://via.placeholder.com/400x300?text=잠실+아파트'],
    is_active: true,
    featured: true,
    view_count: 0
  }
]

async function insertTestProperties() {
  console.log('🏠 테스트 매물 데이터 삽입 시작...')
  
  try {
    // 기존 테스트 데이터 삭제 (중복 방지)
    console.log('📋 기존 테스트 데이터 확인 중...')
    const { data: existingData } = await supabase
      .from('properties')
      .select('id, title')
      .eq('tenant_id', '00000000-0000-0000-0000-000000000001')
    
    if (existingData && existingData.length > 0) {
      console.log(`⚠️ 기존 데이터 ${existingData.length}건 발견 - 삭제 후 진행`)
      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('tenant_id', '00000000-0000-0000-0000-000000000001')
      
      if (deleteError) {
        console.error('❌ 기존 데이터 삭제 실패:', deleteError)
      } else {
        console.log('✅ 기존 데이터 삭제 완료')
      }
    }
    
    // 새 테스트 데이터 삽입
    console.log('💾 새 테스트 매물 데이터 삽입 중...')
    const { data, error } = await supabase
      .from('properties')
      .insert(testProperties)
      .select('id, title, transaction_type, property_type')
    
    if (error) {
      console.error('❌ 테스트 데이터 삽입 실패:', error)
      throw error
    }
    
    console.log('✅ 테스트 매물 데이터 삽입 성공!')
    console.log('📊 삽입된 데이터:')
    data.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title} (${item.property_type}, ${item.transaction_type})`)
    })
    
    // 삽입 결과 검증
    console.log('\n🔍 삽입 결과 검증 중...')
    const { data: verifyData, error: verifyError } = await supabase
      .from('properties')
      .select('count')
      .eq('tenant_id', '00000000-0000-0000-0000-000000000001')
      .eq('is_active', true)
    
    if (verifyError) {
      console.error('❌ 검증 쿼리 실패:', verifyError)
    } else {
      const count = verifyData?.[0]?.count || 0
      console.log(`✅ 최종 확인: 활성 매물 ${count}건`)
    }
    
  } catch (error) {
    console.error('💥 스크립트 실행 실패:', error)
    process.exit(1)
  }
}

// 스크립트 실행
insertTestProperties()
  .then(() => {
    console.log('\n🎉 테스트 데이터 삽입 완료!')
    console.log('💡 이제 애플리케이션에서 매물 데이터를 확인할 수 있습니다.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 최종 에러:', error)
    process.exit(1)
  })