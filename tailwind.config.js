/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SaaS 브랜딩 색상 시스템
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // 매물 상태별 색상
        status: {
          available: '#059669',     // 판매중 - 초록
          reserved: '#d97706',      // 예약중 - 주황
          sold: '#6b7280',          // 거래완료 - 회색
        },
        // 거래유형별 색상
        transaction: {
          sale: '#dc2626',          // 매매 - 빨강
          jeonse: '#059669',        // 전세 - 초록
          monthly: '#2563eb',       // 월세 - 파랑
        },
        // 테넌트별 커스텀 색상 (CSS 변수로 동적 변경)
        tenant: {
          primary: 'var(--tenant-primary, #3b82f6)',
          secondary: 'var(--tenant-secondary, #6b7280)',
          accent: 'var(--tenant-accent, #f59e0b)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}