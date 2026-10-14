const VERSION = 'kok-v5';
const SHELL = `${VERSION}-shell`;
const MEDIA = `${VERSION}-media`;
const STATIC = `${VERSION}-static`;
const SHELL_ASSETS = [
  '/', '/index.html', '/order.html', '/privacy.html', '/terms.html', '/404.html',
  '/offline.html', '/manifest.webmanifest', '/robots.txt', '/sitemap.xml',
  '/media/logo.webp', '/media/poster.webp', '/media/frames/060.webp',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png',
  '/media/menu/oxtails.webp', '/media/menu/brownstew-chicken.webp',
  '/media/menu/meatballs-plum.webp', '/media/menu/jerk-salmon.webp',
  '/media/menu/eight-wings.webp', '/media/menu/twelve-wings.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL).then(cache => cache.addAll(SHELL_ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => ![SHELL, MEDIA, STATIC].includes(key)).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

async function trim(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - maxEntries)).map(key => cache.delete(key)));
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(STATIC);
    cache.put(request, response.clone());
    return response;
  } catch {
    return (await caches.match(request)) || (await caches.match('/offline.html'));
  }
}

async function cacheFirst(request, cacheName, limit) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
    trim(cacheName, limit);
  }
  return response;
}

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }
  if (url.pathname.startsWith('/media/')) {
    event.respondWith(cacheFirst(request, MEDIA, 96));
    return;
  }
  event.respondWith(cacheFirst(request, STATIC, 48));
});
