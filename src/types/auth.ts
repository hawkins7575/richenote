// ============================================================================
// 인증 관련 타입 정의
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "owner" | "manager" | "agent" | "viewer";
  tenant_id: string | null;
  avatar_url: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: AuthUser;
}

// 간단한 로그인 데이터
export interface SignInData {
  email: string;
  password: string;
}

// 회원가입 데이터
export interface SignUpData {
  email: string;
  password: string;
  name: string;
  company: string;
}

// 로그인 요청 (기존 호환성)
export interface SignInRequest {
  email: string;
  password: string;
  tenant_slug?: string; // 테넌트별 로그인
}

// 회원가입 요청 (기존 호환성)
export interface SignUpRequest {
  email: string;
  password: string;
  full_name: string;
  tenant_name?: string; // 새 테넌트 생성
  tenant_slug?: string; // 기존 테넌트 가입
}

// 비밀번호 재설정 요청
export interface ResetPasswordRequest {
  email: string;
  redirect_to?: string;
}

// 이메일 확인 요청
export interface ConfirmEmailRequest {
  token: string;
  type: "signup" | "email_change" | "recovery";
}

// 초대 수락 요청
export interface AcceptInviteRequest {
  token: string;
  password: string;
  full_name: string;
}

// OAuth 제공자
export type OAuthProvider = "google" | "github" | "microsoft" | "apple";

// OAuth 로그인 요청
export interface OAuthSignInRequest {
  provider: OAuthProvider;
  redirect_to?: string;
  tenant_slug?: string;
}

// 2FA 관련
export interface TwoFactorSetup {
  secret: string;
  qr_code: string;
  backup_codes: string[];
}

export interface TwoFactorVerifyRequest {
  token: string;
  backup_code?: string;
}

// 세션 관리
export interface SessionInfo {
  id: string;
  user_id: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  last_activity: string;
  is_current: boolean;
}

// 로그인 기록
export interface LoginAttempt {
  id: string;
  email: string;
  tenant_slug?: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  failure_reason?: string;
  created_at: string;
}

// 인증 컨텍스트 타입
export interface AuthContextType {
  // 상태
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // 액션
  signIn: (request: SignInRequest) => Promise<void>;
  signUp: (request: SignUpRequest) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (request: ResetPasswordRequest) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (updates: {
    full_name?: string;
    avatar_url?: string;
  }) => Promise<void>;

  // OAuth
  signInWithOAuth: (request: OAuthSignInRequest) => Promise<void>;

  // 2FA
  setup2FA: () => Promise<TwoFactorSetup>;
  enable2FA: (token: string) => Promise<void>;
  disable2FA: (token: string) => Promise<void>;
  verify2FA: (request: TwoFactorVerifyRequest) => Promise<void>;

  // 세션 관리
  refreshSession: () => Promise<void>;
  getActiveSessions: () => Promise<SessionInfo[]>;
  terminateSession: (sessionId: string) => Promise<void>;
  terminateAllSessions: () => Promise<void>;
}

// 권한 가드 props
export interface AuthGuardProps {
  children: React.ReactNode;
  require?: "authenticated" | "unauthenticated";
  redirect?: string;
  fallback?: React.ReactNode;
}

// 역할 기반 가드 props
export interface RoleGuardProps {
  children: React.ReactNode;
  roles: string[];
  fallback?: React.ReactNode;
  strict?: boolean; // true: 정확한 역할 매치, false: 상위 역할도 허용
}
