const CACHE_NAME = 'cerebro-v1';
const urlsToCache = ['/cerebro/', '/cerebro/index.html'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// ── NOTIFICACIONES PROGRAMADAS ─────────────────────────────────────────
// Recibe mensaje desde la app con lista de memos con fecha
self.addEventListener('message', event => {
  if (event.data && event.data.tipo === 'programar-notifs') {
    const memos = event.data.memos;
    programarNotificaciones(memos);
  }
});

function programarNotificaciones(memos) {
  const ahora = Date.now();
  memos.forEach(m => {
    const fecha = new Date(m.fechaEvento);
    fecha.setHours(8, 0, 0, 0);
    const ms = fecha.getTime() - ahora;
    if (ms <= 0) return;
    // Usar setTimeout en el SW — funciona aunque la app esté cerrada
    setTimeout(() => {
      self.registration.showNotification('📅 Segunda Memoria', {
        body: m.texto,
        tag: m.id,
        icon: '/cerebro/icon-192.png',
        badge: '/cerebro/icon-192.png',
        vibrate: [200, 100, 200]
      });
    }, Math.min(ms, 2147483647));
  });
}

// Al activarse el SW, leer memos del cache y reprogramar
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.open('cerebro-notifs').then(async cache => {
      const resp = await cache.match('memos-fecha');
      if (resp) {
        const memos = await resp.json();
        programarNotificaciones(memos);
      }
    })
  );
});

// Guardar memos en cache cuando llega mensaje
self.addEventListener('message', event => {
  if (event.data && event.data.tipo === 'guardar-memos') {
    const memos = event.data.memos;
    caches.open('cerebro-notifs').then(cache => {
      cache.put('memos-fecha', new Response(JSON.stringify(memos)));
    });
    programarNotificaciones(memos);
  }
});
