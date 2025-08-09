// ============================================================================
// Supabase 클라이언트 설정
// ============================================================================

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Supabase 환경 변수 검증
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 프로덕션 환경에서는 반드시 환경 변수가 설정되어야 함
const isProduction = import.meta.env.PROD;
// const isDevelopment = import.meta.env.DEV;

if (
  isProduction &&
  (!supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("your-project") ||
    supabaseAnonKey.includes("your-anon-key"))
) {
  throw new Error(
    "프로덕션 환경에서는 올바른 Supabase 환경 변수가 필요합니다.",
  );
}

if (!supabaseUrl || !supabaseAnonKey) {
  if (isProduction) {
    throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
  }
  // 개발 환경에서만 기본값 사용
  console.warn(
    "⚠️ 개발 환경: Supabase 환경 변수가 설정되지 않아 기본값을 사용합니다.",
  );
}

// Supabase 클라이언트 생성 (싱글톤 패턴)
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    // 개발 환경에서만 기본값 사용
    const finalUrl = supabaseUrl || "https://your-project.supabase.co";
    const finalKey = supabaseAnonKey || "your-anon-key";

    supabaseInstance = createClient<Database>(finalUrl, finalKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: "sb-auth-token",
      },
    });
  }
  return supabaseInstance;
})();

// 타입 도우미 함수
export type SupabaseClient = typeof supabase;
