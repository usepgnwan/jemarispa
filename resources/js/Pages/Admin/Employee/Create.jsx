import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { ArrowLeftIcon, PhotoIcon, PlusIcon, TrashIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';

export default function Create({ skills = [], certifications = [], serviceAreas = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        nip: '',
        name: '',
        fullname: '',
        nohp: '',
        title: '',
        work_area: 'Jemari Home Spa - Seluruh Area Layanan',
        status: 'aktif',
        email: '',
        is_active: true,
        join_date: '',
        photo: null,
        skills: [],
        service_areas: [],
        certifications: [{ certification_id: '', certificate_number: '', valid_until: '', file: null }]
    });

    const toggleSkill = (id) => {
        const current = data.skills || [];
        setData('skills', current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
    };

    const toggleServiceArea = (id) => {
        const current = data.service_areas || [];
        const updated = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
        const areaNames = serviceAreas.filter(a => updated.includes(a.id)).map(a => a.name);
        setData(prev => ({
            ...prev,
            service_areas: updated,
            work_area: areaNames.length > 0 ? areaNames.join(', ') : 'Jemari Home Spa - Seluruh Area Layanan'
        }));
    };

    const addCertificationRow = () => {
        setData('certifications', [...data.certifications, { certification_id: '', certificate_number: '', valid_until: '', file: null }]);
    };

    const removeCertificationRow = (index) => {
        setData('certifications', data.certifications.filter((_, i) => i !== index));
    };

    const handleCertificationFieldChange = (index, field, value) => {
        const updated = [...data.certifications];
        updated[index] = { ...updated[index], [field]: value };
        setData('certifications', updated);
    };

    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.employee.store'), { forceFormData: true });
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
                                    <InputLabel value="Foto Karyawan (Opsional)" />
                                    <div className="mt-2 flex flex-col sm:flex-row items-center gap-6 p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-[#0057B8] transition-colors bg-gray-50/50">
                                        <div className="relative w-36 h-36 shrink-0 rounded-2xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center shadow-sm group">
                                            {imagePreview ? (
                                                <>
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-semibold">
                                                        Ganti Foto
                                                        <input
                                                            type="file"
                                                            onChange={handleImageChange}
                                                            accept="image/*"
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </>
                                            ) : (
                                                <PhotoIcon className="w-12 h-12 text-gray-300" />
                                            )}
                                        </div>

                                        <div className="flex-1 text-center sm:text-left">
                                            <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 hover:border-gray-300 focus:outline-none transition ease-in-out duration-150 cursor-pointer">
                                                <span>{imagePreview ? 'Ganti Foto' : 'Pilih Foto'}</span>
                                                <input
                                                    type="file"
                                                    onChange={handleImageChange}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                            </label>
                                            <div className="mt-3 space-y-1.5">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                                                    <span>Catatan: Disarankan rasio 1:1 (Persegi)</span>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Format PNG, JPG, atau WebP maksimal 5MB.
                                                </p>
                                            </div>
                                            <InputError message={errors.photo} className="mt-2" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <InputLabel htmlFor="nip" value="Nomor Induk Pegawai (NIP)" />
                                        <TextInput
                                            id="nip"
                                            type="text"
                                            name="nip"
                                            value={data.nip}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('nip', e.target.value)}
                                            placeholder="Contoh: 20260101"
                                        />
                                        <InputError message={errors.nip} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="name" value="Nama Pendek / Nickname" />
                                        <TextInput
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                            placeholder="Contoh: Ina"
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="fullname" value="Nama Lengkap Karyawan" />
                                        <TextInput
                                            id="fullname"
                                            type="text"
                                            name="fullname"
                                            value={data.fullname}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('fullname', e.target.value)}
                                            required
                                            placeholder="Contoh: Ina Nurhayati"
                                        />
                                        <InputError message={errors.fullname} className="mt-2" />
                                    </div>
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
                                            placeholder="Contoh: budi@jemari.com"
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        <InputLabel htmlFor="status" value="Status Karyawan" />
                                        <select
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="mt-1 block w-full bg-white border-gray-300 focus:border-[#0057B8] focus:ring-[#0057B8] rounded-xl text-sm py-2.5"
                                        >
                                            <option value="aktif">Aktif</option>
                                            <option value="tidak_aktif">Tidak Aktif</option>
                                        </select>
                                        <InputError message={errors.status} className="mt-2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                <div>
                                    <InputLabel htmlFor="work_area" value="Catatan Ringkasan Area Kerja / Cakupan Wilayah" />
                                    <TextInput
                                        id="work_area"
                                        type="text"
                                        name="work_area"
                                        value={data.work_area}
                                        className="mt-1 block w-full text-sm"
                                        onChange={(e) => setData('work_area', e.target.value)}
                                        placeholder="Otomatis terisi saat memilih Service Area di bawah..."
                                    />
                                    <InputError message={errors.work_area} className="mt-2" />
                                </div>

                                {/* Service Areas (1 ke N) */}
                                <div className="pt-4 border-t border-gray-100">
                                    <InputLabel value="Cakupan Area Layanan / Service Areas (1 ke N)" />
                                    <p className="text-xs text-gray-500 mt-1 mb-3">
                                        Pilih 1 atau lebih wilayah layanan di mana terapis ini dapat melayani reservasi:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {serviceAreas.map((area) => {
                                            const isSelected = (data.service_areas || []).includes(area.id);
                                            return (
                                                <div
                                                    key={area.id}
                                                    onClick={() => toggleServiceArea(area.id)}
                                                    className={`cursor-pointer border rounded-2xl p-3.5 flex items-center justify-between transition-all select-none ${
                                                        isSelected
                                                            ? 'bg-blue-50/70 border-[#0057B8] shadow-sm'
                                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div>
                                                        <p className={`text-sm font-semibold ${isSelected ? 'text-[#0057B8]' : 'text-gray-800'}`}>
                                                            {area.name}
                                                        </p>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => {}}
                                                        className="rounded text-[#0057B8] focus:ring-[#0057B8] w-4 h-4 pointer-events-none"
                                                    />
                                                </div>
                                            );
                                        })}
                                        {serviceAreas.length === 0 && (
                                            <p className="text-xs text-gray-400 italic">Belum ada data Service Areas di menu Pengaturan.</p>
                                        )}
                                    </div>
                                    <InputError message={errors.service_areas} className="mt-2" />
                                </div>

                                {/* Bidang Keahlian (1 ke N) */}
                                <div className="pt-4 border-t border-gray-100">
                                    <InputLabel value="Bidang Keahlian yang Dikuasai (1 ke N)" />
                                    <p className="text-xs text-gray-500 mt-1 mb-3">
                                        Pilih treatment / keahlian yang dikuasai oleh terapis ini:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {skills.map((skill) => {
                                            const isSelected = data.skills.includes(skill.id);
                                            return (
                                                <div
                                                    key={skill.id}
                                                    onClick={() => toggleSkill(skill.id)}
                                                    className={`cursor-pointer border rounded-2xl p-3.5 flex items-center justify-between transition-all select-none ${
                                                        isSelected
                                                            ? 'bg-blue-50/70 border-[#0057B8] shadow-sm'
                                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div>
                                                        <p className={`text-sm font-semibold ${isSelected ? 'text-[#0057B8]' : 'text-gray-800'}`}>
                                                            {skill.name}
                                                        </p>
                                                        {skill.description && (
                                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{skill.description}</p>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => {}}
                                                        className="rounded text-[#0057B8] focus:ring-[#0057B8] w-4 h-4 pointer-events-none"
                                                    />
                                                </div>
                                            );
                                        })}
                                        {skills.length === 0 && (
                                            <p className="text-xs text-gray-400 italic">Belum ada master bidang keahlian.</p>
                                        )}
                                    </div>
                                    <InputError message={errors.skills} className="mt-2" />
                                </div>

                                {/* Status Sertifikasi (1 ke N) dengan Select & Upload Opsional */}
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <InputLabel value="Status Sertifikasi / Pelatihan (1 ke N)" />
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Pilih sertifikasi/pelatihan menggunakan dropdown dan unggah bukti sertifikat (opsional).
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addCertificationRow}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold transition-colors"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            Tambah Sertifikasi
                                        </button>
                                    </div>

                                    <div className="space-y-3 mt-3">
                                        {data.certifications.map((row, index) => (
                                            <div
                                                key={index}
                                                className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 flex flex-col gap-3 transition-all relative"
                                            >
                                                {data.certifications.length > 1 && (
                                                    <div className="absolute top-3 right-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCertificationRow(index)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Hapus Baris"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                                                            Pilih Sertifikasi / Pelatihan
                                                        </label>
                                                        <select
                                                            value={row.certification_id}
                                                            onChange={(e) => handleCertificationFieldChange(index, 'certification_id', e.target.value)}
                                                            className="w-full bg-white border-gray-300 focus:border-[#0057B8] focus:ring-[#0057B8] rounded-xl text-sm py-2"
                                                        >
                                                            <option value="">-- Pilih Status Sertifikasi --</option>
                                                            {certifications.map((cert) => (
                                                                <option key={cert.id} value={cert.id}>
                                                                    {cert.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                                                            Nomor Sertifikat (Opsional)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={row.certificate_number || ''}
                                                            onChange={(e) => handleCertificationFieldChange(index, 'certificate_number', e.target.value)}
                                                            placeholder="Contoh: BNSP/2026/001"
                                                            className="w-full bg-white border-gray-300 focus:border-[#0057B8] focus:ring-[#0057B8] rounded-xl text-sm py-2"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                                                            Masa Berlaku (Opsional)
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={row.valid_until || ''}
                                                            onChange={(e) => handleCertificationFieldChange(index, 'valid_until', e.target.value)}
                                                            className="w-full bg-white border-gray-300 focus:border-[#0057B8] focus:ring-[#0057B8] rounded-xl text-sm py-2 text-gray-700"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                                                            Upload Bukti Sertifikat (Opsional)
                                                        </label>
                                                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 hover:border-[#0057B8] rounded-xl text-xs font-medium text-gray-700 transition-colors w-full justify-center">
                                                            <DocumentArrowUpIcon className="w-4 h-4 text-[#0057B8]" />
                                                            <span className="truncate max-w-[180px]">
                                                                {row.file ? row.file.name : 'Pilih File (Gambar/PDF)'}
                                                            </span>
                                                            <input
                                                                type="file"
                                                                accept="image/*,.pdf"
                                                                onChange={(e) => handleCertificationFieldChange(index, 'file', e.target.files[0])}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <InputError message={errors.certifications} className="mt-2" />
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
