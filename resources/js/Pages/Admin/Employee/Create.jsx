import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        nohp: '',
        title: '',
        join_date: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.employee.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Karyawan" />

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
                        <h2 className="font-bold text-2xl text-gray-900">Tambah Karyawan Baru</h2>
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
                                        placeholder="Contoh: Budi Santoso"
                                    />
                                    <InputError message={errors.name} className="mt-2" />
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
                                        placeholder="Contoh: Terapis Spa"
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
                                        placeholder="Contoh: 08123456789"
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
                                    Simpan Karyawan
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
