import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    UsersIcon, 
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart, 
    Pie, 
    Cell 
} from 'recharts';

const data = [
    { name: 'Sen', value: 20 },
    { name: 'Sel', value: 25 },
    { name: 'Rab', value: 22 },
    { name: 'Kam', value: 28 },
    { name: 'Jum', value: 24 },
    { name: 'Sab', value: 30 },
    { name: 'Min', value: 35 },
];

const pieData = [
    { name: 'Baru', value: 400 },
    { name: 'Lama', value: 300 },
    { name: 'Premium', value: 300 },
    { name: 'Free', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const stats = [
    { 
        name: 'PENGGUNA AKTIF', 
        value: '4,102', 
        change: '+12%', 
        type: 'increase',
        icon: UsersIcon,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-50'
    },
    { 
        name: 'PENDAPATAN (HARIAN)', 
        value: 'Rp 14.5M', 
        change: '+5.4%', 
        type: 'increase',
        icon: PresentationChartLineIcon,
        iconColor: 'text-green-600',
        iconBg: 'bg-green-50'
    },
    { 
        name: 'TINGKAT PENYELESAIAN TRYOUT', 
        value: '68%', 
        change: '-2.1%', 
        type: 'decrease',
        icon: ArrowTrendingDownIcon,
        iconColor: 'text-red-600',
        iconBg: 'bg-red-50'
    },
];

export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="py-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Kantan Admin Panel</p>
                        <h2 className="text-3xl font-extrabold text-gray-900 mt-1">Dashboard Overview</h2>
                    </div>
                    
                    <div className="flex items-center bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                        <button className="px-5 py-2 text-sm font-bold bg-blue-600 text-white rounded-xl shadow-md shadow-blue-200">7 Hari</button>
                        <button className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">30 Hari</button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                    {stats.map((stat) => (
                        <div key={stat.name} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 flex flex-col justify-between h-56 transition-all hover:shadow-lg group">
                            <div className="flex justify-between items-start">
                                <div className={`p-3 rounded-2xl ${stat.iconBg}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                                </div>
                                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                    stat.type === 'increase' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                }`}>
                                    {stat.type === 'increase' ? <ArrowTrendingUpIcon className="h-3 w-3" /> : <ArrowTrendingDownIcon className="h-3 w-3" />}
                                    {stat.change}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 tracking-widest mb-1">{stat.name}</p>
                                <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-gray-50">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-x-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <ChartBarIcon className="h-5 w-5 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Analisis Pendapatan Mingguan</h3>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 font-bold tracking-widest">...</button>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                        itemStyle={{fontWeight: 'bold'}}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-50 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 mb-8">Distribusi Pengguna</h3>
                        <div className="flex-1 flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute flex flex-col items-center">
                                <p className="text-xs font-bold text-gray-400">TOTAL</p>
                                <p className="text-2xl font-extrabold text-gray-900">1,200</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            {pieData.map((item, index) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function ChartBarIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
    );
}
