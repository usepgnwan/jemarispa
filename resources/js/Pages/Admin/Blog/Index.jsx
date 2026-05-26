import { useState, useCallback } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { PlusIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, PhotoIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

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

export default function Index({ blogs, filters }) {
    const { flash } = usePage().props;

    // Delete Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);

    const [search, setSearch] = useState(filters?.search || '');
    const [limit, setLimit] = useState(filters?.limit || 9);

    const { delete: destroy, processing } = useForm();

    const confirmDelete = (blog) => {
        setBlogToDelete(blog);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (blogToDelete) {
            destroy(route('admin.blog.destroy', blogToDelete.id), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setBlogToDelete(null);
                },
            });
        }
    };

    // Handle filter changes
    const fetchFilteredData = useCallback(
        debounce((query, limitValue) => {
            router.get(
                route('admin.blog.index'),
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
            <Head title="Kelola Blog" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Page Header (Title & Add Button) */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-2 sm:px-0">
                        <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                MASTER DATA <span className="mx-1">/</span> BLOG
                            </div>
                            <h2 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
                                <DocumentTextIcon className="w-6 h-6 text-[#0057B8]" />
                                Kelola Blog
                            </h2>
                        </div>
                        <Link
                            href={route('admin.blog.create')}
                            className="inline-flex justify-center items-center gap-x-2 bg-[#0057B8] hover:bg-[#004494] text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Tambah Blog
                        </Link>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="bg-white shadow-sm sm:rounded-[2rem] overflow-hidden border border-gray-100 p-4 sm:p-6 mb-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            
                            {/* Search Bar Left */}
                            <div className="relative w-full sm:w-96">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari artikel blog..."
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
                                        <option value="9">9 / PAGE</option>
                                        <option value="18">18 / PAGE</option>
                                        <option value="36">36 / PAGE</option>
                                        <option value="72">72 / PAGE</option>
                                    </select>
                                </div>
                                <div className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                                    TOTAL {blogs.total || blogs.data.length} BLOG
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Blog Card Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogs.data.map((blog) => (
                            <div key={blog.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-lg transition-shadow">
                                {/* Image Container */}
                                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                                    {blog.thumbnail ? (
                                        <img 
                                            src={`/storage/${blog.thumbnail}`} 
                                            alt={blog.title} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                            <PhotoIcon className="w-12 h-12 text-gray-300" />
                                        </div>
                                    )}
                                    
                                    {/* Author overlay */}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-[#0057B8] uppercase tracking-wider shadow-sm">
                                            {blog.user?.name || 'Admin'}
                                        </span>
                                    </div>

                                    {/* Action buttons overlay */}
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link 
                                            href={route('admin.blog.edit', blog.id)}
                                            className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-[#0057B8] transition-colors"
                                        >
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </Link>
                                        <button 
                                            onClick={() => confirmDelete(blog)}
                                            className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-red-500 transition-colors"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {blog.tag && blog.tag.split(',').map((tag, idx) => (
                                            <span key={idx} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-md">
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                                        {blog.title}
                                    </h3>
                                    <div className="text-xs text-gray-400 mb-4 font-mono truncate">/{blog.slug}</div>
                                    
                                    <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                                        {blog.description ? blog.description.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') : ''}
                                    </p>

                                    {blog.type_package && (
                                        <div className="pt-4 border-t border-gray-100 mt-auto">
                                            <span className="text-xs font-semibold text-[#0057B8]">
                                                Paket: {blog.type_package}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {blogs.data.length === 0 && (
                        <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm border border-gray-100 mt-6">
                            <div className="flex flex-col items-center justify-center">
                                <DocumentTextIcon className="w-16 h-16 text-gray-200 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada artikel</h3>
                                <p className="text-sm text-gray-500">Mulai buat artikel blog pertama Anda.</p>
                            </div>
                        </div>
                    )}

                    {/* Pagination Links */}
                    {blogs.links && blogs.links.length > 3 && (
                        <div className="py-6 flex items-center justify-center">
                            <div className="flex flex-wrap gap-2">
                                {blogs.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 text-sm border rounded-md transition-colors shadow-sm ${link.active
                                                ? 'bg-zenith-orange text-white border-zenith-orange'
                                                : link.url
                                                    ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
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

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                <div className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                        <TrashIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2 text-center">
                        Hapus Artikel Blog
                    </h2>
                    <p className="text-sm text-gray-600 mb-6 text-center">
                        Apakah Anda yakin ingin menghapus artikel <br />"<span className="font-semibold">{blogToDelete?.title}</span>"? <br /><br />
                        Gambar thumbnail yang terkait juga akan dihapus permanen.
                    </p>
                    <div className="flex justify-center gap-x-3">
                        <SecondaryButton onClick={() => setIsDeleteModalOpen(false)} disabled={processing}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={handleDelete}
                            disabled={processing}
                            className="!bg-red-600 hover:!bg-red-700 focus:!ring-red-500"
                        >
                            Hapus Artikel
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* Toast Notification */}
            {flash?.message && (
                <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
                    <div className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <p className="text-sm font-medium">{flash.message}</p>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
