// Service Worker for Smart Money Guide - Ultra-Optimized for 100/100 Lighthouse
// Version 3.0.0 - Maximum Performance & AdSense Optimized
// Updated: 2025-12-20

const CACHE_VERSION = 'v3.0.0';
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
  '/js/main.min.eb2549f5.js'
];

// Install event - cache critical static assets aggressively
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v3...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Install error:', err);
      })
  );
});

// Activate event - cleanup old caches aggressively
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
      .catch((err) => {
        console.error('[SW] Activation error:', err);
      })
  );
});

// Fetch event - optimized caching strategies
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

  // Strategy 1: Cache first for static assets (JS, CSS, fonts)
  if (/\.(js|css|woff2|ttf|otf|woff)$/.test(request.url)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            console.log('[SW] Cache hit (static):', request.url);
            return response;
          }
          return fetch(request)
            .then((response) => {
              if (!response || response.status !== 200) {
                return response;
              }
              const responseClone = response.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
              return response;
            })
            .catch(() => {
              // Return cached version if network fails
              return caches.match(request)
                .then((cachedResponse) => {
                  return cachedResponse || new Response('Offline', { status: 503 });
                });
            });
        })
        .catch(() => {
          return new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // Strategy 2: Cache for images with stale-while-revalidate
  if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(request.url)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            console.log('[SW] Cache hit (image):', request.url);
            // Revalidate in background
            fetch(request)
              .then((freshResponse) => {
                if (freshResponse && freshResponse.status === 200) {
                  caches.open(IMAGE_CACHE).then((cache) => {
                    cache.put(request, freshResponse);
                  });
                }
              })
              .catch(() => {});
            return response;
          }
          // No cache, fetch fresh
          return fetch(request)
            .then((response) => {
              if (!response || response.status !== 200) {
                return response;
              }
              const responseClone = response.clone();
              caches.open(IMAGE_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
              return response;
            })
            .catch(() => {
              return new Response('', { status: 404 });
            });
        })
    );
    return;
  }

  // Strategy 3: Network first for HTML and dynamic content
  if (request.headers.get('accept')?.includes('text/html') || /\.html$/.test(request.url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return new Response('Offline', { status: 503 });
            });
        })
    );
    return;
  }

  // Strategy 4: Network first for API calls
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then((response) => {
              return response || new Response(JSON.stringify({ offline: true }), {
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
    return;
  }

  // Default: Cache first with network fallback
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(request)
          .then((response) => {
            if (!response || response.status !== 200) {
              return response;
            }
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
            return response;
          })
          .catch(() => {
            return new Response('Offline', { status: 503 });
          });
      })
      .catch(() => {
        return new Response('Offline', { status: 503 });
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
