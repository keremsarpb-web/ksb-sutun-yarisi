// Tarayıcı sürümü: önce ağ, ağ yoksa önbellek. Böylece güncellemeler hemen gelir, internetsiz de açılır.
const CACHE = 'sutun-yarisi-web-v2';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('sutun-yarisi-web') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  // Yalnızca bu sitenin dosyaları; online oda (PeerJS) ve fontlar doğrudan ağdan
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.endsWith('version.php')) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
