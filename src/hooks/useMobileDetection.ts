// ============================================================================
// 고급 모바일 감지 훅
// ============================================================================

import { useState, useEffect } from "react";
import { logger } from "@/utils/logger";

export interface MobileDetectionResult {
  isMobile: boolean;
  width: number;
  height: number;
  detectionDetails: {
    isMobileWidth: boolean;
    isMobileUA: boolean;
    isTouchDevice: boolean;
    isPortraitOrientation: boolean;
    mediaQueryMatch: boolean;
    isHighDPR: boolean;
    mobileScore: number;
    userAgent: string;
  };
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
      userAgent: "",
    },
  });

  useEffect(() => {
    const detectMobile = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent.toLowerCase();

      // 1. 화면 크기 기반 감지 (우선순위 1)
      const isMobileWidth = width < 1024; // lg breakpoint

      // 2. 강화된 User-Agent 감지 (크롬 모바일 특화)
      const isMobileUA =
        // 기본 모바일 디바이스
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent,
        ) ||
        // 크롬 모바일 특화 패턴 (더 엄격한 조건)
        (userAgent.includes("chrome") && userAgent.includes("mobile")) ||
        (userAgent.includes("chrome") && userAgent.includes("android") && userAgent.includes("mobile")) ||
        (userAgent.includes("crios") && userAgent.includes("mobile")) || // 크롬 iOS
        // 안드로이드 크롬 명확한 패턴
        /chrome.*android.*mobile/i.test(userAgent) ||
        /android.*chrome.*mobile/i.test(userAgent) ||
        // 삼성 브라우저
        userAgent.includes("samsungbrowser") ||
        // 기타 모바일 브라우저
        userAgent.includes("mobile") ||
        userAgent.includes("phone") ||
        // 추가: 웹뷰 패턴
        userAgent.includes("wv") ||
        // 안드로이드 디바이스 명시적 체크
        (userAgent.includes("android") && !userAgent.includes("desktop"));

      // 3. 터치 기능 감지
      const isTouchDevice =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0;

      // 4. 화면 비율 감지 (모바일은 보통 세로가 더 김)
      const isPortraitOrientation = height > width;

      // 5. CSS 미디어 쿼리 매치 감지
      const mediaQueryMatch = window.matchMedia("(max-width: 1023px)").matches;

      // 6. 디바이스 픽셀 비율 (모바일은 보통 높음)
      const isHighDPR = window.devicePixelRatio > 1.5;

      // 7. 추가: 화면 밀도 기반 감지
      const isSmallScreen = width < 768 && height < 1024;

      // 특별 조건: 크롬 모바일 명시적 체크
      const isChromeAndroid = userAgent.includes("chrome") && userAgent.includes("android") && userAgent.includes("mobile");
      const isExplicitMobile = userAgent.includes("mobile") && (width < 768 || isTouchDevice);
      
      // 종합 판단 로직 (가중치 기반 점수 시스템 - 크롬 모바일 최적화)
      let mobileScore = [
        isMobileWidth ? 4 : 0, // 화면 크기 (가중치 최고)
        isMobileUA ? 3 : 0, // User-Agent (크롬 모바일 가중치 증가)
        isTouchDevice ? 2 : 0, // 터치 지원 (중요도 상승)
        isPortraitOrientation && width < 800 ? 1.5 : 0, // 세로 방향 + 좁은 화면
        mediaQueryMatch ? 2 : 0, // CSS 미디어 쿼리 (가중치 증가)
        isHighDPR ? 1 : 0, // 고해상도 (모바일에서 일반적)
        isSmallScreen ? 2 : 0, // 작은 화면 (가중치 증가)
      ].reduce((sum, score) => sum + score, 0);

      // 크롬 모바일이거나 명시적 모바일 조건에서는 점수 보너스
      if (isChromeAndroid || isExplicitMobile) {
        mobileScore += 2;
      }

      // 강제 모바일 모드 조건들 (확실한 모바일 디바이스)
      const forceMobile = 
        // 화면이 작고 터치 기능이 있으면 무조건 모바일
        (width <= 768 && isTouchDevice) ||
        // 모바일 User-Agent이고 화면이 작으면 모바일
        (isMobileUA && width < 1024) ||
        // 크롬 모바일 확실한 패턴
        isChromeAndroid ||
        // 세로 모드이고 화면이 좁으면 모바일
        (isPortraitOrientation && width < 768) ||
        // CSS 미디어 쿼리가 모바일이고 터치가 가능하면 모바일
        (mediaQueryMatch && isTouchDevice);

      const finalIsMobile = forceMobile || mobileScore >= 4; // 강제 모바일 조건 추가

      const detectionDetails = {
        isMobileWidth,
        isMobileUA,
        isTouchDevice,
        isPortraitOrientation,
        mediaQueryMatch,
        isHighDPR,
        mobileScore,
        userAgent: navigator.userAgent,
      };

      // 디버깅 정보 출력 (크롬 모바일 특화)
      if (process.env.NODE_ENV === "development") {
        logger.debug("📱 강화된 모바일 감지 결과", {
          width,
          height,
          finalIsMobile,
          forceMobile,
          isChromeAndroid,
          isExplicitMobile,
          forceConditions: {
            smallWithTouch: width <= 768 && isTouchDevice,
            mobileUAWithSmallScreen: isMobileUA && width < 1024,
            chromeAndroid: isChromeAndroid,
            portraitSmall: isPortraitOrientation && width < 768,
            mediaQueryWithTouch: mediaQueryMatch && isTouchDevice,
          },
          mobileScoreBreakdown: {
            width: isMobileWidth ? 4 : 0,
            userAgent: isMobileUA ? 3 : 0,
            touch: isTouchDevice ? 2 : 0,
            portrait: isPortraitOrientation && width < 800 ? 1.5 : 0,
            mediaQuery: mediaQueryMatch ? 2 : 0,
            highDPR: isHighDPR ? 1 : 0,
            smallScreen: isSmallScreen ? 2 : 0,
            bonus: (isChromeAndroid || isExplicitMobile) ? 2 : 0,
            total: mobileScore
          },
          ...detectionDetails,
        });
      }

      setDetection({
        isMobile: finalIsMobile,
        width,
        height,
        detectionDetails,
      });
    };

    // 초기 감지
    detectMobile();

    // 이벤트 리스너 등록
    window.addEventListener("resize", detectMobile);
    window.addEventListener("orientationchange", detectMobile);

    return () => {
      window.removeEventListener("resize", detectMobile);
      window.removeEventListener("orientationchange", detectMobile);
    };
  }, []);

  return detection;
};

/**
 * 간단한 모바일 감지 훅 (boolean만 반환)
 */
export const useIsMobile = (): boolean => {
  const { isMobile } = useMobileDetection();
  return isMobile;
};
