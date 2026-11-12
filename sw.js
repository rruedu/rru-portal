// RRU School Portal - Lightweight Service Worker
const CACHE_NAME = 'rru-portal-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Let network handle dynamic requests, with cache fallback if offline
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
