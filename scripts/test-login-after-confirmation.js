#!/usr/bin/env node

// ============================================================================
// 이메일 확인 후 로그인 테스트 스크립트
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

async function testLoginAfterConfirmation() {
  try {
    console.log('🧪 이메일 확인 후 로그인 테스트...')
    
    // 테스트할 계정들
    const testAccounts = [
      { email: 'demo@propertydesk.com', password: 'demo123456' },
      { email: 'propertydesk.test@gmail.com', password: 'PropertyDesk123!' }
    ]
    
    for (const account of testAccounts) {
      console.log(`\n📧 ${account.email} 로그인 테스트...`)
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      })
      
      if (loginError) {
        console.log(`❌ 로그인 실패: ${loginError.message}`)
        
        if (loginError.message.includes('Email not confirmed')) {
          console.log('  → 아직 이메일 확인이 필요합니다. Supabase 대시보드에서 확인해주세요.')
        } else if (loginError.message.includes('Invalid login credentials')) {
          console.log('  → 이메일 또는 비밀번호가 틀렸습니다.')
        }
      } else {
        console.log('✅ 로그인 성공!')
        console.log(`👤 사용자 ID: ${loginData.user?.id}`)
        console.log(`📧 이메일: ${loginData.user?.email}`)
        console.log(`✉️ 이메일 확인됨: ${loginData.user?.email_confirmed_at ? '✅' : '❌'}`)
        
        // 사용자 프로필 정보 확인
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', loginData.user.id)
          .single()
        
        if (profile) {
          console.log(`👤 프로필: ${profile.full_name} (${profile.role})`)
          console.log(`🏢 테넌트 ID: ${profile.tenant_id}`)
        } else if (profileError) {
          console.log('⚠️ 사용자 프로필이 없습니다. 프로필을 생성해야 합니다.')
        }
        
        // 로그아웃
        await supabase.auth.signOut()
        console.log('🔓 로그아웃 완료')
      }
    }
    
    console.log('\n📝 사용 가능한 로그인 정보:')
    testAccounts.forEach(account => {
      console.log(`📧 ${account.email} / 🔐 ${account.password}`)
    })
    
  } catch (error) {
    console.error('💥 오류 발생:', error)
  }
}

testLoginAfterConfirmation()