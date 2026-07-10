import { useState, useCallback } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

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

export default function Index({ certifications, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCertificationId, setCurrentCertificationId] = useState(null);

    const [toast, setToast] = useState({ show: false, message: '' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [certificationToDelete, setCertificationToDelete] = useState(null);

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const [search, setSearch] = useState(filters?.search || '');
    const [limit, setLimit] = useState(filters?.limit || 10);

    const { data, setData, post, put, delete: destroy, reset, processing, errors, clearErrors } = useForm({
        name: '',
        description: '',
    });

    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentCertificationId(null);
        setData({ name: '', description: '' });
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (certification) => {
        setIsEditing(true);
        setCurrentCertificationId(certification.id);
        setData({
            name: certification.name,
            description: certification.description || '',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setData({ name: '', description: '' });
            reset();
            clearErrors();
        }, 300);
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            put(route('admin.certification.update', currentCertificationId), {
                onSuccess: () => {
                    closeModal();
                    showToast('Status sertifikasi berhasil diperbarui!');
                },
            });
        } else {
            post(route('admin.certification.store'), {
                onSuccess: () => {
                    closeModal();
                    showToast('Status sertifikasi berhasil ditambahkan!');
                },
            });
        }
    };

    const confirmDelete = (certification) => {
        setCertificationToDelete(certification);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (certificationToDelete) {
            destroy(route('admin.certification.destroy', certificationToDelete.id), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setCertificationToDelete(null);
                    showToast('Status sertifikasi berhasil dihapus!');
                },
            });
        }
    };

    const fetchFilteredData = useCallback(
        debounce((query, limitValue) => {
            router.get(
                route('admin.certification.index'),
                { search: query, limit: limitValue },
                { preserveState: true, replace: true }
            );
        }, 300),
        []
    );

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        fetchFilteredData(e.target.value, limit);
    };

    const handleLimitChange = (e) => {
        setLimit(e.target.value);
        fetchFilteredData(search, e.target.value);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Status Sertifikasi" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-2 sm:px-0">
                        <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                MASTER DATA <span className="mx-1">/</span> STATUS SERTIFIKASI
                            </div>
                            <h2 className="font-bold text-2xl text-gray-900 flex items-center gap-2.5">
                                <CheckBadgeIcon className="w-7 h-7 text-[#0057B8]" />
                                Master Status Sertifikasi Terapis
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Kelola daftar pelatihan & status sertifikasi (contoh: Pelatihan Internal Jemari Home Spa, BNSP, dll).
                            </p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex justify-center items-center gap-x-2 bg-[#0057B8] hover:bg-[#004494] text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0057B8]"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Tambah Sertifikasi
                        </button>
                    </div>

                    <div className="bg-white shadow-sm sm:rounded-[2rem] overflow-hidden border border-gray-100 p-2 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                            
                            <div className="relative w-full sm:w-80">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari status sertifikasi..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="pl-11 w-full bg-gray-50 border-transparent focus:bg-white focus:border-[#0057B8] focus:ring-[#0057B8] rounded-full text-sm py-2.5 transition-colors"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <select
                                        value={limit}
                                        onChange={handleLimitChange}
                                        className="bg-transparent border-none text-xs font-bold text-gray-500 focus:ring-0 cursor-pointer"
                                    >
                                        <option value="10">10 / PAGE</option>
                                        <option value="25">25 / PAGE</option>
                                        <option value="50">50 / PAGE</option>
                                        <option value="100">100 / PAGE</option>
                                    </select>
                                </div>
                                <div className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                                    TOTAL {certifications.total || certifications.data.length} SERTIFIKASI
                                </div>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto rounded-xl">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-[13px] font-bold text-gray-700 capitalize tracking-wide rounded-l-xl w-16">
                                            No
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-[13px] font-bold text-gray-700 capitalize tracking-wide">
                                            Status Sertifikasi
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-[13px] font-bold text-gray-700 capitalize tracking-wide">
                                            Keterangan / Deskripsi
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right text-[13px] font-bold text-gray-700 capitalize tracking-wide rounded-r-xl w-32">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {certifications.data.map((cert, index) => (
                                        <tr key={cert.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 font-medium">
                                                {(certifications.current_page - 1) * certifications.per_page + index + 1}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                        <CheckBadgeIcon className="w-4 h-4" />
                                                    </div>
                                                    <span>{cert.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-600">
                                                {cert.description || '-'}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-x-4">
                                                    <button
                                                        onClick={() => openEditModal(cert)}
                                                        className="text-gray-400 hover:text-[#0057B8] focus:outline-none transition-colors"
                                                        title="Edit"
                                                    >
                                                        <PencilSquareIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(cert)}
                                                        className="text-gray-400 hover:text-red-500 focus:outline-none transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {certifications.data.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <CheckBadgeIcon className="w-16 h-16 text-gray-200 mb-4" />
                                                    <p className="text-gray-400 text-sm font-medium">Belum ada data status sertifikasi</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {certifications.links && certifications.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center">
                                <div className="flex flex-wrap gap-2">
                                    {certifications.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-4 py-2 text-sm border rounded-md transition-colors ${
                                                link.active 
                                                    ? 'bg-zenith-orange text-white border-zenith-orange' 
                                                    : link.url 
                                                        ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
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

            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">
                        {isEditing ? 'Edit Status Sertifikasi' : 'Tambah Status Sertifikasi Baru'}
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Status Sertifikasi" />
                            <TextInput
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                className="mt-1 block w-full"
                                placeholder="Contoh: Pelatihan Internal Jemari Home Spa, BNSP..."
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                isFocused
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Keterangan / Deskripsi (Opsional)" />
                            <textarea
                                id="description"
                                name="description"
                                value={data.description}
                                placeholder="Penjelasan standar atau lembaga pelatihan..."
                                onChange={(e) => setData('description', e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-[#0057B8] focus:ring-[#0057B8] rounded-xl shadow-sm text-sm"
                                rows="3"
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-x-3">
                        <SecondaryButton onClick={closeModal} disabled={processing}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-[#0057B8] hover:bg-[#004494]">
                            {isEditing ? 'Simpan Perubahan' : 'Simpan Sertifikasi'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        Hapus Status Sertifikasi
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Apakah Anda yakin ingin menghapus status sertifikasi <span className="font-semibold text-gray-900">{certificationToDelete?.name}</span>? 
                        Data yang dihapus tidak dapat dikembalikan.
                    </p>
                    <div className="flex justify-end gap-x-3">
                        <SecondaryButton onClick={() => setIsDeleteModalOpen(false)} disabled={processing}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={handleDelete}
                            disabled={processing}
                            className="!bg-red-600 hover:!bg-red-700 focus:!ring-red-500"
                        >
                            Hapus
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {toast.show && (
                <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
                    <div className="bg-gray-800 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-green-400 rounded-full"></div>
                        <p className="text-sm font-medium">{toast.message}</p>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
