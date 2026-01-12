// Service Worker for Mobile Performance & Offline Support
// Caches critical assets for faster loading on mobile networks
'use strict';

const CACHE_VERSION = 'v4-mobile-optimized';
const CACHE_NAME = `smart-money-${CACHE_VERSION}`;

// Critical assets to pre-cache on install
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/config.js',
  '/js/main.js',
  '/js/mobile-menu.js',
  '/js/pagination.js',
  '/js/search.js',
  '/images/logo.png'
];

// Install event - pre-cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching critical assets...');
        return cache.addAll(CRITICAL_ASSETS).catch(err => {
          console.warn('[SW] Some assets failed to cache (OK for missing):', err);
        });
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((err) => {
        console.error('[SW] Installation error:', err);
      })
  );
});

// Activate event - cleanup old caches for mobile optimization
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        console.log('[SW] Found caches:', cacheNames);
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
      .catch((err) => {
        console.error('[SW] Activation error:', err);
      })
  );
});

// Fetch event - optimized for mobile with stale-while-revalidate
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

  // Strategy for HTML documents: Network first with cache fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful HTML responses
          if (response.ok && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fall back to cache on network error
          return caches.match(request).then(cached => {
            return cached || new Response('Offline - Please check your connection', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/plain' })
            });
          });
        })
    );
    return;
  }

  // Strategy for CSS/JS: Cache first with network fallback (stale-while-revalidate)
  if (request.destination === 'style' || request.destination === 'script' || 
      request.url.match(/\.(css|js)$/)) {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          // Return cached version immediately
          if (cached) {
            // Optionally update cache in background
            fetch(request).then(response => {
              if (response.ok) {
                caches.open(CACHE_NAME).then(cache => cache.put(request, response));
              }
            }).catch(() => {}); // Silently fail background update
            return cached;
          }
          // No cache, fetch from network
          return fetch(request).then((response) => {
            if (response.ok && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          });
        })
        .catch(() => caches.match(request)) // Double fallback
    );
    return;
  }

  // Strategy for images: Cache first with network fallback
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          return cached || fetch(request)
            .then((response) => {
              if (response.ok && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(request, responseToCache);
                });
              }
              return response;
            })
            .catch(() => {
              // Placeholder for missing images
              return new Response(
                '<svg width="100" height="100"><rect fill="#f0f0f0" width="100" height="100"/></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            });
        })
    );
    return;
  }

  // Default strategy for API calls: Network first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.status === 200 && 
            response.headers.get('content-type')?.includes('application/json')) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request) || new Response(
          JSON.stringify({ error: 'Offline' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
  );
});
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
        // Network failed, try cache as fallback
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Network failed, using cache:', request.url);
              return cachedResponse;
            }
            // No cache either, return offline page or error
            return new Response('Offline', { 
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

console.log('[SW] Service Worker loaded - Version:', CACHE_VERSION);
