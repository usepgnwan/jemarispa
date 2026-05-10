import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    ChartBarIcon, 
    ArrowPathIcon,
    CursorArrowRaysIcon,
    CalendarIcon,
    MapPinIcon,
    ComputerDesktopIcon,
    ArrowTrendingUpIcon,
    UsersIcon,
    HandRaisedIcon
} from '@heroicons/react/24/outline';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

const COLORS = ['#F26440', '#D9A05B', '#407BFF', '#10B981', '#8B5CF6', '#F59E0B'];

export default function Index({ analytics, stats }) {
    return (
        <AuthenticatedLayout>
            <Head title="Analitik Landing Page" />

            <div className="py-6 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dashboard Tracking</p>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Analitik Performa Landing Page</h2>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
                        <div className="w-14 h-14 bg-zenith-orange/10 rounded-2xl flex items-center justify-center text-zenith-orange shrink-0">
                            <CursorArrowRaysIcon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Klik</p>
                            <p className="text-3xl font-black text-gray-900 leading-tight">{stats.total}</p>
                            <p className="text-xs text-gray-400 mt-1">Akumulasi seluruh waktu</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                            <ArrowTrendingUpIcon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Klik Hari Ini</p>
                            <p className="text-3xl font-black text-emerald-600 leading-tight">{stats.today}</p>
                            <p className="text-xs text-gray-400 mt-1">Interaksi dalam 24 jam</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                            <CalendarIcon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Klik Bulan Ini</p>
                            <p className="text-3xl font-black text-blue-600 leading-tight">{stats.this_month}</p>
                            <p className="text-xs text-gray-400 mt-1">Bulan {new Date().toLocaleDateString('id-ID', { month: 'long' })}</p>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Trend Chart - Multi Line */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-gray-900">Trend per Menu (Top 5)</h3>
                            <div className="flex flex-wrap gap-3">
                                {stats.top_titles.map((title, idx) => (
                                    <div key={title} className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">{title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.trend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis 
                                        dataKey="date_label" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 'bold', fill: '#94A3B8'}}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 'bold', fill: '#94A3B8'}}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    {stats.top_titles.map((title, idx) => (
                                        <Area 
                                            key={title}
                                            type="monotone" 
                                            dataKey={title} 
                                            stackId="1"
                                            stroke={COLORS[idx % COLORS.length]} 
                                            fill={COLORS[idx % COLORS.length]} 
                                            fillOpacity={0.1}
                                            strokeWidth={3} 
                                        />
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-4 lg:grid-cols-1">
                        {/* Menu Distribution */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-6">Distribusi Menu (Top 10)</h3>
                            <div className="h-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.by_item}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            nameKey="name"
                                        >
                                            {stats.by_item.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Device Distribution */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
                            <h3 className="font-bold text-gray-900 mb-6 w-full text-left">Penggunaan Perangkat</h3>
                            <div className="h-[180px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.device_distribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={10}
                                            dataKey="value"
                                            nameKey="name"
                                        >
                                            <Cell fill="#F26440" />
                                            <Cell fill="#407BFF" />
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '16px', border: 'none' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex gap-8 mt-4">
                                {stats.device_distribution.map((d, i) => (
                                    <div key={d.name} className="flex items-center gap-2">
                                        {d.name === 'Mobile' ? <HandRaisedIcon className="w-4 h-4 text-zenith-orange" /> : <ComputerDesktopIcon className="w-4 h-4 text-blue-600" />}
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d.name}</p>
                                            <p className="text-lg font-black text-gray-900">{d.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Actions & Recent Table */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Top Actions */}
                    <div className="lg:col-span-1 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-6">Menu Paling Populer</h3>
                        <div className="space-y-4">
                            {stats.top_actions.map((action, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-zenith-orange/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-zenith-orange border border-gray-100 shadow-sm">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900">{action.title}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{action.category}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-black text-zenith-orange bg-zenith-orange/5 px-3 py-1 rounded-full">
                                        {action.total}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent History Table */}
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">History Interaksi Terkini</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="py-4 px-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kategori</th>
                                        <th className="py-4 px-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Title / Aksi</th>
                                        <th className="py-4 px-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Perangkat</th>
                                        <th className="py-4 px-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Waktu</th>
                                        <th className="py-4 px-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {analytics.data.map((item) => {
                                        const isMobile = item.user_agent.toLowerCase().includes('mobile') || 
                                                       item.user_agent.toLowerCase().includes('android') || 
                                                       item.user_agent.toLowerCase().includes('iphone');
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-zenith-orange/5 text-zenith-orange border border-zenith-orange/10 uppercase tracking-wider">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-xs font-bold text-gray-900 truncate max-w-[150px]">
                                                    {item.title}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-1.5">
                                                        {isMobile ? (
                                                            <HandRaisedIcon className="w-4 h-4 text-zenith-orange" title="Mobile" />
                                                        ) : (
                                                            <ComputerDesktopIcon className="w-4 h-4 text-blue-600" title="Desktop" />
                                                        )}
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                                                            {isMobile ? 'Mobile' : 'Desktop'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase">
                                                    {new Date(item.created_at).toLocaleString('id-ID', {
                                                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="py-4 px-6 text-xs text-gray-500 font-mono">
                                                    {item.ip_address}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
