// Service worker disabled for CSP/ad compatibility
// This file is kept but non-functional to maintain compatibility
(function() {
  'use strict';
  // Service worker disabled
  console.log('[SW] Service worker disabled');
})();

// Activate event - cleanup old caches aggressively
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v3.2...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        console.log('[SW] Found caches:', cacheNames);
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW] Deleting cache:', cacheName);
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
