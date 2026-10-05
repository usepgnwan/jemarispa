import axios from 'axios';

let messagingPromise;

export function isPushConfigured(config) {
    return Boolean(config?.firebase?.apiKey && config?.firebase?.projectId
        && config?.firebase?.messagingSenderId && config?.firebase?.appId && config?.vapidKey);
}

async function messagingClient(config) {
    if (!isPushConfigured(config)) throw new Error('Konfigurasi Firebase Web dan VAPID belum lengkap.');
    if (!window.isSecureContext || !('serviceWorker' in navigator) || !('Notification' in window)) {
        throw new Error('Push membutuhkan HTTPS dan browser yang mendukung notifikasi.');
    }
    if (!messagingPromise) {
        messagingPromise = (async () => {
            const [appSdk, sdk] = await Promise.all([import('firebase/app'), import('firebase/messaging')]);
            if (!(await sdk.isSupported())) throw new Error('Firebase Messaging tidak didukung browser ini.');
            const app = appSdk.getApps().find((app) => app.name === 'jemari-push')
                || appSdk.initializeApp(config.firebase, 'jemari-push');
            return { sdk, messaging: sdk.getMessaging(app) };
        })().catch((error) => { messagingPromise = undefined; throw error; });
    }
    return messagingPromise;
}

export async function registerPushDevice(config, userId, requestPermission = false) {
    try {
        const key = `jemari-push-disabled-${userId}`;
        if (requestPermission) localStorage.removeItem(key);
        else if (localStorage.getItem(key) === 'true') return null;
    } catch { /* Storage may be unavailable. */ }
    // Permission request runs directly from a button click (required on mobile Safari).
    if (!('Notification' in window)) throw new Error('Browser ini tidak mendukung notifikasi.');
    if (requestPermission && Notification.permission !== 'granted') {
        if (await Notification.requestPermission() !== 'granted') {
            throw new Error('Izin notifikasi belum diberikan. Ubah izin melalui pengaturan browser.');
        }
    }
    if (Notification.permission !== 'granted') return null;
    const { sdk, messaging } = await messagingClient(config);
    await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });
    const registration = await navigator.serviceWorker.ready;
    const token = await sdk.getToken(messaging, { vapidKey: config.vapidKey, serviceWorkerRegistration: registration });
    if (!token) throw new Error('FCM tidak mengembalikan token device.');
    const platform = /iPad|iPhone|iPod/.test(navigator.userAgent) ? 'ios'
        : /Android/.test(navigator.userAgent) ? 'android' : 'web';
    const { data } = await axios.post('/api/push/devices', {
        fcm_token: token, platform,
        device_name: `${platform} • ${navigator.userAgent.slice(0, 180)}`,
    });
    const storageKey = `jemari-push-device-${userId}`;
    try {
        const oldId = localStorage.getItem(storageKey);
        if (oldId && Number(oldId) !== data.device.id) {
            await axios.delete(`/api/push/devices/${oldId}`).catch(() => {});
        }
        localStorage.setItem(storageKey, data.device.id);
    } catch { /* Private browsing may disable localStorage. */ }
    window.dispatchEvent(new Event('jemari:push-devices'));
    return data.device;
}

export async function subscribeForeground(config, callback) {
    const { sdk, messaging } = await messagingClient(config);
    return sdk.onMessage(messaging, callback);
}

export async function disablePushDevice(id, config, userId) {
    await axios.delete(`/api/push/devices/${id}`);
    try {
        const key = `jemari-push-device-${userId}`;
        if (Number(localStorage.getItem(key)) === id) {
            localStorage.setItem(`jemari-push-disabled-${userId}`, 'true');
            const { sdk, messaging } = await messagingClient(config);
            await sdk.deleteToken(messaging);
            localStorage.removeItem(key);
        }
    } finally {
        window.dispatchEvent(new Event('jemari:push-devices'));
    }
}
