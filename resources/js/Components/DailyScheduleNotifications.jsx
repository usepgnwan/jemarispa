import { useCallback, useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import PushNotificationLogs from '@/Components/PushNotificationLogs';
import SchedulerTimeline from '@/Components/SchedulerTimeline';
import Modal from '@/Components/Modal';
import { DialogTitle } from '@headlessui/react';
import { disablePushDevice, isPushConfigured, registerPushDevice } from '@/lib/pushMessaging';

const buttonClass = 'rounded-lg border px-3 py-2 text-sm disabled:opacity-50 hover:bg-gray-50';
const statusLabels = {
    pending: 'Menunggu scheduler', queued: 'Dalam antrean', sent: 'Diterima FCM',
    failed: 'Gagal', cancelled: 'Dibatalkan', partial: 'Sebagian terkirim',
};

function dateInTimezone(timezone, offsetDays = 0) {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const value = (type) => parts.find((part) => part.type === type).value;
    const day = new Date(`${value('year')}-${value('month')}-${value('day')}T12:00:00Z`);
    day.setUTCDate(day.getUTCDate() + offsetDays);
    return day.toISOString().slice(0, 10);
}

function ReminderEditor({ schedule, busy, run }) {
    const saved = schedule.notification.notify_before_minutes;
    const [minutes, setMinutes] = useState(String(saved));
    useEffect(() => setMinutes(String(saved)), [saved, schedule.id]);
    const locked = ['success', 'failed'].includes(schedule.status) || new Date(schedule.schedule_at) <= new Date();
    return (
        <form className="flex min-w-40 flex-wrap items-center gap-2" onSubmit={(event) => {
            event.preventDefault();
            run(() => axios.patch(`/api/schedules/${schedule.id}/notification`, { notify_before_minutes: Number(minutes) })
                .then(() => `Reminder ${schedule.order_number} disimpan: ${minutes} menit sebelum jadwal.`));
        }}>
            <input type="number" min="1" max="10080" step="1" required aria-label={`Reminder ${schedule.order_number}`}
                className="w-24 rounded-lg border-gray-300 text-sm" value={minutes} disabled={busy || locked}
                onChange={(event) => setMinutes(event.target.value)} />
            <span className="text-xs text-gray-500">menit</span>
            <button type="submit" className={buttonClass} disabled={busy || locked || Number(minutes) === saved}>Simpan</button>
            {locked && <span className="text-xs text-gray-400">Jadwal sudah lewat / selesai.</span>}
        </form>
    );
}

export default function DailyScheduleNotifications() {
    const { auth, push_config: config } = usePage().props;
    const timezone = config?.timezone || 'Asia/Jakarta';
    const [date, setDate] = useState(() => dateInTimezone(timezone));
    const [result, setResult] = useState({ schedules: [], devices: [], tests: [] });
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');
    const [delay, setDelay] = useState(1);
    const [deviceId, setDeviceId] = useState('');
    const [devicePage, setDevicePage] = useState(1);
    const [tab, setTab] = useState('schedules');
    const [deviceModal, setDeviceModal] = useState(null);
    const [deviceName, setDeviceName] = useState('');
    const [deviceError, setDeviceError] = useState('');
    const requestSequence = useRef(0);

    const load = useCallback(async () => {
        const sequence = ++requestSequence.current;
        try {
            const { data } = await axios.get('/api/schedules/today', { params: { date, device_page: devicePage, device_id: deviceId || undefined } });
            if (sequence === requestSequence.current) setResult(data);
        } catch (e) {
            if (sequence === requestSequence.current) setError(e.response?.data?.message || 'Gagal memuat jadwal harian.');
        } finally {
            if (sequence === requestSequence.current) setLoading(false);
        }
    }, [date, devicePage, deviceId]);

    useEffect(() => {
        setLoading(true);
        load();
        const timer = setInterval(load, 15000);
        window.addEventListener('jemari:push-devices', load);
        return () => {
            requestSequence.current++;
            clearInterval(timer);
            window.removeEventListener('jemari:push-devices', load);
        };
    }, [load]);

    useEffect(() => {
        if (!result.devices.some((device) => String(device.id) === String(deviceId))) {
            setDeviceId(result.devices[0]?.id || '');
        }
    }, [result.devices, deviceId]);

    useEffect(() => {
        if (result.active_devices) setDevicePage(result.active_devices.current_page);
    }, [result.active_devices]);

    const run = async (action) => {
        setBusy(true); setError(''); setFeedback('');
        try {
            const message = await action();
            setFeedback(message || 'Perubahan disimpan.');
            await load();
        } catch (e) {
            const errors = e.response?.data?.errors;
            setError(errors ? Object.values(errors).flat().join(' ') : e.response?.data?.message || e.message);
        } finally { setBusy(false); }
    };

    const changeDay = (amount) => {
        const day = new Date(`${date}T12:00:00Z`);
        day.setUTCDate(day.getUTCDate() + amount);
        setDate(day.toISOString().slice(0, 10));
    };
    const openDeviceModal = (device = null) => {
        setDeviceName(device?.device_label || '');
        setDeviceError('');
        setDeviceModal({ device });
    };
    const saveDevice = async (event) => {
        event.preventDefault();
        const label = deviceName.trim();
        if (!label) {
            setDeviceError('Title / label device wajib diisi.');
            return;
        }
        setBusy(true); setDeviceError(''); setError(''); setFeedback('');
        try {
            if (deviceModal.device) {
                await axios.patch(`/api/push/devices/${deviceModal.device.id}`, { device_label: label });
            } else {
                const device = await registerPushDevice(config, auth.user.id, true, label);
                if (!device) throw new Error('Device belum berhasil diaktifkan.');
            }
            setFeedback(deviceModal.device ? 'Label device disimpan.' : 'Push aktif di device ini.');
            setDeviceModal(null);
            await load();
        } catch (e) {
            const errors = e.response?.data?.errors;
            setDeviceError(errors ? Object.values(errors).flat().join(' ') : e.response?.data?.message || e.message);
        } finally { setBusy(false); }
    };
    const formatTime = (value) => value ? new Intl.DateTimeFormat('id-ID', {
        timeZone: timezone, day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(value)) : '—';
    const selectedDevice = result.devices.find((device) => String(device.id) === String(deviceId));

    return (
        <section className="mb-6 rounded-2xl border bg-white p-4 sm:p-6" aria-label="Jadwal harian dan push notification">
            <nav aria-label="Menu scheduler" className="mb-5 flex gap-2 overflow-x-auto border-b pb-3">
                {[['schedules', 'Tes & Jadwal'], ['settings', 'Setting'], ['logs', 'Log Push']].map(([id, label]) => (
                    <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}
                        className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${tab === id ? 'bg-zenith-orange text-white' : 'text-gray-500 hover:bg-gray-50'}`}>{label}</button>
                ))}
            </nav>
            {tab === 'logs' ? <PushNotificationLogs formatTime={formatTime} /> : <>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-bold">{tab === 'settings' ? 'Setting Push' : 'Jadwal harian'}</h3>
                    <p className="text-xs text-gray-500">Data transaksi • {timezone} • reminder untuk akun Anda</p>
                </div>
                {tab === 'schedules' && <div className="flex flex-wrap items-center gap-2">
                    <button className={buttonClass} onClick={() => changeDay(-1)} aria-label="Hari sebelumnya">←</button>
                    <input aria-label="Tanggal jadwal" className="rounded-lg border-gray-300 text-sm" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
                    <button className={buttonClass} onClick={() => changeDay(1)} aria-label="Hari berikutnya">→</button>
                    <button className={buttonClass} onClick={() => setDate(dateInTimezone(timezone))}>Hari ini</button>
                </div>}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                {tab === 'settings' && <button disabled={busy || !isPushConfigured(config)} className={buttonClass}
                    onClick={() => openDeviceModal()}>Aktifkan Push di Device Ini</button>}
                <select aria-label="Device untuk tes dan filter jadwal" className="max-w-xs rounded-lg border-gray-300 text-sm" value={deviceId} onChange={(e) => { setLoading(true); setDeviceId(e.target.value); }}>
                    <option value="">{result.devices.length ? 'Pilih device aktif' : 'Tidak ada device aktif'}</option>
                    {result.devices.map((device) => <option key={device.id} value={device.id}>{device.device_label || `Device ${device.id}`} — {device.user?.name || `User ${device.user_id}`}</option>)}
                </select>
                {tab === 'settings' && <><button disabled={busy || !deviceId} className={buttonClass} onClick={() => run(async () => {
                    const { data } = await axios.post('/api/notifications/test-now', { device_id: Number(deviceId) });
                    return data.message;
                })}>Send Push Now</button>
                <select aria-label="Delay Test Scheduler" className="rounded-lg border-gray-300 text-sm" value={delay} onChange={(e) => setDelay(Number(e.target.value))}>
                    {[1, 2, 5].map((minutes) => <option key={minutes} value={minutes}>{minutes} menit</option>)}
                </select>
                <button disabled={busy || !result.devices.some((device) => device.user_id === auth.user.id)} className={buttonClass} onClick={() => run(async () => {
                    const { data } = await axios.post('/api/notifications/test-schedule', { delay_minutes: delay });
                    return `Tes #${data.notification.id} pending sampai ${formatTime(data.notification.notify_at)}. Menunggu scheduler dan queue worker.`;
                })}>Test Scheduler</button></>}
            </div>
            {!isPushConfigured(config) && <p className="mt-2 text-sm text-amber-700">Firebase Web config dan VAPID key perlu diisi di server.</p>}
            {tab === 'schedules' && <p className="mt-2 text-xs text-gray-500">Pilih device, lalu klik Tes Push untuk kirim sekarang. Simpan reminder tiap jadwal dalam menit (1–10080). Jika waktu pengingat sudah lewat, scheduler mengirim pada proses berikutnya.</p>}
            {tab === 'schedules' && <p className="mt-2 text-sm text-gray-600">{selectedDevice?.user?.role === 'terapis'
                ? `Menampilkan jadwal yang men-tag ${selectedDevice.user.name}.`
                : 'Menampilkan semua jadwal.'}</p>}
            {tab === 'schedules' && !result.devices.length && <button className="mt-2 text-sm text-zenith-orange" onClick={() => setTab('settings')}>Aktifkan device di tab Setting</button>}
            {feedback && <p role="status" className="mt-3 text-sm text-green-700">{feedback}</p>}
            {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
            {busy && <p role="status" className="mt-2 text-sm">Memproses…</p>}

            {tab === 'schedules' && <div className="mt-5 grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,85fr)_minmax(240px,25fr)]">
                <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200">
                    <div className="border-b bg-gray-50/60 px-4 py-3">
                        <h3 className="text-sm font-semibold text-gray-900">Jadwal harian</h3>
                        <p className="mt-1 text-xs text-gray-500">{date} · {result.schedules.length} jadwal</p>
                    </div>
                    <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead><tr className="border-b text-gray-500"><th className="p-2">Pesan transaksi</th><th className="p-2">Jadwal</th><th className="p-2">Reminder sebelum</th><th className="p-2">Notify at</th><th className="p-2">Status push</th><th className="p-2">Tes notifikasi</th></tr></thead>
                    <tbody>
                        {!loading && result.schedules.map((schedule) => <tr key={schedule.id} className="border-b">
                            <td className="p-2"><p className="whitespace-pre-line">{schedule.push_message}</p><span className="text-xs text-gray-500">{schedule.status}</span></td>
                            <td className="whitespace-nowrap p-2">{formatTime(schedule.schedule_at)}</td>
                            <td className="p-2"><ReminderEditor schedule={schedule} busy={busy} run={run} /></td>
                            <td className="whitespace-nowrap p-2">{formatTime(schedule.notification.notify_at)}</td>
                            <td className="p-2">{statusLabels[schedule.notification.status] || schedule.notification.status}
                                {schedule.notification.error_message && <p className="max-w-xs text-xs text-red-600">{schedule.notification.error_message}</p>}</td>
                            <td className="p-2"><button className={`${buttonClass} whitespace-nowrap`} disabled={busy || !deviceId}
                                aria-label={`Tes push ${schedule.order_number}`}
                                onClick={() => run(async () => {
                                    const { data } = await axios.post('/api/notifications/test-now', {
                                        device_id: Number(deviceId), schedule_id: schedule.id,
                                    });
                                    return data.message;
                                })}>Tes Push</button></td>
                        </tr>)}
                        <tr><td colSpan={6} className="p-2 text-gray-500">{loading ? 'Memuat jadwal…' : !result.schedules.length ? 'Tidak ada jadwal pada tanggal ini.' : ''}</td></tr>
                    </tbody>
                </table>
                    </div>
                </div>
                <SchedulerTimeline timeline={result.scheduler_timeline} loading={loading} formatTime={formatTime} />
            </div>}
            {tab === 'settings' && !!result.tests.length && <div className="mt-4 text-sm"><strong>Antrean Tes Scheduler</strong>
                {result.tests.map((test) => <p key={test.id} className="mt-1">#{test.id} • {formatTime(test.notify_at)} • {statusLabels[test.status]}{test.sent_at && ` • FCM ${formatTime(test.sent_at)}`}
                    {test.error_message && <span className="text-red-600"> • {test.error_message}</span>}</p>)}
            </div>}
            {tab === 'settings' && !!result.active_devices?.total && <details open className="mt-4 text-sm"><summary>Device aktif ({result.active_devices.total})</summary>
                {loading ? <p className="mt-3 text-gray-500">Memuat device…</p> : result.active_devices.data.map((device) => <div key={device.id} className="mt-2 flex flex-wrap items-center justify-between gap-2"><div className="min-w-0 flex-1 break-all">
                    {device.device_label && <p className="font-semibold">{device.device_label}</p>}
                    <p className="text-xs text-gray-500">{device.device_name || `Device ${device.id}`}</p>
                    <p className="text-xs text-gray-500">Akun: {device.user?.name || `User ${device.user_id}`}</p>
                </div>
                    {device.user_id === auth.user.id && <div className="flex shrink-0 gap-2">
                        <button disabled={busy} className={buttonClass} onClick={() => openDeviceModal(device)}>Edit Label</button>
                        <button disabled={busy} className={buttonClass} onClick={() => run(() => disablePushDevice(device.id, config, auth.user.id).then(() => 'Device dinonaktifkan.'))}>Nonaktifkan</button>
                    </div>}</div>)}
                <nav aria-label="Pagination device aktif" className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                    <span className="text-gray-500">{result.active_devices.from}–{result.active_devices.to} dari {result.active_devices.total} device · Halaman {result.active_devices.current_page} / {result.active_devices.last_page}</span>
                    <div className="flex gap-2">
                        <button className={buttonClass} disabled={busy || loading || devicePage <= 1} onClick={() => { setLoading(true); setDevicePage((page) => page - 1); }}>Sebelumnya</button>
                        <button className={buttonClass} disabled={busy || loading || devicePage >= result.active_devices.last_page} onClick={() => { setLoading(true); setDevicePage((page) => page + 1); }}>Berikutnya</button>
                    </div>
                </nav>
            </details>}
            </>}
            <Modal show={deviceModal !== null} maxWidth="md" closeable={!busy} onClose={() => setDeviceModal(null)}>
                <form onSubmit={saveDevice} className="p-6">
                    <DialogTitle className="text-lg font-bold">{deviceModal?.device ? 'Edit Label Device' : 'Tambahkan Device'}</DialogTitle>
                    <p className="mt-2 text-sm text-gray-500">{deviceModal?.device ? 'Ubah label agar device mudah dikenali.' : 'Beri label untuk browser / device ini, lalu aktifkan push notification.'}</p>
                    {deviceModal?.device && <p className="mt-3 break-all text-xs text-gray-500">Device: {deviceModal.device.device_name || `Device ${deviceModal.device.id}`}</p>}
                    <label htmlFor="push-device-label" className="mt-5 block text-sm font-semibold">Title / Label Device</label>
                    <input id="push-device-label" type="text" autoFocus required maxLength={255} disabled={busy}
                        className="mt-2 w-full rounded-lg border-gray-300 text-sm" placeholder="Contoh: HP Admin atau Laptop CS"
                        value={deviceName} onChange={(event) => setDeviceName(event.target.value)}
                        aria-invalid={!!deviceError} aria-describedby={deviceError ? 'push-device-error' : undefined} />
                    {deviceError && <p id="push-device-error" role="alert" className="mt-2 text-sm text-red-700">{deviceError}</p>}
                    <div className="mt-6 flex justify-end gap-2">
                        <button type="button" disabled={busy} className={buttonClass} onClick={() => setDeviceModal(null)}>Batal</button>
                        <button type="submit" disabled={busy || !deviceName.trim()} className="rounded-lg bg-zenith-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                            {busy ? 'Menyimpan…' : deviceModal?.device ? 'Simpan Label' : 'Aktifkan Push'}
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
