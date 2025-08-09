// ============================================================================
// PWA 설치 프롬프트 컴포넌트 - PC 바로가기 만들기
// ============================================================================

import React, { useState, useEffect } from 'react'
import { Download, X, Monitor } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // PWA 설치 가능 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    // PWA 설치 완료 이벤트 리스너
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    // 이미 설치되었는지 확인
    const checkIfInstalled = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    checkIfInstalled()

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('✅ PWA 설치 승인됨')
        setShowInstallPrompt(false)
      } else {
        console.log('❌ PWA 설치 거부됨')
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('PWA 설치 오류:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // 24시간 후에 다시 표시하도록 설정 (선택사항)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // 설치되었거나 설치 프롬프트가 없으면 표시하지 않음
  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Monitor className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            PC에 바로가기 만들기
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            리체 매물장을 PC 바탕화면에 설치하여 더 편리하게 사용하세요.
          </p>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
            >
              <Download className="w-3 h-3 mr-1" />
              설치하기
            </button>
            
            <button
              onClick={handleDismiss}
              className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors"
            >
              나중에
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// 별도 설치 버튼 컴포넌트 (헤더나 설정에서 사용)
export const InstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      console.log('✅ PWA 설치 이벤트 감지됨')
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsSupported(true)
    }

    const checkIfInstalled = () => {
      // 이미 설치된 경우 확인
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        console.log('✅ 이미 PWA로 설치되어 실행 중')
        setIsInstalled(true)
        return
      }

      // iOS Safari에서 홈 화면에 추가된 경우
      if ((window.navigator as any).standalone === true) {
        console.log('✅ iOS에서 홈 화면에 추가되어 실행 중')
        setIsInstalled(true)
        return
      }

      // 브라우저가 PWA를 지원하는지 확인
      if ('serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window) {
        setIsSupported(true)
        console.log('✅ 브라우저가 PWA를 지원함')
      } else {
        console.log('❌ 브라우저가 PWA를 지원하지 않음')
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    checkIfInstalled()

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    console.log('🔘 설치 버튼 클릭됨')
    
    if (!deferredPrompt) {
      console.log('❌ deferredPrompt가 없음 - 수동 설치 안내')
      
      // 수동 설치 안내
      const userAgent = navigator.userAgent.toLowerCase()
      const isIOS = userAgent.includes('ipad') || userAgent.includes('iphone') || userAgent.includes('ipod')
      const isAndroid = userAgent.includes('android')
      
      if (isIOS) {
        alert('iOS Safari에서 설치하기:\n\n1. 하단의 공유 버튼(⬆️) 터치\n2. "홈 화면에 추가" 선택\n3. "추가" 버튼 터치')
      } else if (isAndroid) {
        alert('Android Chrome에서 설치하기:\n\n1. 우상단 메뉴(⋮) 터치\n2. "홈 화면에 추가" 또는 "앱 설치" 선택')
      } else {
        alert('PC에서 설치하기:\n\n1. Chrome/Edge 주소창 우측의 설치 아이콘 클릭\n2. 또는 브라우저 메뉴에서 "앱 설치" 선택')
      }
      return
    }

    try {
      console.log('⏳ PWA 설치 프롬프트 표시 중...')
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      console.log(`📊 사용자 선택: ${outcome}`)
      
      if (outcome === 'accepted') {
        console.log('✅ PWA 설치 승인됨')
        setIsInstalled(true)
        alert('✅ 설치가 완료되었습니다! 바탕화면에서 앱을 확인해보세요.')
      } else {
        console.log('❌ PWA 설치 거부됨')
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('💥 PWA 설치 오류:', error)
      alert('설치 중 오류가 발생했습니다. 브라우저 메뉴에서 "앱 설치"를 시도해보세요.')
    }
  }

  // 이미 설치된 경우
  if (isInstalled) {
    return (
      <div className="inline-flex items-center px-3 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-lg">
        <span className="w-4 h-4 mr-2">✅</span>
        설치 완료
      </div>
    )
  }

  // PWA를 지원하지 않는 브라우저
  if (!isSupported && !deferredPrompt) {
    return (
      <button
        onClick={handleInstallClick}
        className="inline-flex items-center px-3 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
        title="브라우저에서 수동 설치 방법을 안내합니다"
      >
        <Download className="w-4 h-4 mr-2" />
        설치 방법 보기
      </button>
    )
  }

  return (
    <button
      onClick={handleInstallClick}
      className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors active:bg-blue-800"
      disabled={false}
    >
      <Download className="w-4 h-4 mr-2" />
      PC에 설치
    </button>
  )
}