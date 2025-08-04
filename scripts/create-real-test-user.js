#!/usr/bin/env node

// ============================================================================
// 실제 Gmail 계정으로 테스트 사용자 생성
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

async function createRealTestUser() {
  try {
    console.log('👤 실제 Gmail 계정으로 테스트 사용자 생성...')
    
    // 실제 Gmail 주소 사용
    const testEmail = 'propertydesk.test@gmail.com'
    const testPassword = 'PropertyDesk123!'
    
    console.log(`📧 테스트 이메일: ${testEmail}`)
    console.log(`🔐 비밀번호: ${testPassword}`)
    
    // 1. 먼저 기존 로그인 시도
    console.log('\n1️⃣ 기존 계정 로그인 시도...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })
    
    if (loginError) {
      console.log(`❌ 로그인 실패: ${loginError.message}`)
      
      if (loginError.message.includes('Invalid login credentials')) {
        // 2. 계정이 없으면 새로 생성
        console.log('\n2️⃣ 새 계정 생성 시도...')
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
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
            console.log('\n📬 이메일 확인 메일이 발송되었습니다.')
            console.log('1. Gmail 받은편지함을 확인하세요')
            console.log('2. Supabase에서 온 확인 메일을 찾아 링크를 클릭하세요')
            console.log('3. 또는 Supabase 대시보드에서 수동으로 이메일을 확인 처리하세요')
          }
        }
      } else if (loginError.message.includes('Email not confirmed')) {
        console.log('\n⚠️ 이메일 확인이 필요한 기존 계정입니다.')
        console.log('🔧 해결 방법:')
        console.log('1. Gmail에서 Supabase 이메일 확인 링크 클릭')
        console.log('2. 또는 Supabase 대시보드 → Authentication → Users에서 Email Confirmed 체크')
      }
    } else {
      console.log('✅ 로그인 성공!')
      console.log('👤 사용자 ID:', loginData.user?.id)
      console.log('📧 이메일:', loginData.user?.email)
      console.log('✉️ 이메일 확인됨:', loginData.user?.email_confirmed_at ? '✅' : '❌')
      
      // 성공한 경우 로그아웃
      await supabase.auth.signOut()
      console.log('🔓 로그아웃 완료')
    }
    
    console.log('\n📝 로그인 정보 (이메일 확인 후 사용):')
    console.log(`이메일: ${testEmail}`)
    console.log(`비밀번호: ${testPassword}`)
    
  } catch (error) {
    console.error('💥 오류 발생:', error)
  }
}

createRealTestUser()