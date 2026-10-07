export async function showForegroundPushNotification(payload) {
    if (!('Notification' in window) || Notification.permission !== 'granted'
        || !('serviceWorker' in navigator)) return false;

    const registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration) return false;

    const data = payload.data || payload.notification || {};
    const url = data.url === '/terapis/notifikasi'
        || /^\/admin\/scheduler(?:\/\d+)?$/.test(data.url || '')
        ? data.url : '/admin/scheduler';

    await registration.showNotification(data.title || 'Jemari Home Spa', {
        body: data.body || 'Ada pengingat jadwal baru.',
        icon: '/images/logo-pwa-192.png',
        badge: '/images/logo-pwa-192.png',
        tag: data.tag || `push-${payload.messageId || Date.now()}`,
        data: { jemariPush: true, notificationId: data.notification_id, url },
    });
    return true;
}
