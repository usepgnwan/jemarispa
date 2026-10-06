import { useEffect, useState } from 'react';
import axios from 'axios';

const statusLabels = { pending: 'Memproses', success: 'Sukses', failed: 'Gagal' };

export default function PushNotificationLogs({ formatTime }) {
    const [filters, setFilters] = useState({ type: '', status: '', date: '', page: 1 });
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        let active = true;
        let sequence = 0;
        setLoading(true);
        const load = async () => {
            const request = ++sequence;
            try {
                const { data } = await axios.get('/api/notifications/logs', { params: filters });
                if (active && request === sequence) { setResult(data); setError(''); }
            } catch (e) {
                if (active && request === sequence) setError(e.response?.data?.message || 'Gagal memuat log push.');
            } finally {
                if (active && request === sequence) setLoading(false);
            }
        };
        load();
        const timer = setInterval(load, 15000);
        return () => { active = false; clearInterval(timer); };
    }, [filters, refresh]);

    const filter = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: 1 }));

    return (
        <div className="mt-4">
            <h3 className="text-lg font-bold">Log Push</h3>
            <p className="mt-1 text-xs text-gray-500">Riwayat pengiriman akun Anda. Sukses berarti pesan diterima FCM. Setiap percobaan ulang dicatat terpisah.</p>
            <div className="my-4 flex flex-wrap gap-2">
                <select aria-label="Tipe log" value={filters.type} onChange={(e) => filter('type', e.target.value)} className="rounded-lg border-gray-300 text-sm">
                    <option value="">Semua tipe</option><option value="test">Tes</option><option value="scheduler">Scheduler</option>
                </select>
                <select aria-label="Status log" value={filters.status} onChange={(e) => filter('status', e.target.value)} className="rounded-lg border-gray-300 text-sm">
                    <option value="">Semua status</option><option value="success">Sukses</option><option value="failed">Gagal</option><option value="pending">Memproses</option>
                </select>
                <input type="date" aria-label="Tanggal log" value={filters.date} onChange={(e) => filter('date', e.target.value)} className="rounded-lg border-gray-300 text-sm" />
                <button onClick={() => setRefresh((value) => value + 1)} className="rounded-lg border px-3 py-2 text-sm">Refresh</button>
            </div>
            {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead><tr className="border-b text-gray-500">
                        {['Waktu', 'Tipe', 'Pesan', 'Penerima / Device', 'Status', 'Detail / Error'].map((label) => <th key={label} className="p-2">{label}</th>)}
                    </tr></thead>
                    <tbody>
                        {loading ? <tr><td colSpan={6} className="p-4 text-gray-500">Memuat log…</td></tr>
                            : result?.data.map((log) => <tr key={log.id} className="border-b align-top">
                                <td className="whitespace-nowrap p-2">{formatTime(log.created_at)}<div className="text-xs text-gray-400">#{log.id}</div></td>
                                <td className="p-2">{log.type === 'test' ? 'Tes' : 'Scheduler'}</td>
                                <td className="min-w-56 p-2"><strong>{log.title}</strong><p className="whitespace-pre-line">{log.body}</p>
                                    {log.notify_before_minutes != null && <p className="mt-1 text-xs text-gray-500">Reminder: {log.notify_before_minutes} menit sebelum jadwal</p>}</td>
                                <td className="max-w-48 break-words p-2">
                                    <p className="font-semibold">User: {log.receiver_user_name || '-'}</p>
                                    <p className="text-xs text-gray-500">Label: {log.device_label || '-'}</p>
                                    <p className="text-xs text-gray-500">Device: {log.device_name || (log.push_device_id ? `Device ${log.push_device_id}` : '-')}</p>
                                </td>
                                <td className="p-2"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${log.status === 'success' ? 'bg-green-50 text-green-700' : log.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{statusLabels[log.status] || log.status}</span></td>
                                <td className="min-w-56 max-w-sm break-words p-2">
                                    {log.error_code && <strong className="text-xs text-red-700">{log.error_code}</strong>}
                                    {log.error_message && <p className="text-red-600">{log.error_message}</p>}
                                    {log.fcm_message_id && <p className="break-all text-xs text-gray-500">{log.fcm_message_id}</p>}
                                    {log.finished_at && <p className="mt-1 text-xs text-gray-400">Selesai: {formatTime(log.finished_at)}</p>}
                                </td>
                            </tr>)}
                        {!loading && !error && !result?.data.length && <tr><td colSpan={6} className="p-4 text-gray-500">Belum ada log sesuai filter. Pengiriman baru akan tercatat di sini.</td></tr>}
                    </tbody>
                </table>
            </div>
            {result && <div className="mt-4 flex items-center justify-between gap-2 text-sm">
                <span>{result.total} log · Halaman {result.current_page} / {result.last_page}</span>
                <div className="flex gap-2">
                    <button disabled={loading || filters.page <= 1} onClick={() => setFilters((value) => ({ ...value, page: value.page - 1 }))} className="rounded-lg border px-3 py-2 disabled:opacity-50">Sebelumnya</button>
                    <button disabled={loading || filters.page >= result.last_page} onClick={() => setFilters((value) => ({ ...value, page: value.page + 1 }))} className="rounded-lg border px-3 py-2 disabled:opacity-50">Berikutnya</button>
                </div>
            </div>}
        </div>
    );
}
