// ============================================================================
// SaaS 요금제 정의 (계획서 기반)
// ============================================================================

import type { SubscriptionPlan } from '@/types/subscription'

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    slug: 'starter',
    description: '개인 중개사, 소규모 업체를 위한 기본 플랜',
    price_monthly: 19000,
    price_yearly: 188000, // 17% 할인
    yearly_discount: 0.17,
    limits: {
      max_properties: 50,
      max_users: 2,
      max_storage_gb: 1,
      max_api_calls_per_month: 1000,
    },
    features: [
      '매물 관리 (최대 50개)',
      '사용자 2명',
      '모바일 앱 지원',
      '기본 검색 및 필터링',
      '이메일 지원',
      '1GB 스토리지',
    ],
    stripe_price_id_monthly: 'price_starter_monthly',
    stripe_price_id_yearly: 'price_starter_yearly',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    slug: 'professional',
    description: '중소형 부동산업체를 위한 전문가 플랜',
    price_monthly: 49000,
    price_yearly: 489000, // 17% 할인
    yearly_discount: 0.17,
    limits: {
      max_properties: 300,
      max_users: 8,
      max_storage_gb: 10,
      max_api_calls_per_month: 10000,
    },
    features: [
      '매물 관리 (최대 300개)',
      '사용자 8명',
      '고급 검색 및 필터링',
      'CRM 시스템',
      '분석 대시보드',
      '자동화 워크플로우',
      '우선 지원',
      '10GB 스토리지',
      '매물 템플릿',
    ],
    stripe_price_id_monthly: 'price_professional_monthly',
    stripe_price_id_yearly: 'price_professional_yearly',
    is_popular: true,
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'business',
    name: 'Business',
    slug: 'business',
    description: '대형 부동산업체, 프랜차이즈를 위한 비즈니스 플랜',
    price_monthly: 89000,
    price_yearly: 888000, // 17% 할인
    yearly_discount: 0.17,
    limits: {
      max_properties: 1000,
      max_users: 25,
      max_storage_gb: 100,
      max_api_calls_per_month: 100000,
    },
    features: [
      '매물 관리 (최대 1,000개)',
      '사용자 25명',
      '모든 Professional 기능',
      '고급 분석 및 리포팅',
      'API 접근',
      '맞춤형 브랜딩',
      '전화 지원',
      '100GB 스토리지',
      '대량 매물 가져오기/내보내기',
      '팀 관리 기능',
    ],
    stripe_price_id_monthly: 'price_business_monthly',
    stripe_price_id_yearly: 'price_business_yearly',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    slug: 'enterprise',
    description: '대형 프랜차이즈, 공기업을 위한 엔터프라이즈 플랜',
    price_monthly: 0, // 맞춤 견적
    price_yearly: 0,
    yearly_discount: 0,
    limits: {
      max_properties: 999999,
      max_users: 999999,
      max_storage_gb: 999999,
      max_api_calls_per_month: 999999,
    },
    features: [
      '무제한 매물 관리',
      '무제한 사용자',
      '모든 Business 기능',
      '온프레미스 배포 옵션',
      '전담 고객 성공 매니저',
      'SLA 보장 (99.9% 업타임)',
      '맞춤형 개발',
      '고급 보안 기능',
      '무제한 스토리지',
      '우선 기술 지원',
    ],
    stripe_price_id_monthly: '',
    stripe_price_id_yearly: '',
    is_enterprise: true,
    sort_order: 4,
    is_active: true,
  },
]

// 기능별 플랜 매트릭스
export const FEATURE_MATRIX = [
  {
    feature_name: '매물 관리',
    category: '기본 기능',
    plans: {
      starter: '50개',
      professional: '300개',
      business: '1,000개',
      enterprise: '무제한',
    },
  },
  {
    feature_name: '사용자 수',
    category: '기본 기능',
    plans: {
      starter: '2명',
      professional: '8명',
      business: '25명',
      enterprise: '무제한',
    },
  },
  {
    feature_name: '스토리지',
    category: '기본 기능',
    plans: {
      starter: '1GB',
      professional: '10GB',
      business: '100GB',
      enterprise: '무제한',
    },
  },
  {
    feature_name: 'CRM 시스템',
    category: '고급 기능',
    plans: {
      starter: false,
      professional: true,
      business: true,
      enterprise: true,
    },
  },
  {
    feature_name: '분석 대시보드',
    category: '고급 기능',
    plans: {
      starter: false,
      professional: '기본',
      business: '고급',
      enterprise: '전문가',
    },
  },
  {
    feature_name: 'API 접근',
    category: '통합',
    plans: {
      starter: false,
      professional: false,
      business: true,
      enterprise: true,
    },
  },
  {
    feature_name: '맞춤형 브랜딩',
    category: '브랜딩',
    plans: {
      starter: false,
      professional: false,
      business: true,
      enterprise: true,
    },
  },
  {
    feature_name: '지원 수준',
    category: '지원',
    plans: {
      starter: '이메일',
      professional: '우선 이메일',
      business: '전화 + 이메일',
      enterprise: '전담 매니저',
    },
  },
]

// 플랜별 색상 테마
export const PLAN_COLORS = {
  starter: {
    primary: '#10b981', // emerald-500
    background: '#ecfdf5', // emerald-50
    border: '#d1fae5', // emerald-100
  },
  professional: {
    primary: '#3b82f6', // blue-500
    background: '#eff6ff', // blue-50
    border: '#dbeafe', // blue-100
  },
  business: {
    primary: '#8b5cf6', // violet-500
    background: '#f5f3ff', // violet-50
    border: '#e7e5e4', // violet-100
  },
  enterprise: {
    primary: '#f59e0b', // amber-500
    background: '#fffbeb', // amber-50
    border: '#fef3c7', // amber-100
  },
}

// 플랜 헬퍼 함수
export const getPlanById = (planId: string) => {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId)
}

export const getPlanBySlug = (slug: string) => {
  return SUBSCRIPTION_PLANS.find(plan => plan.slug === slug)
}

export const getActivePlans = () => {
  return SUBSCRIPTION_PLANS.filter(plan => plan.is_active)
}

export const getPopularPlan = () => {
  return SUBSCRIPTION_PLANS.find(plan => plan.is_popular)
}

export const calculateYearlyDiscount = (plan: SubscriptionPlan) => {
  const yearlyPrice = plan.price_yearly
  const monthlyPrice = plan.price_monthly * 12
  return monthlyPrice - yearlyPrice
}

export const formatPlanPrice = (price: number, currency = 'KRW') => {
  if (price === 0) return '맞춤 견적'
  
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price)
}

// 플랜 비교 유틸리티
export const comparePlans = (currentPlanId: string, targetPlanId: string) => {
  const currentPlan = getPlanById(currentPlanId)
  const targetPlan = getPlanById(targetPlanId)
  
  if (!currentPlan || !targetPlan) return null
  
  const isUpgrade = targetPlan.sort_order > currentPlan.sort_order
  const isDowngrade = targetPlan.sort_order < currentPlan.sort_order
  
  return {
    isUpgrade,
    isDowngrade,
    priceDifference: targetPlan.price_monthly - currentPlan.price_monthly,
    currentPlan,
    targetPlan,
  }
}