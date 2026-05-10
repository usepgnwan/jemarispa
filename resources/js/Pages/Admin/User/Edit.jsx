import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import InputError from '@/Components/InputError';

export default function Edit({ auth, user }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.user.update', user.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit User</h2>}
        >
            <Head title={`Edit User - ${user.name}`} />

            <div className="py-12">
                <div className="mb-8">
                    <Link
                        href={route('admin.user.index')}
                        className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-zenith-orange transition-colors"
                    >
                        <ChevronLeftIcon className="h-4 w-4 mr-1" />
                        Kembali ke Daftar User
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">Edit User: {user.name}</h1>
                    <p className="text-gray-500 mt-1">Perbarui informasi profil dan hak akses user.</p>
                </div>

                <div className="max-w-2xl bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-zenith-orange/20 focus:border-zenith-orange transition-all font-medium"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-zenith-orange/20 focus:border-zenith-orange transition-all font-medium"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Role Akses</label>
                            <select
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-zenith-orange/20 focus:border-zenith-orange transition-all font-medium"
                                value={data.role}
                                onChange={e => setData('role', e.target.value)}
                            >
                                <option value="admin">Administrator (Full Akses)</option>
                                <option value="marketing">Digital Marketing (Analitik, Testimoni, Blog)</option>
                                <option value="cs">Customer Service (Pesanan & POS)</option>
                            </select>
                            <InputError message={errors.role} className="mt-2" />
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">Ganti Password (Opsional)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Password Baru</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-zenith-orange/20 focus:border-zenith-orange transition-all font-medium"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="Kosongkan jika tidak ingin ganti"
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Konfirmasi Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-zenith-orange/20 focus:border-zenith-orange transition-all font-medium"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                    />
                                    <InputError message={errors.password_confirmation} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-8 py-3 bg-zenith-orange border border-transparent rounded-xl font-bold text-sm text-white hover:bg-zenith-orange/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zenith-orange transition-all shadow-lg shadow-zenith-orange/20 disabled:opacity-50"
                            >
                                <CheckCircleIcon className="h-5 w-5 mr-2" />
                                {processing ? 'Menyimpan...' : 'Perbarui User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
