#!/usr/bin/env node

// ============================================================================
// 기존 사용자 이메일 확인 상태 수정 스크립트
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경변수 로드
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 기존 사용자 문제 해결 시작...')
console.log('📍 Supabase URL:', supabaseUrl)
console.log('🔑 Anon Key:', supabaseKey ? '✅ 설정됨' : '❌ 없음')
console.log('🔐 Service Key:', serviceKey ? '✅ 설정됨' : '❌ 없음')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixExistingUsers() {
  try {
    // 1. 기존 계정들로 로그인 시도해서 상태 확인
    console.log('\n1️⃣ 기존 계정 로그인 시도...')
    
    const existingAccounts = [
      { email: 'demo@propertydesk.com', password: 'demo123456' },
      { email: 'propertydesk.test@gmail.com', password: 'PropertyDesk123!' },
      { email: 'test@example.com', password: 'test123456' },
      { email: 'admin@richey.com', password: 'admin123456' }
    ]
    
    let workingAccount = null
    
    for (const account of existingAccounts) {
      console.log(`\n📧 ${account.email} 테스트...`)
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      })
      
      if (loginError) {
        console.log(`❌ 로그인 실패: ${loginError.message}`)
        
        if (loginError.message.includes('Invalid login credentials')) {
          // 계정이 아예 없는 경우 - 새로 생성 시도
          console.log('🔧 계정이 없습니다. 새로 생성 시도...')
          
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: account.email,
            password: account.password,
            options: {
              data: {
                name: account.email.includes('demo') ? '데모 사용자' : '테스트 사용자',
                company: '리체 매물장'
              }
            }
          })
          
          if (signUpError) {
            console.log(`❌ 회원가입 실패: ${signUpError.message}`)
          } else {
            console.log('✅ 새 계정 생성 성공!')
            console.log('👤 사용자 ID:', signUpData.user?.id)
            console.log('✉️ 이메일 확인됨:', signUpData.user?.email_confirmed_at ? '✅' : '❌')
            
            if (signUpData.user?.email_confirmed_at) {
              workingAccount = account
              console.log('🎉 이 계정은 바로 사용 가능합니다!')
              
              // 로그아웃
              await supabase.auth.signOut()
            }
          }
        } else if (loginError.message.includes('Email not confirmed')) {
          console.log('⚠️ 이메일 확인이 필요한 기존 계정입니다.')
          console.log('   Supabase 대시보드에서 Email Confirmed를 체크해주세요.')
        }
      } else {
        console.log('✅ 로그인 성공!')
        console.log('👤 사용자 ID:', loginData.user?.id)
        console.log('📧 이메일:', loginData.user?.email)
        workingAccount = account
        
        // 로그아웃
        await supabase.auth.signOut()
      }
    }
    
    // 2. 사용 가능한 계정 정보 출력
    console.log('\n📝 결과 요약:')
    if (workingAccount) {
      console.log('✅ 사용 가능한 계정을 찾았습니다!')
      console.log(`📧 이메일: ${workingAccount.email}`)
      console.log(`🔐 비밀번호: ${workingAccount.password}`)
      console.log('\n🌐 웹 애플리케이션에서 이 계정으로 로그인을 시도해보세요.')
    } else {
      console.log('❌ 바로 사용 가능한 계정이 없습니다.')
      console.log('🔧 해결방법:')
      console.log('1. Supabase 대시보드 → Authentication → Users')
      console.log('2. 각 사용자의 "Email Confirmed" 체크')
      console.log('3. 또는 새로운 계정을 웹에서 직접 가입')
    }
    
    // 3. 빠른 테스트 계정 생성
    console.log('\n🚀 빠른 테스트용 계정 생성...')
    const quickEmail = `quicktest${Date.now()}@gmail.com`
    const quickPassword = 'quick123456'
    
    const { data: quickSignUp, error: quickError } = await supabase.auth.signUp({
      email: quickEmail,
      password: quickPassword,
      options: {
        data: {
          name: '빠른테스트',
          company: '리체 매물장'
        }
      }
    })
    
    if (quickError) {
      console.log('❌ 빠른 테스트 계정 생성 실패:', quickError.message)
    } else {
      console.log('✅ 빠른 테스트 계정 생성 성공!')
      console.log('📧 이메일:', quickEmail)
      console.log('🔐 비밀번호:', quickPassword)
      console.log('🌐 이 계정으로 바로 로그인 가능합니다!')
      
      // 로그아웃
      await supabase.auth.signOut()
    }
    
  } catch (error) {
    console.error('💥 오류 발생:', error)
  }
}

fixExistingUsers()