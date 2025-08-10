// ============================================================================
// Service Worker 등록 및 관리 유틸리티
// ============================================================================

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
};

// Service Worker 등록
export function register(config?: Config) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(
      import.meta.env.PUBLIC_URL || '',
      window.location.href
    );
    
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL}sw.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('[SW] Service worker is ready (localhost)');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }

  // 온라인/오프라인 상태 감지
  window.addEventListener('online', () => {
    console.log('[SW] App is online');
    config?.onOnline?.();
  });

  window.addEventListener('offline', () => {
    console.log('[SW] App is offline');
    config?.onOffline?.();
  });
}

// 유효한 Service Worker 등록
function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('[SW] Service Worker registered:', registration);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('[SW] New content is available and will be used when all tabs are closed.');
              config?.onUpdate?.(registration);
            } else {
              console.log('[SW] Content is cached for offline use.');
              config?.onSuccess?.(registration);
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('[SW] Service Worker registration failed:', error);
    });
}

// Service Worker 유효성 검사 (로컬호스트용)
function checkValidServiceWorker(swUrl: string, config?: Config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('[SW] No internet connection found. App is running in offline mode.');
    });
}

// Service Worker 등록 해제
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('[SW] Service Worker unregister error:', error.message);
      });
  }
}

// 캐시 업데이트 강제 실행
export function updateCache() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.update();
        console.log('[SW] Cache update requested');
      })
      .catch((error) => {
        console.error('[SW] Cache update failed:', error);
      });
  }
}

// 캐시 클리어
export function clearCache() {
  if ('caches' in window) {
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW] Clearing cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log('[SW] All caches cleared');
        window.location.reload();
      })
      .catch((error) => {
        console.error('[SW] Cache clear failed:', error);
      });
  }
}

// 네트워크 상태 확인
export function getNetworkStatus() {
  return {
    isOnline: navigator.onLine,
    connection: (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection,
    effectiveType: ((navigator as any).connection?.effectiveType) || 'unknown'
  };
}

// PWA 설치 가능 여부 확인
export function isPWAInstallable(): Promise<boolean> {
  return new Promise((resolve) => {
    let deferredPrompt: any;
    
    const beforeInstallPromptHandler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      resolve(true);
    };
    
    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    
    // 일정 시간 후에도 이벤트가 발생하지 않으면 false 반환
    setTimeout(() => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
      if (!deferredPrompt) {
        resolve(false);
      }
    }, 3000);
  });
}

// PWA 설치 프롬프트 표시
export function showInstallPrompt(): Promise<boolean> {
  return new Promise((resolve) => {
    let deferredPrompt: any;
    
    const beforeInstallPromptHandler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
    };
    
    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] User accepted the install prompt');
          resolve(true);
        } else {
          console.log('[PWA] User dismissed the install prompt');
          resolve(false);
        }
        deferredPrompt = null;
      });
    } else {
      resolve(false);
    }
  });
}