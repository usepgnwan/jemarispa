import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    UserGroupIcon,
    CalendarDaysIcon,
    BanknotesIcon,
    ArrowTrendingUpIcon,
    UserIcon,
    EyeIcon,
    XMarkIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import Modal from '@/Components/Modal';

const fmt = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function Report({ therapistRevenue, filters }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTherapist, setSelectedTherapist] = useState(null);
    const [therapistDetails, setTherapistDetails] = useState([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    
    const handleFilter = () => {
        router.get(route('admin.therapist.report'), { start_date: startDate, end_date: endDate }, {
            preserveState: true,
            replace: true
        });
    };

    const handleOpenDetail = async (therapist) => {
        setSelectedTherapist(therapist);
        setIsModalOpen(true);
        setIsLoadingDetails(true);
        try {
            const response = await axios.get(route('admin.therapist.report.detail', {
                employee_id: therapist.id,
                start_date: startDate,
                end_date: endDate
            }));
            if (response.data.success) {
                setTherapistDetails(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load details:', error);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleReset = () => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
        setStartDate(start);
        setEndDate(end);
        router.get(route('admin.therapist.report'), { start_date: start, end_date: end });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const dateLabel = filters.start_date && filters.end_date
        ? `${formatDate(filters.start_date)} - ${formatDate(filters.end_date)}`
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

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm">
                            <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="text-sm font-bold text-gray-700 bg-transparent border-none outline-none cursor-pointer focus:ring-0 p-0"
                            />
                            <span className="text-gray-400 font-bold px-2">-</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="text-sm font-bold text-gray-700 bg-transparent border-none outline-none cursor-pointer focus:ring-0 p-0"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleFilter}
                                className="px-4 py-2.5 bg-zenith-charcoal border border-transparent rounded-2xl text-sm font-bold text-white hover:bg-zenith-orange transition-all shadow-sm"
                            >
                                Filter
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                            >
                                Reset
                            </button>
                        </div>
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
                            <p className="text-xs text-gray-400 mt-1">{dateLabel}</p>
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
                            {dateLabel}
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
                                        <th className="py-4 px-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aksi</th>
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
                                                <td className="py-5 px-6 text-center">
                                                    <button
                                                        onClick={() => handleOpenDetail(t)}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                                                        title="Lihat Detail"
                                                    >
                                                        <EyeIcon className="w-5 h-5" />
                                                    </button>
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
                                        <td className="py-5 px-6"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="3xl">
                <div className="flex flex-col max-h-[90vh] md:max-h-[85vh]">
                    <div className="p-4 md:p-6 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black text-gray-900">Detail Komisi: {selectedTherapist?.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{dateLabel}</p>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-4 md:p-6 overflow-y-auto">
                        {isLoadingDetails ? (
                            <div className="py-12 flex justify-center">
                                <ArrowPathIcon className="w-8 h-8 text-purple-500 animate-spin" />
                            </div>
                        ) : therapistDetails.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 font-bold">
                                Tidak ada rincian data ditemukan.
                            </div>
                        ) : (
                            <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500">
                                            <th className="py-3 px-4 text-left font-bold uppercase tracking-wider text-[10px]">Tanggal</th>
                                            <th className="py-3 px-4 text-left font-bold uppercase tracking-wider text-[10px]">No Invoice</th>
                                            <th className="py-3 px-4 text-left font-bold uppercase tracking-wider text-[10px]">Layanan</th>
                                            <th className="py-3 px-4 text-right font-bold uppercase tracking-wider text-[10px]">Harga</th>
                                            <th className="py-3 px-4 text-right font-bold uppercase tracking-wider text-[10px]">Komisi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {therapistDetails.map((detail) => (
                                            <tr key={detail.id} className="hover:bg-gray-50/50">
                                                <td className="py-3 px-4 text-gray-900 font-medium whitespace-nowrap">{detail.schedule_date}</td>
                                                <td className="py-3 px-4 text-purple-600 font-bold whitespace-nowrap">{detail.invoice_no}</td>
                                                <td className="py-3 px-4">
                                                    <div className="text-gray-900 font-bold">{detail.package_name}</div>
                                                    <div className="text-xs text-gray-500">{detail.package_duration}</div>
                                                </td>
                                                <td className="py-3 px-4 text-right text-gray-900 font-bold whitespace-nowrap">{fmt(detail.price)}</td>
                                                <td className="py-3 px-4 text-right text-red-500 font-bold whitespace-nowrap">{fmt(detail.commission)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-900 text-white font-bold">
                                            <td colSpan={3} className="py-3 px-4 text-right uppercase text-[10px] tracking-wider">Total</td>
                                            <td className="py-3 px-4 text-right whitespace-nowrap">{fmt(therapistDetails.reduce((a, b) => a + b.price, 0))}</td>
                                            <td className="py-3 px-4 text-right whitespace-nowrap text-red-400">{fmt(therapistDetails.reduce((a, b) => a + b.commission, 0))}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
