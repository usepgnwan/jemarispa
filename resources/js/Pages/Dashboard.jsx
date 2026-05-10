import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    BanknotesIcon,
    CalendarDaysIcon,
    ShoppingCartIcon,
    CheckCircleIcon,
    UserGroupIcon,
    ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
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

export default function Dashboard({ monthlyRevenue, statusBreakdown, therapistRevenue, stats }) {
    const totalTransactions = statusBreakdown.reduce((s, d) => s + d.value, 0);

    // ── Therapist month filter state ─────────────────────────────────────────
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const [therapistMonth, setTherapistMonth] = useState(currentMonth);
    const [therapistData, setTherapistData] = useState(therapistRevenue);
    const [therapistLoading, setTherapistLoading] = useState(false);

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
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Panel</p>
                    <h2 className="text-2xl font-extrabold text-gray-900 mt-1">Dashboard</h2>
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
                                {therapistData.length} terapis aktif
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
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
