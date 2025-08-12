// ============================================================================
// 인증 컨텍스트 - Supabase Auth 통합
// ============================================================================

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase";
import type { AuthUser, SignUpData, SignInData } from "@/types";
import { logger } from "@/utils/logger";

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<any>;
  signIn: (data: SignInData) => Promise<any>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  getCurrentUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.info("🔍 인증 초기화 시작");

    // 초기 세션 확인 (타임아웃 포함)
    const getSession = async () => {
      try {
        // 5초 타임아웃 설정
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session check timeout")), 5000),
        );

        const sessionPromise = supabase.auth.getSession();

        const {
          data: { session },
          error,
        } = await Promise.race([sessionPromise, timeoutPromise]) as { data: { session: Session | null }, error: AuthError | null };

        if (error) {
          logger.error("Error getting session:", { message: error.message });
          setLoading(false);
          return;
        }

        setSession(session);
        if (session?.user) {
          try {
            // 사용자 프로필 정보 가져오기 (타임아웃 포함)
            const profilePromise = supabase
              .from("user_profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            const profileTimeoutPromise = new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Profile fetch timeout")),
                3000,
              ),
            );

            const { data: profile } = (await Promise.race([
              profilePromise,
              profileTimeoutPromise,
            ])) as any;

            console.log("🔍 [DEBUG] AuthContext 프로필 데이터:", profile);
            const finalTenantId = profile?.tenant_id || session.user.id;
            console.log("🔍 [DEBUG] AuthContext 최종 tenant_id:", finalTenantId);
            
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: profile?.name || session.user.user_metadata?.name || "",
              role: (profile?.role as "owner" | "manager" | "agent" | "viewer") || "owner",
              tenant_id: finalTenantId, // 프로필의 tenant_id 우선, 없으면 사용자 ID
              avatar_url: profile?.avatar_url || null,
              created_at: session.user.created_at,
              last_sign_in_at: session.user.last_sign_in_at || null,
            });
          } catch (profileError) {
            logger.error("Error fetching profile:", { error: profileError });
            // 프로필 가져오기 실패 시 기본 사용자 정보만 설정
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name || session.user.email!,
              role: "owner",
              tenant_id: session.user.id,
              avatar_url: null,
              created_at: session.user.created_at,
              last_sign_in_at: session.user.last_sign_in_at || null,
            });
          }
        }
      } catch (error) {
        logger.error("Error in getSession:", { error });
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // 인증 상태 변경 리스너 (타임아웃 포함)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info("🔐 Auth state changed:", {
        event,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
      });

      setSession(session);

      if (session?.user) {
        try {
          // 사용자 프로필 정보 가져오기 (타임아웃 포함)
          const profilePromise = supabase
            .from("user_profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          const profileTimeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Profile fetch timeout")), 3000),
          );

          const { data: profile } = await Promise.race([
            profilePromise,
            profileTimeoutPromise,
          ]) as { data: { id: string; name?: string; role?: string; avatar_url?: string } | null };

          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.user_metadata?.name || "",
            role: (profile?.role as "owner" | "manager" | "agent" | "viewer") || "owner",
            tenant_id: profile?.tenant_id || session.user.id, // 프로필의 tenant_id 우선, 없으면 사용자 ID
            avatar_url: profile?.avatar_url || null,
            created_at: session.user.created_at,
            last_sign_in_at: session.user.last_sign_in_at || null,
          });
        } catch (profileError) {
          logger.error("Error fetching profile in auth state change:", { 
            error: profileError 
          });
          // 프로필 가져오기 실패 시 기본 사용자 정보만 설정
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email!,
            role: "owner",
            tenant_id: session.user.id,
            avatar_url: null,
            created_at: session.user.created_at,
            last_sign_in_at: session.user.last_sign_in_at || null,
          });
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (data: SignUpData) => {
    try {
      const result = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            company: data.company,
          },
        },
      });

      // 회원가입 성공 시 사용자 ID를 tenant_id로 사용하여 개별 데이터 관리
      if (result.data.user && !result.error) {
        try {
          logger.info("👤 사용자별 독립 프로필 생성:", { 
            userId: result.data.user.id 
          });

          // 사용자 ID를 tenant_id로 사용하여 완전히 독립적인 데이터 관리
          const { error: profileError } = await supabase
            .from("user_profiles")
            .insert({
              id: result.data.user.id,
              email: data.email,
              name: data.name,
              role: "owner",
              tenant_id: result.data.user.id, // 사용자 ID = tenant_id로 개별 관리
            });

          if (profileError) {
            logger.error("Error creating user profile:", { 
              error: profileError 
            });
          } else {
            logger.info("✅ 사용자별 독립 프로필 생성 완료");
          }
        } catch (error) {
          logger.error("Error in profile creation process:", { error });
        }
      }

      return result;
    } catch (error) {
      logger.error("Sign up error:", { error });
      return { user: null, error: error as AuthError };
    }
  };

  const signIn = async (data: SignInData) => {
    try {
      const result = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      return result;
    } catch (error) {
      logger.error("Sign in error:", { error });
      return { user: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const result = await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      return result;
    } catch (error) {
      logger.error("Sign out error:", { error });
      return { error: error as AuthError };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return result;
    } catch (error) {
      logger.error("Reset password error:", { error });
      return { error: error as AuthError };
    }
  };

  const getCurrentUser = async (): Promise<AuthUser | null> => {
    try {
      logger.info("🔍 getCurrentUser 호출됨");
      
      // 1. 컨텍스트에 사용자가 있으면 반환
      if (user && !loading) {
        logger.info("✅ 컨텍스트에서 사용자 반환", { userId: user.id });
        return user;
      }
      
      // 2. Supabase에서 직접 확인 (세션 새로고침 포함)
      logger.info("🔄 Supabase 세션 새로고침 시도...");
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        logger.warn("⚠️ 세션 새로고침 실패, 직접 사용자 확인:", { error: refreshError.message });
      } else if (refreshData.session) {
        logger.info("✅ 세션 새로고침 성공");
      }
      
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
      
      if (error || !supabaseUser) {
        logger.error("❌ getCurrentUser 실패:", { error: error?.message });
        return null;
      }
      
      // 3. 프로필 정보와 함께 AuthUser 객체 생성
      try {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", supabaseUser.id)
          .single();

        const authUser: AuthUser = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: profile?.name || supabaseUser.user_metadata?.name || "",
          role: profile?.role || "owner",
          tenant_id: profile?.tenant_id || supabaseUser.id, // 프로필의 tenant_id 우선, 없으면 사용자 ID
          avatar_url: profile?.avatar_url || null,
          created_at: supabaseUser.created_at,
          last_sign_in_at: supabaseUser.last_sign_in_at || null,
        };

        logger.info("✅ getCurrentUser 성공:", { userId: authUser.id });
        return authUser;
      } catch (profileError) {
        logger.error("프로필 조회 실패, 기본 사용자 정보 반환:", { error: profileError });
        
        const authUser: AuthUser = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.name || supabaseUser.email!,
          role: "owner",
          tenant_id: supabaseUser.id,
          avatar_url: null,
          created_at: supabaseUser.created_at,
          last_sign_in_at: supabaseUser.last_sign_in_at || null,
        };

        return authUser;
      }
    } catch (error) {
      logger.error("getCurrentUser 전체 실패:", { error });
      return null;
    }
  };

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      getCurrentUser,
    }),
    [user, session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
