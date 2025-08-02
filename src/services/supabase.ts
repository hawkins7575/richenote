// ============================================================================
// Supabase 클라이언트 설정
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Supabase 환경 변수 (개발 중에는 가상의 값 사용)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('문서를 참조하여 Supabase 환경 변수를 설정해주세요.')
}

// Supabase 클라이언트 생성
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// 타입 도우미 함수
export type SupabaseClient = typeof supabase