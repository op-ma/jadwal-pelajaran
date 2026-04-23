const CACHE_NAME = 'jadwalku-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // Melakukan cache file external agar bisa digunakan full offline
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Activate & Hapus Cache Lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercept Network Requests (Cache First Strategy)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return resource dari cache jika ada, jika tidak, fetch ke internet
        return response || fetch(event.request).then(
          (fetchResponse) => {
            // Opsional: Simpan response baru ke cache
            return caches.open(CACHE_NAME).then((cache) => {
              // Hanya simpan jika request GET (menghindari error skema data: atau sejenisnya)
              if (event.request.method === 'GET' && event.request.url.startsWith('http')) {
                cache.put(event.request, fetchResponse.clone());
              }
              return fetchResponse;
            });
          }
        );
      }).catch(() => {
        // Jika offline dan tidak ada di cache, bisa berikan fallback HTML disini jika mau
      })
  );
});