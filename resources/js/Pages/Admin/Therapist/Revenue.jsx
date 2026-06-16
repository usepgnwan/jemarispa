import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import {
    BanknotesIcon,
    CalendarIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ClockIcon,
    DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const fmt = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function Revenue({ auth, transactions, filters, totals }) {
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');

    const handleFilter = () => {
        router.get(route('admin.therapist_user.revenue'), { start_date: startDate, end_date: endDate }, {
            preserveState: true,
            replace: true
        });
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        router.get(route('admin.therapist_user.revenue'), {}, {
            preserveState: true,
            replace: true
        });
    };

    // Calculate totals using server-provided data
    const totalTransferKomisi = totals?.transfer_commission || 0;
    const totalCashNetProfit = totals?.cash_net_profit || 0;
    const totalSemua = totalTransferKomisi - totalCashNetProfit;

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title="Riwayat Pendapatan" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 font-serif italic">Riwayat Pendapatan Anda</h2>
                        <p className="mt-1 text-sm text-gray-500">Daftar layanan, pembayaran komisi, dan riwayat transaksi Anda</p>
                    </div>

                    <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Mulai Tanggal</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="text-xs border-gray-200 rounded-xl focus:ring-zenith-orange focus:border-zenith-orange bg-white shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="text-xs border-gray-200 rounded-xl focus:ring-zenith-orange focus:border-zenith-orange bg-white shadow-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleFilter}
                                className="px-4 py-2 bg-zenith-orange text-white text-xs font-bold rounded-xl hover:bg-opacity-90 shadow-sm transition-colors"
                            >
                                Filter
                            </button>
                            {(startDate || endDate) && (
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Reset
                                </button>
                            )}
                            <a
                                href={route('admin.therapist_user.revenue.export', { start_date: startDate, end_date: endDate })}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2 ml-auto"
                            >
                                <DocumentArrowDownIcon className="w-4 h-4" />
                                Export PDF
                            </a>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Tanggal</th>
                                        {/* <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">No Pesanan</th> */}
                                        <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Nama Customer</th>
                                        <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Layanan</th>
                                        <th scope="col" className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Metode</th>
                                        {/* <th scope="col" className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Harga Dasar</th> */}
                                        <th scope="col" className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Pendapatan</th>
                                        {/* <th scope="col" className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Net Profit (Cash)</th> */}
                                        <th scope="col" className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {transactions.data && transactions.data.length > 0 ? (
                                        transactions.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                {/* <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm font-mono text-gray-600">{item.order_number}</span>
                                                    </div>
                                                </td> */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900">{item.customer_name}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-gray-900">{item.package_name}</p>
                                                    <p className="text-xs text-gray-500">{item.package_duration}</p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.payment_method}</span>
                                                </td>
                                                {/* <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className="text-sm font-medium text-gray-900">{fmt(item.price)}</span>
                                                </td> */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className="text-sm font-medium text-gray-900">{fmt(item.commission)}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {item.is_paid ? (
                                                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                                                            <CheckCircleIcon className="w-3.5 h-3.5" />
                                                            Selesai
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                                                            <ClockIcon className="w-3.5 h-3.5" />
                                                            Belum Selesai
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center">
                                                <BanknotesIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                                                <p className="text-sm font-medium text-gray-500">Belum ada riwayat layanan</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {transactions.data && transactions.data.length > 0 && (
                                    <tfoot className="bg-gray-50 border-t border-gray-100">
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-right text-[10px] font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap">Total (Halaman Ini)</td>
                                            {/* <td className="px-6 py-4 text-right text-sm font-bold text-gray-900 whitespace-nowrap">
                                                {fmt(transactions.data.reduce((sum, item) => sum + Number(item.price || 0), 0))}
                                            </td> */}
                                            <td className="px-6 py-4 text-right text-sm font-bold text-gray-900 whitespace-nowrap">
                                                {fmt(transactions.data.reduce((sum, item) => sum + Number(item.commission || 0), 0))}
                                            </td>
                                            <td className="px-6 py-4"></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>

                    <div className="mb-8">
                        <Pagination links={transactions.links} />
                    </div>

                    {/* Ringkasan di Bawah */}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
