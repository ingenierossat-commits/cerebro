self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

// Fallback por si showTrigger no está disponible
self.addEventListener('message', event => {
  if (event.data && event.data.tipo === 'test') {
    const ms = event.data.ms || 60000;
    setTimeout(() => {
      self.registration.showNotification('🔔 Test SW postMessage', {
        body: 'Llegó desde SW con postMessage',
        vibrate: [200, 100, 200]
      });
    }, ms);
  }
});
