// ============================================================================
// 구독 및 결제 관련 타입 정의
// ============================================================================

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'

export type BillingCycle = 'monthly' | 'yearly'

export interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  description: string
  
  // 가격 정보
  price_monthly: number // 월간 가격 (원)
  price_yearly: number // 연간 가격 (원)
  yearly_discount: number // 연간 할인율 (0.17 = 17%)
  
  // 제한사항
  limits: {
    max_properties: number
    max_users: number
    max_storage_gb: number
    max_api_calls_per_month: number
  }
  
  // 포함 기능
  features: string[]
  
  // Stripe 관련
  stripe_price_id_monthly: string
  stripe_price_id_yearly: string
  
  // 메타데이터
  is_popular?: boolean
  is_enterprise?: boolean
  sort_order: number
  is_active: boolean
}

export interface Subscription {
  id: string
  tenant_id: string
  
  // 플랜 정보
  plan_id: string
  plan: SubscriptionPlan
  
  // 상태
  status: SubscriptionStatus
  billing_cycle: BillingCycle
  
  // 날짜
  trial_start?: string
  trial_end?: string
  current_period_start: string
  current_period_end: string
  canceled_at?: string
  ended_at?: string
  
  // Stripe 관련
  stripe_subscription_id?: string
  stripe_customer_id?: string
  
  // 사용량 추적
  usage: SubscriptionUsage
  
  // 메타데이터
  created_at: string
  updated_at: string
}

export interface SubscriptionUsage {
  properties_count: number
  users_count: number
  storage_used_gb: number
  api_calls_this_month: number
  
  // 한도 대비 사용률 (0.0 - 1.0)
  properties_usage_ratio: number
  users_usage_ratio: number
  storage_usage_ratio: number
  api_calls_usage_ratio: number
}

export interface Invoice {
  id: string
  tenant_id: string
  subscription_id: string
  
  // 금액 정보
  subtotal: number
  tax: number
  total: number
  currency: string
  
  // 기간
  period_start: string
  period_end: string
  
  // 상태
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  
  // Stripe 관련
  stripe_invoice_id?: string
  hosted_invoice_url?: string
  invoice_pdf?: string
  
  // 날짜
  due_date?: string
  paid_at?: string
  created_at: string
}

export interface PaymentMethod {
  id: string
  tenant_id: string
  
  // 카드 정보
  type: 'card'
  card: {
    brand: string // 'visa', 'mastercard', etc.
    last4: string
    exp_month: number
    exp_year: number
  }
  
  // 상태
  is_default: boolean
  
  // Stripe 관련
  stripe_payment_method_id: string
  
  // 메타데이터
  created_at: string
}

// 구독 생성 요청
export interface CreateSubscriptionRequest {
  plan_id: string
  billing_cycle: BillingCycle
  payment_method_id?: string
  trial_days?: number
}

// 구독 업데이트 요청
export interface UpdateSubscriptionRequest {
  plan_id?: string
  billing_cycle?: BillingCycle
}

// 구독 취소 요청
export interface CancelSubscriptionRequest {
  reason?: string
  cancel_immediately?: boolean // true: 즉시 취소, false: 기간 만료 시 취소
}

// 결제 설정
export interface BillingSettings {
  company_name?: string
  billing_email?: string
  tax_id?: string
  billing_address: {
    line1: string
    line2?: string
    city: string
    state?: string
    postal_code: string
    country: string
  }
  auto_billing: boolean
  invoice_language: string
}

// 사용량 알림 설정
export interface UsageAlert {
  id: string
  tenant_id: string
  resource: 'properties' | 'users' | 'storage' | 'api_calls'
  threshold: number // 0.8 = 80% 사용 시 알림
  is_enabled: boolean
  notification_methods: ('email' | 'dashboard')[]
  created_at: string
}

// 구독 변경 미리보기
export interface SubscriptionChangePreview {
  current_plan: SubscriptionPlan
  new_plan: SubscriptionPlan
  proration_amount: number // 일할 계산 금액
  next_invoice_amount: number
  effective_date: string
}

// 플랜 비교용 타입
export interface PlanComparison {
  plans: SubscriptionPlan[]
  feature_matrix: {
    feature_name: string
    category: string
    plans: Record<string, boolean | string | number>
  }[]
}