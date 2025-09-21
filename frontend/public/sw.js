const CACHE_NAME = 'sifalı-bitkiler-v1.1.0';
const API_CACHE_NAME = 'api-cache-v2';

// Cache edilecek static dosyalar
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // Icons
  '/icon-72x72.png',
  '/icon-96x96.png',
  '/icon-128x128.png',
  '/icon-144x144.png',
  '/icon-152x152.png',
  '/icon-192x192.png',
  '/icon-384x384.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/favicon.svg'
];

// API endpoint'leri cache stratejileri
const API_CACHE_STRATEGY = {
  '/api/products': 'cache-first',
  '/api/products/featured': 'cache-first',
  '/api/products/categories': 'cache-first',
  '/api/blog': 'cache-first',
  '/api/support/faqs': 'cache-first'
};

// Service Worker kurulum
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // PWA yüklemesini API'ye bildir
        trackPWAEvent('install');
        return self.skipWaiting();
      })
  );
});

// Service Worker aktivasyon
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      trackPWAEvent('update');
      return self.clients.claim();
    })
  );
});

// Fetch event handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API istekleri için cache stratejisi
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Static asset'ler için cache-first stratejisi
  if (request.destination === 'document' ||
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image') {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Diğer istekler için network-first
  event.respondWith(
    fetch(request).catch(() => {
      if (request.destination === 'document') {
        return caches.match('/offline.html');
      }
    })
  );
});

// API istekleri için cache stratejisi
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  const cacheKey = url.pathname;
  const strategy = API_CACHE_STRATEGY[cacheKey] || 'network-first';

  if (strategy === 'cache-first') {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Background'da güncelle
      fetch(request).then(response => {
        if (response.ok) {
          const cache = caches.open(API_CACHE_NAME);
          cache.then(c => c.put(request, response.clone()));
        }
      });
      return cachedResponse;
    }
  }

  try {
    const response = await fetch(request);

    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Static asset'ler için handler
async function handleStaticAsset(request) {
  try {
    // Önce cache'den kontrol et
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Network'den al ve cache'le
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;

  } catch (error) {
    // Offline durumunda cache'den serve et
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Document istekleri için offline sayfa
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }

    throw error;
  }
}

// PWA event tracking
async function trackPWAEvent(eventType) {
  try {
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      mobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      tablet: /iPad/i.test(navigator.userAgent)
    };

    await fetch('/api/pwa/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        eventType,
        deviceInfo
      })
    });
  } catch (error) {
    console.log('PWA tracking failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  console.log('Push notification received:', data);

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: '/badge.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      timestamp: data.timestamp || Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Aç',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Kapat'
      }
    ],
    requireInteraction: false,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Zaten açık bir window varsa onu kullan
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }

      // Yeni window aç
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Background sync (gelecekte kullanım için)
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Offline'da birikmiş istekleri gönder
    const requests = await getStoredRequests();
    for (const request of requests) {
      await fetch(request);
    }
    await clearStoredRequests();
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Yardımcı fonksiyonlar
async function getStoredRequests() {
  // IndexedDB'den offline istekleri al
  return [];
}

async function clearStoredRequests() {
  // IndexedDB'den offline istekleri temizle
}

// Uygulama açıldığında launch event'ini track et
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'APP_LAUNCH') {
    trackPWAEvent('launch');
  }
});