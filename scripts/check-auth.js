#!/usr/bin/env node

// ============================================================================
// 인증 및 사용자 데이터 확인 스크립트
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경변수 로드
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 인증 설정 확인 시작...')
console.log('📍 Supabase URL:', supabaseUrl)
console.log('🔑 Anon Key:', supabaseKey ? '✅ 설정됨' : '❌ 없음')
console.log('🔐 Service Key:', serviceKey ? '✅ 설정됨' : '❌ 없음')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAuth() {
  try {
    // 1. 현재 세션 확인
    console.log('\n1️⃣ 현재 세션 확인...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.log('❌ 세션 오류:', sessionError.message)
    } else {
      console.log('📱 현재 세션:', session ? '✅ 활성' : '❌ 없음')
      if (session) {
        console.log('👤 사용자 ID:', session.user.id)
        console.log('📧 이메일:', session.user.email)
      }
    }

    // 2. auth.users 테이블 확인 (service key 필요)
    if (serviceKey) {
      console.log('\n2️⃣ auth.users 테이블 확인...')
      const adminSupabase = createClient(supabaseUrl, serviceKey)
      
      // auth.users는 직접 접근할 수 없으므로 대신 users 테이블 확인
      const { data: users, error: usersError } = await adminSupabase
        .from('users')
        .select('*')
        .limit(5)
      
      if (usersError) {
        console.log('❌ users 테이블 조회 오류:', usersError.message)
      } else {
        console.log('👥 등록된 사용자 수:', users?.length || 0)
        users?.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email} (${user.full_name}) - ${user.role}`)
        })
      }
    }

    // 3. 테넌트 데이터 확인
    console.log('\n3️⃣ 테넌트 데이터 확인...')
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .limit(5)
    
    if (tenantsError) {
      console.log('❌ 테넌트 조회 오류:', tenantsError.message)
    } else {
      console.log('🏢 등록된 테넌트 수:', tenants?.length || 0)
      tenants?.forEach((tenant, index) => {
        console.log(`  ${index + 1}. ${tenant.name} (${tenant.slug}) - ${tenant.status}`)
      })
    }

    // 4. 테스트 로그인 시도
    console.log('\n4️⃣ 테스트 로그인 시도...')
    console.log('📧 테스트 계정으로 로그인 시도: demo@propertydesk.com')
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'demo@propertydesk.com',
      password: 'demo123456'
    })
    
    if (loginError) {
      console.log('❌ 로그인 실패:', loginError.message)
      
      // 계정이 없다면 생성 시도
      console.log('\n🔧 테스트 계정 생성 시도...')
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'demo@propertydesk.com',
        password: 'demo123456',
        options: {
          data: {
            name: '데모 사용자',
            company: '리체 매물장'
          }
        }
      })
      
      if (signUpError) {
        console.log('❌ 회원가입 실패:', signUpError.message)
      } else {
        console.log('✅ 테스트 계정 생성 성공')
        console.log('👤 사용자 ID:', signUpData.user?.id)
        console.log('📧 이메일:', signUpData.user?.email)
      }
    } else {
      console.log('✅ 로그인 성공!')
      console.log('👤 사용자 ID:', loginData.user?.id)
      console.log('📧 이메일:', loginData.user?.email)
    }
    
  } catch (error) {
    console.error('💥 오류 발생:', error)
  }
}

checkAuth()