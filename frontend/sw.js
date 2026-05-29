// ============================================================
//  sw.js — Service Worker (PWA offline support)
// ============================================================

const CACHE_NAME = 'task-manager-v2';

const ASSETS = [
  './',
  './index.html',
  './trash.html',
  './styles/style.css',
  './scripts/main.js',
  './manifest.json',
  './img/icono.png',
];

// Instalar y cachear assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Limpiar caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Cache-first para assets, network-first para el resto
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => cached);
    })
  );
});
