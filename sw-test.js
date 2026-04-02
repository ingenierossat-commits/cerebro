self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

self.addEventListener('message', event => {
  if (event.data && event.data.tipo === 'test') {
    const ms = event.data.ms || 60000;
    setTimeout(() => {
      self.registration.showNotification('🔔 Test Notificación', {
        body: '¡Funciona! La notificación llegó desde el service worker.',
        icon: 'icon-192.png',
        vibrate: [200, 100, 200]
      });
    }, ms);
  }
});
