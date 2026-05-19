const CACHE_NAME = 'jemari-spa-v1';
const ASSETS_TO_CACHE = [
  '/login',
  '/manifest.json',
  '/images/logo-pwa-192.jpg',
  '/images/logo-pwa-512.jpg'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // We don't force cache everything to prevent dev staleness,
      // but cache basic assets for reliable PWA recognition
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Required for PWA install prompt)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests to avoid intercepting POST logins, API updates, or Inertia actions
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
