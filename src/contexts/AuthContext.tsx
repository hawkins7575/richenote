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
        } = (await Promise.race([sessionPromise, timeoutPromise])) as any;

        if (error) {
          logger.error("Error getting session:", error);
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

            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: profile?.name || session.user.user_metadata?.name || "",
              role: profile?.role || "owner",
              tenant_id: session.user.id, // 사용자 ID를 tenant_id로 사용
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

          const { data: profile } = (await Promise.race([
            profilePromise,
            profileTimeoutPromise,
          ])) as any;

          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.user_metadata?.name || "",
            role: profile?.role || "owner",
            tenant_id: session.user.id, // 사용자 ID를 tenant_id로 사용
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

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
    }),
    [user, session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
