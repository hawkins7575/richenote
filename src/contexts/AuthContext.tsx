// ============================================================================
// 인증 컨텍스트 - Supabase Auth 통합
// ============================================================================

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'
import type { AuthUser, SignUpData, SignInData } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signUp: (data: SignUpData) => Promise<{ user: User | null; error: AuthError | null }>
  signIn: (data: SignInData) => Promise<{ user: User | null; error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 개발 환경에서 데모 사용자 자동 로그인
    if (import.meta.env.VITE_APP_ENV === 'development') {
      const demoUser: AuthUser = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'demo@propertydesk.com',
        name: '데모 관리자',
        role: 'admin',
        tenant_id: '00000000-0000-0000-0000-000000000001',
        avatar_url: null,
        created_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
      }
      
      setUser(demoUser)
      setLoading(false)
      return
    }

    // 초기 세션 확인
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        } else {
          setSession(session)
          if (session?.user) {
            // 사용자 프로필 정보 가져오기
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: profile?.name || session.user.user_metadata?.name || '',
              role: profile?.role || 'agent',
              tenant_id: profile?.tenant_id || null,
              avatar_url: profile?.avatar_url || null,
              created_at: session.user.created_at,
              last_sign_in_at: session.user.last_sign_in_at || null,
            })
          }
        }
      } catch (error) {
        console.error('Error in getSession:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        
        setSession(session)
        
        if (session?.user) {
          // 사용자 프로필 정보 가져오기
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.user_metadata?.name || '',
            role: profile?.role || 'agent',
            tenant_id: profile?.tenant_id || null,
            avatar_url: profile?.avatar_url || null,
            created_at: session.user.created_at,
            last_sign_in_at: session.user.last_sign_in_at || null,
          })
        } else {
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (data: SignUpData) => {
    try {
      const result = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            company: data.company,
          }
        }
      })

      // 회원가입 성공 시 user_profiles 테이블에 프로필 생성
      if (result.data.user && !result.error) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: result.data.user.id,
            email: data.email,
            name: data.name,
            role: 'admin', // 첫 번째 사용자는 관리자
            tenant_id: null, // 추후 테넌트 생성 시 업데이트
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
        }
      }

      return result
    } catch (error) {
      console.error('Sign up error:', error)
      return { user: null, error: error as AuthError }
    }
  }

  const signIn = async (data: SignInData) => {
    try {
      const result = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      return result
    } catch (error) {
      console.error('Sign in error:', error)
      return { user: null, error: error as AuthError }
    }
  }

  const signOut = async () => {
    try {
      const result = await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      return result
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: error as AuthError }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return result
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: error as AuthError }
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}