// Imported by the existing /sw.js; do not register another root-scope worker.
// The web config contains public Firebase identifiers only.
function scheduleNotificationUrl(value) {
    if (value === '/terapis/notifikasi') return value;
    return /^\/admin\/scheduler(?:\/\d+)?$/.test(value || '') ? value : '/admin/scheduler';
}

self.addEventListener('notificationclick', (event) => {
    if (!event.notification.data?.jemariPush) return;
    event.stopImmediatePropagation();
    event.notification.close();
    event.waitUntil((async () => {
        const url = new URL(scheduleNotificationUrl(event.notification.data.url), self.location.origin).href;
        const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of windows) {
            if (new URL(client.url).origin === self.location.origin) {
                await client.navigate(url);
                return client.focus();
            }
        }
        return self.clients.openWindow(url);
    })());
});

try {
    importScripts('/firebase-config.js');
    const config = self.JEMARI_FIREBASE_CONFIG;
    if (config?.apiKey && config?.projectId && config?.messagingSenderId && config?.appId) {
        importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js');
        importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js');
        firebase.initializeApp(config);
        firebase.messaging().onBackgroundMessage((payload) => {
            const data = payload.data || {};
            return self.registration.showNotification(data.title || 'Jemari Home Spa', {
                body: data.body || 'Ada pengingat jadwal baru.',
                icon: '/images/logo-pwa-192.png', badge: '/images/logo-pwa-192.png',
                tag: data.tag || `push-${payload.messageId}`,
                data: { jemariPush: true, notificationId: data.notification_id, url: scheduleNotificationUrl(data.url) },
            });
        });
    }
} catch (error) {
    console.warn('Firebase Messaging worker belum tersedia. Periksa konfigurasi dan koneksi.');
}
