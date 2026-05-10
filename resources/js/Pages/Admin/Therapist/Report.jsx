import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    UserGroupIcon,
    CalendarDaysIcon,
    BanknotesIcon,
    ArrowTrendingUpIcon,
    UserIcon
} from '@heroicons/react/24/outline';

const fmt = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function Report({ therapistRevenue, filters }) {
    const [therapistMonth, setTherapistMonth] = useState(filters.month || new Date().toISOString().slice(0, 7));
    
    const handleMonthChange = (e) => {
        const newMonth = e.target.value;
        setTherapistMonth(newMonth);
        router.get(route('admin.therapist.report'), { month: newMonth }, {
            preserveState: true,
            replace: true
        });
    };

    const monthLabel = therapistMonth
        ? new Date(therapistMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
        : 'Semua Waktu';

    const totalRevenue = therapistRevenue.reduce((s, t) => s + t.revenue, 0);
    const totalCommission = therapistRevenue.reduce((s, t) => s + t.commission, 0);
    const totalNet = therapistRevenue.reduce((s, t) => s + t.net, 0);
    const totalJobs = therapistRevenue.reduce((s, t) => s + t.jobs, 0);

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Terapis" />

            <div className="py-6 space-y-8">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Laporan Keuangan</p>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Laporan Pendapatan Terapis</h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm">
                            <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                            <input
                                type="month"
                                value={therapistMonth}
                                onChange={handleMonthChange}
                                className="text-sm font-bold text-gray-700 bg-transparent border-none outline-none cursor-pointer focus:ring-0"
                            />
                        </div>
                        {therapistMonth && (
                            <button
                                onClick={() => {
                                    setTherapistMonth('');
                                    router.get(route('admin.therapist.report'), { month: '' });
                                }}
                                className="px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                            >
                                Semua Waktu
                            </button>
                        )}
                    </div>
                </div>

                {/* Summary Cards for the selected month */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
                        <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center">
                            <BanknotesIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
                            <p className="text-2xl font-extrabold text-gray-900 leading-tight">{fmt(totalRevenue)}</p>
                            <p className="text-xs text-gray-400 mt-1">{monthLabel}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
                        <div className="w-11 h-11 bg-red-50 rounded-2xl flex items-center justify-center">
                            <ArrowTrendingUpIcon className="w-5 h-5 text-red-600 rotate-180" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Komisi</p>
                            <p className="text-2xl font-extrabold text-red-600 leading-tight">{fmt(totalCommission)}</p>
                            <p className="text-xs text-gray-400 mt-1">Dibayarkan ke terapis</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-200 ring-2 ring-emerald-50 flex flex-col gap-4">
                        <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center">
                            <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pendapatan Bersih</p>
                            <p className="text-2xl font-extrabold text-emerald-600 leading-tight">{fmt(totalNet)}</p>
                            <p className="text-xs text-gray-400 mt-1">Setelah dikurangi komisi</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
                        <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center">
                            <UserGroupIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Sesi</p>
                            <p className="text-2xl font-extrabold text-gray-900 leading-tight">{totalJobs} Sesi</p>
                            <p className="text-xs text-gray-400 mt-1">Dari {therapistRevenue.length} terapis</p>
                        </div>
                    </div>
                </div>

                {/* Therapist Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <UserIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="font-bold text-gray-900">Rincian per Terapis</h3>
                        </div>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-wider rounded-full">
                            {monthLabel}
                        </span>
                    </div>

                    {therapistRevenue.length === 0 ? (
                        <div className="py-24 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserGroupIcon className="w-10 h-10 text-gray-200" />
                            </div>
                            <p className="text-gray-400 font-bold">Tidak ada data transaksi sukses untuk periode ini.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="py-4 px-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">#</th>
                                        <th className="py-4 px-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Terapis</th>
                                        <th className="py-4 px-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jumlah Sesi</th>
                                        <th className="py-4 px-6 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gross Revenue</th>
                                        <th className="py-4 px-6 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Komisi Terapis</th>
                                        <th className="py-4 px-6 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Net Profit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {therapistRevenue.map((t, i) => {
                                        const maxRevenue = therapistRevenue[0]?.revenue || 1;
                                        const pct = Math.round((t.revenue / maxRevenue) * 100);
                                        return (
                                            <tr key={t.name} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="py-5 px-6 text-sm font-bold text-gray-300">#{i + 1}</td>
                                                <td className="py-5 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center text-white font-black shadow-sm group-hover:scale-110 transition-transform">
                                                            {t.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">{t.name}</p>
                                                            <div className="mt-1.5 h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-purple-500 to-purple-700 rounded-full transition-all duration-1000"
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6 text-center">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                                        {t.jobs} Sesi
                                                    </span>
                                                </td>
                                                <td className="py-5 px-6 text-right text-sm font-bold text-gray-900">
                                                    {fmt(t.revenue)}
                                                </td>
                                                <td className="py-5 px-6 text-right">
                                                    <span className={`text-sm font-bold ${t.commission > 0 ? 'text-red-500' : 'text-gray-300'}`}>
                                                        {t.commission > 0 ? `− ${fmt(t.commission)}` : '—'}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-6 text-right">
                                                    <span className="text-sm font-black text-emerald-600">
                                                        {fmt(t.net)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-900 text-white">
                                        <td colSpan={2} className="py-5 px-6 text-xs font-black uppercase tracking-widest">Total Keseluruhan</td>
                                        <td className="py-5 px-6 text-center text-sm font-black">{totalJobs} Sesi</td>
                                        <td className="py-5 px-6 text-right text-sm font-black">{fmt(totalRevenue)}</td>
                                        <td className="py-5 px-6 text-right text-sm font-black text-red-400">− {fmt(totalCommission)}</td>
                                        <td className="py-5 px-6 text-right text-sm font-black text-emerald-400">{fmt(totalNet)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
