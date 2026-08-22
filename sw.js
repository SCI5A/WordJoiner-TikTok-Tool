// Bump this whenever a processing rule or client asset changes.
const CACHE_NAME = 'wordjoiner-pro-v12';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js?v=6',
  './arabic-spacing.js?v=5',
  './quran-segmentation.js?v=1',
  './docx-export.js?v=1',
  './manifest.json',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400;500;700&family=Tajawal:wght@400;500;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install Service Worker
self.addEventListener('install', event => {
  // Activate the updated worker without waiting for every old tab to close.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching assets');
        return cache.addAll(ASSETS);
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
    ])
  );
});

// Fetch Assets
self.addEventListener('fetch', event => {
  const request = event.request;
  const pathname = new URL(request.url).pathname;
  const isAppCode = pathname.endsWith('/') ||
    pathname.endsWith('/index.html') ||
    pathname.endsWith('/script.js') ||
    pathname.endsWith('/arabic-spacing.js') ||
    pathname.endsWith('/quran-segmentation.js') ||
    pathname.endsWith('/docx-export.js') ||
    pathname.endsWith('/sw.js');

  if (request.method !== 'GET') return;

  event.respondWith(
    (isAppCode ? fetch(request, { cache: 'no-store' }) : fetch(request))
      .then(response => {
        if (response && response.ok && isAppCode) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
