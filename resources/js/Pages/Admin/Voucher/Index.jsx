import { useState } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { PlusIcon, PencilSquareIcon, TrashIcon, TicketIcon } from '@heroicons/react/24/outline';
import Pagination from '@/Components/Pagination';

export default function Index({ vouchers = { data: [] } }) {
    const { flash = {} } = usePage().props;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [voucherToDelete, setVoucherToDelete] = useState(null);

    const { delete: destroy, processing } = useForm();

    const openDeleteModal = (voucher) => {
        setVoucherToDelete(voucher);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setVoucherToDelete(null);
    };

    const handleDelete = () => {
        destroy(route('admin.voucher.destroy', voucherToDelete.id), {
            onSuccess: () => closeDeleteModal(),
        });
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    return (
        <AuthenticatedLayout
            user={usePage().props.auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Voucher Management</h2>}
        >
            <Head title="Voucher Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {flash.message && (
                        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl shadow-sm animate-fade-in flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {flash.message}
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-3xl border border-gray-100">
                        <div className="p-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-zenith-orange/10 rounded-2xl">
                                        <TicketIcon className="w-8 h-8 text-zenith-orange" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">List Voucher</h1>
                                        <p className="text-sm text-gray-500">Kelola voucher promo dan bundle paket</p>
                                    </div>
                                </div>
                                <Link
                                    href={route('admin.voucher.create')}
                                    className="inline-flex items-center px-6 py-3 bg-zenith-orange text-white rounded-2xl font-bold hover:bg-zenith-orange/90 transition-all shadow-lg shadow-zenith-orange/20 group"
                                >
                                    <PlusIcon className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                                    Tambah Voucher
                                </Link>
                            </div>

                            <div className="overflow-x-auto -mx-8">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Detail Voucher</th>
                                            <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Tipe & Kategori</th>
                                            <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status & Kuota</th>
                                            <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {vouchers.data.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className="p-4 bg-gray-50 rounded-full mb-4">
                                                            <TicketIcon className="w-12 h-12 text-gray-300" />
                                                        </div>
                                                        <h3 className="text-lg font-bold text-gray-900">Belum ada voucher</h3>
                                                        <p className="text-gray-500">Mulai dengan menambahkan voucher pertama Anda.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            vouchers.data.map((voucher) => (
                                                <tr key={voucher.id} className="group hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-900 group-hover:text-zenith-orange transition-colors uppercase tracking-wider">
                                                                {voucher.code}
                                                            </span>
                                                            <span className="text-xs text-gray-500 mt-1 line-clamp-1">{voucher.description || 'Tidak ada deskripsi'}</span>
                                                            {voucher.type === 'paid' && (
                                                                <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
                                                                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                                    Buyer: <span className="font-medium text-gray-700">{voucher.customer_name}</span> 
                                                                    {voucher.customer_phone && <span className="text-gray-400">({voucher.customer_phone})</span>}
                                                                    <span className="mx-1">·</span>
                                                                    <span className="text-gray-400">@{formatRupiah(voucher.price)}</span>
                                                                    <span className="mx-1">·</span>
                                                                    <span className="font-bold text-zenith-orange">Total Bayar: {formatRupiah(voucher.price * voucher.quota)}</span>
                                                                </div>
                                                            )}
                                                            {voucher.category === 'bundle' && (
                                                                <div className="mt-2 flex flex-wrap gap-1">
                                                                    {voucher.bundle_packages?.map((pkg, i) => (
                                                                        <span key={i} className="text-[9px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-md font-medium border border-purple-100">
                                                                            {pkg.name} ({pkg.duration})
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                                voucher.type === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                            }`}>
                                                                {voucher.type}
                                                            </span>
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                                voucher.category === 'bundle' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                                                            }`}>
                                                                {voucher.category}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                                                voucher.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                            }`}>
                                                                {voucher.is_active ? 'AKTIF' : 'NON-AKTIF'}
                                                            </span>
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                                                                    <div 
                                                                        className="h-full bg-zenith-orange transition-all duration-500" 
                                                                        style={{ width: `${Math.min((voucher.used_count / voucher.quota) * 100, 100)}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-tighter">
                                                                    {voucher.used_count} / {voucher.quota} DIGUNAKAN
                                                                </span>
                                                            </div>
                                                            <span className="text-[9px] text-gray-400 font-medium">
                                                                Exp: {new Date(voucher.expired_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <a
                                                                href={route('admin.voucher.download', voucher.id)}
                                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                                                title="Download PDF"
                                                                target="_blank"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                                                </svg>
                                                            </a>
                                                            <Link
                                                                href={route('admin.voucher.edit', voucher.id)}
                                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                                title="Edit"
                                                            >
                                                                <PencilSquareIcon className="w-5 h-5" />
                                                            </Link>
                                                            <button
                                                                onClick={() => openDeleteModal(voucher)}
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                                title="Hapus"
                                                            >
                                                                <TrashIcon className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-8 border-t border-gray-50 pt-8">
                                <Pagination links={vouchers.links} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal} maxWidth="sm">
                <div className="p-8">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <TrashIcon className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Hapus Voucher?</h3>
                    <p className="text-gray-500 text-center text-sm mb-8">
                        Voucher <span className="font-bold text-gray-900 uppercase">"{voucherToDelete?.code}"</span> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex gap-3">
                        <SecondaryButton onClick={closeDeleteModal} className="flex-1 justify-center rounded-xl py-3">
                            Batal
                        </SecondaryButton>
                        <DangerButton
                            onClick={handleDelete}
                            disabled={processing}
                            className="flex-1 justify-center rounded-xl py-3 shadow-lg shadow-red-500/20"
                        >
                            {processing ? 'Menghapus...' : 'Ya, Hapus'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
