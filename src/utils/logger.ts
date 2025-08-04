// ============================================================================
// 개발환경 로깅 유틸리티
// ============================================================================

const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_APP_ENV === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
  
  error: (...args: any[]) => {
    // 에러는 항상 로그 (프로덕션에서도 중요)
    console.error(...args)
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  }
}