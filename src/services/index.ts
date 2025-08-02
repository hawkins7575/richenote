// ============================================================================
// 서비스 레이어 - 환경별 서비스 선택
// ============================================================================

import * as mockService from './mockPropertyService'
// import * as realService from './propertyService'

console.log('🔧 개발 모드: 모의 서비스 사용 중')

// 개발 환경에서는 항상 모의 서비스 사용
const propertyService = mockService

export const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
  getPropertyStats,
  togglePropertyFavorite
} = propertyService