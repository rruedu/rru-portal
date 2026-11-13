/**
 * RRU School Portal - Progressive Web App Service Worker
 * Version: v3.2.0 (Open Graph & School Crest Assets)
 */

const STATIC_CACHE = 'rru-static-v3-2';
const API_CACHE = 'rru-api-v3-2';
const RUNTIME_CACHE = 'rru-runtime-v3-2';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/logo.png',
  './assets/favicon.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/og-image.png',
  './src/styles/main.css',
  './src/styles/orbit.css',
  './src/js/app.js',
  './src/js/config.js',
  './src/js/state.js',
  './src/js/api.js',
  './src/js/utils.js',
  './src/js/components/announcement.js',
  './src/js/components/navbar.js',
  './src/js/components/orbitHero.js',
  './src/js/components/departmentGrid.js',
  './src/js/components/adminView.js',
  './src/js/components/installModal.js',
  './src/js/components/reportModal.js'
];

// 1. Install Event: Pre-cache core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      try {
        await cache.addAll(PRECACHE_ASSETS);
      } catch (err) {
        console.warn('SW Precache non-fatal warning:', err);
      }
      return self.skipWaiting();
    })
  );
});

// 2. Activate Event: Clean up outdated caches from previous versions
self.addEventListener('activate', (event) => {
  const activeCaches = [STATIC_CACHE, API_CACHE, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!activeCaches.includes(key)) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Multi-tiered caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Strategy A: SPA Navigation requests -> Network-first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match('./index.html') || await caches.match('./');
          return cached || new Response('Offline: RRU Portal', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }

  // Strategy B: Google Apps Script API (Data Read) -> Network-First with API Cache fallback
  if (url.hostname.includes('script.google.com') && url.search.includes('action=getData')) {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const clone = response.clone();
            const cache = await caches.open(API_CACHE);
            await cache.put(request, clone);
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(JSON.stringify({ success: false, error: 'Offline network mode' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Strategy C: Local Static Assets (Scripts, CSS, Manifest) -> Stale-While-Revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        }).catch(() => null);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Strategy D: External CDN / Third-Party (Tailwind, Lucide, Google Fonts, Icons) -> Cache-First
  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          const clone = networkResponse.clone();
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, clone);
        }
        return networkResponse;
      } catch (e) {
        return new Response('', { status: 408, statusText: 'Resource request offline' });
      }
    })
  );
});
