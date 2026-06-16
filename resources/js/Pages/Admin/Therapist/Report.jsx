import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
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
    const [selectedItems, setSelectedItems] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);
    const [expandedInvoices, setExpandedInvoices] = useState([]);
    const [editingInvoiceId, setEditingInvoiceId] = useState(null);

    const toggleRow = (id) => {
        setExpandedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
    };

    const toggleInvoiceRow = (id) => {
        setExpandedInvoices(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
    };

    const copyInvoiceToText = (invoice) => {
        const title = invoice.total_amount < 0
            ? "Total Dibayarkan Terapis ke Jemari Home Spa"
            : "Total Dibayarkan Jemari Home Spa ke Terapis";

        let detailsText = '';
        if (invoice.items && invoice.items.length > 0) {
            const sortedItems = [...invoice.items].sort((a, b) => {
                const tiA = a.transaction_item || a.transactionItem;
                const tiB = b.transaction_item || b.transactionItem;
                const dateA = new Date(tiA?.transaction?.schedule_date || 0).getTime();
                const dateB = new Date(tiB?.transaction?.schedule_date || 0).getTime();
                return dateA - dateB;
            });

            sortedItems.forEach((invItem) => {
                const ti = invItem.transaction_item || invItem.transactionItem;
                const method = ti?.transaction?.payment_method?.toLowerCase() || '';
                const price = ti?.price || 0;
                const comm = ti?.therapist_commission || 0;
                const dateStr = new Date(ti?.transaction?.schedule_date).toLocaleDateString();
                const customer = ti?.transaction?.customer_name || '-';
                
                const commStr = method === 'transfer' ? fmt(comm) : '-';
                const netStr = method === 'cash' ? fmt(price - comm) : '-';
                
                detailsText += `${dateStr}\t${customer} (${method})\t${commStr}\t${netStr}\n`;
            });
            detailsText += '\n';
        }

        const text = `${detailsText}---------------------------------\nTotal Komisi (Transfer) : ${fmt(invoice.total_transfer_commission)}\nTotal Net Profit (Cash) : - ${fmt(invoice.total_cash_net_profit)}\n---------------------------------\n${title}: ${fmt(invoice.total_amount)}`;
        navigator.clipboard.writeText(text);
        alert('Invoice berhasil disalin ke clipboard!');
    };

    const handleSaveInvoice = () => {
        if (selectedItems.length === 0) return;
        
        if (editingInvoiceId) {
            router.put(route('admin.therapist.invoice.update', editingInvoiceId), {
                transaction_item_ids: selectedItems
            }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setSelectedItems([]);
                    setEditingInvoiceId(null);
                }
            });
        } else {
            router.post(route('admin.therapist.invoice.store'), {
                employee_id: selectedTherapist.id,
                transaction_item_ids: selectedItems
            }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setSelectedItems([]);
                }
            });
        }
    };
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
        setSelectedItems([]);
        setEditingInvoiceId(null);
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

    const handleEditInvoice = async (invoice, therapist) => {
        setSelectedTherapist(therapist);
        setIsModalOpen(true);
        setIsLoadingDetails(true);
        setEditingInvoiceId(invoice.id);
        
        // Preselect existing items
        const existingItemIds = invoice.items.map(item => item.transaction_item_id);
        setSelectedItems(existingItemIds);

        try {
            const response = await axios.get(route('admin.therapist.report.detail', {
                employee_id: therapist.id,
                start_date: startDate,
                end_date: endDate,
                invoice_id: invoice.id
            }));
            if (response.data.success) {
                setTherapistDetails(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load details for editing:', error);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleDeleteInvoice = (invoiceId) => {
        if (confirm('Apakah Anda yakin ingin menghapus invoice ini? Data sesi akan kembali ke status belum dibayar.')) {
            router.delete(route('admin.therapist.invoice.destroy', invoiceId));
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
                                            <React.Fragment key={t.name}>
                                                <tr className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="py-5 px-6 text-sm font-bold text-gray-300">
                                                        <button
                                                            onClick={() => toggleRow(t.id)}
                                                            className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 hover:bg-purple-100 text-gray-500 hover:text-purple-600 transition-colors"
                                                        >
                                                            {expandedRows.includes(t.id) ? '-' : '+'}
                                                        </button>
                                                    </td>
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
                                                            title="Buat Invoice Baru"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">add_box</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedRows.includes(t.id) && (
                                                    <tr>
                                                        <td colSpan={7} className="px-6 py-4 bg-gray-50/30 border-b border-gray-100">
                                                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                                                    <h5 className="font-bold text-sm text-gray-700">Riwayat Invoice Terapis</h5>
                                                                </div>
                                                                {t.invoices && t.invoices.length > 0 ? (
                                                                    <table className="w-full text-xs">
                                                                        <thead className="bg-gray-50 text-gray-500">
                                                                            <tr>
                                                                                <th className="py-2 px-4 text-left uppercase font-bold tracking-wider">Tgl Invoice</th>
                                                                                <th className="py-2 px-4 text-left uppercase font-bold tracking-wider">No Invoice</th>
                                                                                <th className="py-2 px-4 text-right uppercase font-bold tracking-wider">Trx Sesi</th>
                                                                                <th className="py-2 px-4 text-right uppercase font-bold tracking-wider">Transfer (Komisi)</th>
                                                                                <th className="py-2 px-4 text-right uppercase font-bold tracking-wider">Cash (Net)</th>
                                                                                <th className="py-2 px-4 text-right uppercase font-bold tracking-wider">Status Bayar</th>
                                                                                <th className="py-2 px-4 text-center uppercase font-bold tracking-wider">Aksi</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-gray-100">
                                                                            {t.invoices.map((inv) => (
                                                                                <React.Fragment key={inv.id}>
                                                                                    <tr className="hover:bg-purple-50/30">
                                                                                        <td className="py-2 px-4 text-gray-900">{new Date(inv.created_at).toLocaleDateString()}</td>
                                                                                        <td className="py-2 px-4 text-purple-600 font-bold">{inv.invoice_no}</td>
                                                                                        <td className="py-2 px-4 text-right">{inv.items ? inv.items.length : 0} Sesi</td>
                                                                                        <td className="py-2 px-4 text-right">{fmt(inv.total_transfer_commission)}</td>
                                                                                        <td className="py-2 px-4 text-right text-red-500">- {fmt(inv.total_cash_net_profit)}</td>
                                                                                        <td className="py-2 px-4 text-right">
                                                                                            <div className={`font-bold ${inv.total_amount < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                                                                {inv.total_amount < 0 ? 'Terapis Bayar Spa' : 'Spa Bayar Terapis'}<br />
                                                                                                {fmt(inv.total_amount)}
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="py-2 px-4 text-center whitespace-nowrap">
                                                                                            <button
                                                                                                onClick={() => copyInvoiceToText(inv)}
                                                                                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded text-[10px] transition-colors mr-2"
                                                                                            >
                                                                                                Copy Text
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => toggleInvoiceRow(inv.id)}
                                                                                                className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium rounded text-[10px] transition-colors mr-2"
                                                                                            >
                                                                                                {expandedInvoices.includes(inv.id) ? 'Tutup Detail' : 'Lihat Detail'}
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => handleEditInvoice(inv, t)}
                                                                                                className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded text-[10px] transition-colors mr-2"
                                                                                                title="Edit Invoice"
                                                                                            >
                                                                                                <span className="material-symbols-outlined text-[14px] align-middle">edit</span>
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => handleDeleteInvoice(inv.id)}
                                                                                                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded text-[10px] transition-colors"
                                                                                                title="Hapus Invoice"
                                                                                            >
                                                                                                <span className="material-symbols-outlined text-[14px] align-middle">delete</span>
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>
                                                                                    {expandedInvoices.includes(inv.id) && (
                                                                                        <tr>
                                                                                            <td colSpan={7} className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                                                                                                <div className="bg-white rounded border border-gray-200 p-3 shadow-sm">
                                                                                                    <h6 className="font-bold text-xs text-gray-700 mb-2">Rincian Sesi di Invoice {inv.invoice_no}</h6>
                                                                                                    <table className="w-full text-[11px] text-left">
                                                                                                        <thead className="text-gray-500 border-b border-gray-200">
                                                                                                            <tr>
                                                                                                                <th className="py-1 px-2 font-semibold">Tgl / No Trx</th>
                                                                                                                <th className="py-1 px-2 font-semibold">Layanan</th>
                                                                                                                <th className="py-1 px-2 font-semibold">Metode</th>
                                                                                                                <th className="py-1 px-2 font-semibold text-right">Harga</th>
                                                                                                                <th className="py-1 px-2 font-semibold text-right">Komisi (Transfer)</th>
                                                                                                                <th className="py-1 px-2 font-semibold text-right">Net Profit (Cash)</th>
                                                                                                            </tr>
                                                                                                        </thead>
                                                                                                        <tbody>
                                                                                                            {inv.items && [...inv.items].sort((a, b) => {
                                                                                                                const tiA = a.transaction_item || a.transactionItem;
                                                                                                                const tiB = b.transaction_item || b.transactionItem;
                                                                                                                return new Date(tiA?.transaction?.schedule_date || 0).getTime() - new Date(tiB?.transaction?.schedule_date || 0).getTime();
                                                                                                            }).map((invItem) => {
                                                                                                                const ti = invItem.transaction_item || invItem.transactionItem;
                                                                                                                const method = ti?.transaction?.payment_method?.toLowerCase() || '';
                                                                                                                const price = ti?.price || 0;
                                                                                                                const comm = ti?.therapist_commission || 0;
                                                                                                                return (
                                                                                                                    <tr key={invItem.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                                                                                                        <td className="py-2 px-2 text-gray-700">
                                                                                                                            <div>{new Date(ti?.transaction?.schedule_date).toLocaleDateString()}</div>
                                                                                                                            <div className="font-bold text-purple-600">{ti?.transaction?.order_number}</div>
                                                                                                                            <div className="text-[10px] text-gray-500">{ti?.transaction?.customer_name}</div>
                                                                                                                        </td>
                                                                                                                        <td className="py-2 px-2 text-gray-700">
                                                                                                                            <div className="font-semibold">{ti?.package_name}</div>
                                                                                                                            <div className="text-gray-400">{ti?.package_duration}</div>
                                                                                                                        </td>
                                                                                                                        <td className="py-2 px-2 text-gray-700 uppercase font-semibold">{method}</td>
                                                                                                                        <td className="py-2 px-2 text-right text-gray-700 font-medium">{fmt(price)}</td>
                                                                                                                        <td className="py-2 px-2 text-right text-gray-700 font-medium">
                                                                                                                            {method === 'transfer' ? fmt(comm) : '-'}
                                                                                                                        </td>
                                                                                                                        <td className="py-2 px-2 text-right text-gray-700 font-medium">
                                                                                                                            {method === 'cash' ? fmt(price - comm) : '-'}
                                                                                                                        </td>
                                                                                                                    </tr>
                                                                                                                );
                                                                                                            })}
                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                </div>
                                                                                            </td>
                                                                                        </tr>
                                                                                    )}
                                                                                </React.Fragment>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                ) : (
                                                                    <div className="p-4 text-center text-gray-500 text-sm">Belum ada invoice tersimpan.</div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
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
                            <h3 className="text-2xl font-bold text-gray-900">{selectedTherapist?.name}</h3>
                            <p className="text-sm text-gray-500">{editingInvoiceId ? 'Edit Invoice Komisi' : 'Detail Komisi & Buat Invoice'}</p>
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
                            <div className="flex flex-col gap-6">
                                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 text-gray-500">
                                                <th className="py-3 px-4 text-center w-10">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-purple-600 shadow-sm focus:ring-purple-500"
                                                        checked={selectedItems.length > 0 && selectedItems.length === therapistDetails.length}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedItems(therapistDetails.map(d => d.id));
                                                            } else {
                                                                setSelectedItems([]);
                                                            }
                                                        }}
                                                    />
                                                </th>
                                                <th className="py-3 px-4 text-left font-bold uppercase tracking-wider text-[10px]">Tanggal</th>
                                                <th className="py-3 px-4 text-left font-bold uppercase tracking-wider text-[10px]">No Invoice</th>
                                                <th className="py-3 px-4 text-left font-bold uppercase tracking-wider text-[10px]">Layanan</th>
                                                <th className="py-3 px-4 text-left font-bold uppercase tracking-wider text-[10px]">Metode</th>
                                                <th className="py-3 px-4 text-right font-bold uppercase tracking-wider text-[10px]">Harga</th>
                                                <th className="py-3 px-4 text-right font-bold uppercase tracking-wider text-[10px]">Komisi</th>
                                                <th className="py-3 px-4 text-right font-bold uppercase tracking-wider text-[10px]">Net Profit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {therapistDetails.map((detail) => (
                                                <tr key={detail.id} className="hover:bg-gray-50/50">
                                                    <td className="py-3 px-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-gray-300 text-purple-600 shadow-sm focus:ring-purple-500"
                                                            checked={selectedItems.includes(detail.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedItems([...selectedItems, detail.id]);
                                                                } else {
                                                                    setSelectedItems(selectedItems.filter(id => id !== detail.id));
                                                                }
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-900 font-medium whitespace-nowrap">{detail.schedule_date}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-purple-600 font-bold whitespace-nowrap">{detail.invoice_no}</div>
                                                        <div className="text-[10px] text-gray-500">{detail.customer_name}</div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-gray-900 font-bold">{detail.package_name}</div>
                                                        <div className="text-xs text-gray-500">{detail.package_duration}</div>
                                                    </td>
                                                    <td className="py-3 px-4 text-left text-gray-900 font-bold whitespace-nowrap uppercase text-xs">{detail.payment_method}</td>
                                                    <td className="py-3 px-4 text-right text-gray-900 font-bold whitespace-nowrap">{fmt(detail.price)}</td>
                                                    <td className="py-3 px-4 text-right text-red-500 font-bold whitespace-nowrap">{fmt(detail.commission)}</td>
                                                    <td className="py-3 px-4 text-right text-emerald-600 font-bold whitespace-nowrap">{fmt(detail.price - detail.commission)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-gray-900 text-white font-bold">
                                                <td colSpan={5} className="py-3 px-4 text-right uppercase text-[10px] tracking-wider">Total</td>
                                                <td className="py-3 px-4 text-right whitespace-nowrap">{fmt(therapistDetails.reduce((a, b) => a + b.price, 0))}</td>
                                                <td className="py-3 px-4 text-right whitespace-nowrap text-red-400">{fmt(therapistDetails.reduce((a, b) => a + b.commission, 0))}</td>
                                                <td className="py-3 px-4 text-right whitespace-nowrap text-emerald-400">{fmt(therapistDetails.reduce((a, b) => a + (b.price - b.commission), 0))}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {selectedItems.length > 0 && (() => {
                                    const selectedData = therapistDetails.filter(d => selectedItems.includes(d.id));
                                    const totalKomisiTransfer = selectedData.filter(d => d.payment_method?.toLowerCase() === 'transfer').reduce((sum, d) => sum + d.commission, 0);
                                    const totalNetProfitCash = selectedData.filter(d => d.payment_method?.toLowerCase() === 'cash').reduce((sum, d) => sum + (d.price - d.commission), 0);
                                    const totalDibayarkan = totalKomisiTransfer - totalNetProfitCash;

                                    return (
                                        <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100 flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="flex-1 w-full space-y-3">
                                                <h4 className="text-purple-900 font-bold flex items-center gap-2">
                                                    <span className="material-symbols-outlined">receipt_long</span>
                                                    Ringkasan Pembayaran ({selectedItems.length} Sesi Terpilih)
                                                </h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between text-gray-600">
                                                        <span>Total Komisi (Metode Transfer)</span>
                                                        <span className="font-bold text-gray-900">{fmt(totalKomisiTransfer)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-gray-600">
                                                        <span>Total Net Profit (Metode Cash)</span>
                                                        <span className="font-bold text-red-500">- {fmt(totalNetProfitCash)}</span>
                                                    </div>
                                                    <div className="pt-2 border-t border-purple-200 flex justify-between font-black text-base">
                                                        <span className="text-purple-900">Total Dibayarkan ke Terapis</span>
                                                        <span className={totalDibayarkan >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                                            {fmt(totalDibayarkan)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 w-full md:w-auto">
                                                <button
                                                    className="w-full md:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                                                    onClick={handleSaveInvoice}
                                                >
                                                    <span className="material-symbols-outlined text-sm">save</span>
                                                    {editingInvoiceId ? 'Update Invoice' : 'Simpan & Buat Invoice'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
