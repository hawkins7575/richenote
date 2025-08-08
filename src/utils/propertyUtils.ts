// ============================================================================
// 매물 관련 유틸리티 함수들
// ============================================================================

import { Property } from '@/types/property'

/**
 * 주소에서 동(네이버후드) 추출
 */
export const extractNeighborhood = (address: string): string => {
  // 주소에서 동 단위 추출 (예: "서울특별시 강남구 신사동 123-45" → "신사동")
  const parts = address.split(' ')
  
  // 동으로 끝나는 부분 찾기
  const dong = parts.find(part => part.endsWith('동'))
  if (dong) return dong
  
  // 동이 없으면 구 단위 반환
  const gu = parts.find(part => part.endsWith('구'))
  if (gu) return gu
  
  // 그것도 없으면 마지막 두 단어 반환
  return parts.slice(-2).join(' ')
}

/**
 * 가격 포맷팅
 */
export const formatPrice = (property: Property): string => {
  const { transaction_type, price, deposit, monthly_rent, title } = property
  
  // 매매가 디버깅 (모든 매물)
  if (transaction_type === '매매') {
    console.log('🔍 매매가 가격 포맷팅:', {
      title,
      transaction_type,
      price,
      priceType: typeof price,
      result: price ? `${formatMoney(price)}` : '가격 협의'
    })
  }
  
  switch (transaction_type) {
    case '매매':
      return price ? `${formatMoney(price)}` : '가격 협의'
    
    case '전세':
      return deposit ? `전세 ${formatMoney(deposit)}` : '보증금 협의'
    
    case '월세':
      const depositStr = deposit ? formatMoney(deposit) : '0'
      const rentStr = monthly_rent ? formatMoney(monthly_rent) : '0'
      return `${depositStr}/${rentStr}`
    
    case '단기임대':
      return monthly_rent ? `월 ${formatMoney(monthly_rent)}` : '가격 협의'
    
    default:
      return '가격 정보 없음'
  }
}

/**
 * 금액을 억/만원 단위로 포맷팅
 */
export const formatMoney = (amount: number): string => {
  // 매매가 관련 디버깅 (고액 매매가 추적)
  if (amount >= 10000) {
    console.log('💰 formatMoney 매매가 디버깅:', {
      amount,
      type: typeof amount,
      eok: Math.floor(amount / 10000),
      man: amount % 10000,
      결과: amount >= 10000 ? 
        (amount % 10000 === 0 ? `${Math.floor(amount / 10000)}억` : `${Math.floor(amount / 10000)}억 ${(amount % 10000).toLocaleString()}만원`) :
        `${amount.toLocaleString()}만원`
    })
  }
  
  if (amount >= 10000) {
    const eok = Math.floor(amount / 10000)
    const man = amount % 10000
    
    if (man === 0) {
      return `${eok}억`
    } else {
      return `${eok}억 ${man.toLocaleString()}만원`
    }
  } else {
    return `${amount.toLocaleString()}만원`
  }
}

/**
 * 면적 포맷팅
 */
export const formatArea = (area: number): string => {
  const pyeong = (area / 3.3058).toFixed(1)
  return `${area}㎡ (${pyeong}평)`
}

/**
 * 매물 상태에 따른 색상 클래스 반환
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case '거래중':
      return 'text-green-600'
    case '거래완료':
      return 'text-gray-600'
    default:
      return 'text-gray-600'
  }
}

/**
 * 매물 상태에 따른 배경 색상 클래스 반환
 */
export const getStatusBgColor = (status: string): string => {
  switch (status) {
    case '거래중':
      return 'bg-green-100'
    case '거래완료':
      return 'bg-gray-100'
    default:
      return 'bg-gray-100'
  }
}

/**
 * 상대적 시간 표시 (예: "2시간 전", "3일 전")
 */
export const getRelativeTime = (dateString: string): string => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)
  
  if (diffInHours < 1) {
    return '방금 전'
  } else if (diffInHours < 24) {
    return `${diffInHours}시간 전`
  } else if (diffInDays < 7) {
    return `${diffInDays}일 전`
  } else {
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric'
    })
  }
}

/**
 * 퇴실날짜까지 남은 일수 계산
 */
export const getDaysUntilExit = (exitDate: string): number => {
  const today = new Date()
  const exit = new Date(exitDate)
  const diffInMs = exit.getTime() - today.getTime()
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
}

/**
 * 퇴실날짜 긴급도 판단
 */
export const getExitUrgency = (exitDate: string): 'urgent' | 'warning' | 'normal' => {
  const daysLeft = getDaysUntilExit(exitDate)
  
  if (daysLeft <= 7) {
    return 'urgent'
  } else if (daysLeft <= 30) {
    return 'warning'
  } else {
    return 'normal'
  }
}

/**
 * 매물 카드에 표시할 핵심 정보만 추출
 */
export const getPropertyCardData = (property: Property) => {
  return {
    id: property.id,
    title: property.title,
    neighborhood: extractNeighborhood(property.address),
    price: formatPrice(property),
    exitDate: property.exit_date,
    status: /* status removed */ "거래중",
    type: property.type,
    transactionType: property.transaction_type,
    isUrgent: property.is_urgent,
    createdAt: property.created_at
  }
}