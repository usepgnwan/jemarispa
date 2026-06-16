import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    BanknotesIcon, 
    UsersIcon, 
    CalendarIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ auth, totalCustomers, trendPendapatan, todaySchedules }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Format chart data
    const chartData = trendPendapatan.map(item => ({
        name: new Date(item.month + '-01').toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        Total: parseFloat(item.total_commission || 0)
    }));

    const totalIncomeThisMonth = trendPendapatan.length > 0 ? parseFloat(trendPendapatan[trendPendapatan.length - 1].total_commission) : 0;

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title="Dashboard Terapis" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 font-serif italic">Halo, {auth.user.name} 👋</h2>
                        <p className="mt-1 text-sm text-gray-500">Berikut adalah ringkasan kinerja Anda.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Income Card */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-zenith-orange/10 rounded-2xl text-zenith-orange">
                                        <ArrowTrendingUpIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pendapatan Bulan Ini</span>
                                </div>
                                <p className="text-3xl font-black text-gray-900 tracking-tight">{formatCurrency(totalIncomeThisMonth)}</p>
                            </div>
                        </div>

                        {/* Total Customers */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-blue-50 rounded-2xl text-blue-500">
                                        <UsersIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Pelanggan</span>
                                </div>
                                <p className="text-3xl font-black text-gray-900 tracking-tight">{totalCustomers}</p>
                                <p className="text-xs text-gray-500 mt-2">Sepanjang masa</p>
                            </div>
                        </div>

                        {/* Today's Schedule */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-500">
                                        <CalendarIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Jadwal Hari Ini</span>
                                </div>
                                <p className="text-3xl font-black text-gray-900 tracking-tight">{todaySchedules.length}</p>
                            </div>
                            <div className="mt-4">
                                <Link href={route('admin.calendar.index')} className="text-xs text-emerald-600 font-bold hover:underline inline-block">
                                    Lihat kalender lengkap &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Trend Pendapatan */}
                        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Trend Pendapatan (6 Bulan Terakhir)</h3>
                            <div className="h-72 mt-4">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }}
                                                dy={10}
                                            />
                                            <YAxis 
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                                tickFormatter={(value) => `Rp ${value / 1000}k`}
                                            />
                                            <Tooltip 
                                                formatter={(value) => [formatCurrency(value), 'Pendapatan']}
                                                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                                                cursor={{ fill: '#f8fafc' }}
                                            />
                                            <Bar 
                                                dataKey="Total" 
                                                fill="#F97316" 
                                                radius={[6, 6, 0, 0]}
                                                maxBarSize={60}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center">
                                        <BanknotesIcon className="w-12 h-12 text-gray-200 mb-3" />
                                        <p className="text-sm font-medium text-gray-400">Belum ada data pendapatan</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Jadwal Hari Ini Detail */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Jadwal Anda Hari Ini</h3>
                            {todaySchedules.length > 0 ? (
                                <div className="space-y-4">
                                    {todaySchedules.map((schedule, idx) => (
                                        <div key={idx} className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-white rounded-xl text-zenith-orange shadow-sm">
                                                    <CalendarIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900">{schedule.schedule_time ? schedule.schedule_time.substring(0,5) : ''}</p>
                                                    <p className="text-[10px] text-gray-500">{schedule.customer_name}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 pt-2 border-t border-gray-100">
                                                {schedule.items.filter(i => i.employee_id == auth.user.employee_id).map((item, iIdx) => (
                                                    <p key={iIdx} className="text-[10px] font-bold text-gray-600 truncate">• {item.package_name}</p>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <CalendarIcon className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                                    <p className="text-sm text-gray-500 font-medium">Tidak ada jadwal hari ini</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
