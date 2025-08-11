#!/usr/bin/env node

// ============================================================================
// 일정관리 날짜 불일치 문제 테스트 스크립트
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경변수 로드
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('📅 일정관리 날짜 불일치 문제 분석 시작...')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testScheduleDates() {
  try {
    // 1. 현재 저장된 스케줄 데이터 조회
    console.log('\n1️⃣ 저장된 스케줄 데이터 조회...')
    
    const { data: schedules, error: scheduleError } = await supabase
      .from('schedules')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (scheduleError) {
      console.log('❌ 스케줄 조회 오류:', scheduleError.message)
      return
    }

    console.log(`📊 저장된 스케줄 수: ${schedules?.length || 0}개`)
    
    if (schedules && schedules.length > 0) {
      console.log('\n📋 스케줄 데이터 분석:')
      schedules.forEach((schedule, index) => {
        console.log(`\n  ${index + 1}. ${schedule.title}`)
        console.log(`      스케줄 ID: ${schedule.id}`)
        console.log(`      생성자: ${schedule.tenant_id}`)
        console.log(`      시작일시(DB): ${schedule.start_date}`)
        console.log(`      종료일시(DB): ${schedule.end_date}`)
        console.log(`      생성일시: ${schedule.created_at}`)
        console.log(`      업데이트: ${schedule.updated_at}`)
        
        // 날짜 파싱 테스트
        const startDate = new Date(schedule.start_date)
        const endDate = new Date(schedule.end_date)
        const createdDate = new Date(schedule.created_at)
        
        console.log(`      파싱 결과:`)
        console.log(`        시작일시: ${startDate.toLocaleString('ko-KR')}`)
        console.log(`        종료일시: ${endDate.toLocaleString('ko-KR')}`)
        console.log(`        생성일시: ${createdDate.toLocaleString('ko-KR')}`)
        
        // 날짜 형식 분석
        console.log(`      날짜 형식 분석:`)
        console.log(`        시작일시 ISO: ${startDate.toISOString()}`)
        console.log(`        시작일시 UTC: ${startDate.toUTCString()}`)
        console.log(`        로컬 날짜만: ${startDate.toLocaleDateString('ko-KR')}`)
        console.log(`        로컬 시간만: ${startDate.toLocaleTimeString('ko-KR')}`)
        
        // 타임존 확인
        console.log(`      타임존 정보:`)
        console.log(`        타임존 오프셋: ${startDate.getTimezoneOffset()}분`)
        console.log(`        현재 타임존: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`)
        
        console.log('      ─────────────────')
      })
    } else {
      console.log('📝 저장된 스케줄이 없습니다.')
      
      // 테스트 데이터 생성
      console.log('\n2️⃣ 테스트 스케줄 생성...')
      await createTestSchedule()
    }

    // 2. 날짜 형식 변환 테스트
    console.log('\n3️⃣ 날짜 형식 변환 테스트...')
    testDateConversions()

  } catch (error) {
    console.error('💥 오류 발생:', error)
  }
}

async function createTestSchedule() {
  try {
    // 현재 시간을 기준으로 테스트 스케줄 생성
    const now = new Date()
    const startTime = new Date(now)
    startTime.setHours(now.getHours() + 1, 0, 0, 0) // 1시간 후 정시
    
    const endTime = new Date(startTime)
    endTime.setHours(startTime.getHours() + 1) // 2시간 지속
    
    const testSchedule = {
      tenant_id: 'test-tenant-id',
      user_id: 'test-user-id', 
      title: '날짜 테스트 스케줄',
      description: '날짜 형식 테스트를 위한 스케줄입니다.',
      start_date: startTime.toISOString(),
      end_date: endTime.toISOString(),
      all_day: false,
      category: 'other',
      priority: 'medium',
      location: '테스트 장소'
    }
    
    console.log('📝 생성할 테스트 스케줄:')
    console.log('  제목:', testSchedule.title)
    console.log('  시작일시(입력):', testSchedule.start_date)
    console.log('  종료일시(입력):', testSchedule.end_date)
    console.log('  시작일시(로컬):', startTime.toLocaleString('ko-KR'))
    console.log('  종료일시(로컬):', endTime.toLocaleString('ko-KR'))
    
    const { data, error } = await supabase
      .from('schedules')
      .insert([testSchedule])
      .select()
      .single()
    
    if (error) {
      console.log('❌ 테스트 스케줄 생성 실패:', error.message)
    } else {
      console.log('✅ 테스트 스케줄 생성 성공')
      console.log('📋 저장된 데이터:')
      console.log('  ID:', data.id)
      console.log('  시작일시(DB):', data.start_date)
      console.log('  종료일시(DB):', data.end_date)
      
      // 저장된 데이터 다시 파싱
      const savedStart = new Date(data.start_date)
      const savedEnd = new Date(data.end_date)
      console.log('  시작일시(파싱):', savedStart.toLocaleString('ko-KR'))
      console.log('  종료일시(파싱):', savedEnd.toLocaleString('ko-KR'))
      
      // 입력과 출력 비교
      console.log('🔍 입출력 비교:')
      console.log('  입력 시작:', startTime.toLocaleString('ko-KR'))
      console.log('  출력 시작:', savedStart.toLocaleString('ko-KR'))
      console.log('  일치 여부:', startTime.getTime() === savedStart.getTime() ? '✅' : '❌')
    }
    
  } catch (error) {
    console.error('💥 테스트 스케줄 생성 중 오류:', error)
  }
}

function testDateConversions() {
  console.log('🔄 JavaScript 날짜 변환 테스트...')
  
  // 현재 시간
  const now = new Date()
  console.log('현재 시간:', now.toLocaleString('ko-KR'))
  
  // HTML datetime-local 입력값 시뮬레이션
  const datetimeLocal = now.toISOString().slice(0, 16) // "2024-08-11T15:30"
  console.log('datetime-local 형식:', datetimeLocal)
  
  // datetime-local 값을 Date 객체로 변환
  const parsedDate = new Date(datetimeLocal)
  console.log('파싱된 날짜:', parsedDate.toLocaleString('ko-KR'))
  
  // ISO 문자열로 변환 (DB 저장용)
  const isoString = parsedDate.toISOString()
  console.log('ISO 문자열:', isoString)
  
  // 다시 Date 객체로 파싱 (DB에서 읽은 후)
  const reparsedDate = new Date(isoString)
  console.log('재파싱된 날짜:', reparsedDate.toLocaleString('ko-KR'))
  
  // 시간 차이 확인
  console.log('🕐 타임존 분석:')
  console.log('  로컬 타임존:', Intl.DateTimeFormat().resolvedOptions().timeZone)
  console.log('  UTC 오프셋:', now.getTimezoneOffset(), '분')
  console.log('  한국 시간과 차이:', (now.getTimezoneOffset() + 540), '분') // KST는 UTC+9
  
  // 캘린더 렌더링용 날짜 변환 테스트
  console.log('📅 캘린더 렌더링 테스트:')
  const testScheduleDate = '2024-08-11T14:30:00.000Z'
  const scheduleDate = new Date(testScheduleDate)
  const calendarDisplay = scheduleDate.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  console.log('  스케줄 DB 값:', testScheduleDate)
  console.log('  캘린더 표시:', calendarDisplay)
  console.log('  로컬 시간:', scheduleDate.toLocaleString('ko-KR'))
}

testScheduleDates()