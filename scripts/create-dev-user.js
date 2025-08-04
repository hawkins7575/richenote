#!/usr/bin/env node

// ============================================================================
// 개발용 사용자 생성 스크립트 (이메일 확인 없이)
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

async function createDevUser() {
  try {
    console.log('👤 개발용 사용자 생성 시작...')
    
    // 1. 기존 세션 정리
    await supabase.auth.signOut()
    
    // 2. 새로운 개발용 계정 생성 (다른 이메일로)
    console.log('\n1️⃣ 새 개발용 계정 생성...')
    const timestamp = Date.now()
    const devEmail = `dev-${timestamp}@richey.local`
    const devPassword = 'dev123456'
    
    console.log('📧 개발 계정 이메일:', devEmail)
    console.log('🔐 비밀번호:', devPassword)
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: devEmail,
      password: devPassword,
      options: {
        data: {
          name: '개발자',
          company: '리체 매물장'
        }
      }
    })
    
    if (signUpError) {
      console.log('❌ 회원가입 실패:', signUpError.message)
      
      // 이미 존재한다면 로그인 시도
      if (signUpError.message.includes('already registered')) {
        console.log('\n🔄 기존 계정으로 로그인 시도...')
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: devEmail,
          password: devPassword
        })
        
        if (signInError) {
          console.log('❌ 로그인도 실패:', signInError.message)
          return
        } else {
          console.log('✅ 기존 계정 로그인 성공!')
          return
        }
      }
      return
    }
    
    console.log('✅ 개발용 계정 생성 성공!')
    console.log('👤 사용자 ID:', signUpData.user?.id)
    console.log('📧 이메일:', signUpData.user?.email)
    console.log('✉️  이메일 확인 필요:', signUpData.user?.email_confirmed_at ? '❌' : '✅')
    
    // 3. 이메일 확인이 필요한 경우 안내
    if (!signUpData.user?.email_confirmed_at) {
      console.log('\n⚠️  이메일 확인이 필요합니다.')
      console.log('🔧 해결 방법:')
      console.log('1. Supabase 대시보드 → Authentication → Users에서 해당 사용자의 "Email Confirmed" 체크')
      console.log('2. 또는 Authentication → Settings → "Enable email confirmations" 비활성화')
      console.log('3. 로컬 개발 환경에서는 AuthContext의 자동 로그인이 작동해야 합니다.')
    }
    
    console.log('\n📝 로그인 정보:')
    console.log('이메일:', devEmail)
    console.log('비밀번호:', devPassword)
    
  } catch (error) {
    console.error('💥 오류 발생:', error)
  }
}

createDevUser()