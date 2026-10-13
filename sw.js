// Сервис-воркер: всё приложение и компилятор отдаются из кэша, интернет нужен только один раз.
const SHELL_CACHE = 'cpp-trainer-shell-v3';
const VENDOR_CACHE = 'cpp-trainer-vendor-v1'; // компилятор живёт отдельно, чтобы обновления приложения его не перекачивали
const SHELL = [
  './', 'index.html', 'style.css', 'app.js', 'problems.js', 'concepts.js', 'harness.js', 'compiler-worker.js', 'run-worker.js',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== SHELL_CACHE && k !== VENDOR_CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const isVendor = url.pathname.includes('/vendor/');
  e.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const resp = await fetch(req);
      if (resp.ok && resp.status === 200) {
        const copy = resp.clone();
        caches.open(isVendor ? VENDOR_CACHE : SHELL_CACHE).then((c) => c.put(req, copy)).catch(() => {});
      }
      return resp;
    } catch (err) {
      if (req.mode === 'navigate') {
        const shell = await caches.match('index.html', { ignoreSearch: true });
        if (shell) return shell;
      }
      throw err;
    }
  })());
});
