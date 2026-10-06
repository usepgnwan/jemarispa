import { useCallback, useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { BellIcon } from '@heroicons/react/24/outline';
import { DialogTitle } from '@headlessui/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { disablePushDevice, isPushConfigured, registerPushDevice } from '@/lib/pushMessaging';

const buttonClass = 'rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50';

function usePaginatedList(url) {
    const [page, setPage] = useState(1);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refresh, setRefresh] = useState(0);
    const reload = useCallback(() => setRefresh((value) => value + 1), []);
    useEffect(() => {
        let active = true;
        let sequence = 0;
        setLoading(true);
        const load = async () => {
            const current = ++sequence;
            try {
                const { data } = await axios.get(url, { params: { page } });
                if (!active || current !== sequence) return;
                if (page > data.last_page) { setPage(data.last_page); return; }
                setResult(data); setError('');
            } catch (e) {
                if (active && current === sequence) setError(e.response?.data?.message || 'Gagal memuat data.');
            } finally {
                if (active && current === sequence) setLoading(false);
            }
        };
        load();
        const timer = setInterval(load, 15000);
        window.addEventListener('jemari:push-devices', load);
        return () => { active = false; clearInterval(timer); window.removeEventListener('jemari:push-devices', load); };
    }, [url, page, refresh]);
    return { result, loading, error, reload, changePage: (value) => { setLoading(true); setPage(value); } };
}

function Pagination({ list, label }) {
    const data = list.result;
    if (!data?.total) return null;
    return <nav aria-label={label} className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm">
        <span className="text-gray-500">{data.from}–{data.to} dari {data.total} · Halaman {data.current_page} / {data.last_page}</span>
        <div className="flex gap-2">
            <button className={buttonClass} disabled={list.loading || data.current_page <= 1} onClick={() => list.changePage(data.current_page - 1)}>Sebelumnya</button>
            <button className={buttonClass} disabled={list.loading || data.current_page >= data.last_page} onClick={() => list.changePage(data.current_page + 1)}>Berikutnya</button>
        </div>
    </nav>;
}

export default function Notifications() {
    const { auth, push_config: config } = usePage().props;
    const devices = usePaginatedList('/api/push/devices');
    const history = usePaginatedList('/api/notifications/received');
    const [modal, setModal] = useState(null);
    const [label, setLabel] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState('');
    const openModal = (device = null) => { setLabel(device?.device_label || ''); setError(''); setModal({ device }); };
    const run = async (action) => {
        setBusy(true); setError(''); setFeedback('');
        try { setFeedback(await action()); devices.reload(); }
        catch (e) { setError(Object.values(e.response?.data?.errors || {}).flat().join(' ') || e.response?.data?.message || e.message); }
        finally { setBusy(false); }
    };
    const save = (event) => {
        event.preventDefault();
        if (!label.trim()) { setError('Label device wajib diisi.'); return; }
        run(async () => {
            if (modal.device) await axios.patch(`/api/push/devices/${modal.device.id}`, { device_label: label.trim() });
            else if (!await registerPushDevice(config, auth.user.id, true, label.trim())) throw new Error('Device belum berhasil diaktifkan.');
            const message = modal.device ? 'Label device disimpan.' : 'Notifikasi aktif di device ini.';
            setModal(null);
            return message;
        });
    };
    const formatTime = (value) => value ? new Intl.DateTimeFormat('id-ID', {
        timeZone: config?.timezone || 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short',
    }).format(new Date(value)) : '-';

    return <AuthenticatedLayout>
        <Head title="Notifikasi" />
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
            <div><h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900"><BellIcon className="h-6 w-6 text-zenith-orange" />Notifikasi</h1>
                <p className="mt-2 text-sm text-gray-500">Aktifkan perangkat dan lihat riwayat notifikasi untuk akun Anda.</p></div>
            <section aria-label="Device notifikasi" className="rounded-2xl border bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">Device Aktif</h2>
                    <button className="rounded-lg bg-zenith-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={busy || !isPushConfigured(config)} onClick={() => openModal()}>Aktifkan Push di Device Ini</button></div>
                {!isPushConfigured(config) && <p className="mt-3 text-sm text-amber-700">Notifikasi belum tersedia. Hubungi admin untuk mengaktifkannya.</p>}
                {feedback && <p role="status" className="mt-3 text-sm text-green-700">{feedback}</p>}
                {error && !modal && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
                {devices.error && <p role="alert" className="mt-3 text-sm text-red-600">{devices.error}</p>}
                {devices.loading ? <p className="mt-4 text-sm text-gray-500">Memuat device…</p> : !devices.result?.data.length ? <p className="mt-4 text-sm text-gray-500">Belum ada device aktif. Aktifkan perangkat ini untuk menerima notifikasi.</p>
                    : <div className="mt-4 divide-y">{devices.result.data.map((device) => <div key={device.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <div><p className="font-semibold">{device.device_label || `Device ${device.id}`}</p><p className="text-xs text-gray-500">{auth.user.name}</p></div>
                        <div className="flex gap-2"><button className={buttonClass} disabled={busy} onClick={() => openModal(device)}>Edit Label</button>
                            <button className={buttonClass} disabled={busy} onClick={() => run(async () => { await disablePushDevice(device.id, config, auth.user.id); return 'Device dinonaktifkan.'; })}>Nonaktifkan</button></div>
                    </div>)}</div>}
                <Pagination list={devices} label="Pagination device" />
            </section>
            <section aria-label="Riwayat notifikasi" className="rounded-2xl border bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Riwayat Notifikasi</h2><button className={buttonClass} disabled={history.loading} onClick={history.reload}>Refresh</button></div>
                {history.error && <p role="alert" className="mt-3 text-sm text-red-600">{history.error}</p>}
                {history.loading ? <p className="mt-4 text-sm text-gray-500">Memuat notifikasi…</p> : !history.result?.data.length ? <p className="mt-4 text-sm text-gray-500">Belum ada notifikasi untuk akun Anda.</p>
                    : <div className="mt-4 divide-y">{history.result.data.map((notification) => <article key={notification.id} className="py-4">
                        <p className="text-xs text-gray-500">{formatTime(notification.finished_at || notification.created_at)}</p>
                        <h3 className="mt-1 font-semibold text-gray-900">{notification.title}</h3><p className="mt-2 whitespace-pre-line text-sm text-gray-600">{notification.body}</p>
                        <p className="mt-2 text-xs text-gray-500">Device: {notification.device_label || '-'}</p>
                        {notification.schedule_id && <Link href={route('admin.scheduler.show', notification.schedule_id)} className="mt-3 inline-block text-sm font-semibold text-zenith-orange">Lihat detail jadwal</Link>}
                    </article>)}</div>}
                <Pagination list={history} label="Pagination riwayat notifikasi" />
            </section>
        </div>
        <Modal show={modal !== null} maxWidth="md" closeable={!busy} onClose={() => setModal(null)}>
            <form onSubmit={save} className="p-6"><DialogTitle className="text-lg font-bold">{modal?.device ? 'Edit Label Device' : 'Aktifkan Device'}</DialogTitle>
                <label htmlFor="therapist-device-label" className="mt-5 block text-sm font-semibold">Label Device</label>
                <input id="therapist-device-label" autoFocus required maxLength={255} disabled={busy} value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Contoh: HP Sari" className="mt-2 w-full rounded-lg border-gray-300 text-sm" />
                {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
                <div className="mt-5 flex justify-end gap-2"><button type="button" className={buttonClass} disabled={busy} onClick={() => setModal(null)}>Batal</button>
                    <button disabled={busy || !label.trim()} className="rounded-lg bg-zenith-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Menyimpan…' : modal?.device ? 'Simpan Label' : 'Aktifkan Push'}</button></div>
            </form>
        </Modal>
    </AuthenticatedLayout>;
}
