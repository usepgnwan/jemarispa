import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Edit({ employee }) {
    const { data, setData, put, processing, errors } = useForm({
        name: employee.name || '',
        nohp: employee.nohp || '',
        title: employee.title || '',
        email: employee.email || '',
        is_active: employee.is_active !== undefined ? employee.is_active : true,
        join_date: employee.join_date || ''
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.employee.update', employee.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Karyawan: ${employee.name}`} />

            <div className="py-8">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 px-2 sm:px-0">
                        <Link 
                            href={route('admin.employee.index')}
                            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0057B8] font-medium transition-colors mb-4"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            Kembali ke Data Karyawan
                        </Link>
                        <h2 className="font-bold text-2xl text-gray-900">Edit Karyawan: {employee.name}</h2>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <form onSubmit={submit} className="p-8">
                            <div className="space-y-6">
                                
                                <div>
                                    <InputLabel htmlFor="name" value="Nama Lengkap Karyawan" />
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="email" value="Alamat Email (Akses Login)" />
                                        <TextInput
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.email} className="mt-2" />
                                    </div>
                                    
                                    <div className="flex flex-col justify-center pt-6">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-zenith-orange shadow-sm focus:ring-zenith-orange w-5 h-5 cursor-pointer"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                            />
                                            <span className="ml-3 text-sm font-medium text-gray-700">Aktifkan Akses Login</span>
                                        </label>
                                        <p className="mt-1 text-xs text-gray-500 ml-8">Jika tidak dicentang, karyawan tidak bisa login.</p>
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="title" value="Jabatan / Posisi" />
                                    <TextInput
                                        id="title"
                                        type="text"
                                        name="title"
                                        value={data.title}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.title} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="nohp" value="Nomor Handphone" />
                                    <TextInput
                                        id="nohp"
                                        type="text"
                                        name="nohp"
                                        value={data.nohp}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('nohp', e.target.value.replace(/\D/g, ''))}
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Hanya angka (0-9).</p>
                                    <InputError message={errors.nohp} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="join_date" value="Tanggal Bergabung (Opsional)" />
                                    <TextInput
                                        id="join_date"
                                        type="date"
                                        name="join_date"
                                        value={data.join_date}
                                        className="mt-1 block w-full text-gray-700"
                                        onChange={(e) => setData('join_date', e.target.value)}
                                    />
                                    <InputError message={errors.join_date} className="mt-2" />
                                </div>

                            </div>

                            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end gap-x-4">
                                <Link href={route('admin.employee.index')}>
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
