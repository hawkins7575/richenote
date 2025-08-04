// ============================================================================
// Supabase 연결 진단 유틸리티
// ============================================================================

import { supabase } from '@/services/supabase'

export interface DiagnosticResult {
  step: string
  success: boolean
  message: string
  data?: any
  error?: any
}

// Supabase 연결 상태 종합 진단
export const runSupabaseDiagnostics = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = []
  
  // 1. 환경변수 확인
  console.log('🔍 1단계: 환경변수 확인')
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  results.push({
    step: '환경변수 확인',
    success: !!(supabaseUrl && supabaseKey),
    message: supabaseUrl && supabaseKey 
      ? `✅ URL: ${supabaseUrl}, Key: 설정됨` 
      : '❌ 환경변수 누락',
    data: { url: supabaseUrl, hasKey: !!supabaseKey }
  })

  // 2. 기본 연결 테스트
  console.log('🔍 2단계: 기본 연결 테스트')
  try {
    const { data: healthCheck, error } = await supabase
      .from('properties')
      .select('count(*)', { count: 'exact', head: true })
    
    if (error) {
      results.push({
        step: '기본 연결 테스트',
        success: false,
        message: `❌ 연결 실패: ${error.message}`,
        error: error
      })
    } else {
      results.push({
        step: '기본 연결 테스트',
        success: true,
        message: `✅ 연결 성공 (테이블 접근 가능)`,
        data: healthCheck
      })
    }
  } catch (error) {
    results.push({
      step: '기본 연결 테스트',
      success: false,
      message: `❌ 네트워크 오류: ${error}`,
      error: error
    })
  }

  // 3. 스키마 확인
  console.log('🔍 3단계: 테이블 스키마 확인')
  try {
    const { data: schemaCheck, error } = await supabase
      .from('properties')
      .select('*')
      .limit(1)
    
    if (error) {
      results.push({
        step: '스키마 확인',
        success: false,
        message: `❌ 스키마 문제: ${error.message}`,
        error: error
      })
    } else {
      results.push({
        step: '스키마 확인',
        success: true,
        message: `✅ 스키마 접근 가능`,
        data: schemaCheck
      })
    }
  } catch (error) {
    results.push({
      step: '스키마 확인',
      success: false,
      message: `❌ 스키마 오류: ${error}`,
      error: error
    })
  }

  // 4. 인증 상태 확인
  console.log('🔍 4단계: 인증 상태 확인')
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    results.push({
      step: '인증 상태 확인',
      success: true,
      message: user 
        ? `✅ 로그인됨: ${user.email}` 
        : '⚠️ 로그인되지 않음 (익명 접근)',
      data: { user: user?.email || null, isAuthenticated: !!user }
    })
  } catch (authError) {
    results.push({
      step: '인증 상태 확인',
      success: false,
      message: `❌ 인증 확인 실패: ${authError}`,
      error: authError
    })
  }

  // 5. 테이블 구조 확인
  console.log('🔍 5단계: 테이블 구조 확인')
  try {
    const { error: tableError } = await supabase
      .from('properties')
      .select('*')
      .limit(0)
    
    results.push({
      step: '테이블 구조 확인',
      success: !tableError,
      message: tableError 
        ? `❌ 테이블 구조 확인 실패: ${tableError.message}`
        : `✅ 테이블 구조 확인 성공`,
      error: tableError
    })
  } catch (error) {
    results.push({
      step: '테이블 구조 확인',
      success: false,
      message: `❌ 테이블 구조 오류: ${error}`,
      error: error
    })
  }

  // 6. 전체 데이터 조회 테스트 (필터 없음)
  console.log('🔍 6단계: 전체 데이터 조회 테스트')
  try {
    const { data: allData, error: allError } = await supabase
      .from('properties')
      .select('*')
      .limit(5)
    
    if (allError) {
      results.push({
        step: '전체 데이터 조회',
        success: false,
        message: `❌ 전체 데이터 조회 실패: ${allError.message}`,
        error: allError
      })
    } else {
      results.push({
        step: '전체 데이터 조회',
        success: true,
        message: `✅ 전체 데이터 조회 성공 (${allData?.length || 0}개)`,
        data: allData
      })
    }
  } catch (error) {
    results.push({
      step: '전체 데이터 조회',
      success: false,
      message: `❌ 전체 데이터 조회 오류: ${error}`,
      error: error
    })
  }

  // 7. 테넌트별 데이터 조회 테스트
  console.log('🔍 7단계: 테넌트별 데이터 조회 테스트')
  const testTenantId = '00000000-0000-0000-0000-000000000001'
  try {
    const { data: tenantData, error: tenantError } = await supabase
      .from('properties')
      .select('*')
      .eq('tenant_id', testTenantId)
      .limit(5)
    
    if (tenantError) {
      results.push({
        step: '테넌트별 데이터 조회',
        success: false,
        message: `❌ 테넌트 데이터 조회 실패: ${tenantError.message}`,
        error: tenantError
      })
    } else {
      results.push({
        step: '테넌트별 데이터 조회',
        success: true,
        message: `✅ 테넌트 데이터 조회 성공 (${tenantData?.length || 0}개)`,
        data: { tenantId: testTenantId, count: tenantData?.length, sample: tenantData?.[0] }
      })
    }
  } catch (error) {
    results.push({
      step: '테넌트별 데이터 조회',
      success: false,
      message: `❌ 테넌트 데이터 조회 오류: ${error}`,
      error: error
    })
  }

  return results
}

// 진단 결과 출력
export const printDiagnostics = (results: DiagnosticResult[]) => {
  console.log('\n🏥 === Supabase 연결 진단 결과 ===')
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.step}`)
    console.log(`   ${result.message}`)
    if (result.data) {
      console.log('   데이터:', result.data)
    }
    if (result.error) {
      console.log('   에러:', result.error)
    }
  })
  
  const successCount = results.filter(r => r.success).length
  const totalCount = results.length
  
  console.log(`\n📊 진단 완료: ${successCount}/${totalCount} 단계 성공`)
  
  if (successCount === totalCount) {
    console.log('🎉 모든 진단 통과! Supabase 연결이 정상적으로 작동합니다.')
  } else {
    console.log('⚠️ 일부 문제가 발견되었습니다. 위의 에러 메시지를 확인해주세요.')
  }
}