import { Link } from '@inertiajs/react';
import { ClockIcon } from '@heroicons/react/24/outline';

const statuses = {
    pending: ['Menunggu scheduler', 'bg-amber-50 text-amber-700'],
    queued: ['Dalam antrean', 'bg-blue-50 text-blue-700'],
    sent: ['Diterima FCM', 'bg-green-50 text-green-700'],
    failed: ['Gagal', 'bg-red-50 text-red-700'],
    cancelled: ['Dibatalkan', 'bg-gray-100 text-gray-500'],
    partial: ['Sebagian terkirim', 'bg-orange-50 text-orange-700'],
};

export default function SchedulerTimeline({ timeline, loading, formatTime }) {
    return (
        <aside aria-label="Daftar scheduler" className="min-w-0 self-start rounded-xl border border-gray-200 bg-gray-50/60 p-4">
            <div className="mb-4">
                <h3 className="flex items-center gap-2 font-bold text-gray-900"><ClockIcon className="h-5 w-5 text-zenith-orange" /> Scheduler</h3>
                <p className="mt-1 text-xs text-gray-500">Waktu pengiriman reminder · semua tanggal</p>
            </div>
            {loading ? <p className="text-sm text-gray-500">Memuat scheduler…</p> : <div className="space-y-5">
                {[
                    { key: 'upcoming', title: 'Akan datang', empty: 'Belum ada reminder mendatang.', hint: '10 reminder berikutnya', count: timeline?.upcoming_count || 0 },
                    { key: 'past', title: 'Sudah lewat', empty: 'Belum ada reminder yang waktunya lewat.', hint: '10 reminder terbaru', count: timeline?.past_count || 0 },
                ].map((group) => <section key={group.key} aria-label={group.title}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-gray-800">{group.title}</h4>
                        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-500 ring-1 ring-gray-200">{group.count}</span>
                    </div>
                    <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                        {(timeline?.[group.key] || []).map((notification) => {
                            const [label, color] = statuses[notification.status] || [notification.status, 'bg-gray-100 text-gray-600'];
                            return <Link key={notification.id} href={route('admin.scheduler.show', notification.schedule_id)}
                                className="block rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-zenith-orange/40">
                                <p className="break-words text-sm font-semibold text-gray-900">{notification.customer_name}</p>
                                <p className="mt-0.5 break-all text-[11px] text-gray-400">{notification.order_number}</p>
                                <p className="mt-2 text-xs font-medium text-gray-700">Kirim: {formatTime(notification.notify_at)}</p>
                                <p className="mt-1 text-[11px] text-gray-500">Jadwal: {formatTime(notification.schedule_at)}</p>
                                <span className={`mt-2 inline-block rounded-full px-2 py-1 text-[10px] font-semibold ${color}`}>{label}</span>
                                {notification.error_message && <p className="mt-2 break-words text-xs text-red-600">{notification.error_message}</p>}
                            </Link>;
                        })}
                        {!timeline?.[group.key]?.length && <p className="rounded-lg border border-dashed border-gray-200 p-3 text-xs text-gray-400">{group.empty}</p>}
                    </div>
                    {group.count > 10 && <p className="mt-2 text-[11px] text-gray-400">Menampilkan {group.hint}.</p>}
                </section>)}
            </div>}
        </aside>
    );
}
