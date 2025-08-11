#!/usr/bin/env node

// ============================================================================
// 김선미의 실제 등록된 매물 데이터 검색 스크립트
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경변수 로드
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 김선미의 실제 매물 데이터 검색 시작...')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function searchRealData() {
  try {
    // 1. 전체 매물 데이터 조회 (최근 100개)
    console.log('\n1️⃣ 전체 매물 데이터 조회...')
    
    const { data: allProperties, error: allError } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (allError) {
      console.log('❌ 전체 매물 조회 오류:', allError.message)
      return
    }

    console.log('📊 전체 등록된 매물 수:', allProperties?.length || 0)
    
    if (allProperties && allProperties.length > 0) {
      console.log('\n📋 최근 매물 목록:')
      allProperties.forEach((property, index) => {
        console.log(`  ${index + 1}. ${property.title}`)
        console.log(`      소유자: ${property.tenant_id}`)
        console.log(`      생성일: ${new Date(property.created_at).toLocaleDateString('ko-KR')}`)
        console.log(`      상태: ${property.status}`)
        console.log(`      설명: ${property.description?.slice(0, 50) || '설명 없음'}...`)
        console.log('      ─────────────────')
      })
    }

    // 2. 김선미와 관련된 매물 검색 (다양한 방법으로)
    console.log('\n2️⃣ 김선미 관련 매물 검색...')
    
    // 2-1. 제목에 "김선미" 포함된 매물
    const { data: titleSearch, error: titleError } = await supabase
      .from('properties')
      .select('*')
      .ilike('title', '%김선미%')
    
    if (!titleError && titleSearch?.length) {
      console.log(`📍 제목에 "김선미" 포함된 매물: ${titleSearch.length}개`)
      titleSearch.forEach((property, index) => {
        console.log(`  ${index + 1}. ${property.title} (ID: ${property.id})`)
      })
    }

    // 2-2. 설명에 "김선미" 포함된 매물  
    const { data: descSearch, error: descError } = await supabase
      .from('properties')
      .select('*')
      .ilike('description', '%김선미%')
    
    if (!descError && descSearch?.length) {
      console.log(`📍 설명에 "김선미" 포함된 매물: ${descSearch.length}개`)
      descSearch.forEach((property, index) => {
        console.log(`  ${index + 1}. ${property.title} (ID: ${property.id})`)
      })
    }

    // 2-3. 김선미의 user_id로 등록된 매물 (알려진 ID 사용)
    const kimSeonmiId = 'e431e972-1e58-4068-b9bb-71bdca89bb17'
    const { data: userProperties, error: userError } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', kimSeonmiId)
    
    if (!userError) {
      console.log(`📍 김선미 ID(${kimSeonmiId})로 등록된 매물: ${userProperties?.length || 0}개`)
      userProperties?.forEach((property, index) => {
        console.log(`  ${index + 1}. ${property.title} (ID: ${property.id})`)
        console.log(`      생성일: ${new Date(property.created_at).toLocaleDateString('ko-KR')}`)
      })
    }

    // 2-4. 김선미의 tenant_id로 등록된 매물
    const { data: tenantProperties, error: tenantError } = await supabase
      .from('properties')
      .select('*')
      .eq('tenant_id', kimSeonmiId)
    
    if (!tenantError) {
      console.log(`📍 김선미 테넌트 ID로 등록된 매물: ${tenantProperties?.length || 0}개`)
      tenantProperties?.forEach((property, index) => {
        console.log(`  ${index + 1}. ${property.title} (ID: ${property.id})`)
        console.log(`      생성일: ${new Date(property.created_at).toLocaleDateString('ko-KR')}`)
      })
    }

    // 3. 사용자별 매물 통계
    console.log('\n3️⃣ 사용자별 매물 통계...')
    
    if (allProperties?.length) {
      const userStats = {}
      allProperties.forEach(property => {
        const userId = property.tenant_id || property.user_id || '알 수 없음'
        userStats[userId] = (userStats[userId] || 0) + 1
      })
      
      console.log('👥 사용자별 매물 개수:')
      Object.entries(userStats).forEach(([userId, count]) => {
        console.log(`  ${userId}: ${count}개`)
      })
    }

    // 4. 삭제된 데이터나 백업 확인
    console.log('\n4️⃣ 삭제된 데이터 추적 시도...')
    
    // 최근 7일 이내 생성된 모든 매물 확인
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: recentProperties, error: recentError } = await supabase
      .from('properties')
      .select('*')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
    
    if (!recentError && recentProperties?.length) {
      console.log(`📅 최근 7일 이내 등록된 매물: ${recentProperties.length}개`)
      recentProperties.forEach((property, index) => {
        console.log(`  ${index + 1}. ${property.title}`)
        console.log(`      등록자: ${property.tenant_id}`)
        console.log(`      생성일: ${new Date(property.created_at).toLocaleString('ko-KR')}`)
      })
    } else {
      console.log('📅 최근 7일 이내 등록된 매물이 없습니다.')
    }

  } catch (error) {
    console.error('💥 오류 발생:', error)
  }
}

searchRealData()