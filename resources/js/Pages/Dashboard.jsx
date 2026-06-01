import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    BanknotesIcon,
    CalendarDaysIcon,
    ShoppingCartIcon,
    CheckCircleIcon,
    UserGroupIcon,
    ArrowTrendingUpIcon,
    EyeIcon,
    XMarkIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import Modal from '@/Components/Modal';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';

const fmt = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const shortFmt = (n) => {
    if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}Jt`;
    if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}K`;
    return `Rp ${n}`;
};

// Custom Tooltip for bar chart
const RevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#2D2D2D] text-white px-4 py-3 rounded-2xl shadow-xl text-sm">
                <p className="font-bold text-gray-300 text-xs mb-1">{label}</p>
                <p className="font-bold text-lg">{fmt(payload[0].value)}</p>
            </div>
        );
    }
    return null;
};

// Custom Tooltip for donut
const StatusTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#2D2D2D] text-white px-4 py-2 rounded-2xl shadow-xl text-sm">
                <p className="font-bold">{payload[0].name}: {payload[0].value}</p>
            </div>
        );
    }
    return null;
};

export default function Dashboard({ filters, monthlyRevenue, statusBreakdown, therapistRevenue, stats }) {
    const totalTransactions = statusBreakdown.reduce((s, d) => s + d.value, 0);

    const [therapistMonth, setTherapistMonth] = useState(filters?.month || '');
    const [therapistData, setTherapistData] = useState(therapistRevenue);
    const [therapistLoading, setTherapistLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTherapist, setSelectedTherapist] = useState(null);
    const [therapistDetails, setTherapistDetails] = useState([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Filter global dashboard
    const handleGlobalMonthFilter = (e) => {
        const val = e.target.value;
        router.get(route('dashboard'), { month: val }, { preserveState: true, preserveScroll: true });
    };

    const handleOpenDetail = async (therapist) => {
        setSelectedTherapist(therapist);
        setIsModalOpen(true);
        setIsLoadingDetails(true);
        try {
            // For Dashboard we need to figure out start_date and end_date from month
            let start_date = '';
            let end_date = '';
            if (therapistMonth) {
                const date = new Date(therapistMonth + '-01');
                start_date = date.toISOString().slice(0, 10);
                const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                end_date = lastDay.toISOString().slice(0, 10);
            }

            const response = await axios.get(route('admin.therapist.report.detail', {
                employee_id: therapist.id,
                start_date: start_date,
                end_date: end_date
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

    useEffect(() => {
        setTherapistLoading(true);
        const params = therapistMonth ? `?month=${therapistMonth}` : '';
        fetch(`/api/dashboard/therapist-revenue${params}`, {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        })
            .then(r => r.json())
            .then(data => { setTherapistData(data); setTherapistLoading(false); })
            .catch(() => setTherapistLoading(false));
    }, [therapistMonth]);

    // Label bulan yang ditampilkan
    const monthLabel = therapistMonth
        ? new Date(therapistMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
        : 'Semua Waktu';

    const summaryCards = [
        {
            label: 'Total Pendapatan',
            value: shortFmt(stats.total_revenue),
            sub: 'semua waktu (success)',
            icon: BanknotesIcon,
            bg: 'bg-green-50',
            iconColor: 'text-green-600',
            accent: 'border-green-100',
        },
        {
            label: 'Komisi Terapis',
            value: shortFmt(stats.total_commission),
            sub: 'dari transaksi selesai',
            icon: UserGroupIcon,
            bg: 'bg-purple-50',
            iconColor: 'text-purple-600',
            accent: 'border-purple-100',
        },
        {
            label: 'Pendapatan Bersih',
            value: shortFmt(stats.net_revenue),
            sub: 'pendapatan − komisi terapis',
            icon: ArrowTrendingUpIcon,
            bg: 'bg-orange-50',
            iconColor: 'text-orange-600',
            accent: 'border-orange-200',
            highlight: true,
        },
        {
            label: 'Bulan Ini',
            value: shortFmt(stats.this_month),
            sub: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
            icon: CalendarDaysIcon,
            bg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            accent: 'border-blue-100',
        },
        {
            label: 'Pesanan Selesai',
            value: stats.success_orders.toLocaleString('id-ID'),
            sub: `${stats.total_orders > 0 ? Math.round((stats.success_orders / stats.total_orders) * 100) : 0}% dari ${stats.total_orders} pesanan`,
            icon: CheckCircleIcon,
            bg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            accent: 'border-emerald-100',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="py-6 space-y-8">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Panel</p>
                        <h2 className="text-2xl font-extrabold text-gray-900 mt-1">Dashboard</h2>
                    </div>
                    {/* Global Month Picker */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2 shadow-sm">
                            <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                            <input
                                type="month"
                                value={filters?.month || ''}
                                onChange={handleGlobalMonthFilter}
                                className="text-sm font-bold text-gray-700 bg-transparent border-none outline-none cursor-pointer p-0 focus:ring-0"
                            />
                        </div>
                        {filters?.month && (
                            <button
                                onClick={() => router.get(route('dashboard'))}
                                className="text-xs font-bold text-gray-400 hover:text-gray-700 px-3 py-2 bg-white border border-gray-200 rounded-2xl transition-colors shadow-sm"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
                    {summaryCards.map((card) => (
                        <div
                            key={card.label}
                            className={`bg-white rounded-3xl p-6 shadow-sm border flex flex-col gap-4 ${
                                card.highlight
                                    ? 'border-orange-300 ring-2 ring-orange-200 shadow-orange-100'
                                    : card.accent
                            }`}
                        >
                            <div className={`w-11 h-11 ${card.bg} rounded-2xl flex items-center justify-center`}>
                                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                                <p className={`text-2xl font-extrabold leading-tight ${
                                    card.highlight ? 'text-orange-600' : 'text-gray-900'
                                }`}>{card.value}</p>
                                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Row: Monthly Revenue + Donut */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Monthly Revenue Bar Chart */}
                    <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Grafik Pendapatan</p>
                                <h3 className="text-lg font-bold text-gray-900">Pendapatan Per Bulan</h3>
                            </div>
                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100 uppercase tracking-wider">
                                Status Selesai
                            </span>
                        </div>
                        {monthlyRevenue.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-gray-300 text-sm font-bold">
                                Belum ada data transaksi selesai
                            </div>
                        ) : (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyRevenue} barSize={28}>
                                        <defs>
                                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#E07A5F" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#F2B39E" stopOpacity={0.6} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                            dy={8}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                            tickFormatter={(v) => shortFmt(v)}
                                            width={70}
                                        />
                                        <Tooltip content={<RevenueTooltip />} cursor={{ fill: '#f8fafc', radius: 8 }} />
                                        <Bar dataKey="total" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Status Donut Chart */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="mb-6">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Distribusi</p>
                            <h3 className="text-lg font-bold text-gray-900">Transaksi per Status</h3>
                        </div>
                        <div className="relative flex items-center justify-center mb-4">
                            <ResponsiveContainer width="100%" height={210}>
                                <PieChart>
                                    <Pie
                                        data={statusBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={4}
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        {statusBreakdown.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<StatusTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute flex flex-col items-center pointer-events-none">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</p>
                                <p className="text-2xl font-extrabold text-gray-900">{totalTransactions.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {statusBreakdown.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs font-bold text-gray-600">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-extrabold text-gray-900">{item.value}</span>
                                        <span className="text-[10px] font-bold text-gray-300">
                                            {totalTransactions > 0 ? Math.round((item.value / totalTransactions) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Therapist Revenue Table */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    {/* Header + Filter */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center">
                                <UserGroupIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Laporan Terapis</p>
                                <h3 className="text-lg font-bold text-gray-900">Pendapatan per Terapis</h3>
                            </div>
                        </div>

                        {/* Month Picker */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2">
                                <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                                <input
                                    type="month"
                                    value={therapistMonth}
                                    onChange={e => setTherapistMonth(e.target.value)}
                                    className="text-sm font-bold text-gray-700 bg-transparent border-none outline-none cursor-pointer"
                                />
                            </div>
                            {therapistMonth && (
                                <button
                                    onClick={() => setTherapistMonth('')}
                                    className="text-xs font-bold text-gray-400 hover:text-gray-700 px-3 py-2 bg-gray-50 border border-gray-200 rounded-2xl transition-colors"
                                >
                                    Semua
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Period badge */}
                    <div className="mb-4 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-xs font-bold text-purple-700">
                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                            {therapistLoading ? 'Memuat...' : monthLabel}
                        </span>
                        {!therapistLoading && (
                            <span className="text-xs text-gray-400 font-medium">
                                {therapistData.length} terapis
                            </span>
                        )}
                    </div>

                    {therapistLoading ? (
                        <div className="py-16 flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                            <p className="text-xs font-bold text-gray-400">Memuat data...</p>
                        </div>
                    ) : therapistData.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-gray-300 text-sm font-bold">Tidak ada data untuk {monthLabel}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="py-3 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">#</th>
                                        <th className="py-3 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Terapis</th>
                                        <th className="py-3 px-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sesi</th>
                                        <th className="py-3 px-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Revenue</th>
                                        <th className="py-3 px-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Komisi</th>
                                        <th className="py-3 px-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bersih</th>
                                        <th className="py-3 px-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {therapistData.map((t, i) => {
                                        const maxRevenue = therapistData[0]?.revenue || 1;
                                        const pct = Math.round((t.revenue / maxRevenue) * 100);
                                        const net = t.net ?? Math.max(0, t.revenue - t.commission);
                                        return (
                                            <tr key={t.name} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-4 text-sm font-bold text-gray-300">#{i + 1}</td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0">
                                                            {t.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">{t.name}</p>
                                                            <div className="mt-1 h-1.5 w-28 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                                                        {t.jobs} sesi
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right text-sm font-extrabold text-gray-900">
                                                    {fmt(t.revenue)}
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <span className={`text-sm font-bold ${t.commission > 0 ? 'text-red-500' : 'text-gray-300'}`}>
                                                        {t.commission > 0 ? `− ${fmt(t.commission)}` : '—'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <span className="text-sm font-extrabold text-emerald-600">
                                                        {fmt(net)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-center">
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
                                {therapistData.length >= 1 && (
                                    <tfoot>
                                        <tr className="border-t-2 border-gray-100 bg-gray-50/50">
                                            <td colSpan={3} className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Total</td>
                                            <td className="py-3 px-4 text-right text-sm font-extrabold text-gray-900">
                                                {fmt(therapistData.reduce((s, t) => s + t.revenue, 0))}
                                            </td>
                                            <td className="py-3 px-4 text-right text-sm font-extrabold text-red-500">
                                                − {fmt(therapistData.reduce((s, t) => s + t.commission, 0))}
                                            </td>
                                            <td className="py-3 px-4 text-right text-sm font-extrabold text-emerald-600">
                                                {fmt(therapistData.reduce((s, t) => s + (t.net ?? Math.max(0, t.revenue - t.commission)), 0))}
                                            </td>
                                            <td className="py-3 px-4"></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    )}
                </div>

            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="3xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-black text-gray-900">Detail Komisi: {selectedTherapist?.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{monthLabel}</p>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

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
            </Modal>
        </AuthenticatedLayout>
    );
}
