/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
  readonly VITE_APP_ENV: string
  readonly VITE_DEV_TOOLS: string
  readonly VITE_MOCK_API: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string
  readonly VITE_NAVER_MAP_CLIENT_ID?: string
  readonly VITE_KAKAO_MAP_API_KEY?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_GA_MEASUREMENT_ID?: string
  readonly VITE_POSTHOG_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}