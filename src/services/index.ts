// ============================================================================
// 서비스 레이어 - 실제 Supabase 서비스 사용
// ============================================================================

import * as mockService from './mockPropertyService'
import * as realService from './propertyService'

// 환경변수로 서비스 모드 결정
const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true'
const hasSupabaseConfig = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

console.log('🔧 서비스 모드:', {
  useSupabase,
  hasSupabaseConfig,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  appEnv: import.meta.env.VITE_APP_ENV
})

// 환경에 따른 서비스 선택
const useMockAPI = import.meta.env.VITE_MOCK_API === 'true'
const propertyService = useMockAPI ? mockService : realService

if (useMockAPI) {
  console.log('🔧 Mock 서비스 사용 중 (네트워크 문제로 인한 임시 전환)')
} else {
  console.log('📡 실제 Supabase 서비스 사용 중')
}

export const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
  getPropertyStats,
  togglePropertyFavorite
} = propertyService