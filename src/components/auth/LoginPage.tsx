// ============================================================================
// 로그인 페이지
// ============================================================================

import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { SignUpForm } from './SignUpForm'
import type { SignInData } from '@/types'

export const LoginPage: React.FC = () => {
  const { signIn, resetPassword } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [isResetPassword, setIsResetPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<SignInData>({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (isResetPassword) {
      const { error } = await resetPassword(formData.email)
      if (error) {
        setError(error.message)
      } else {
        setSuccess('비밀번호 재설정 이메일을 보냈습니다.')
        setIsResetPassword(false)
      }
    } else {
      const { error } = await signIn(formData)
      if (error) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      }
    }

    setLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
    setSuccess(null)
  }

  if (isSignUp) {
    return <SignUpForm onBackToLogin={() => setIsSignUp(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 및 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full text-white text-2xl font-bold mb-4">
            P
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PropertyDesk
          </h1>
          <p className="text-gray-600">
            부동산 전문 관리 솔루션
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">
              {isResetPassword ? '비밀번호 재설정' : '로그인'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 오류/성공 메시지 */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              {success && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  <CheckCircle size={16} />
                  <span className="text-sm">{success}</span>
                </div>
              )}

              {/* 이메일 */}
              <div>
                <Input
                  type="email"
                  name="email"
                  placeholder="이메일 주소"
                  value={formData.email}
                  onChange={handleInputChange}
                  leftIcon={<Mail size={20} />}
                  required
                />
              </div>

              {/* 비밀번호 (비밀번호 재설정이 아닌 경우만) */}
              {!isResetPassword && (
                <div>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="비밀번호"
                      value={formData.password}
                      onChange={handleInputChange}
                      leftIcon={<Lock size={20} />}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}

              {/* 로그인/재설정 버튼 */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
              >
                {isResetPassword ? '재설정 이메일 전송' : '로그인'}
              </Button>

              {/* 비밀번호 재설정 링크 */}
              {!isResetPassword && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsResetPassword(true)}
                    className="text-sm text-primary-600 hover:text-primary-700 underline"
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                </div>
              )}

              {/* 뒤로 가기 */}
              {isResetPassword && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetPassword(false)
                      setError(null)
                      setSuccess(null)
                    }}
                    className="text-sm text-gray-600 hover:text-gray-700 underline"
                  >
                    로그인으로 돌아가기
                  </button>
                </div>
              )}
            </form>

            {/* 회원가입 링크 */}
            {!isResetPassword && (
              <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  계정이 없으신가요?{' '}
                  <button
                    onClick={() => setIsSignUp(true)}
                    className="text-primary-600 hover:text-primary-700 font-medium underline"
                  >
                    회원가입
                  </button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 푸터 */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 PropertyDesk. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}