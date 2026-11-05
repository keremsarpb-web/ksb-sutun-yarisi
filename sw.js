// Uygulama kabuğunu önbelleğe alır; oyun verisi (api.php) her zaman sunucudan gelir.
const CACHE = 'sutun-yarisi-v13';
const SHELL = ['./', 'style.css', 'game.js', 'char3d.js', 'vendor/three.min.js', 'vendor/alpine.min.js', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.pathname.endsWith('api.php') || url.pathname.endsWith('version.php')) return;
  // Önce ağ, olmazsa önbellek: güncellemeler hemen gelir, sunucu kapalıysa da açılış ekranı görünür.
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r.ok && url.origin === location.origin) {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
