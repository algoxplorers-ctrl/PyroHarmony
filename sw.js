/**
 * @file sw.js
 * @description Offline-First Tactical Service Worker for PyroHarmony v2.0.0 PWA.
 * Enables wildland firefighting brigades (SNMF, IBAMA, CONAF, USFS) to operate
 * the 3D Orbital Command Center and LACES Radar in zero-connectivity field zones.
 * @team AlgoXplorers (Argentina)
 * @license MIT
 */

const CACHE_NAME = 'pyroharmony-pwa-v2.0.16';

const CORE_ASSETS = [
  './',
  './index.html',
  './app.bundle.js?v=2.0.16',
  './manifest.webmanifest',
  './src/styles/main.css?v=2.0.16',
  './assets/icons/favicon.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/logo-official.png',
  './DOSSIER_ENTREGA_EQUIPO.html',
  './GUIA_CIENTIFICA_PYROHARMONY.html',
  './GUIA_INTERPRETACION_MAQUETA.html',
  './VIDEO_PITCH_PROMPTER.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((oldKey) => caches.delete(oldKey))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Network-first for live Supabase REST calls, fallback to offline response
  if (request.url.includes('supabase.co')) {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(JSON.stringify({ offline: true, mode: 'local_cache' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
      )
    );
    return;
  }

  // Cache-first with background refresh (Stale-While-Revalidate) for app & 3D assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkFetch = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});
