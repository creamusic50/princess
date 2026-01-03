// Service Worker for Smart Money Guide - Ultra-Optimized for 100/100 Lighthouse
// Version 3.2.0 - Maximum Performance & AdSense Optimized  
// Updated: 2025-12-31 14:00

const CACHE_VERSION = 'v3.2.0-' + Date.now();
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
  '/css/mobile-menu.css',
  '/js/config.min.f841bc00.js',
  '/js/main.min.eb2549f5.js',
  '/js/config.js'
  ,'/offline.html'
];

// Install event - DELETE ALL OLD CACHES FIRST, then install fresh
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v3.2...');
  event.waitUntil(
    // First delete ALL caches
    caches.keys().then(function(cacheNames) {
      return Promise.all(cacheNames.map(function(cacheName) {
        console.log('[SW] DELETING OLD CACHE ON INSTALL:', cacheName);
        return caches.delete(cacheName);
      }));
    }).then(function() {
      // Then create fresh cache (tolerant: cache assets individually so a missing asset won't fail the whole install)
      return caches.open(STATIC_CACHE).then((cache) => {
          console.log('[SW] Caching static assets (individual, tolerant)');
          return Promise.all(STATIC_ASSETS.map((asset) => {
            return cache.add(asset).then(() => {
              console.log('[SW] Cached:', asset);
            }).catch((err) => {
              console.warn('[SW] Failed to cache asset (skipping):', asset, err && err.message ? err.message : err);
              // swallow error so install doesn't fail
            });
          }));
        });
    })
    .then(() => {
      console.log('[SW] Static assets cached, skipping waiting');
      return self.skipWaiting();
    })
    .catch((err) => {
      console.error('[SW] Install error:', err);
    })
  );
});

// Activate event - cleanup ALL old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v3.2...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        console.log('[SW] Found caches on activate:', cacheNames);
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW] DELETING CACHE ON ACTIVATE:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log('[SW] All old caches deleted, claiming clients');
        return self.clients.claim();
      })
      .catch((err) => {
        console.error('[SW] Activation error:', err);
      })
  );
});

// Fetch event - Network first strategy for everything
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Bypass SW for API requests - always go to network (don't cache API responses here)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((cached) => cached || new Response('Offline', { status: 503 })))
    );
    return;
  }

  // Network first strategy - always try fresh first
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Log successful network fetch
        if (response && response.status === 200) {
          console.log('[SW] Network hit (fresh):', request.url);
          // Cache successful response for offline fallback
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache as fallback, then offline.html
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Network failed, using cache:', request.url);
              return cachedResponse;
            }
            return caches.match('/offline.html')
              .then((offlineResp) => {
                if (offlineResp) return offlineResp;
                return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
              });
          });
      })
  );
});

// Message event handler for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(cacheNames.map((name) => caches.delete(name)));
        })
    );
  }
});

console.log('[SW] Service Worker loaded - Version:', CACHE_VERSION);
