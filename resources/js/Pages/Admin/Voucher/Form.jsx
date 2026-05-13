import React, { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { PlusIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Form({ auth, voucher = null, packages = [] }) {
    const isEditing = !!voucher;

    const { data, setData, post, put, processing, errors } = useForm({
        code: voucher?.code || '',
        description: voucher?.description || '',
        category: voucher?.category || 'standard',
        bundle_packages: voucher?.bundle_packages || [],
        type: voucher?.type || 'free',
        discount_amount: voucher?.discount_amount || '',
        price: voucher?.price || '',
        customer_name: voucher?.customer_name || '',
        customer_phone: voucher?.customer_phone || '',
        quota: voucher?.quota || 1,
        expired_at: voucher?.expired_at ? voucher.expired_at.split('T')[0] : '',
        is_active: voucher?.is_active ?? true,
    });

    const addBundlePackage = () => {
        const newBundles = [...data.bundle_packages, { name: '', duration: '', price: '' }];
        setData({
            ...data,
            bundle_packages: newBundles,
            type: 'paid'
        });
    };

    const updateBundlePackage = (index, field, value) => {
        const newBundles = [...data.bundle_packages];
        newBundles[index][field] = value;

        let newData = { ...data, bundle_packages: newBundles };

        // Calculate accumulated price if category is bundle
        if (data.category === 'bundle') {
            const total = newBundles.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
            newData.price = total;
            newData.discount_amount = total; // Default discount amount to total price for bundle
        }

        setData(newData);
    };

    const removeBundlePackage = (index) => {
        const newBundles = data.bundle_packages.filter((_, i) => i !== index);
        let newData = { ...data, bundle_packages: newBundles };

        if (data.category === 'bundle') {
            const total = newBundles.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
            newData.price = total;
            newData.discount_amount = total;
        }

        setData(newData);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('admin.voucher.update', voucher.id));
        } else {
            post(route('admin.voucher.store'));
        }
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">
                {isEditing ? 'Edit Voucher' : 'Tambah Voucher Baru'}
            </h2>}
        >
            <Head title={isEditing ? 'Edit Voucher' : 'Tambah Voucher'} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href={route('admin.voucher.index')}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeftIcon className="w-4 h-4 mr-2" />
                            Kembali ke Daftar Voucher
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100">
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <InputLabel htmlFor="category" value="Kategori Voucher" />
                                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setData('category', 'standard')}
                                            className={`py-2 px-4 rounded-lg text-xs font-bold transition-all ${data.category === 'standard'
                                                    ? 'bg-white text-zenith-orange shadow-sm'
                                                    : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                        >
                                            Voucher Discount
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('category', 'bundle')}
                                            className={`py-2 px-4 rounded-lg text-xs font-bold transition-all ${data.category === 'bundle'
                                                    ? 'bg-white text-purple-600 shadow-sm'
                                                    : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                        >
                                            Voucher Treatment
                                        </button>
                                    </div>
                                    <InputError message={errors.category} className="mt-2" />
                                </div>

                                <div className="space-y-2">
                                    <InputLabel htmlFor="code" value="Kode Voucher" />
                                    <TextInput
                                        id="code"
                                        type="text"
                                        className="block w-full uppercase"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                        required
                                        placeholder="CONTOH: PROMO100"
                                    />
                                    <InputError message={errors.code} className="mt-2" />
                                </div>
                            </div>

                            {data.category === 'bundle' && (
                                <div className="p-6 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="text-sm font-bold text-purple-900">Isi Paket Bundle</h4>
                                            <p className="text-[10px] text-purple-600">Pilih paket spa yang akan digabungkan</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addBundlePackage}
                                            className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors shadow-sm"
                                        >
                                            <PlusIcon className="w-3.5 h-3.5 mr-1.5" />
                                            Tambah Paket
                                        </button>
                                    </div>

                                    {data.bundle_packages.length === 0 && (
                                        <div className="text-center py-8 border-2 border-dashed border-purple-200 rounded-xl bg-white/50">
                                            <p className="text-xs text-purple-400">Belum ada paket ditambahkan. Klik "Tambah Paket" untuk memulai.</p>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {data.bundle_packages.map((pkg, index) => (
                                            <div key={index} className="relative p-4 bg-white rounded-xl border border-purple-100 shadow-sm group">
                                                <button
                                                    type="button"
                                                    onClick={() => removeBundlePackage(index)}
                                                    className="absolute -top-2 -right-2 p-1.5 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                                >
                                                    <TrashIcon className="w-3 h-3" />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                                    <div className="md:col-span-7">
                                                        <select
                                                            value={packages.find(p => p.title_id === pkg.name)?.id || ''}
                                                            onChange={(e) => {
                                                                const selectedPkg = packages.find(p => p.id === parseInt(e.target.value));
                                                                if (selectedPkg) {
                                                                    updateBundlePackage(index, 'name', selectedPkg.title_id);
                                                                    updateBundlePackage(index, 'duration', '');
                                                                    updateBundlePackage(index, 'price', '');
                                                                }
                                                            }}
                                                            className="w-full bg-white border-purple-100 focus:border-purple-500 focus:ring-purple-500 rounded-xl text-xs"
                                                            required
                                                        >
                                                            <option value="">Pilih Paket</option>
                                                            {packages.map(p => (
                                                                <option key={p.id} value={p.id}>{p.title_id}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="md:col-span-5">
                                                        <select
                                                            value={pkg.duration + '|' + pkg.price}
                                                            onChange={(e) => {
                                                                const [dur, prc] = e.target.value.split('|');
                                                                updateBundlePackage(index, 'duration', dur);
                                                                updateBundlePackage(index, 'price', prc);
                                                            }}
                                                            className="w-full bg-white border-purple-100 focus:border-purple-500 focus:ring-purple-500 rounded-xl text-xs"
                                                            required
                                                            disabled={!pkg.name}
                                                        >
                                                            <option value="">Pilih Durasi</option>
                                                            {packages.find(p => p.title_id === pkg.name)?.durations.map(d => (
                                                                <option key={d.id} value={`${d.duration}|${d.price}`}>
                                                                    {d.duration} - {formatRupiah(d.price)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <InputLabel htmlFor="description" value="Deskripsi (Optional)" />
                                <textarea
                                    id="description"
                                    className="block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="3"
                                    placeholder="Contoh: Voucher diskon khusus pelanggan baru"
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <InputLabel htmlFor="type" value="Tipe Voucher" />
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                className="text-zenith-orange border-gray-300 focus:ring-zenith-orange"
                                                name="type"
                                                value="free"
                                                checked={data.type === 'free'}
                                                onChange={(e) => setData('type', e.target.value)}
                                            />
                                            <span className="ml-2 text-sm text-gray-600">Gratis (Promotion)</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                className="text-zenith-orange border-gray-300 focus:ring-zenith-orange"
                                                name="type"
                                                value="paid"
                                                checked={data.type === 'paid'}
                                                onChange={(e) => setData('type', e.target.value)}
                                            />
                                            <span className="ml-2 text-sm text-gray-600">Berbayar (Prepaid)</span>
                                        </label>
                                    </div>
                                    <InputError message={errors.type} className="mt-2" />
                                </div>

                                <div className="space-y-2">
                                    <InputLabel htmlFor="discount_amount" value={data.category === 'bundle' ? 'Nominal Voucher' : 'Potongan Diskon (Rp)'} />
                                    <TextInput
                                        id="discount_amount"
                                        type="number"
                                        className="block w-full"
                                        value={data.discount_amount}
                                        onChange={(e) => setData('discount_amount', e.target.value)}
                                        required
                                        readOnly={data.category === 'bundle'}
                                    />
                                    <InputError message={errors.discount_amount} className="mt-2" />
                                </div>
                            </div>

                            {data.type === 'paid' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="space-y-2">
                                        <InputLabel htmlFor="price" value="Harga Jual (Rp)" />
                                        <TextInput
                                            id="price"
                                            type="number"
                                            className="block w-full"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            required
                                            readOnly={data.category === 'bundle'}
                                        />
                                        <InputError message={errors.price} className="mt-2" />
                                        {data.price && data.quota && (
                                            <p className="mt-1 text-[10px] text-zenith-orange font-bold">
                                                Total Bayar: {formatRupiah(data.price * data.quota)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <InputLabel htmlFor="customer_name" value="Nama Pembeli" />
                                        <TextInput
                                            id="customer_name"
                                            type="text"
                                            className="block w-full"
                                            value={data.customer_name}
                                            onChange={(e) => setData('customer_name', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.customer_name} className="mt-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <InputLabel htmlFor="customer_phone" value="No. Telepon (Optional)" />
                                        <TextInput
                                            id="customer_phone"
                                            type="text"
                                            className="block w-full"
                                            value={data.customer_phone}
                                            onChange={(e) => setData('customer_phone', e.target.value)}
                                        />
                                        <InputError message={errors.customer_phone} className="mt-2" />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <InputLabel htmlFor="quota" value="Kuota Voucher" />
                                    <TextInput
                                        id="quota"
                                        type="number"
                                        className="block w-full"
                                        value={data.quota}
                                        onChange={(e) => setData('quota', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.quota} className="mt-2" />
                                </div>

                                <div className="space-y-2">
                                    <InputLabel htmlFor="expired_at" value="Tanggal Kadaluarsa" />
                                    <TextInput
                                        id="expired_at"
                                        type="date"
                                        className="block w-full"
                                        value={data.expired_at}
                                        onChange={(e) => setData('expired_at', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.expired_at} className="mt-2" />
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded border-gray-300 text-zenith-orange shadow-sm focus:ring-zenith-orange"
                                    />
                                    <label htmlFor="is_active" className="text-sm text-gray-700 font-medium">Status Aktif</label>
                                </div>
                            )}

                            <div className="flex items-center justify-end pt-6 border-t border-gray-100">
                                <PrimaryButton disabled={processing} className="bg-zenith-orange hover:bg-zenith-orange/90">
                                    {processing ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Buat Voucher'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
