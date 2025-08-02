// ============================================================================
// Supabase 클라이언트 설정 (멀티테넌트 지원)
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL과 Anon Key가 환경변수에 설정되어 있지 않습니다.\n' +
    'VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 .env 파일에 추가해주세요.'
  )
}

// Supabase 클라이언트 생성
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'propertydesk-auth',
  },
  global: {
    headers: {
      'X-Client': 'PropertyDesk-SaaS',
    },
  },
})

// 멀티테넌트 지원을 위한 RLS 컨텍스트 설정
export const setTenantContext = async (tenantId: string) => {
  const { error } = await supabase.rpc('set_current_tenant_id', {
    tenant_id: tenantId,
  })
  
  if (error) {
    console.error('테넌트 컨텍스트 설정 실패:', error)
    throw error
  }
}

// 현재 테넌트 컨텍스트 해제
export const clearTenantContext = async () => {
  const { error } = await supabase.rpc('clear_current_tenant_id')
  
  if (error) {
    console.error('테넌트 컨텍스트 해제 실패:', error)
    throw error
  }
}

// 테넌트별 실시간 구독 설정
export const createTenantChannel = (tenantId: string, table: string) => {
  return supabase
    .channel(`tenant-${tenantId}-${table}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter: `tenant_id=eq.${tenantId}`,
      },
      (payload) => {
        console.log('실시간 데이터 변경:', payload)
      }
    )
}

// 파일 업로드 헬퍼 (테넌트별 폴더 구조)
export const uploadFile = async (
  file: File,
  bucket: string,
  path: string,
  tenantId: string
) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `${tenantId}/${path}/${fileName}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw error
  }

  // 공개 URL 생성
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return {
    path: data.path,
    url: publicUrl,
    fileName,
  }
}

// 에러 핸들링 헬퍼
export const handleSupabaseError = (error: any) => {
  console.error('Supabase 에러:', error)
  
  // 일반적인 에러 메시지 변환
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'Email not confirmed': '이메일 인증이 필요합니다.',
    'User already registered': '이미 등록된 이메일 주소입니다.',
    'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다.',
    'Unable to validate email address': '유효하지 않은 이메일 주소입니다.',
    'duplicate key value': '중복된 데이터입니다.',
    'foreign key constraint': '참조된 데이터가 존재하지 않습니다.',
  }

  const message = errorMessages[error.message] || error.message || '알 수 없는 오류가 발생했습니다.'
  
  return {
    code: error.code || 'UNKNOWN_ERROR',
    message,
    details: error.details || error.hint,
  }
}

// 헬스 체크
export const checkSupabaseHealth = async () => {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('id')
      .limit(1)
      .single()
    
    return {
      status: 'healthy' as const,
      database: !error,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: 'unhealthy' as const,
      database: false,
      error: handleSupabaseError(error),
      timestamp: new Date().toISOString(),
    }
  }
}