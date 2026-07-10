/**
 * ==========================================================================
 * SERVICE WORKER - CONFIGURACIÓN DE ESTRATEGIA DE CACHE OFFLINE
 * Permite que la app cargue instantáneamente y funcione sin conectividad de red.
 * ==========================================================================
 */

const CACHE_NAME = 'reparaciones-cache-v7';

const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'styles/style.css',
  'scripts/app.js',
  'assets/icons/favicon.png',
  'assets/images/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Descargando y guardando recursos estáticos en caché...');
      return cache.addAll(ASSETS);
    }).catch((error) => {
      console.warn('Service Worker: No se pudieron precargar todos los recursos.', error);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;
  if (request.url.startsWith('chrome-extension://') || request.url.startsWith('data:')) return;

  if (request.url.startsWith('http') && !request.url.startsWith(self.location.origin)) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        const copy = networkResponse.clone();
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        );
        return networkResponse;
      }).catch(() => caches.match('./index.html'));
    })
  );
});