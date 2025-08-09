// ============================================================================
// 고급 모바일 감지 훅
// ============================================================================

import { useState, useEffect } from 'react'

export interface MobileDetectionResult {
  isMobile: boolean
  width: number
  height: number
  detectionDetails: {
    isMobileWidth: boolean
    isMobileUA: boolean
    isTouchDevice: boolean
    isPortraitOrientation: boolean
    mediaQueryMatch: boolean
    isHighDPR: boolean
    mobileScore: number
    userAgent: string
  }
}

/**
 * 고급 모바일 디바이스 감지 훅
 * 
 * 다중 감지 방식을 사용하여 크롬 모바일을 포함한 모든 모바일 디바이스를 정확히 감지
 * - 화면 크기 기반 감지 (가중치 높음)
 * - 개선된 User-Agent 패턴 매칭 (크롬 모바일 특화)
 * - 터치 기능 지원 여부
 * - 화면 방향 및 비율
 * - CSS 미디어 쿼리 매치
 * - 디바이스 픽셀 비율
 */
export const useMobileDetection = (): MobileDetectionResult => {
  const [detection, setDetection] = useState<MobileDetectionResult>({
    isMobile: false,
    width: 0,
    height: 0,
    detectionDetails: {
      isMobileWidth: false,
      isMobileUA: false,
      isTouchDevice: false,
      isPortraitOrientation: false,
      mediaQueryMatch: false,
      isHighDPR: false,
      mobileScore: 0,
      userAgent: ''
    }
  })

  useEffect(() => {
    const detectMobile = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const userAgent = navigator.userAgent.toLowerCase()
      
      // 1. 화면 크기 기반 감지 (우선순위 1)
      const isMobileWidth = width < 1024 // lg breakpoint
      
      // 2. 개선된 User-Agent 감지 (크롬 모바일 특화)
      const isMobileUA = (
        // 기본 모바일 디바이스
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
        // 크롬 모바일 특화 패턴
        (userAgent.includes('chrome') && userAgent.includes('mobile')) ||
        (userAgent.includes('chrome') && userAgent.includes('android')) ||
        // 삼성 브라우저
        userAgent.includes('samsungbrowser') ||
        // 기타 모바일 브라우저
        userAgent.includes('mobile') ||
        userAgent.includes('phone')
      )
      
      // 3. 터치 기능 감지
      const isTouchDevice = 'ontouchstart' in window || 
                           navigator.maxTouchPoints > 0 ||
                           // @ts-ignore - IE 호환성
                           navigator.msMaxTouchPoints > 0
      
      // 4. 화면 비율 감지 (모바일은 보통 세로가 더 김)
      const isPortraitOrientation = height > width
      
      // 5. CSS 미디어 쿼리 매치 감지
      const mediaQueryMatch = window.matchMedia('(max-width: 1023px)').matches
      
      // 6. 디바이스 픽셀 비율 (모바일은 보통 높음)
      const isHighDPR = window.devicePixelRatio > 1.5
      
      // 7. 추가: 화면 밀도 기반 감지
      const isSmallScreen = width < 768 && height < 1024
      
      // 종합 판단 로직 (가중치 기반 점수 시스템)
      const mobileScore = [
        isMobileWidth ? 3 : 0,           // 화면 크기 (가중치 높음)
        isMobileUA ? 2 : 0,              // User-Agent (크롬 모바일 포함)
        isTouchDevice ? 1.5 : 0,         // 터치 지원 (중요도 상승)
        (isPortraitOrientation && width < 800) ? 1 : 0,  // 세로 방향 + 좁은 화면
        mediaQueryMatch ? 1 : 0,         // CSS 미디어 쿼리
        isHighDPR ? 0.5 : 0,             // 고해상도 (보너스)
        isSmallScreen ? 1 : 0            // 작은 화면 (추가 보너스)
      ].reduce((sum, score) => sum + score, 0)
      
      const finalIsMobile = mobileScore >= 3 // 임계값 3점
      
      const detectionDetails = {
        isMobileWidth,
        isMobileUA,
        isTouchDevice,
        isPortraitOrientation,
        mediaQueryMatch,
        isHighDPR,
        mobileScore,
        userAgent: navigator.userAgent
      }

      // 디버깅 정보 출력
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 고급 모바일 감지 결과:', { 
          width, 
          height,
          finalIsMobile,
          ...detectionDetails
        })
      }

      setDetection({
        isMobile: finalIsMobile,
        width,
        height,
        detectionDetails
      })
    }

    // 초기 감지
    detectMobile()
    
    // 이벤트 리스너 등록
    window.addEventListener('resize', detectMobile)
    window.addEventListener('orientationchange', detectMobile)
    
    return () => {
      window.removeEventListener('resize', detectMobile)
      window.removeEventListener('orientationchange', detectMobile)
    }
  }, [])

  return detection
}

/**
 * 간단한 모바일 감지 훅 (boolean만 반환)
 */
export const useIsMobile = (): boolean => {
  const { isMobile } = useMobileDetection()
  return isMobile
}