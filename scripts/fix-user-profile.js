#!/usr/bin/env node

// ============================================================================
// 사용자 프로필 생성 및 수정 스크립트
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

async function fixUserProfile() {
  try {
    console.log('🔧 사용자 프로필 생성 및 수정 시작...')
    
    // 1. 먼저 테스트 로그인 시도
    console.log('\n1️⃣ 테스트 계정으로 로그인...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'demo@propertydesk.com',
      password: 'demo123456'
    })
    
    if (loginError) {
      console.log('❌ 로그인 실패:', loginError.message)
      return
    }
    
    console.log('✅ 로그인 성공!')
    const user = loginData.user
    console.log('👤 사용자 ID:', user.id)
    console.log('📧 이메일:', user.email)
    
    // 2. 기본 테넌트가 있는지 확인
    console.log('\n2️⃣ 기본 테넌트 확인...')
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
    
    if (tenantsError) {
      console.log('❌ 테넌트 조회 오류:', tenantsError.message)
    } else if (!tenants || tenants.length === 0) {
      console.log('⚠️ 기본 테넌트가 없습니다. 생성합니다...')
      
      const { error: createTenantError } = await supabase
        .from('tenants')
        .insert({
          id: '00000000-0000-0000-0000-000000000001',
          name: '리체 매물장',
          slug: 'richey-demo',
          plan: 'professional',
          status: 'active',
          created_by: user.id
        })
      
      if (createTenantError) {
        console.log('❌ 기본 테넌트 생성 실패:', createTenantError.message)
      } else {
        console.log('✅ 기본 테넌트 생성 성공!')
      }
    } else {
      console.log('✅ 기본 테넌트 존재:', tenants[0].name)
    }
    
    // 3. 사용자 프로필 확인/생성
    console.log('\n3️⃣ 사용자 프로필 확인/생성...')
    const { data: existingProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
      
    if (profileError && profileError.code !== 'PGRST116') {
      console.log('❌ 프로필 조회 오류:', profileError.message)
    } else if (!existingProfile) {
      console.log('⚠️ 사용자 프로필이 없습니다. 생성합니다...')
      
      const { error: createProfileError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          tenant_id: '00000000-0000-0000-0000-000000000001',
          email: user.email,
          full_name: user.user_metadata?.name || '데모 사용자',
          role: 'owner',
          status: 'active'
        })
      
      if (createProfileError) {
        console.log('❌ 프로필 생성 실패:', createProfileError.message)
      } else {
        console.log('✅ 사용자 프로필 생성 성공!')
      }
    } else {
      console.log('✅ 사용자 프로필 존재:', existingProfile.full_name)
    }
    
    // 4. 최종 확인
    console.log('\n4️⃣ 최종 확인...')
    const { data: finalProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
      
    if (finalProfile) {
      console.log('✅ 사용자 프로필 최종 확인:')
      console.log('  - 이름:', finalProfile.full_name)
      console.log('  - 역할:', finalProfile.role)
      console.log('  - 테넌트 ID:', finalProfile.tenant_id)
      console.log('  - 상태:', finalProfile.status)
    }
    
    console.log('\n🎉 사용자 프로필 설정 완료!')
    console.log('이제 로그인을 시도해보세요:')
    console.log('📧 이메일: demo@propertydesk.com')
    console.log('🔐 비밀번호: demo123456')
    
  } catch (error) {
    console.error('💥 오류 발생:', error)
  }
}

fixUserProfile()