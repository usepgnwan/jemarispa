import { useState, useCallback } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, LanguageIcon } from '@heroicons/react/24/outline';
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

export default function Index({ faqs, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentFaqId, setCurrentFaqId] = useState(null);

    // Toast and Delete Modal state
    const [toast, setToast] = useState({ show: false, message: '' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [faqToDelete, setFaqToDelete] = useState(null);

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const [search, setSearch] = useState(filters?.search || '');
    const [limit, setLimit] = useState(filters?.limit || 10);

    const { data, setData, post, put, delete: destroy, reset, processing, errors, clearErrors } = useForm({
        title_id: '',
        description_id: '',
        title_en: '',
        description_en: '',
    });

    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentFaqId(null);
        setData({ title_id: '', description_id: '', title_en: '', description_en: '' });
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (faq) => {
        setIsEditing(true);
        setCurrentFaqId(faq.id);
        setData({
            title_id: faq.title_id || '',
            description_id: faq.description_id || '',
            title_en: faq.title_en || '',
            description_en: faq.description_en || '',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setData({ title_id: '', description_id: '', title_en: '', description_en: '' });
            reset();
            clearErrors();
        }, 300);
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            put(route('faq.update', currentFaqId), {
                onSuccess: () => {
                    closeModal();
                    showToast('FAQ berhasil diperbarui!');
                },
            });
        } else {
            post(route('faq.store'), {
                onSuccess: () => {
                    closeModal();
                    showToast('FAQ berhasil ditambahkan!');
                },
            });
        }
    };

    const confirmDelete = (faq) => {
        setFaqToDelete(faq);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (faqToDelete) {
            destroy(route('faq.destroy', faqToDelete.id), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setFaqToDelete(null);
                    showToast('FAQ berhasil dihapus!');
                },
            });
        }
    };

    // Handle filter changes
    const fetchFilteredData = useCallback(
        debounce((query, limitValue) => {
            router.get(
                route('faq.index'),
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
            <Head title="Kelola FAQ" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Page Header (Title & Add Button) */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-2 sm:px-0">
                        <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                MASTER DATA <span className="mx-1">/</span> FAQ
                            </div>
                            <h2 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
                                <svg className="w-6 h-6 text-[#0057B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Kelola FAQ
                            </h2>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex justify-center items-center gap-x-2 bg-[#0057B8] hover:bg-[#004494] text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0057B8]"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Tambah FAQ
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
                                    placeholder="Cari FAQ..."
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
                                    TOTAL {faqs.total || faqs.data.length} FAQ
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
                                            Judul (ID & EN)
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-[13px] font-bold text-gray-700 capitalize tracking-wide">
                                            Deskripsi (ID & EN)
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right text-[13px] font-bold text-gray-700 capitalize tracking-wide rounded-r-xl">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {faqs.data.map((faq, index) => (
                                        <tr key={faq.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 font-medium align-top">
                                                {(faqs.current_page - 1) * faqs.per_page + index + 1}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900 align-top">
                                                <div className="mb-2">
                                                    <span className="inline-block px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs mr-2 font-bold">ID</span>
                                                    {faq.title_id}
                                                </div>
                                                <div className="text-gray-500">
                                                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs mr-2 font-bold">EN</span>
                                                    {faq.title_en || <span className="italic">Belum diisi</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-500 max-w-md align-top">
                                                <div className="mb-3">
                                                    <span className="inline-block px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs mb-1 font-bold">ID</span>
                                                    <div 
                                                        className="line-clamp-2 prose prose-sm max-w-none text-gray-700"
                                                        dangerouslySetInnerHTML={{ __html: faq.description_id }}
                                                    />
                                                </div>
                                                <div className="text-gray-500">
                                                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs mb-1 font-bold">EN</span>
                                                    {faq.description_en ? (
                                                        <div 
                                                            className="line-clamp-2 prose prose-sm max-w-none text-gray-500"
                                                            dangerouslySetInnerHTML={{ __html: faq.description_en }}
                                                        />
                                                    ) : (
                                                        <div><span className="italic">Belum diisi</span></div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium align-top">
                                                <div className="flex items-center justify-end gap-x-4">
                                                    <button
                                                        onClick={() => openEditModal(faq)}
                                                        className="text-gray-400 hover:text-[#0057B8] focus:outline-none transition-colors"
                                                        title="Edit"
                                                    >
                                                        <PencilSquareIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(faq)}
                                                        className="text-gray-400 hover:text-red-500 focus:outline-none transition-colors"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {faqs.data.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-16 text-center">
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
                        {faqs.links && faqs.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center">
                                <div className="flex flex-wrap gap-2">
                                    {faqs.links.map((link, index) => (
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
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="4xl">
                <form onSubmit={submit} className="p-0">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <LanguageIcon className="w-5 h-5 text-[#0057B8]" />
                            {isEditing ? 'Edit Data FAQ' : 'Tambah FAQ Baru'}
                        </h2>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/50">
                        
                        {/* Versi Indonesia */}
                        <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded bg-red-100 text-red-600 font-bold text-xs">ID</span>
                                <h3 className="font-bold text-gray-900">Versi Indonesia</h3>
                            </div>

                            <div>
                                <InputLabel htmlFor="title_id" value="Judul / Pertanyaan (Wajib)" />
                                <TextInput
                                    id="title_id"
                                    type="text"
                                    name="title_id"
                                    value={data.title_id}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('title_id', e.target.value)}
                                    required
                                />
                                <InputError message={errors.title_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="description_id" value="Deskripsi / Jawaban (Wajib)" />
                                <div className="mt-1">
                                    <ReactQuill 
                                        theme="snow" 
                                        value={data.description_id} 
                                        onChange={(content) => setData('description_id', content)}
                                        className="bg-white rounded-md h-48 mb-10"
                                    />
                                </div>
                                <InputError message={errors.description_id} className="mt-2" />
                            </div>
                        </div>

                        {/* English Version */}
                        <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded bg-blue-100 text-blue-600 font-bold text-xs">EN</span>
                                <h3 className="font-bold text-gray-900">English Version</h3>
                            </div>

                            <div>
                                <InputLabel htmlFor="title_en" value="Title / Question" />
                                <TextInput
                                    id="title_en"
                                    type="text"
                                    name="title_en"
                                    value={data.title_en}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('title_en', e.target.value)}
                                />
                                <InputError message={errors.title_en} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="description_en" value="Description / Answer" />
                                <div className="mt-1">
                                    <ReactQuill 
                                        theme="snow" 
                                        value={data.description_en} 
                                        onChange={(content) => setData('description_en', content)}
                                        className="bg-white rounded-md h-48 mb-10"
                                    />
                                </div>
                                <InputError message={errors.description_en} className="mt-2" />
                            </div>
                        </div>

                    </div>

                    <div className="p-6 flex justify-end gap-x-3 border-t border-gray-100">
                        <SecondaryButton onClick={closeModal} disabled={processing}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-[#0057B8] hover:bg-[#004494]">
                            {isEditing ? 'Simpan Perubahan' : 'Simpan FAQ'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        Hapus FAQ
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Apakah Anda yakin ingin menghapus FAQ <span className="font-semibold">{faqToDelete?.title_id}</span>? 
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
                            Hapus FAQ
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
