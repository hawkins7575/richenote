// ============================================================================
// PropertyDesk SaaS - Service Worker
// 캐싱 전략 및 오프라인 지원
// ============================================================================

const CACHE_NAME = 'propertydesk-v1';
const STATIC_CACHE = 'propertydesk-static-v1';
const DYNAMIC_CACHE = 'propertydesk-dynamic-v1';

// 캐시할 정적 자원들
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // CSS는 빌드 후 동적으로 추가됨
];

// 캐시 전략별 URL 패턴
const CACHE_STRATEGIES = {
  // 즉시 캐시 (Critical Resources)
  CACHE_FIRST: [
    /\.(js|css|woff2?|ttf|eot)$/,
    /\/assets\//,
  ],
  
  // 네트워크 우선, 실패시 캐시 (Dynamic Content)
  NETWORK_FIRST: [
    /\/api\//,
    /\.supabase\.co/,
  ],
  
  // 캐시 우선, 실패시 네트워크 (Static Content)
  CACHE_ONLY: [
    /\.(png|jpg|jpeg|gif|webp|svg|ico)$/,
  ]
};

// Service Worker 설치
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting(); // 즉시 활성화
      })
  );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    Promise.all([
      // 이전 캐시 정리
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== CACHE_NAME) {
              console.log('[SW] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 모든 클라이언트 제어
      self.clients.claim()
    ])
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Supabase 요청은 항상 네트워크 우선
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // API 요청은 네트워크 우선
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // 정적 자원은 캐시 우선
  if (CACHE_STRATEGIES.CACHE_FIRST.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // 이미지는 캐시만 사용
  if (CACHE_STRATEGIES.CACHE_ONLY.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(cacheOnly(request));
    return;
  }
  
  // 기본: 네트워크 우선
  event.respondWith(networkFirst(request));
});

// 캐시 우선 전략
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Cache hit:', request.url);
      return cachedResponse;
    }
    
    console.log('[SW] Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);
    
    // 성공적인 응답만 캐시
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return new Response('오프라인 상태입니다.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

// 네트워크 우선 전략
async function networkFirst(request) {
  try {
    console.log('[SW] Network first:', request.url);
    const networkResponse = await fetch(request);
    
    // 성공적인 응답을 캐시
    if (networkResponse.status === 200 && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 오프라인 폴백
    return new Response('네트워크 연결을 확인해주세요.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

// 캐시만 사용 전략
async function cacheOnly(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // 캐시에 없으면 기본 이미지 반환
  return new Response('이미지를 찾을 수 없습니다.', {
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

// 백그라운드 동기화 (향후 확장용)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'property-sync') {
    event.waitUntil(syncProperties());
  }
});

// 매물 데이터 동기화 (향후 구현)
async function syncProperties() {
  try {
    // 오프라인에서 저장된 매물 데이터를 서버와 동기화
    console.log('[SW] Syncing properties...');
    // 구현 예정
  } catch (error) {
    console.error('[SW] Property sync failed:', error);
  }
}

// 푸시 알림 (향후 확장용)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      const client = clients.find(c => c.url.includes(url));
      
      if (client) {
        return client.focus();
      } else {
        return self.clients.openWindow(url);
      }
    })
  );
});