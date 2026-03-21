// ── INCREMENT THIS when deploying updates to force cache refresh ──────────
const CACHE_VERSION = 'v27';
// ─────────────────────────────────────────────────────────────────────────

const CACHE = 'cardsage-' + CACHE_VERSION;

// Local app files — always pre-cached on install
const LOCAL_ASSETS = [
  './index.html',
  './cards-data.js',
  './version.json',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './privacy-policy.html',
  './terms.html',
  './affiliate-disclosure.html',
];

// CDN assets — cache on first fetch
const CDN_ORIGINS = [
  'https://unpkg.com',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
];

// ── Install: pre-cache all local assets ───────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(LOCAL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: delete ALL old caches, then claim open tabs immediately ──────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isLocal = url.origin === self.location.origin;
  const isCDN = CDN_ORIGINS.some(o => e.request.url.startsWith(o));

  if (!isLocal && !isCDN) return;

  // Network-first for HTML, data, and version files — always fresh when online
  const path = url.pathname;
  const isNetworkFirst = isLocal && (
    path === '/' ||
    path.endsWith('.html') ||
    path.endsWith('cards-data.js') ||
    path.endsWith('version.json')
  );

  if (isNetworkFirst) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (!res || res.status !== 200 || res.type === 'error') return res;
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request)) // offline fallback
    );
    return;
  }

  // Cache-first for everything else (icons, manifest, CDN assets)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'error') return res;
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      }).catch(() => cached);
    })
  );
});
