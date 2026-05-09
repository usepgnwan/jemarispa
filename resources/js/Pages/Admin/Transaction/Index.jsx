import { useState, useCallback } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { 
    MagnifyingGlassIcon, 
    ShoppingCartIcon, 
    EyeIcon, 
    TrashIcon, 
    CheckCircleIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    TruckIcon
} from '@heroicons/react/24/outline';

// Custom debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const statusColors = {
    pending: 'bg-gray-100 text-gray-700 border-gray-200',
    send_terapis: 'bg-blue-100 text-blue-700 border-blue-200',
    invoice: 'bg-amber-100 text-amber-700 border-amber-200',
    success: 'bg-green-100 text-green-700 border-green-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
};

const statusIcons = {
    pending: ArrowPathIcon,
    send_terapis: TruckIcon,
    invoice: DocumentTextIcon,
    success: CheckCircleIcon,
    failed: TrashIcon,
};

export default function Index({ transactions, filters, counts }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [limit, setLimit] = useState(filters?.limit || 10);
    const [activeTab, setActiveTab] = useState(filters?.tab || 'recent');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const { patch, delete: destroy, processing } = useForm();

    const fetchFilteredData = useCallback(
        debounce((query, limitValue, tabValue) => {
            router.get(
                route('admin.transaction.index'),
                { search: query, limit: limitValue, tab: tabValue },
                { preserveState: true, replace: true }
            );
        }, 300),
        []
    );

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        fetchFilteredData(e.target.value, limit, activeTab);
    };

    const handleLimitChange = (e) => {
        setLimit(e.target.value);
        fetchFilteredData(search, e.target.value, activeTab);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        fetchFilteredData(search, limit, tab);
    };

    const updateStatus = (id, status) => {
        patch(route('admin.transaction.update-status', id), {
            status: status,
        }, {
            onSuccess: () => {
                if (selectedTransaction?.id === id) {
                    setSelectedTransaction({ ...selectedTransaction, status });
                }
            }
        });
    };

    const confirmDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            destroy(route('admin.transaction.destroy', id));
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const openDetails = (transaction) => {
        setSelectedTransaction(transaction);
        setIsDetailModalOpen(true);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Riwayat Transaksi" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-2 sm:px-0">
                        <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                PENGGUNA <span className="mx-1">/</span> PESANAN
                            </div>
                            <h2 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
                                <ShoppingCartIcon className="w-6 h-6 text-zenith-orange" />
                                Riwayat Transaksi
                            </h2>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="mb-6 flex overflow-x-auto pb-2 scrollbar-hide gap-2 px-2 sm:px-0">
                        {[
                            { id: 'recent', label: 'Terbaru (3 Hari)', count: counts.recent, icon: ArrowPathIcon },
                            { id: 'pending', label: 'Pending', count: counts.pending, icon: ArrowPathIcon },
                            { id: 'send_terapis', label: 'Kirim Terapis', count: counts.send_terapis, icon: TruckIcon },
                            { id: 'invoice', label: 'Invoice', count: counts.invoice, icon: DocumentTextIcon },
                            { id: 'success', label: 'Selesai', count: counts.success, icon: CheckCircleIcon },
                            { id: 'failed', label: 'Batal', count: counts.failed, icon: TrashIcon },
                        ].map((tab) => {
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${
                                        isActive 
                                        ? 'bg-zenith-orange text-white border-zenith-orange shadow-lg shadow-zenith-orange/20' 
                                        : 'bg-white text-gray-500 border-gray-100 hover:border-zenith-orange/30 hover:text-zenith-orange'
                                    }`}
                                >
                                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                    {tab.label}
                                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[9px] ${
                                        isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Filter & Search */}
                    <div className="bg-white shadow-sm sm:rounded-[2rem] overflow-hidden border border-gray-100 p-4 sm:p-6 mb-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div className="relative w-full sm:w-96">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari Order ID atau Nama..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="pl-11 w-full bg-gray-50 border-transparent focus:bg-white focus:border-zenith-orange focus:ring-zenith-orange rounded-full text-sm py-2.5 transition-colors"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <select
                                    value={limit}
                                    onChange={handleLimitChange}
                                    className="bg-transparent border-none text-xs font-bold text-gray-500 focus:ring-0 cursor-pointer"
                                >
                                    <option value="10">10 / PAGE</option>
                                    <option value="25">25 / PAGE</option>
                                    <option value="50">50 / PAGE</option>
                                </select>
                                <div className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                                    TOTAL {transactions.total} PESANAN
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-white shadow-sm sm:rounded-[2rem] overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jadwal</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.data.map((transaction) => {
                                        const StatusIcon = statusIcons[transaction.status];
                                        return (
                                            <tr key={transaction.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <span className="text-sm font-bold text-gray-900 block">{transaction.order_number}</span>
                                                    <span className="text-[10px] font-medium text-gray-400">{new Date(transaction.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-sm font-semibold text-gray-700 block">{transaction.customer_name}</span>
                                                    <span className="text-[10px] font-medium text-gray-400">{transaction.phone}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-sm font-medium text-gray-700 block">{new Date(transaction.schedule_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                                    <span className="text-[10px] font-bold text-zenith-orange uppercase tracking-wider">{transaction.schedule_time}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-sm font-bold text-gray-900">{formatCurrency(transaction.total_price)}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex justify-center">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[transaction.status]}`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {transaction.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => openDetails(transaction)}
                                                            className="p-2 text-gray-400 hover:text-zenith-orange transition-colors"
                                                            title="Detail"
                                                        >
                                                            <EyeIcon className="w-5 h-5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => confirmDelete(transaction.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {transactions.data.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-20 text-center text-gray-400 italic text-sm">
                                                Tidak ada transaksi ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {transactions.links && transactions.links.length > 3 && (
                            <div className="px-6 py-6 bg-gray-50/50 border-t border-gray-100">
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {transactions.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-4 py-2 text-xs border rounded-xl transition-all shadow-sm ${link.active
                                                ? 'bg-zenith-orange text-white border-zenith-orange shadow-lg shadow-zenith-orange/20'
                                                : link.url
                                                    ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                    : 'bg-white/50 text-gray-400 border-gray-100 cursor-not-allowed'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            preserveScroll
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail & Update Status Modal */}
            <Modal show={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} maxWidth="2xl">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">{selectedTransaction?.order_number}</h3>
                            <p className="text-sm text-gray-500">Detail Pesanan & Pembaruan Status</p>
                        </div>
                        <button 
                            onClick={() => setIsDetailModalOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined text-gray-400">close</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Customer Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Informasi Pelanggan</label>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-sm font-bold text-gray-900">{selectedTransaction?.customer_name}</p>
                                    <p className="text-sm text-gray-600">{selectedTransaction?.phone}</p>
                                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">{selectedTransaction?.address}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Catatan</label>
                                <p className="text-sm text-gray-600 bg-amber-50 p-4 rounded-2xl border border-amber-100 italic">
                                    {selectedTransaction?.notes || 'Tidak ada catatan.'}
                                </p>
                            </div>
                        </div>

                        {/* Status Update */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Update Status Pesanan</label>
                            <div className="space-y-2">
                                {Object.keys(statusColors).map((status) => {
                                    const Icon = statusIcons[status];
                                    const isActive = selectedTransaction?.status === status;
                                    return (
                                        <button
                                            key={status}
                                            onClick={() => updateStatus(selectedTransaction.id, status)}
                                            disabled={processing}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                                                isActive 
                                                ? `ring-2 ring-offset-1 ${statusColors[status]}` 
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-zenith-orange hover:text-zenith-orange'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-5 h-5" />
                                                <span className="text-xs font-bold uppercase tracking-wider">{status.replace('_', ' ')}</span>
                                            </div>
                                            {isActive && <CheckCircleIcon className="w-5 h-5" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Daftar Paket & Guest</label>
                        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-4 py-3 font-bold text-gray-500">Gender</th>
                                        <th className="px-4 py-3 font-bold text-gray-500">Paket</th>
                                        <th className="px-4 py-3 text-right font-bold text-gray-500">Harga</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {selectedTransaction?.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-3">
                                                <span className="text-[10px] font-bold uppercase text-zenith-orange">{item.guest_gender}</span>
                                                <p className="text-[9px] text-gray-400 uppercase tracking-tighter">Terapis: {item.therapist_gender_preference}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-gray-800">{item.package_name}</span>
                                                <span className="text-xs text-gray-400 ml-2">({item.package_duration})</span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-900">
                                                {formatCurrency(item.price)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50/50 font-bold">
                                        <td colSpan="2" className="px-4 py-4 text-right text-gray-500">TOTAL</td>
                                        <td className="px-4 py-4 text-right text-zenith-orange text-lg">
                                            {formatCurrency(selectedTransaction?.total_price)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <SecondaryButton onClick={() => setIsDetailModalOpen(false)}>Tutup</SecondaryButton>
                    </div>
                </div>
            </Modal>

            {/* Toast Notification */}
            {flash?.message && (
                <div className="fixed bottom-10 right-10 z-[110] animate-slide-up">
                    <div className="bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-x-4 border border-white/10">
                        <span className="material-symbols-outlined text-green-400">check_circle</span>
                        <p className="text-sm font-medium">{flash.message}</p>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
