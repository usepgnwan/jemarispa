import { useState, useRef, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { PhotoIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import QuillEditorV2 from '@/Components/QuillEditorV2';

export default function Create() {
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        slug: '',
        description: '',
        tag: '',
        type_package: '',
        thumbnail: null,
    });

    const handleTitleChange = (e) => {
        const title = e.target.value;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        setData(data => ({ ...data, title, slug }));
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('thumbnail', file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.blog.store'), {
            forceFormData: true,
        });
    };



    return (
        <AuthenticatedLayout>
            <Head title="Tambah Artikel Blog" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 px-2 sm:px-0">
                        <Link 
                            href={route('admin.blog.index')}
                            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0057B8] font-medium transition-colors mb-4"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            Kembali ke Daftar Blog
                        </Link>
                        <h2 className="font-bold text-2xl text-gray-900">Tambah Artikel Baru</h2>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <form onSubmit={submit} className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                {/* Left column - Content */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div>
                                        <InputLabel htmlFor="title" value="Judul Artikel" />
                                        <TextInput
                                            id="title"
                                            type="text"
                                            name="title"
                                            value={data.title}
                                            className="mt-1 block w-full text-lg font-medium"
                                            onChange={handleTitleChange}
                                            required
                                            isFocused
                                        />
                                        <InputError message={errors.title} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="slug" value="Slug (URL)" />
                                        <TextInput
                                            id="slug"
                                            type="text"
                                            name="slug"
                                            value={data.slug}
                                            className="mt-1 block w-full bg-gray-50 font-mono text-sm text-gray-500"
                                            onChange={(e) => setData('slug', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.slug} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="description" value="Isi Artikel" />
                                        <div className="mt-2">
                                            <QuillEditorV2 
                                                value={data.description} 
                                                onChange={(content) => setData('description', content)}
                                                className="bg-white h-[500px] mb-12 rounded-lg"
                                            />
                                        </div>
                                        <InputError message={errors.description} className="mt-2" />
                                    </div>
                                </div>

                                {/* Right column - Meta/Media */}
                                <div className="space-y-8">
                                    {/* Thumbnail Upload */}
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        <InputLabel value="Thumbnail Image (Opsional)" />
                                        <div className="mt-3 flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 bg-white hover:border-[#0057B8] transition-colors">
                                            <div className="text-center w-full">
                                                {imagePreview ? (
                                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4 shadow-sm border border-gray-100">
                                                        <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setImagePreview(null);
                                                                setData('thumbnail', null);
                                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                                            }}
                                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                                                )}
                                                <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                                    <label
                                                        htmlFor="thumbnail"
                                                        className="relative cursor-pointer rounded-md bg-white font-semibold text-[#0057B8] focus-within:outline-none hover:text-[#004494]"
                                                    >
                                                        <span>Upload a file</span>
                                                        <input 
                                                            id="thumbnail" 
                                                            name="thumbnail" 
                                                            type="file" 
                                                            className="sr-only" 
                                                            accept="image/*"
                                                            onChange={handleThumbnailChange}
                                                            ref={fileInputRef}
                                                        />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs leading-5 text-gray-500 mt-2">PNG, JPG, WebP up to 5MB (Bisa dikosongkan)</p>
                                            </div>
                                        </div>
                                        <InputError message={errors.thumbnail} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="type_package" value="Tipe Paket (Bebas)" />
                                        <TextInput
                                            id="type_package"
                                            type="text"
                                            name="type_package"
                                            value={data.type_package}
                                            className="mt-1 block w-full"
                                            placeholder="Contoh: Paket Premium, Treatment Reguler"
                                            onChange={(e) => setData('type_package', e.target.value)}
                                        />
                                        <InputError message={errors.type_package} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="tag" value="Tags (Pisahkan dengan koma)" />
                                        <TextInput
                                            id="tag"
                                            type="text"
                                            name="tag"
                                            value={data.tag}
                                            className="mt-1 block w-full"
                                            placeholder="bekam, spa, kesehatan"
                                            onChange={(e) => setData('tag', e.target.value)}
                                        />
                                        <InputError message={errors.tag} className="mt-2" />
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {data.tag && data.tag.split(',').map((t, i) => t.trim() !== '' && (
                                                <span key={i} className="inline-flex items-center rounded-md bg-zenith-orange/10 px-3 py-1 text-xs font-bold text-zenith-orange tracking-widest uppercase">
                                                    {t.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end gap-x-4">
                                <Link href={route('admin.blog.index')}>
                                    <SecondaryButton disabled={processing}>
                                        Batal
                                    </SecondaryButton>
                                </Link>
                                <PrimaryButton disabled={processing} className="bg-[#0057B8] hover:bg-[#004494] px-8">
                                    Terbitkan Artikel
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
