import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { ArrowLeftIcon, PhotoIcon, SparklesIcon } from '@heroicons/react/24/outline';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title_id: '',
        title_en: '',
        category_id: '',
        category_en: '',
        description_en: '',
        image: null,
        status: 'public',
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '' });

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check if file size > 5MB (5 * 1024 * 1024 bytes)
            if (file.size > 5 * 1024 * 1024) {
                showToast('image max 5mb');
                e.target.value = ''; // Reset input
                return;
            }
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.signature-ritual.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Main Service Baru" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 px-2 sm:px-0">
                        <Link 
                            href={route('admin.signature-ritual.index')}
                            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-zenith-orange font-medium transition-colors mb-4"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            Kembali ke Daftar Service
                        </Link>
                        <h2 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
                            <SparklesIcon className="w-6 h-6 text-zenith-orange" />
                            Tambah Main Service Baru
                        </h2>
                    </div>

                    <form onSubmit={submit} className="space-y-8">
                        {/* Basic Info Section */}
                        <div className="bg-white shadow-sm sm:rounded-[2rem] overflow-hidden border border-gray-100">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Informasi Dasar (Indonesia)</h3>
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <InputLabel htmlFor="title_id" value="Nama Service (Wajib)" />
                                    <TextInput
                                        id="title_id"
                                        type="text"
                                        value={data.title_id}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('title_id', e.target.value)}
                                        required
                                        placeholder="Contoh: Pijat Tradisional"
                                    />
                                    <InputError message={errors.title_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="category_id" value="Kategori (Opsional)" />
                                    <TextInput
                                        id="category_id"
                                        type="text"
                                        value={data.category_id}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('category_id', e.target.value)}
                                        placeholder="Contoh: Massage, Relaxation"
                                    />
                                    <InputError message={errors.category_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="status" value="Status Tampilan" />
                                    <div className="mt-1 relative">
                                        <select
                                            id="status"
                                            value={data.status}
                                            className="mt-1 block w-full rounded-xl border-gray-300 focus:border-[#0057B8] focus:ring-[#0057B8] shadow-sm appearance-none pr-10"
                                            onChange={(e) => setData('status', e.target.value)}
                                        >
                                            <option value="public">Public (Tampil di Home & Admin)</option>
                                            <option value="private">Private (Hanya tampil di Admin)</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                            <span className="material-symbols-outlined text-gray-400">expand_more</span>
                                        </div>
                                    </div>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="description_id" value="Deskripsi (Wajib)" />
                                    <div className="mt-1">
                                        <ReactQuill
                                            theme="snow"
                                            value={data.description_id}
                                            onChange={(val) => setData('description_id', val)}
                                            className="bg-white rounded-lg h-48 mb-12"
                                        />
                                    </div>
                                    <InputError message={errors.description_id} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* English Section */}
                        <div className="bg-white shadow-sm sm:rounded-[2rem] overflow-hidden border border-gray-100">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Basic Info (English)</h3>
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <InputLabel htmlFor="title_en" value="Service Name" />
                                    <TextInput
                                        id="title_en"
                                        type="text"
                                        value={data.title_en}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('title_en', e.target.value)}
                                        placeholder="Example: Traditional Massage"
                                    />
                                    <InputError message={errors.title_en} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="category_en" value="Category" />
                                    <TextInput
                                        id="category_en"
                                        type="text"
                                        value={data.category_en}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('category_en', e.target.value)}
                                    />
                                    <InputError message={errors.category_en} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="description_en" value="Description" />
                                    <div className="mt-1">
                                        <ReactQuill
                                            theme="snow"
                                            value={data.description_en}
                                            onChange={(val) => setData('description_en', val)}
                                            className="bg-white rounded-lg h-48 mb-12"
                                        />
                                    </div>
                                    <InputError message={errors.description_en} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* Image Section */}
                        <div className="bg-white shadow-sm sm:rounded-[2rem] overflow-hidden border border-gray-100">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Foto Service</h3>
                            </div>
                            <div className="p-8">
                                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-3xl hover:border-zenith-orange transition-colors cursor-pointer relative group">
                                    <input
                                        type="file"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        accept="image/*"
                                    />
                                    {imagePreview ? (
                                        <div className="relative w-full max-w-sm aspect-video">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-2xl shadow-md"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                                <p className="text-white text-sm font-bold">Klik untuk Ganti Foto</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-300 group-hover:text-zenith-orange transition-colors" />
                                            <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                                <span className="font-semibold text-zenith-orange">Upload file</span>
                                                <p className="pl-1">atau tarik dan lepas</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="mt-2 text-xs leading-5 text-gray-500 text-center">PNG, JPG, WebP up to 5MB (Bisa dikosongkan)</p>
                                <InputError message={errors.image} className="mt-2 text-center" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-x-4 px-2 sm:px-0 pb-10">
                            <Link href={route('admin.signature-ritual.index')}>
                                <SecondaryButton disabled={processing}>Batal</SecondaryButton>
                            </Link>
                            <PrimaryButton disabled={processing} className="!bg-zenith-orange hover:!bg-zenith-orange/90 px-8">
                                Tambah Service Baru
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-10 right-10 z-[110] animate-bounce">
                    <div className="bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-x-4 border border-white/10">
                        <span className="material-symbols-outlined">warning</span>
                        <p className="text-sm font-bold uppercase tracking-widest">{toast.message}</p>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
