import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeftIcon, CalendarDaysIcon, ClockIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const statuses = {
    pending: ['Pending', 'bg-slate-100 text-slate-700'],
    send_terapis: ['Kirim Terapis', 'bg-blue-50 text-blue-700'],
    invoice: ['Invoice', 'bg-amber-50 text-amber-700'],
    success: ['Selesai', 'bg-green-50 text-green-700'],
    failed: ['Gagal', 'bg-red-50 text-red-700'],
};
const reminderStatuses = { pending: 'Menunggu scheduler', queued: 'Dalam antrean', sent: 'Diterima FCM', failed: 'Gagal', cancelled: 'Dibatalkan', partial: 'Sebagian terkirim' };

export default function Show({ schedule, reminder, timezone, delivery }) {
    const isTherapist = usePage().props.auth.user.role === 'terapis';
    const [status, statusClass] = statuses[schedule.status] || [schedule.status, 'bg-gray-100 text-gray-700'];
    const formatDate = (value) => new Intl.DateTimeFormat('id-ID', {
        timeZone: timezone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date(value));
    const formatTime = (value) => new Intl.DateTimeFormat('id-ID', {
        timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).format(new Date(value));
    const therapists = [...new Set(schedule.items.map((item) => item.therapist_name).filter(Boolean))];

    return (
        <AuthenticatedLayout>
            <Head title={`Detail Jadwal ${schedule.order_number}`} />
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <Link href={route(isTherapist ? 'admin.therapist_user.notifications' : 'admin.scheduler.index')} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-zenith-orange">
                    <ArrowLeftIcon className="h-4 w-4" /> {isTherapist ? 'Kembali ke Notifikasi' : 'Kembali ke Scheduler'}
                </Link>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">{isTherapist ? 'Notifikasi' : 'Scheduler'} / Detail Jadwal</p>
                        <h1 className="text-2xl font-bold text-gray-900">{schedule.order_number}</h1>
                        <p className="mt-1 text-gray-500">{schedule.customer_name}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClass}`}>{status}</span>
                </div>

                <div className="mb-6 rounded-2xl border border-orange-100 bg-orange-50 p-5 sm:p-6">
                    <div className="flex items-center gap-2 font-semibold text-gray-900"><CalendarDaysIcon className="h-5 w-5 text-zenith-orange" />{formatDate(schedule.schedule_at)}</div>
                    <div className="mt-3 flex items-center gap-2 text-xl font-bold text-gray-900"><ClockIcon className="h-5 w-5 text-zenith-orange" />{formatTime(schedule.schedule_at)}<span className="text-xs font-normal text-gray-500">{timezone}</span></div>
                    <p className="mt-3 text-sm text-gray-700"><strong>Terapis:</strong> {therapists.join(', ') || 'Belum ditentukan'}</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <section className="rounded-2xl border bg-white p-5 sm:p-6">
                        <h2 className="mb-4 flex items-center gap-2 font-bold text-gray-900"><UserIcon className="h-5 w-5 text-zenith-orange" /> Pemesan</h2>
                        <dl className="space-y-4 text-sm">
                            <div><dt className="text-gray-500">Nama</dt><dd className="mt-1 font-semibold text-gray-900">{schedule.customer_name}</dd></div>
                            <div><dt className="text-gray-500">Nomor telepon</dt><dd className="mt-1 text-gray-900">{schedule.phone || 'Belum diisi'}</dd></div>
                            <div><dt className="flex items-center gap-1 text-gray-500"><MapPinIcon className="h-4 w-4" /> Alamat layanan</dt><dd className="mt-1 whitespace-pre-line break-words text-gray-900">{schedule.address || 'Belum diisi'}</dd></div>
                        </dl>
                    </section>
                    <section className="rounded-2xl border bg-white p-5 sm:p-6">
                        <h2 className="mb-4 font-bold text-gray-900">Pengingat Anda</h2>
                        {reminder ? <div className="space-y-3 text-sm">
                            <p><span className="text-gray-500">Reminder sebelum:</span> <strong>{reminder.notify_before_minutes} menit</strong></p>
                            <p><span className="text-gray-500">Waktu pengingat:</span><br />{formatDate(reminder.notify_at)}, {formatTime(reminder.notify_at)}</p>
                            <p><span className="text-gray-500">Status:</span> {reminderStatuses[reminder.status] || reminder.status}</p>
                            {reminder.error_message && <p className="text-red-600">{reminder.error_message}</p>}
                        </div> : <p className="text-sm text-gray-500">Belum ada pengingat untuk akun Anda.</p>}
                    </section>
                </div>

                {delivery && <section className="mt-6 rounded-2xl border bg-white p-5 sm:p-6">
                    <h2 className="mb-2 font-bold text-gray-900">Penerima Notifikasi</h2>
                    <p className="mb-4 text-sm text-gray-500">{delivery.success_count} device sukses · {delivery.failed_count} device gagal</p>
                    <div className="divide-y">{delivery.recipients.map((recipient, index) => <div key={index} className="py-3 text-sm">
                        <p className="font-semibold">{recipient.user_name || `User ${recipient.user_id}`}</p>
                        <p className="mt-1 text-gray-500">{recipient.device_label || recipient.device_name || 'Belum ada device saat pengiriman'}</p>
                        {recipient.device_label && <p className="text-xs text-gray-500">{recipient.device_name}</p>}
                        <p className={`mt-1 font-semibold ${recipient.status === 'success' ? 'text-green-700' : recipient.status === 'failed' ? 'text-red-700' : 'text-gray-500'}`}>
                            {{ success: 'Sukses — diterima FCM', failed: 'Gagal', pending: 'Memproses', no_device: 'Tidak ada device' }[recipient.status]}
                        </p>
                        {recipient.error_message && <p className="mt-1 text-xs text-gray-500">{recipient.error_code}: {recipient.error_message}</p>}
                    </div>)}</div>
                </section>}

                <section className="mt-6 rounded-2xl border bg-white p-5 sm:p-6">
                    <h2 className="mb-4 font-bold text-gray-900">Layanan & Terapis</h2>
                    <div className="divide-y">
                        {schedule.items.map((item) => <div key={item.id} className="flex flex-col justify-between gap-2 py-4 first:pt-0 sm:flex-row">
                            <div><p className="font-semibold text-gray-900">{item.package_name || 'Layanan'}</p><p className="mt-1 text-sm text-gray-500">Tamu {item.guest_index}{item.package_duration ? ` · ${item.package_duration} menit` : ''}</p></div>
                            <p className="text-sm text-gray-700">Terapis: <strong>{item.therapist_name || 'Belum ditentukan'}</strong> - {formatTime(schedule.schedule_at)}</p>
                        </div>)}
                        {!schedule.items.length && <p className="text-sm text-gray-500">Belum ada layanan pada jadwal ini.</p>}
                    </div>
                </section>
                <section className="mt-6 rounded-2xl border bg-white p-5 sm:p-6">
                    <h2 className="mb-3 font-bold text-gray-900">Catatan</h2>
                    <p className="whitespace-pre-line break-words text-sm text-gray-600">{schedule.notes || 'Tidak ada catatan.'}</p>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
