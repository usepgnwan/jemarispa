import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { TrashIcon, ArrowLeftIcon, PlusIcon, ClockIcon } from '@heroicons/react/24/outline';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function Edit({ pkg, signaturePackages = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title_id: pkg.title_id || '',
        title_en: pkg.title_en || '',
        category_id: pkg.category_id || '',
        category_en: pkg.category_en || '',
        description_id: pkg.description_id || '',
        description_en: pkg.description_en || '',
        parent_id: pkg.parent_id || '',
        is_signature: pkg.is_signature || false,
        priority: pkg.priority !== null && pkg.priority !== undefined ? pkg.priority : '',
        durations: pkg.durations.length > 0
            ? pkg.durations.map(d => ({ id: d.id, duration: d.duration, price: d.price, commission: d.commission || '' }))
            : [{ duration: '', price: '', commission: '' }]
    });

    const handleAddDuration = () => {
        setData('durations', [...data.durations, { duration: '', price: '', commission: '' }]);
    };

    const handleRemoveDuration = (index) => {
        if (data.durations.length === 1) return;
        const newDurations = [...data.durations];
        newDurations.splice(index, 1);
        setData('durations', newDurations);
    };

    const handleDurationChange = (index, field, value) => {
        const newDurations = [...data.durations];
        newDurations[index][field] = value;
        setData('durations', newDurations);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.package.update', pkg.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Paket: ${pkg.title_id}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 px-2 sm:px-0">
                        <Link
                            href={route('admin.package.index')}
                            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0057B8] font-medium transition-colors mb-4"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            Kembali ke Daftar Paket
                        </Link>
                        <h2 className="font-bold text-2xl text-gray-900">
                            Edit Paket: {pkg.title_id}
                        </h2>
                    </div>

                    <form onSubmit={submit} className="space-y-8">
                        {/* Service Settings */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-zenith-gold/10 px-8 py-4 border-b border-gray-100 flex items-center gap-2">
                                <span className="material-symbols-outlined text-zenith-gold">spa</span>
                                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-widest">Pengaturan Layanan</h3>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="parent_id" value="Pilih Main Service (Opsional)" />
                                    <div className="mt-1 relative">
                                        <select
                                            id="parent_id"
                                            value={data.parent_id}
                                            className="mt-1 block w-full rounded-xl border-gray-300 focus:border-[#0057B8] focus:ring-[#0057B8] shadow-sm appearance-none pr-10"
                                            onChange={(e) => setData('parent_id', e.target.value)}
                                        >
                                            <option value="">-- Tanpa Layanan Utama --</option>
                                            {signaturePackages.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.title_id} {s.title_en ? `(${s.title_en})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                            <span className="material-symbols-outlined text-gray-400">expand_more</span>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Pilih layanan utama jika paket ini merupakan bagian dari kategori ritual tertentu.
                                    </p>
                                    <InputError message={errors.parent_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="priority" value="Prioritas Tampilan (Opsional)" />
                                    <TextInput
                                        id="priority"
                                        type="number"
                                        value={data.priority}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('priority', e.target.value)}
                                        placeholder="Contoh: 1 (Urutan teratas)"
                                        min="0"
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                        Semakin kecil angkanya, semakin tinggi prioritas tampilannya di halaman beranda.
                                    </p>
                                    <InputError message={errors.priority} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* Language Sections Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Indonesian Version */}
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-red-50/50 px-8 py-4 border-b border-gray-100 flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded bg-red-100 text-red-600 font-bold text-xs">ID</span>
                                    <h3 className="font-bold text-gray-900">Versi Indonesia</h3>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div>
                                        <InputLabel htmlFor="title_id" value="Nama Paket (Wajib)" />
                                        <TextInput
                                            id="title_id"
                                            type="text"
                                            value={data.title_id}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('title_id', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.title_id} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="category_id" value="Kategori" />
                                        <TextInput
                                            id="category_id"
                                            type="text"
                                            value={data.category_id}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('category_id', e.target.value)}
                                        />
                                        <InputError message={errors.category_id} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="description_id" value="Deskripsi Paket" />
                                        <div className="mt-2">
                                            <ReactQuill
                                                theme="snow"
                                                value={data.description_id}
                                                onChange={(content) => setData('description_id', content)}
                                                className="bg-white h-[200px] mb-12 rounded-lg"
                                            />
                                        </div>
                                        <InputError message={errors.description_id} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* English Version */}
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-blue-50/50 px-8 py-4 border-b border-gray-100 flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded bg-blue-100 text-blue-600 font-bold text-xs">EN</span>
                                    <h3 className="font-bold text-gray-900">English Version</h3>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div>
                                        <InputLabel htmlFor="title_en" value="Package Name" />
                                        <TextInput
                                            id="title_en"
                                            type="text"
                                            value={data.title_en}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('title_en', e.target.value)}
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
                                        <InputLabel htmlFor="description_en" value="Package Description" />
                                        <div className="mt-2">
                                            <ReactQuill
                                                theme="snow"
                                                value={data.description_en}
                                                onChange={(content) => setData('description_en', content)}
                                                className="bg-white h-[200px] mb-12 rounded-lg"
                                            />
                                        </div>
                                        <InputError message={errors.description_en} className="mt-2" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Durations Section */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Pilihan Durasi & Harga</h3>
                                    <button
                                        type="button"
                                        onClick={handleAddDuration}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0057B8]/10 text-[#0057B8] rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#0057B8]/20 transition-colors"
                                    >
                                        <PlusIcon className="w-4 h-4" /> Tambah Durasi
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {data.durations.map((item, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row gap-4 items-end bg-gray-50 p-5 rounded-2xl border border-gray-200">
                                            <div className="flex-1 w-full">
                                                <InputLabel value="Durasi" className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5" />
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                        <ClockIcon className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="pl-11 w-full rounded-xl border-gray-300 focus:border-[#0057B8] focus:ring-[#0057B8] sm:text-sm py-2.5 shadow-sm bg-white"
                                                        placeholder="Misal: 60 Menit"
                                                        value={item.duration}
                                                        onChange={(e) => handleDurationChange(index, 'duration', e.target.value)}
                                                    />
                                                </div>
                                                <InputError message={errors[`durations.${index}.duration`]} className="mt-1 text-xs" />
                                            </div>
                                            <div className="flex-1 w-full">
                                                <InputLabel value="Harga" className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5" />
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <span className="text-gray-500 text-sm font-bold">Rp</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="pl-12 w-full rounded-xl border-gray-300 focus:border-[#0057B8] focus:ring-[#0057B8] sm:text-sm font-semibold py-2.5 shadow-sm bg-white"
                                                        placeholder="0"
                                                        value={item.price !== undefined && item.price !== null && item.price !== '' ? new Intl.NumberFormat('id-ID').format(item.price) : ''}
                                                        onChange={(e) => {
                                                            const rawValue = e.target.value.replace(/\D/g, '');
                                                            handleDurationChange(index, 'price', rawValue);
                                                        }}
                                                    />
                                                </div>
                                                <InputError message={errors[`durations.${index}.price`]} className="mt-1 text-xs" />
                                            </div>

                                            <div className="flex-1 w-full">
                                                <InputLabel value="Komisi Terapis" className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5" />
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <span className="text-gray-500 text-sm font-bold">Rp</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="pl-12 w-full rounded-xl border-gray-300 focus:border-[#0057B8] focus:ring-[#0057B8] sm:text-sm font-semibold py-2.5 shadow-sm bg-white"
                                                        placeholder="0"
                                                        value={item.commission !== undefined && item.commission !== null && item.commission !== '' ? new Intl.NumberFormat('id-ID').format(item.commission) : ''}
                                                        onChange={(e) => {
                                                            const rawValue = e.target.value.replace(/\D/g, '');
                                                            handleDurationChange(index, 'commission', rawValue);
                                                        }}
                                                    />
                                                </div>
                                                <InputError message={errors[`durations.${index}.commission`]} className="mt-1 text-xs" />
                                            </div>

                                            {data.durations.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveDuration(index)}
                                                    className="w-full sm:w-auto p-3 bg-white border border-gray-300 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50 transition-colors shadow-sm"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-x-4 px-2 sm:px-0 pb-10">
                            <Link href={route('admin.package.index')}>
                                <SecondaryButton disabled={processing}>Batal</SecondaryButton>
                            </Link>
                            <PrimaryButton disabled={processing} className="bg-[#0057B8] hover:bg-[#004494] px-8">
                                Simpan Perubahan
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
