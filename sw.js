/* Simple PWA service worker for Tech Help for Seniors */
const CACHE_NAME = 'tech-help-cache-v9';
const STATIC_ASSETS = [
  // Entry points
  'index.html',
  'index_simple.html',
  'manifest.json',
  // Core styles/scripts
  'style.css',
  'styles.css',
  'app.js',
  'script.js',
  'i18n.js',
  'translations.js',
  'data/text_map.json',
  'features/i18n.js',
  'features/tts.js',
  'features/progress.js',
  'features/voice.js',
  'features/accessibility.js',
  // Main tutorial pages
  'ai.html','bank.html','transport.html','computer.html','phone.html','language.html','apps.html','tips.html',
  // Per-page assets (best-effort)
  'ai.css','ai.js','apps.css','apps.js','bank.css','bank.js','computer.css','computer.js','language.css','language.js','phone.css','phone.js','tips.css','tips.js','transport.css','transport.js',
  // Module wrappers (redirects are fine to cache)
  'modules/ai_tools.html','modules/banking.html','modules/transport.html','modules/computer.html','modules/phone.html','modules/language.html','modules/useful_apps.html','modules/tips.html',
  // Icons
  'assets/icons/icon-192.png','assets/icons/icon-512.png','assets/icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
    ))
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // For navigation/HTML, use Network-First for freshness
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('index.html')))
    );
    return;
  }

  // For static assets, use Cache-First then network fallback
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, resClone));
        return res;
      });
    })
  );
});
