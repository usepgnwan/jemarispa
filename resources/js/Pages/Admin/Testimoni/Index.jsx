import { useState, useCallback } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, StarIcon as StarOutline, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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

export default function Index({ testimonis, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTestimoniId, setCurrentTestimoniId] = useState(null);

    // Toast and Delete Modal state
    const [toast, setToast] = useState({ show: false, message: '' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [testimoniToDelete, setTestimoniToDelete] = useState(null);

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const [search, setSearch] = useState(filters?.search || '');
    const [limit, setLimit] = useState(filters?.limit || 10);

    const { data, setData, post, put, delete: destroy, reset, processing, errors, clearErrors } = useForm({
        name: '',
        description: '',
        packages_description: '',
        source: '',
        star: 5,
    });

    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentTestimoniId(null);
        setData({ name: '', description: '', packages_description: '', source: '', star: 5 });
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (testimoni) => {
        setIsEditing(true);
        setCurrentTestimoniId(testimoni.id);
        setData({
            name: testimoni.name,
            description: testimoni.description || '',
            packages_description: testimoni.packages_description || '',
            source: testimoni.source || '',
            star: testimoni.star,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setData({ name: '', description: '', packages_description: '', source: '', star: 5 });
            reset();
            clearErrors();
        }, 300);
    };

    const submit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route('testimoni.update', currentTestimoniId), {
                onSuccess: () => {
                    closeModal();
                    showToast('Testimoni berhasil diperbarui!');
                },
            });
        } else {
            post(route('testimoni.store'), {
                onSuccess: () => {
                    closeModal();
                    showToast('Testimoni berhasil ditambahkan!');
                },
            });
        }
    };

    const confirmDelete = (testimoni) => {
        setTestimoniToDelete(testimoni);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (testimoniToDelete) {
            destroy(route('testimoni.destroy', testimoniToDelete.id), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setTestimoniToDelete(null);
                    showToast('Testimoni berhasil dihapus!');
                },
            });
        }
    };

    // Handle filter changes
    const fetchFilteredData = useCallback(
        debounce((query, limitValue) => {
            router.get(
                route('testimoni.index'),
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
            <Head title="Kelola Testimoni" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Page Header (Title & Add Button) */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-2 sm:px-0">
                        <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                MASTER DATA <span className="mx-1">/</span> TESTIMONI
                            </div>
                            <h2 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
                                <StarSolid className="w-6 h-6 text-[#0057B8]" />
                                Kelola Testimoni
                            </h2>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex justify-center items-center gap-x-2 bg-[#0057B8] hover:bg-[#004494] text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0057B8]"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Tambah Testimoni
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
                                    placeholder="Cari testimoni..."
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
                                    TOTAL {testimonis.total || testimonis.data.length} TESTIMONI
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
                                            Nama
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-[13px] font-bold text-gray-700 capitalize tracking-wide">
                                            Rating
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-[13px] font-bold text-gray-700 capitalize tracking-wide">
                                            Paket
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-[13px] font-bold text-gray-700 capitalize tracking-wide">
                                            Sumber
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
                                    {testimonis.data.map((testimoni, index) => (
                                        <tr key={testimoni.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 font-medium">
                                                {(testimonis.current_page - 1) * testimonis.per_page + index + 1}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {testimoni.name}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center text-yellow-500">
                                                    {[...Array(5)].map((_, i) => (
                                                        i < testimoni.star ? (
                                                            <StarSolid key={i} className="w-4 h-4 drop-shadow-sm" />
                                                        ) : (
                                                            <StarOutline key={i} className="w-4 h-4 text-gray-300" />
                                                        )
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                                                {testimoni.packages_description || '-'}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                                                {testimoni.source ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {testimoni.source}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-500 max-w-xs">
                                                <div
                                                    className="line-clamp-2 prose prose-sm max-w-none text-gray-500"
                                                    dangerouslySetInnerHTML={{ __html: testimoni.description }}
                                                />
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-x-4">
                                                    <button
                                                        onClick={() => openEditModal(testimoni)}
                                                        className="text-gray-400 hover:text-[#0057B8] focus:outline-none transition-colors"
                                                        title="Edit"
                                                    >
                                                        <PencilSquareIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(testimoni)}
                                                        className="text-gray-400 hover:text-red-500 focus:outline-none transition-colors"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {testimonis.data.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-16 text-center">
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
                        {testimonis.links && testimonis.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center">
                                <div className="flex flex-wrap gap-2">
                                    {testimonis.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-4 py-2 text-sm border rounded-md transition-colors ${link.active
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
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="2xl">
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">
                        {isEditing ? 'Edit Data Testimoni' : 'Tambah Testimoni Baru'}
                    </h2>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="name" value="Nama Pelanggan" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    isFocused
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel value="Rating (Bintang)" />
                                <div className="mt-2 flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((starValue) => (
                                        <button
                                            key={starValue}
                                            type="button"
                                            onClick={() => setData('star', starValue)}
                                            className="focus:outline-none focus:ring-2 focus:ring-[#0057B8] focus:ring-offset-1 rounded-full p-1 transition-transform hover:scale-110 text-yellow-500"
                                        >
                                            {starValue <= data.star ? (
                                                <StarSolid className="h-7 w-7 !text-zenith-gold drop-shadow-sm" />
                                            ) : (
                                                <StarOutline className="w-7 h-7 text-gray-300 hover:text-yellow-300" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <InputError message={errors.star} className="mt-2" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="packages_description" value="Paket yang Dibeli" />
                                <TextInput
                                    id="packages_description"
                                    type="text"
                                    name="packages_description"
                                    value={data.packages_description}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('packages_description', e.target.value)}
                                />
                                <InputError message={errors.packages_description} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="source" value="Sumber (Google, Traveloka, dll)" />
                                <TextInput
                                    id="source"
                                    type="text"
                                    name="source"
                                    value={data.source}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('source', e.target.value)}
                                />
                                <InputError message={errors.source} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Deskripsi Testimoni" />
                            <div className="mt-1">
                                <ReactQuill
                                    theme="snow"
                                    value={data.description}
                                    onChange={(content) => setData('description', content)}
                                    className="bg-white rounded-md h-48 mb-12"
                                />
                            </div>
                            <InputError message={errors.description} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-x-3">
                        <SecondaryButton onClick={closeModal} disabled={processing}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-[#0057B8] hover:bg-[#004494]">
                            {isEditing ? 'Simpan Perubahan' : 'Simpan Testimoni'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        Hapus Testimoni
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Apakah Anda yakin ingin menghapus testimoni dari <span className="font-semibold">{testimoniToDelete?.name}</span>?
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
                            Hapus Testimoni
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
