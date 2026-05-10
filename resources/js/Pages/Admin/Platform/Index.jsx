import { useState, useCallback } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Custom debounce function to avoid lodash dependency issues
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

export default function Index({ platforms, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPlatformId, setCurrentPlatformId] = useState(null);

    // Toast and Delete Modal state
    const [toast, setToast] = useState({ show: false, message: '' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [platformToDelete, setPlatformToDelete] = useState(null);

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const [search, setSearch] = useState(filters?.search || '');
    const [limit, setLimit] = useState(filters?.limit || 10);

    const { data, setData, post, put, delete: destroy, reset, processing, errors, clearErrors } = useForm({
        title: '',
        description: '',
        url: '',
        logo: null,
    });

    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentPlatformId(null);
        setData({ title: '', description: '', url: '', logo: null });
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (platform) => {
        setIsEditing(true);
        setCurrentPlatformId(platform.id);
        setData({
            title: platform.title,
            description: platform.description || '',
            url: platform.url,
            logo: null, // Reset logo for new upload
            current_logo: platform.logo, // For preview
            _method: 'put',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setData({ title: '', description: '', url: '', logo: null });
            reset();
            clearErrors();
        }, 300);
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            post(route('platform.update', currentPlatformId), {
                forceFormData: true,
                onSuccess: () => {
                    closeModal();
                    showToast('Platform berhasil diperbarui!');
                },
            });
        } else {
            post(route('platform.store'), {
                onSuccess: () => {
                    closeModal();
                    showToast('Platform berhasil ditambahkan!');
                },
            });
        }
    };

    const confirmDelete = (platform) => {
        setPlatformToDelete(platform);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (platformToDelete) {
            destroy(route('platform.destroy', platformToDelete.id), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setPlatformToDelete(null);
                    showToast('Platform berhasil dihapus!');
                },
            });
        }
    };

    // Handle filter changes
    const fetchFilteredData = useCallback(
        debounce((query, limitValue) => {
            router.get(
                route('platform.index'),
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
            <Head title="Kelola Platform" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Page Header (Title & Add Button) */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-2 sm:px-0">
                        <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                MASTER DATA <span className="mx-1">/</span> PLATFORM
                            </div>
                            <h2 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
                                <svg className="w-6 h-6 text-[#0057B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                Kelola Platform
                            </h2>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex justify-center items-center gap-x-2 bg-[#0057B8] hover:bg-[#004494] text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0057B8]"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Tambah Platform
                        </button>
                    </div>

                    {/* Card Table */}
                    <div className="bg-white shadow-sm sm:rounded-[2rem] overflow-hidden border border-gray-100 p-2 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                            
                            {/* Search Bar Left */}
                            <div className="relative w-full sm:w-80">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari platform..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="pl-11 w-full bg-gray-50 border-transparent focus:bg-white focus:border-[#0057B8] focus:ring-[#0057B8] rounded-full text-sm py-2.5 transition-colors"
                                />
                            </div>

                            {/* Right Side: Total Text and Limit */}
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
                                    TOTAL {platforms.total || platforms.data.length} PLATFORM
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
                                            Logo
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-[13px] font-bold text-gray-700 capitalize tracking-wide">
                                            Nama Platform
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-[13px] font-bold text-gray-700 capitalize tracking-wide">
                                            URL
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-[13px] font-bold text-gray-700 capitalize tracking-wide">
                                            Deskripsi
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right text-[13px] font-bold text-gray-700 capitalize tracking-wide rounded-r-xl">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {platforms.data.map((platform, index) => (
                                        <tr key={platform.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 font-medium">
                                                {(platforms.current_page - 1) * platforms.per_page + index + 1}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-100 shadow-sm">
                                                    {platform.logo ? (
                                                        <img src={`/storage/${platform.logo}`} alt={platform.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-400">NA</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {platform.title}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                                                <a href={platform.url} target="_blank" rel="noopener noreferrer" className="text-[#0057B8] hover:text-[#004494] hover:underline">
                                                    {platform.url}
                                                </a>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-500 max-w-xs truncate">
                                                {platform.description || '-'}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-x-4">
                                                    <button
                                                        onClick={() => openEditModal(platform)}
                                                        className="text-gray-400 hover:text-[#0057B8] focus:outline-none transition-colors"
                                                        title="Edit"
                                                    >
                                                        <PencilSquareIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(platform)}
                                                        className="text-gray-400 hover:text-red-500 focus:outline-none transition-colors"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {platforms.data.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                    </svg>
                                                    <p className="text-gray-400 text-sm font-medium">No data</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Links */}
                        {platforms.links && platforms.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center">
                                <div className="flex flex-wrap gap-2">
                                    {platforms.links.map((link, index) => (
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

            {/* Create/Edit Modal */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">
                        {isEditing ? 'Edit Data Platform' : 'Tambah Platform Baru'}
                    </h2>

                    <div className="space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="shrink-0">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center relative group">
                                    {data.logo ? (
                                        <img src={URL.createObjectURL(data.logo)} className="w-full h-full object-cover" />
                                    ) : data.current_logo ? (
                                        <img src={`/storage/${data.current_logo}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1">
                                <InputLabel htmlFor="logo" value="Platform Logo" />
                                <input
                                    id="logo"
                                    type="file"
                                    className="mt-1 block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#0057B8]/10 file:text-[#0057B8] hover:file:bg-[#0057B8]/20 transition-all"
                                    onChange={(e) => setData('logo', e.target.files[0])}
                                    accept="image/*"
                                />
                                <p className="mt-1 text-[10px] text-gray-400">SVG, PNG, JPG or GIF (max. 2MB)</p>
                                <InputError message={errors.logo} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="title" value="Title" />
                            <TextInput
                                id="title"
                                type="text"
                                name="title"
                                value={data.title}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('title', e.target.value)}
                                required
                                isFocused
                            />
                            <InputError message={errors.title} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="url" value="URL" />
                            <TextInput
                                id="url"
                                type="url"
                                name="url"
                                value={data.url}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('url', e.target.value)}
                                required
                            />
                            <InputError message={errors.url} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Description" />
                            <textarea
                                id="description"
                                name="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-zenith-orange focus:ring-zenith-orange rounded-md shadow-sm"
                                rows="4"
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-x-3">
                        <SecondaryButton onClick={closeModal} disabled={processing}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {isEditing ? 'Simpan Perubahan' : 'Simpan Platform'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Hapus Platform
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Apakah Anda yakin ingin menghapus platform <span className="font-semibold">{platformToDelete?.title}</span>? 
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
                            Hapus Platform
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
                    <div className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <p className="text-sm font-medium">{toast.message}</p>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
