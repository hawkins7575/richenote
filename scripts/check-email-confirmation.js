#!/usr/bin/env node

// ============================================================================
// 이메일 확인 상태 점검 스크립트
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

async function checkEmailConfirmation() {
  try {
    console.log('📧 이메일 확인 상태 점검 시작...')
    
    // 1. 먼저 로그인 시도해서 정확한 에러 확인
    console.log('\n1️⃣ 기존 계정 로그인 시도...')
    const testEmails = [
      'demo@propertydesk.com',
      'test@example.com', 
      'admin@example.com'
    ]
    
    for (const email of testEmails) {
      console.log(`\n📧 ${email} 로그인 시도...`)
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'demo123456'
      })
      
      if (loginError) {
        console.log(`❌ 로그인 실패: ${loginError.message}`)
        
        // 에러 타입별 상세 분석
        if (loginError.message.includes('Email not confirmed')) {
          console.log('  → 원인: 이메일 확인이 필요합니다')
          console.log('  → 해결방법: Supabase 대시보드에서 사용자의 Email Confirmed 체크')
        } else if (loginError.message.includes('Invalid login credentials')) {
          console.log('  → 원인: 잘못된 이메일 또는 비밀번호')
        } else if (loginError.message.includes('invalid')) {
          console.log('  → 원인: 유효하지 않은 이메일 형식')
        }
      } else {
        console.log(`✅ 로그인 성공!`)
        console.log(`👤 사용자 ID: ${loginData.user?.id}`)
        console.log(`📧 이메일: ${loginData.user?.email}`)
        console.log(`✉️ 이메일 확인됨: ${loginData.user?.email_confirmed_at ? '✅' : '❌'}`)
        
        // 로그아웃
        await supabase.auth.signOut()
      }
    }
    
    // 2. 유효한 이메일로 새 테스트 계정 생성 시도
    console.log('\n2️⃣ 새 테스트 계정 생성 시도...')
    const timestamp = Date.now()
    const newEmail = `test${timestamp}@example.com`
    
    console.log(`📧 새 계정 이메일: ${newEmail}`)
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: newEmail,
      password: 'test123456',
      options: {
        data: {
          name: '테스트 사용자',
          company: '리체 매물장'
        }
      }
    })
    
    if (signUpError) {
      console.log('❌ 회원가입 실패:', signUpError.message)
    } else {
      console.log('✅ 회원가입 성공!')
      console.log('👤 사용자 ID:', signUpData.user?.id)
      console.log('📧 이메일:', signUpData.user?.email)
      console.log('✉️ 이메일 확인 필요:', signUpData.user?.email_confirmed_at ? '❌' : '✅')
      
      if (!signUpData.user?.email_confirmed_at) {
        console.log('\n⚠️ 이메일 확인이 필요합니다.')
        console.log('🔧 해결 방법:')
        console.log('1. Supabase 대시보드 → Authentication → Users')
        console.log('2. 해당 사용자 찾기')
        console.log('3. "Email Confirmed" 체크박스 클릭')
        console.log('4. 또는 Authentication → Settings → "Enable email confirmations" 비활성화')
        
        console.log('\n🧪 이메일 확인 후 로그인 테스트 정보:')
        console.log(`이메일: ${newEmail}`)
        console.log('비밀번호: test123456')
      }
    }
    
  } catch (error) {
    console.error('💥 오류 발생:', error)
  }
}

checkEmailConfirmation()