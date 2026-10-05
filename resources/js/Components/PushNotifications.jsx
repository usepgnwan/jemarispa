import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { isPushConfigured, registerPushDevice, subscribeForeground } from '@/lib/pushMessaging';

export default function PushNotifications() {
    const { auth, push_config: config } = usePage().props;
    const user = auth?.user;
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (!user?.is_active || !['admin', 'cs'].includes(user.role) || !isPushConfigured(config)) return;
        let disposed = false;
        let unsubscribe;
        subscribeForeground(config, (payload) => {
            if (!disposed) {
                setMessage(payload.data || payload.notification);
                window.dispatchEvent(new Event('jemari:push-devices'));
            }
        }).then((stop) => { if (disposed) stop(); else unsubscribe = stop; }).catch(() => {});
        registerPushDevice(config, user.id).catch(() => {});
        return () => { disposed = true; unsubscribe?.(); };
    }, [user?.id, user?.role, user?.is_active, config?.vapidKey]);

    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => setMessage(null), 12000);
        return () => clearTimeout(timer);
    }, [message]);

    if (!message) return null;
    const scheduleUrl = /^\/admin\/scheduler(?:\/\d+)?$/.test(message.url || '') ? message.url : '/admin/scheduler';
    return (
        <div role="status" aria-live="polite" className="fixed bottom-5 right-5 z-[100] max-w-sm rounded-xl border bg-white p-4 shadow-xl">
            <div className="flex justify-between gap-4">
                <strong>{message.title || 'Pengingat jadwal'}</strong>
                <button aria-label="Tutup notifikasi" onClick={() => setMessage(null)}>✕</button>
            </div>
            <p className="mt-2 whitespace-pre-line text-sm text-gray-600">{message.body}</p>
            <Link className="mt-2 inline-block text-sm text-orange-600" href={scheduleUrl} onClick={() => setMessage(null)}>Lihat jadwal</Link>
        </div>
    );
}
