import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Pagination from '@/Components/Pagination';
import { 
    ChartBarIcon, 
    ArrowPathIcon,
    CursorArrowRaysIcon,
    CalendarIcon,
    MapPinIcon,
    ComputerDesktopIcon,
    ArrowTrendingUpIcon,
    UsersIcon,
    HandRaisedIcon,
    TableCellsIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

const COLORS = ['#F26440', '#D9A05B', '#407BFF', '#10B981', '#8B5CF6', '#F59E0B'];

export default function Index({ analytics, stats, filters }) {
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');

    const applyFilter = () => {
        router.get(route('admin.analytics.index'), { start_date: startDate, end_date: endDate }, { preserveState: true });
    };

    const clearFilter = () => {
        setStartDate('');
        setEndDate('');
        router.get(route('admin.analytics.index'), {}, { preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Marketing Analytics" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-10 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-zenith-orange animate-pulse"></span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Marketing Performance</p>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            Marketing Analytics
                            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Live Data</span>
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">Lacak performa konversi dan interaksi pelanggan secara real-time.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-gray-200 shadow-sm">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="text-xs font-bold text-gray-700 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                            />
                            <span className="text-gray-300 text-xs">-</span>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="text-xs font-bold text-gray-700 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                            />
                        </div>
                        <button 
                            onClick={applyFilter}
                            className="flex items-center gap-2 px-4 py-2.5 bg-zenith-orange text-white rounded-2xl text-xs font-bold hover:bg-zenith-orange/90 transition-all shadow-sm shadow-zenith-orange/20"
                        >
                            Filter
                        </button>
                        {(filters?.start_date || filters?.end_date) && (
                            <button 
                                onClick={clearFilter}
                                className="px-3 py-2.5 bg-gray-100 text-gray-500 rounded-2xl text-xs font-bold hover:bg-gray-200 transition-all"
                            >
                                Reset
                            </button>
                        )}
                        <button 
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                            Refresh Data
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl hover:shadow-zenith-orange/5 transition-all duration-500">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                            <CursorArrowRaysIcon className="w-24 h-24" />
                        </div>
                        <div className="flex items-center gap-5 mb-6">
                            <div className="w-14 h-14 bg-zenith-orange/10 rounded-2xl flex items-center justify-center text-zenith-orange">
                                <CursorArrowRaysIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Klik</p>
                                <p className="text-3xl font-black text-gray-900 leading-tight">{stats.total.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <div className="w-2 h-2 rounded-full bg-zenith-orange"></div>
                            Seluruh Waktu
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-600/5 transition-all duration-500">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                            <ArrowTrendingUpIcon className="w-24 h-24" />
                        </div>
                        <div className="flex items-center gap-5 mb-6">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <ArrowTrendingUpIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Klik Hari Ini</p>
                                <p className="text-3xl font-black text-emerald-600 leading-tight">{stats.today.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            Interaksi 24 Jam
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-500">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                            <CalendarIcon className="w-24 h-24" />
                        </div>
                        <div className="flex items-center gap-5 mb-6">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                <CalendarIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Klik Bulan Ini</p>
                                <p className="text-3xl font-black text-blue-600 leading-tight">{stats.this_month.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Trend Chart */}
                    <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Tren Interaksi Menu</h3>
                                <p className="text-sm text-gray-400 mt-1">Perbandingan performa 5 menu terpopuler (14 hari terakhir)</p>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                {stats.top_titles.map((title, idx) => (
                                    <div key={title} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        {stats.top_titles.map((title, idx) => (
                                            <linearGradient key={`grad-${idx}`} id={`color-${idx}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0}/>
                                            </linearGradient>
                                        ))}
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
                                    <XAxis 
                                        dataKey="date_label" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 'bold', fill: '#94A3B8'}}
                                        dy={15}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 'bold', fill: '#94A3B8'}}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    {stats.top_titles.map((title, idx) => (
                                        <Area 
                                            key={title}
                                            type="monotone" 
                                            dataKey={title} 
                                            stroke={COLORS[idx % COLORS.length]} 
                                            fill={`url(#color-${idx})`}
                                            strokeWidth={3} 
                                            animationDuration={2000}
                                        />
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Secondary Insights */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Device Distribution */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-8">Platform Pengguna</h3>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.device_distribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={8}
                                            dataKey="value"
                                            nameKey="name"
                                            stroke="none"
                                        >
                                            <Cell fill="#F26440" />
                                            <Cell fill="#407BFF" />
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-50">
                                {stats.device_distribution.map((d, i) => (
                                    <div key={d.name} className="flex flex-col items-center p-4 rounded-3xl bg-gray-50 border border-gray-100">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${d.name === 'Mobile' ? 'bg-zenith-orange/10 text-zenith-orange' : 'bg-blue-50 text-blue-600'}`}>
                                            {d.name === 'Mobile' ? <HandRaisedIcon className="w-4 h-4" /> : <ComputerDesktopIcon className="w-4 h-4" />}
                                        </div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{d.name}</p>
                                        <p className="text-xl font-black text-gray-900">{d.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Popular Content */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-6">Menu Populer</h3>
                            <div className="space-y-3">
                                {stats.top_actions.map((action, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-zenith-orange/30 transition-all">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-zenith-orange border border-gray-100 shadow-sm shrink-0">
                                                {i + 1}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[11px] font-bold text-gray-900 truncate">{action.title}</p>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider truncate">{action.category}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-zenith-orange bg-zenith-orange/5 px-3 py-1 rounded-full shrink-0">
                                            {action.total}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Booking Sources */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-6">Sumber Booking</h3>
                            <div className="space-y-3">
                                {stats.booking_sources.map((source, i) => {
                                    const maxVal = Math.max(...stats.booking_sources.map(s => s.value), 1);
                                    const pct = Math.round((source.value / maxVal) * 100);
                                    return (
                                        <div key={i} className="flex flex-col gap-2 p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-zenith-orange/30 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-zenith-orange border border-gray-100 shadow-sm shrink-0">
                                                        <ShoppingCartIcon className="w-4 h-4" />
                                                    </div>
                                                    <p className="text-xs font-bold text-gray-900 truncate">{source.name}</p>
                                                </div>
                                                <span className="text-xs font-black text-zenith-orange bg-zenith-orange/5 px-3 py-1 rounded-full shrink-0">
                                                    {source.value} Order
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                                                <div 
                                                    className="h-full bg-zenith-orange transition-all duration-1000"
                                                    style={{ width: `${pct}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Donut Chart - Top Analytics */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Top Analytic Interaksi</h3>
                            <p className="text-sm text-gray-400 mt-1">Distribusi interaksi berdasarkan menu / aksi terpopuler</p>
                        </div>
                    </div>
                    <div className="flex flex-col lg:flex-row items-center gap-10">
                        {/* Donut */}
                        <div className="w-full lg:w-[340px] h-[280px] shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.by_item}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={75}
                                        outerRadius={120}
                                        paddingAngle={4}
                                        dataKey="value"
                                        nameKey="name"
                                        stroke="none"
                                    >
                                        {stats.by_item.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '14px 18px' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                        formatter={(value, name) => [value + ' klik', name]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legend List */}
                        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {stats.by_item.map((item, index) => {
                                const total = stats.by_item.reduce((s, i) => s + i.value, 0);
                                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                                return (
                                    <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-zenith-orange/20 transition-all group">
                                        <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-xs font-bold text-gray-800 truncate group-hover:text-zenith-orange transition-colors">{item.name}</p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-700"
                                                        style={{ width: `${pct}%`, backgroundColor: COLORS[index % COLORS.length] }}
                                                    ></div>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 shrink-0">{pct}%</span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-black shrink-0" style={{ color: COLORS[index % COLORS.length] }}>{item.value}</span>
                                    </div>
                                );
                            })}
                            {stats.by_item.length === 0 && (
                                <div className="col-span-2 py-10 text-center text-sm text-gray-300 font-bold uppercase tracking-widest">
                                    Belum ada data interaksi
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* History Table Section */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
                                <TableCellsIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">History Interaksi Terkini</h3>
                                <p className="text-xs text-gray-400">Daftar lengkap log interaksi pengguna di landing page</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="py-5 px-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Kategori</th>
                                    <th className="py-5 px-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Judul / Aksi</th>
                                    <th className="py-5 px-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Perangkat</th>
                                    <th className="py-5 px-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Waktu Interaksi</th>
                                    <th className="py-5 px-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {analytics.data.length > 0 ? (
                                    analytics.data.map((item) => {
                                        const isMobile = item.user_agent.toLowerCase().includes('mobile') || 
                                                       item.user_agent.toLowerCase().includes('android') || 
                                                       item.user_agent.toLowerCase().includes('iphone');
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-5 px-8">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold bg-zenith-orange/5 text-zenith-orange border border-zenith-orange/10 uppercase tracking-[0.1em]">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-8">
                                                    <p className="text-xs font-bold text-gray-900">{item.title}</p>
                                                </td>
                                                <td className="py-5 px-8">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`p-1.5 rounded-lg ${isMobile ? 'bg-zenith-orange/10 text-zenith-orange' : 'bg-blue-50 text-blue-600'}`}>
                                                            {isMobile ? <HandRaisedIcon className="w-3 h-3" /> : <ComputerDesktopIcon className="w-3 h-3" />}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                            {isMobile ? 'Mobile' : 'Desktop'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-8">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarIcon className="w-3 h-3 text-gray-300" />
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                                                            {new Date(item.created_at).toLocaleString('id-ID', {
                                                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-8">
                                                    <div className="flex items-center gap-2 group cursor-default">
                                                        <MapPinIcon className="w-3 h-3 text-gray-300" />
                                                        <span className="text-[10px] font-mono font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                                                            {item.ip_address}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                    <CursorArrowRaysIcon className="w-8 h-8 text-gray-200" />
                                                </div>
                                                <p className="text-sm font-bold text-gray-400">Belum ada interaksi tercatat.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {analytics.links && (
                        <div className="p-8 border-t border-gray-100 bg-gray-50/30">
                            <Pagination links={analytics.links} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

