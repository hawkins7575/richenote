import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({mode}) => ({
  plugins: [react({
    // JSX runtime 최적화
    jsxRuntime: 'automatic'
  })],
  
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@/components": resolve(__dirname, "./src/components"),
      "@/types": resolve(__dirname, "./src/types"),
      "@/lib": resolve(__dirname, "./src/lib"),
      "@/hooks": resolve(__dirname, "./src/hooks"),
      "@/services": resolve(__dirname, "./src/services"),
      "@/utils": resolve(__dirname, "./src/utils"),
      "@/stores": resolve(__dirname, "./src/stores"),
      "@/constants": resolve(__dirname, "./src/constants"),
    },
  },
  
  // 개발 서버 최적화
  server: {
    port: 3000,
    host: 'localhost',
    open: false,
    strictPort: false,
    cors: true,
    // HMR 최적화
    hmr: {
      overlay: false, // 에러 오버레이 비활성화로 성능 향상
    },
    // 파일 감시 최적화
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**']
    },
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"
    }
  },
  
  // 빌드 최적화
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development', // 개발시에만 소스맵 생성
    minify: 'esbuild', // esbuild로 빠른 minification
    target: 'es2020', // 최신 브라우저 대상으로 최적화
    cssMinify: 'esbuild',
    reportCompressedSize: false, // 압축 크기 리포트 비활성화로 빌드 속도 향상
    
    rollupOptions: {
      output: {
        // 청크 분할 최적화
        manualChunks: {
          // React 관련
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI 라이브러리
          'ui-vendor': ['@headlessui/react', 'lucide-react', 'recharts'],
          // 백엔드 서비스
          'supabase-vendor': ['@supabase/supabase-js'],
          // 폼 관련
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // 유틸리티
          'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge'],
          // 상태 관리
          'state-vendor': ['zustand', 'react-query'],
        },
        // 파일명 최적화
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
  },
  
  // 의존성 최적화
  optimizeDeps: {
    // 사전 번들링할 의존성 명시
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react',
      '@headlessui/react',
      'recharts',
      'react-hook-form',
      'date-fns',
      'clsx',
      'tailwind-merge'
    ],
    // 제외할 의존성
    exclude: ['@types/node']
  },
  
  // CSS 최적화
  css: {
    devSourcemap: mode === 'development',
    preprocessorOptions: {
      scss: {
        charset: false
      }
    }
  },
  
  // ESBuild 최적화
  esbuild: {
    target: 'es2020',
    // Production에서 console.log 제거
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    // 더 나은 트리 쉐이킹
    treeShaking: true
  }
}))