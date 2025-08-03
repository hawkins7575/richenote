// ============================================================================
// 회원가입 폼
// ============================================================================

import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Building, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import type { SignUpData } from '@/types'

interface SignUpFormProps {
  onBackToLogin: () => void
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onBackToLogin }) => {
  const { signUp } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<SignUpData & { confirmPassword: string }>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    company: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setLoading(false)
      return
    }

    // 비밀번호 강도 검사
    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      setLoading(false)
      return
    }

    const { error } = await signUp({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      company: formData.company,
    })

    if (error) {
      if (error.message.includes('User already registered')) {
        setError('이미 등록된 이메일 주소입니다.')
      } else {
        setError(error.message)
      }
    } else {
      setSuccess('회원가입이 완료되었습니다! 이메일을 확인해주세요.')
      
      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        onBackToLogin()
      }, 3000)
    }

    setLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 및 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full text-white text-2xl font-bold mb-4">
            리
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            리체 매물장
          </h1>
          <p className="text-gray-600">
            부동산 전문 관리 솔루션
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <button
                onClick={onBackToLogin}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <CardTitle>회원가입</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 베타 테스트 안내 */}
              <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                <CheckCircle size={16} />
                <span className="text-sm">
                  <strong>베타 테스트 중:</strong> 이메일 인증 없이 즉시 로그인 가능합니다.
                </span>
              </div>

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

              {/* 이름 */}
              <div>
                <Input
                  type="text"
                  name="name"
                  placeholder="이름"
                  value={formData.name}
                  onChange={handleInputChange}
                  leftIcon={<User size={20} />}
                  required
                />
              </div>

              {/* 회사명 */}
              <div>
                <Input
                  type="text"
                  name="company"
                  placeholder="회사명 (선택사항)"
                  value={formData.company}
                  onChange={handleInputChange}
                  leftIcon={<Building size={20} />}
                />
              </div>

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

              {/* 비밀번호 */}
              <div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="비밀번호 (8자 이상)"
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

              {/* 비밀번호 확인 */}
              <div>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="비밀번호 확인"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    leftIcon={<Lock size={20} />}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* 비밀번호 강도 표시 */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex space-x-1">
                    <div className={`h-1 flex-1 rounded ${
                      formData.password.length >= 8 ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div className={`h-1 flex-1 rounded ${
                      formData.password.length >= 12 ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                    <div className={`h-1 flex-1 rounded ${
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password) 
                        ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  </div>
                  <p className="text-xs text-gray-600">
                    최소 8자, 12자 이상 및 특수문자 포함 권장
                  </p>
                </div>
              )}

              {/* 회원가입 버튼 */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
                disabled={success !== null}
              >
                회원가입
              </Button>
            </form>

            {/* 로그인 링크 */}
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <button
                  onClick={onBackToLogin}
                  className="text-primary-600 hover:text-primary-700 font-medium underline"
                >
                  로그인
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 푸터 */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 리체 매물장. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}