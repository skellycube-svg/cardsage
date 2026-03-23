// sw.js — Service Worker for FeeWorth
//
// A service worker is a background script that runs separately from the web page.
// It intercepts every network request the app makes and can serve files from a
// local cache, making the app work offline and load faster on repeat visits.
//
// How it works:
//   1. INSTALL — When a new version is deployed, the browser downloads all app files
//      and stores them in a local cache (like a mini offline copy of the site).
//   2. ACTIVATE — The old cache is deleted so only the latest version is kept.
//   3. FETCH — Every time the app requests a file, the service worker decides whether
//      to fetch it fresh from the internet or serve the cached copy.
//
// Cache strategy:
//   - HTML, CSS, and JS files use "network-first" — try the internet, fall back to cache.
//   - Images, icons, and fonts use "cache-first" — use the cached copy, only fetch if missing.

// ── Read the current version number from config.js ──────────────────────────
importScripts('./config.js');
const CACHE_VERSION = CS_CONFIG.CACHE_VERSION;

// The cache name includes the version so each deploy gets its own cache
const CACHE = 'cardsage-' + CACHE_VERSION;

// Every file the app needs to work offline — these are all downloaded
// and cached when the service worker first installs.
const LOCAL_ASSETS = [
  './index.html',
  './config.js',
  './styles.css',
  './firebase-auth.js',
  './cards-data.js',
  './auth-sync.js',
  './components.js',
  './sw-register.js',
  './version.json',
  './manifest.json',
  './favicon_io/android-chrome-192x192.png',
  './favicon_io/android-chrome-512x512.png',
  './favicon_io/apple-touch-icon.png',
  './favicon_io/favicon-32x32.png',
  './favicon_io/favicon-16x16.png',
  './favicon_io/favicon.ico',
  './privacy-policy.html',
  './terms.html',
  './affiliate-disclosure.html',
  './fo-verify.html',
  './robots.txt',
  './sitemap.xml',
  './404.html',
];

// External resources (React library, fonts) — these are cached the first time
// the user's browser downloads them, so they load instantly on future visits.
const CDN_ORIGINS = [
  'https://unpkg.com',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdn.jsdelivr.net',
];

// ── INSTALL: Download and cache all app files ────────────────────────────
// This runs once when a new version of the service worker is detected.
// It downloads every file in LOCAL_ASSETS and stores them in the cache.
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(LOCAL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: Clean up old caches and take control ──────────────────────
// After a new version installs, this deletes all old cached versions
// so only the latest files remain, then takes control of all open tabs.
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH: Intercept every network request ──────────────────────────────
// Every time the app tries to load a file, this handler decides how to get it.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isLocal = url.origin === self.location.origin;
  const isCDN = CDN_ORIGINS.some(o => e.request.url.startsWith(o));

  if (!isLocal && !isCDN) return;

  // Network-first for HTML, data, config, and version files — always fresh when online
  const path = url.pathname;
  const isNetworkFirst = isLocal && (
    path === '/' ||
    path.endsWith('.html') ||
    path.endsWith('.css') ||
    path.endsWith('.js')
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
