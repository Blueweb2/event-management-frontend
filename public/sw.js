const CACHE_NAME = 'pircello-staff-v1';
const STATIC_CACHE_NAME = 'pircello-staff-static-v1';

// Critical assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/staff',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/images/logo.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn('[SW] Pre-caching non-fatal warning:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only handle GET requests (never cache POST, PUT, PATCH, DELETE)
  if (request.method !== 'GET') {
    return;
  }

  // 2. Ignore non-HTTP/HTTPS schemes (e.g. chrome-extension:)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 3. Do NOT cache or intercept real-time Socket.IO or WebSocket traffic
  if (
    url.pathname.includes('/socket.io') ||
    request.headers.get('upgrade') === 'websocket'
  ) {
    return;
  }

  // 4. Do NOT cache API endpoints, backend server requests, or authentication
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/auth') ||
    url.port === '5000' ||
    url.searchParams.has('api')
  ) {
    return;
  }

  // 5. Handle Next.js static assets and media (CSS, JS bundles, images, icons, fonts)
  const isNextStatic = url.pathname.startsWith('/_next/static/');
  const isStaticMedia =
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ttf');

  if (isNextStatic || isStaticMedia) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          return (
            cachedResponse ||
            new Response('Asset temporarily unavailable offline', {
              status: 503,
              statusText: 'Service Unavailable',
            })
          );
        }
      })
    );
    return;
  }

  // 6. Navigation requests within the Staff PWA scope: Network-First with cache fallback
  if (request.mode === 'navigate' && url.pathname.startsWith('/staff')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }

          const fallbackShell = await caches.match('/staff');
          if (fallbackShell) {
            return fallbackShell;
          }

          return new Response('Staff Portal is currently offline', {
            status: 503,
            headers: { 'Content-Type': 'text/html' },
          });
        })
    );
    return;
  }
});
