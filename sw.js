// ── INCREMENT THIS when deploying updates to force cache refresh ──────────
const CACHE_VERSION = 'v3';
// ─────────────────────────────────────────────────────────────────────────

const CACHE = 'cardsage-' + CACHE_VERSION;

// Local app files — always pre-cached on install
const LOCAL_ASSETS = [
  './index.html',
  './cards-data.js',
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

// ── Activate: remove old caches ───────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first for local + CDN, network-only for everything else ──
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isLocal = url.origin === self.location.origin;
  const isCDN = CDN_ORIGINS.some(o => e.request.url.startsWith(o));

  if (isLocal || isCDN) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          // Only cache valid responses
          if (!res || res.status !== 200 || res.type === 'error') return res;
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
          return res;
        }).catch(() => cached); // offline fallback: return stale if any
      })
    );
  }
});
