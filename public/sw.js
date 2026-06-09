const CACHE = 'brickme-v2';
const OFFLINE_URL = '/offline';

const PRECACHE = [
  OFFLINE_URL,
  '/manifest.json',
  '/logo.png',
  '/icon.svg',
  '/icon-maskable.svg',
];

// ─── Install: pre-cache kritieke bestanden ────────────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate: verwijder oude caches ─────────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API routes nooit cachen
  if (url.pathname.startsWith('/api/')) return;

  // Next.js static chunks — cache-first (hashed filenames zijn immutable)
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(
      caches.match(request).then((hit) => {
        if (hit) return hit;
        return fetch(request).then((res) => {
          if (res.ok) { const cloned = res.clone(); caches.open(CACHE).then((c) => c.put(request, cloned)); }
          return res;
        });
      })
    );
    return;
  }

  // Statische assets uit /public — cache-first
  if (/\.(png|jpg|jpeg|svg|ico|webp|woff2?|ttf|otf)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(request).then((hit) => {
        if (hit) return hit;
        return fetch(request).then((res) => {
          if (res.ok) { const cloned = res.clone(); caches.open(CACHE).then((c) => c.put(request, cloned)); }
          return res;
        });
      })
    );
    return;
  }

  // Navigatieverzoeken — network-first, bouwfase wordt gecacht voor offline
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            // Bouwfase pagina's extra agressief cachen (meeste kans op offline)
            const kritiek = url.pathname.includes('/bouwen') || url.pathname === '/offline';
            if (kritiek) {
              const cloned = res.clone();
              caches.open(CACHE).then((c) => c.put(request, cloned));
            }
          }
          return res;
        })
        .catch(() =>
          // Offline: probeer cache, dan offline-pagina
          caches.match(request).then((hit) => hit || caches.match(OFFLINE_URL))
        )
    );
    return;
  }
});
