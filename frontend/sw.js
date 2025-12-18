// Service Worker for Smart Money Guide (tilana.online)
// Version 2.0.0 - Maximum Performance & AdSense Optimized
// Updated: 2025-12-18

const CACHE_VERSION = 'v2.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const FONT_CACHE = `fonts-${CACHE_VERSION}`;

// Critical assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.min.f5f26ea4.css',
  '/css/responsive.min.c014bbda.css',
  '/js/config.min.f841bc00.js',
  '/js/main.min.eb2549f5.js',
  '/offline.html' // Create this page
];

// Install event - cache critical static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(url => url !== '/offline.html'));
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Failed to cache static assets:', err);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes(CACHE_VERSION)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - smart caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip API requests (always fetch fresh)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return new Response(JSON.stringify({ 
            error: 'Network unavailable',
            offline: true 
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Skip AdSense and external ad-related requests (never cache)
  if (
    url.hostname.includes('googlesyndication.com') ||
    url.hostname.includes('doubleclick.net') ||
    url.hostname.includes('google-analytics.com') ||
    url.hostname.includes('googletagmanager.com') ||
    url.hostname.includes('adservice.google.com')
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // Skip external resources (fetch fresh)
  if (url.origin !== location.origin) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Provide fallback for external resources
          return new Response('', { status: 503 });
        })
    );
    return;
  }

  // FONTS - Cache first with long expiry
  if (isFontFile(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(FONT_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          });
        })
    );
    return;
  }

  // IMAGES - Cache first with fallback
  if (isImageFile(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(IMAGE_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          });
        })
    );
    return;
  }

  // CSS and JS - Cache first (versioned files)
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          });
        })
    );
    return;
  }

  // HTML pages - Network first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If no cache, show offline page
            return caches.match('/offline.html')
              .then((offlinePage) => offlinePage || new Response('Offline', { status: 503 }));
          });
      })
  );
});

// Helper function: Check if file is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = ['.css', '.js'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Helper function: Check if file is an image
function isImageFile(pathname) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico'];
  return imageExtensions.some(ext => pathname.toLowerCase().endsWith(ext));
}

// Helper function: Check if file is a font
function isFontFile(pathname) {
  const fontExtensions = ['.woff', '.woff2', '.ttf', '.eot', '.otf'];
  return fontExtensions.some(ext => pathname.toLowerCase().endsWith(ext));
}

// Message event handler for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          );
        })
        .then(() => {
          return self.clients.matchAll();
        })
        .then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'CACHE_CLEARED' });
          });
        })
    );
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

// Background sync for offline form submissions (if needed)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncForms());
  }
});

async function syncForms() {
  // Implement form sync logic if needed
  console.log('[SW] Syncing forms...');
}

// Push notification support (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/images/icon-192x192.png',
    badge: '/images/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Smart Money Guide', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://tilana.online')
  );
});

console.log('[SW] Service Worker loaded successfully - Version:', CACHE_VERSION);
