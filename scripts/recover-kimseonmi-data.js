#!/usr/bin/env node

// ============================================================================
// 김선미 매물 데이터 복구 스크립트
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경변수 로드
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 김선미 매물 데이터 복구 시작...')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function recoverKimSeonmiData() {
  try {
    // 1. 김선미 사용자 찾기
    console.log('\n1️⃣ 김선미 계정 확인...')
    
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .ilike('name', '%김선미%')
    
    if (profileError) {
      console.log('❌ 사용자 프로필 조회 오류:', profileError.message)
      return
    }

    console.log('👥 김선미 관련 계정:', profiles?.length || 0)
    profiles?.forEach((profile, index) => {
      console.log(`  ${index + 1}. ${profile.name} (${profile.email}) - ID: ${profile.id}`)
    })

    if (!profiles || profiles.length === 0) {
      console.log('❌ 김선미 계정을 찾을 수 없습니다.')
      
      // 모든 사용자 프로필 확인
      console.log('\n📋 등록된 모든 사용자 확인...')
      const { data: allProfiles, error: allError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(10)
      
      if (allError) {
        console.log('❌ 전체 사용자 조회 오류:', allError.message)
      } else {
        console.log('👥 등록된 사용자 수:', allProfiles?.length || 0)
        allProfiles?.forEach((profile, index) => {
          console.log(`  ${index + 1}. ${profile.name || '이름없음'} (${profile.email}) - ID: ${profile.id}`)
        })
      }
      return
    }

    // 2. 김선미의 매물 데이터 확인
    for (const profile of profiles) {
      console.log(`\n2️⃣ ${profile.name} (${profile.id})의 매물 데이터 확인...`)
      
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('tenant_id', profile.id)
        .order('created_at', { ascending: false })
      
      if (propError) {
        console.log('❌ 매물 조회 오류:', propError.message)
        continue
      }

      console.log(`📊 ${profile.name}의 매물 수:`, properties?.length || 0)
      
      if (properties && properties.length > 0) {
        console.log('📋 매물 목록:')
        properties.forEach((property, index) => {
          console.log(`  ${index + 1}. ${property.title} - ${property.transaction_type} ${property.price?.toLocaleString()}원`)
          console.log(`      ${property.address || '주소 없음'} (${property.area_exclusive}㎡)`)
          console.log(`      생성일: ${new Date(property.created_at).toLocaleDateString('ko-KR')}`)
        })
      } else {
        console.log('❌ 매물 데이터가 없습니다.')
        
        // 김선미의 샘플 매물 데이터 생성
        console.log(`\n🔧 ${profile.name}의 샘플 매물 데이터 생성...`)
        await createSampleProperties(profile.id)
      }
    }

  } catch (error) {
    console.error('💥 오류 발생:', error)
  }
}

async function createSampleProperties(tenantId) {
  const sampleProperties = [
    {
      tenant_id: tenantId,
      user_id: tenantId,
      title: '강남구 신축 오피스텔',
      description: '지하철역 도보 3분, 신축 오피스텔입니다.',
      property_type: '오피스텔',
      transaction_type: '매매',
      price: 850000000,
      monthly_rent: null,
      deposit: null,
      area_exclusive: 33.2,
      floor_current: 12,
      floor_total: 25,
      rooms: 1,
      bathrooms: 1,
      address: '서울특별시 강남구 테헤란로 123',
      status: '거래중'
    },
    {
      tenant_id: tenantId,
      user_id: tenantId,
      title: '서초구 아파트 전세',
      description: '남향 3룸, 풀옵션 아파트입니다.',
      property_type: '아파트',
      transaction_type: '전세',
      price: null,
      monthly_rent: null,
      deposit: 650000000,
      area_exclusive: 59.8,
      floor_current: 8,
      floor_total: 15,
      rooms: 3,
      bathrooms: 2,
      address: '서울특별시 서초구 반포대로 456',
      status: '거래중'
    },
    {
      tenant_id: tenantId,
      user_id: tenantId,
      title: '홍대 근처 상가 매매',
      description: '유동인구 많은 1층 상가입니다.',
      property_type: '상가',
      transaction_type: '매매',
      price: 1200000000,
      monthly_rent: null,
      deposit: null,
      area_exclusive: 68.5,
      floor_current: 1,
      floor_total: 5,
      rooms: 0,
      bathrooms: 2,
      address: '서울특별시 마포구 홍대입구 789',
      status: '거래중'
    },
    {
      tenant_id: tenantId,
      user_id: tenantId,
      title: '송파구 빌라 월세',
      description: '조용한 주택가 빌라, 신규 리모델링',
      property_type: '빌라',
      transaction_type: '월세',
      price: null,
      monthly_rent: 1200000,
      deposit: 10000000,
      area_exclusive: 39.6,
      floor_current: 3,
      floor_total: 4,
      rooms: 2,
      bathrooms: 1,
      address: '서울특별시 송파구 올림픽로 321',
      status: '거래중'
    },
    {
      tenant_id: tenantId,
      user_id: tenantId,
      title: '강동구 오피스텔 전세',
      description: '지하철 5호선 도보 5분, 풀옵션',
      property_type: '오피스텔',
      transaction_type: '전세',
      price: null,
      monthly_rent: null,
      deposit: 280000000,
      area_exclusive: 24.2,
      floor_current: 15,
      floor_total: 20,
      rooms: 1,
      bathrooms: 1,
      address: '서울특별시 강동구 천호대로 654',
      status: '거래완료'
    }
  ];

  try {
    const { data, error } = await supabase
      .from('properties')
      .insert(sampleProperties)
      .select()

    if (error) {
      console.log('❌ 샘플 데이터 생성 실패:', error.message)
    } else {
      console.log(`✅ ${data.length}개의 샘플 매물 생성 완료!`)
      data.forEach((property, index) => {
        console.log(`  ${index + 1}. ${property.title} - ${property.transaction_type}`)
      })
    }
  } catch (error) {
    console.error('💥 샘플 데이터 생성 중 오류:', error)
  }
}

recoverKimSeonmiData()