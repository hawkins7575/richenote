#!/usr/bin/env node

// ============================================================================
// 이메일 확인 없이 새 사용자 생성 및 로그인 테스트
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

async function createAndTestNewUser() {
  try {
    console.log('👤 이메일 확인 없이 새 사용자 생성 및 테스트...')
    
    // 새로운 계정 정보
    const timestamp = Date.now()
    const newEmail = `test${timestamp}@gmail.com`
    const newPassword = 'test123456'
    
    console.log(`📧 새 계정 이메일: ${newEmail}`)
    console.log(`🔐 비밀번호: ${newPassword}`)
    
    // 1. 새 계정 생성
    console.log('\n1️⃣ 새 계정 생성...')
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: newEmail,
      password: newPassword,
      options: {
        data: {
          name: '테스트 사용자',
          company: '리체 매물장'
        }
      }
    })
    
    if (signUpError) {
      console.log('❌ 회원가입 실패:', signUpError.message)
      return
    }
    
    console.log('✅ 회원가입 성공!')
    console.log('👤 사용자 ID:', signUpData.user?.id)
    console.log('📧 이메일:', signUpData.user?.email)
    console.log('✉️ 이메일 확인됨:', signUpData.user?.email_confirmed_at ? '✅' : '❌')
    
    // 자동으로 로그인된 상태인지 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (session) {
      console.log('🎉 회원가입 후 자동 로그인 성공!')
      console.log('👤 세션 사용자 ID:', session.user.id)
      console.log('📧 세션 이메일:', session.user.email)
      
      // 사용자 프로필 생성
      console.log('\n2️⃣ 사용자 프로필 생성...')
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: session.user.id,
          tenant_id: '00000000-0000-0000-0000-000000000001',
          email: session.user.email,
          full_name: '테스트 사용자',
          role: 'owner',
          status: 'active'
        })
      
      if (profileError) {
        console.log('⚠️ 프로필 생성 오류:', profileError.message)
      } else {
        console.log('✅ 사용자 프로필 생성 성공!')
      }
      
      // 로그아웃 후 다시 로그인 테스트
      console.log('\n3️⃣ 로그아웃 후 재로그인 테스트...')
      await supabase.auth.signOut()
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: newEmail,
        password: newPassword
      })
      
      if (loginError) {
        console.log('❌ 재로그인 실패:', loginError.message)
      } else {
        console.log('✅ 재로그인 성공!')
        console.log('👤 사용자 ID:', loginData.user?.id)
        console.log('📧 이메일:', loginData.user?.email)
        
        // 다시 로그아웃
        await supabase.auth.signOut()
      }
    } else {
      console.log('⚠️ 회원가입은 성공했지만 자동 로그인이 안되었습니다.')
      
      // 수동 로그인 시도
      console.log('\n2️⃣ 수동 로그인 시도...')
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: newEmail,
        password: newPassword
      })
      
      if (loginError) {
        console.log('❌ 로그인 실패:', loginError.message)
      } else {
        console.log('✅ 로그인 성공!')
        console.log('👤 사용자 ID:', loginData.user?.id)
        console.log('📧 이메일:', loginData.user?.email)
        
        // 로그아웃
        await supabase.auth.signOut()
      }
    }
    
    console.log('\n🎉 테스트 완료!')
    console.log('📝 새로 생성된 계정 정보:')
    console.log(`📧 이메일: ${newEmail}`)
    console.log(`🔐 비밀번호: ${newPassword}`)
    
  } catch (error) {
    console.error('💥 오류 발생:', error)
  }
}

createAndTestNewUser()