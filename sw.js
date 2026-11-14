// Service worker do Garimpo: notificações push + app instalável
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// necessário pro navegador considerar o app instalável (não guarda nada em cache)
self.addEventListener('fetch', () => {});

self.addEventListener('push', e => {
  let d = { title: 'Garimpo', body: 'Mineração atualizada', url: '/#ofertas' };
  try { d = Object.assign(d, e.data.json()); } catch (_) {}
  e.waitUntil(self.registration.showNotification(d.title, {
    body: d.body, icon: '/icon-192.png', badge: '/icon-192.png', data: { url: d.url }, tag: 'garimpo', renotify: true
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/#ofertas';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    for (const w of ws) { if ('focus' in w) { w.navigate(url); return w.focus(); } }
    return clients.openWindow(url);
  }));
});
