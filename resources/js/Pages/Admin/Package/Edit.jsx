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

export default function Edit({ package: pkg }) {
    // If package has no durations, initialize with one empty duration
    const initialDurations = pkg.durations && pkg.durations.length > 0 
        ? pkg.durations.map(d => ({ duration: d.duration, price: d.price })) 
        : [{ duration: '', price: '' }];

    const { data, setData, put, processing, errors } = useForm({
        title: pkg.title || '',
        category: pkg.category || '',
        description: pkg.description || '',
        durations: initialDurations
    });

    const handleAddDuration = () => {
        setData('durations', [...data.durations, { duration: '', price: '' }]);
    };

    const handleRemoveDuration = (index) => {
        if (data.durations.length === 1) return; // Must have at least one
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
        put(route('admin.package.update', pkg.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Paket: ${pkg.title}`} />

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
                        <h2 className="font-bold text-2xl text-gray-900">Edit Paket: {pkg.title}</h2>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <form onSubmit={submit} className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                
                                {/* Left column - Main Package Data */}
                                <div className="space-y-6">
                                    <div>
                                        <InputLabel htmlFor="title" value="Nama Paket Layanan" />
                                        <TextInput
                                            id="title"
                                            type="text"
                                            name="title"
                                            value={data.title}
                                            className="mt-1 block w-full text-lg font-medium"
                                            onChange={(e) => setData('title', e.target.value)}
                                            required
                                            isFocused
                                        />
                                        <InputError message={errors.title} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="category" value="Kategori (Opsional)" />
                                        <TextInput
                                            id="category"
                                            type="text"
                                            name="category"
                                            value={data.category}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('category', e.target.value)}
                                            placeholder="Contoh: Spa, Treatment Khusus"
                                        />
                                        <InputError message={errors.category} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="description" value="Deskripsi Paket" />
                                        <div className="mt-2">
                                            <ReactQuill 
                                                theme="snow" 
                                                value={data.description} 
                                                onChange={(content) => setData('description', content)}
                                                className="bg-white h-[300px] mb-12 rounded-lg"
                                            />
                                        </div>
                                        <InputError message={errors.description} className="mt-2" />
                                    </div>
                                </div>

                                {/* Right column - Dynamic Durations */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                        <h3 className="text-lg font-bold text-gray-900">Pilihan Durasi & Harga</h3>
                                        <button
                                            type="button"
                                            onClick={handleAddDuration}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zenith-orange/10 text-zenith-orange rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zenith-orange/20 transition-colors"
                                        >
                                            <PlusIcon className="w-4 h-4" /> Tambah Durasi
                                        </button>
                                    </div>

                                    {/* Duration Cards */}
                                    <div className="space-y-4">
                                        {data.durations.map((item, index) => (
                                            <div key={index} className="flex flex-col sm:flex-row gap-4 items-end bg-gray-50 p-5 rounded-2xl border border-gray-200">
                                                
                                                {/* Duration Input */}
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

                                                {/* Price Input */}
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

                                                {/* Delete Button */}
                                                {data.durations.length > 1 && (
                                                    <div className="w-full sm:w-auto pt-2 sm:pt-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveDuration(index)}
                                                            className="w-full sm:w-auto flex items-center justify-center p-3 bg-white border border-gray-300 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50 transition-colors shadow-sm"
                                                            title="Hapus baris ini"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <InputError message={errors.durations} className="mt-2" />
                                </div>
                            </div>

                            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end gap-x-4">
                                <Link href={route('admin.package.index')}>
                                    <SecondaryButton disabled={processing}>
                                        Batal
                                    </SecondaryButton>
                                </Link>
                                <PrimaryButton disabled={processing} className="bg-[#0057B8] hover:bg-[#004494] px-8">
                                    Simpan Perubahan
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
