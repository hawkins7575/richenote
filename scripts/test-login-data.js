#!/usr/bin/env node

// ============================================================================
// 김선미 로그인 후 데이터 호출 테스트 스크립트
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경변수 로드
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔐 김선미 로그인 및 데이터 호출 테스트 시작...')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLoginAndData() {
  try {
    // 1. 김선미 계정으로 로그인 시도
    console.log('\n1️⃣ 김선미 계정 로그인 테스트...')
    
    // 김선미의 이메일과 패스워드가 필요함 - user_profiles에서 이메일 확인
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', 'e431e972-1e58-4068-b9bb-71bdca89bb17')
      .single()
    
    if (profileError) {
      console.log('❌ 김선미 프로필 조회 실패:', profileError.message)
      return
    }
    
    console.log('👤 김선미 프로필 확인:')
    console.log(`   이름: ${profile.name}`)
    console.log(`   이메일: ${profile.email || '이메일 없음'}`)
    console.log(`   전화: ${profile.phone || '전화 없음'}`)
    console.log(`   역할: ${profile.role}`)
    
    // 이메일이 없으면 로그인 테스트 불가
    if (!profile.email) {
      console.log('⚠️ 이메일 정보가 없어 직접 로그인 테스트는 불가')
      console.log('🔄 대신 해당 사용자 ID로 직접 데이터 조회 테스트...')
      
      // 2. 직접 사용자 데이터 조회 테스트
      await testDirectDataAccess(profile.id)
      return
    }
    
    // 이메일이 있으면 로그인 시도 (패스워드는 알 수 없으므로 실패할 것)
    console.log(`\n🔑 ${profile.email}로 로그인 시도...`)
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: 'test123456' // 임시 패스워드
    })
    
    if (loginError) {
      console.log('❌ 로그인 실패 (예상됨):', loginError.message)
      console.log('🔄 대신 해당 사용자 ID로 직접 데이터 조회 테스트...')
      
      // 2. 직접 사용자 데이터 조회 테스트
      await testDirectDataAccess(profile.id)
    } else {
      console.log('✅ 로그인 성공!')
      console.log('👤 로그인된 사용자:', loginData.user?.email)
      
      // 3. 로그인 후 데이터 조회
      await testAuthenticatedDataAccess(loginData.user.id)
    }

  } catch (error) {
    console.error('💥 오류 발생:', error)
  }
}

async function testDirectDataAccess(userId) {
  console.log(`\n2️⃣ 사용자 ID(${userId})로 직접 데이터 조회 테스트...`)
  
  try {
    // 매물 데이터 조회
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (propError) {
      console.log('❌ 매물 데이터 조회 실패:', propError.message)
      return
    }
    
    console.log(`✅ 매물 데이터 조회 성공: ${properties?.length || 0}개`)
    
    if (properties && properties.length > 0) {
      console.log('\n📋 조회된 매물 목록:')
      properties.forEach((property, index) => {
        console.log(`   ${index + 1}. ${property.title}`)
        console.log(`      유형: ${property.property_type} | 거래: ${property.transaction_type}`)
        console.log(`      상태: ${property.status}`)
        console.log(`      주소: ${property.address}`)
        console.log(`      면적: ${property.area_exclusive}㎡`)
        
        // 가격 정보
        if (property.price) {
          console.log(`      매매가: ${property.price?.toLocaleString()}원`)
        }
        if (property.deposit) {
          console.log(`      보증금: ${property.deposit?.toLocaleString()}원`)
        }
        if (property.monthly_rent) {
          console.log(`      월세: ${property.monthly_rent?.toLocaleString()}원`)
        }
        
        console.log(`      등록일: ${new Date(property.created_at).toLocaleString('ko-KR')}`)
        console.log('      ─────────────────')
      })
      
      console.log('\n✅ 데이터 호출이 정상적으로 작동합니다!')
      
      // 통계 정보
      const statusCount = {}
      const typeCount = {}
      properties.forEach(prop => {
        statusCount[prop.status] = (statusCount[prop.status] || 0) + 1
        typeCount[prop.property_type] = (typeCount[prop.property_type] || 0) + 1
      })
      
      console.log('\n📊 매물 통계:')
      console.log('   상태별:', statusCount)
      console.log('   유형별:', typeCount)
      
    } else {
      console.log('⚠️ 조회된 매물이 없습니다.')
    }
    
    // 테넌트 정보도 확인
    const { data: tenant, error: tenantError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (!tenantError && tenant) {
      console.log('\n🏢 테넌트 정보:')
      console.log(`   이름: ${tenant.name}`)
      console.log(`   회사: ${tenant.company || '없음'}`)
      console.log(`   역할: ${tenant.role}`)
    }
    
  } catch (error) {
    console.error('💥 데이터 조회 중 오류:', error)
  }
}

async function testAuthenticatedDataAccess(userId) {
  console.log(`\n3️⃣ 인증된 사용자(${userId})의 데이터 조회...`)
  
  // 현재 세션 확인
  const { data: session } = await supabase.auth.getSession()
  console.log('📱 현재 세션 상태:', session.session ? '활성' : '없음')
  
  if (session.session) {
    console.log('👤 세션 사용자:', session.session.user.email)
    
    // RLS 정책이 적용된 상태에서 데이터 조회
    await testDirectDataAccess(userId)
  }
}

testLoginAndData()