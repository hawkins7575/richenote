// ============================================================================
// 인증 컨텍스트 - Supabase Auth 통합
// ============================================================================

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'
import type { AuthUser, SignUpData, SignInData } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signUp: (data: SignUpData) => Promise<any>
  signIn: (data: SignInData) => Promise<any>
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
    // 데모 모드 - 개발자 도구에서만 활성화 (일반 사용자는 사용 불가)
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' && import.meta.env.DEV
    
    console.log('🔍 환경 확인:', { 
      hostname: window.location.hostname, 
      isDemoMode,
      VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
      DEV: import.meta.env.DEV 
    })
    
    // 데모 모드는 개발자만 사용 (일반적으로 비활성화)
    if (isDemoMode && false) { // false로 설정하여 데모 모드 완전 비활성화
      console.log('🎭 데모 모드 - 자동 로그인')
      const demoUser: AuthUser = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'demo@propertydesk.com',
        name: '김대성',
        role: 'owner',
        tenant_id: '00000000-0000-0000-0000-000000000001',
        avatar_url: null,
        created_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
      }
      
      setUser(demoUser)
      setLoading(false)
      return
    }

    // 초기 세션 확인 (타임아웃 포함)
    const getSession = async () => {
      try {
        // 5초 타임아웃 설정
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        )
        
        const sessionPromise = supabase.auth.getSession()
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise, 
          timeoutPromise
        ]) as any
        
        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }
        
        setSession(session)
        if (session?.user) {
          try {
            // 사용자 프로필 정보 가져오기 (타임아웃 포함)
            const profilePromise = supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
              
            const profileTimeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
            )
            
            const { data: profile } = await Promise.race([
              profilePromise,
              profileTimeoutPromise
            ]) as any

            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: profile?.name || session.user.user_metadata?.name || '',
              role: profile?.role || 'owner',
              tenant_id: profile?.tenant_id || null,
              avatar_url: profile?.avatar_url || null,
              created_at: session.user.created_at,
              last_sign_in_at: session.user.last_sign_in_at || null,
            })
          } catch (profileError) {
            console.error('Error fetching profile:', profileError)
            // 프로필 가져오기 실패 시 기본 사용자 정보만 설정
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name || session.user.email!,
              role: 'owner',
              tenant_id: null,
              avatar_url: null,
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

    // 인증 상태 변경 리스너 (타임아웃 포함)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.id, session?.user?.email)
        
        setSession(session)
        
        if (session?.user) {
          try {
            // 사용자 프로필 정보 가져오기 (타임아웃 포함)
            const profilePromise = supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
              
            const profileTimeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
            )
            
            const { data: profile } = await Promise.race([
              profilePromise,
              profileTimeoutPromise
            ]) as any

            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: profile?.name || session.user.user_metadata?.name || '',
              role: profile?.role || 'owner',
              tenant_id: profile?.tenant_id || null,
              avatar_url: profile?.avatar_url || null,
              created_at: session.user.created_at,
              last_sign_in_at: session.user.last_sign_in_at || null,
            })
          } catch (profileError) {
            console.error('Error fetching profile in auth state change:', profileError)
            // 프로필 가져오기 실패 시 기본 사용자 정보만 설정
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name || session.user.email!,
              role: 'owner',
              tenant_id: null,
              avatar_url: null,
              created_at: session.user.created_at,
              last_sign_in_at: session.user.last_sign_in_at || null,
            })
          }
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

      // 회원가입 성공 시 새 테넌트 생성 및 사용자를 Owner로 설정
      if (result.data.user && !result.error) {
        try {
          // create_tenant_and_owner 함수 호출하여 독립적인 테넌트 생성
          console.log('🏢 Creating tenant for user:', result.data.user.id)
          
          const rpcPromise = supabase.rpc('create_tenant_and_owner', {
            tenant_name: data.company || `${data.name}의 부동산`,
            user_name: data.name,
            user_company: data.company
          })
          
          const rpcTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Tenant creation timeout')), 10000)
          )
          
          const { data: tenantData, error: tenantError } = await Promise.race([
            rpcPromise,
            rpcTimeoutPromise
          ]) as any

          if (tenantError) {
            console.error('Error creating tenant:', tenantError)
            // 테넌트 생성 실패 시 기본 프로필만 생성
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert({
                id: result.data.user.id,
                email: data.email,
                name: data.name,
                role: 'owner', // 첫 번째 사용자는 Owner
                tenant_id: null,
              })

            if (profileError) {
              console.error('Error creating user profile:', profileError)
            }
          } else {
            console.log('✅ 새 테넌트 생성 완료:', tenantData)
          }
        } catch (error) {
          console.error('Error in tenant creation process:', error)
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

  const value = useMemo(() => ({
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }), [user, session, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}