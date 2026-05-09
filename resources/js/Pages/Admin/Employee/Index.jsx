import { useState, useCallback } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { 
    PlusIcon, 
    MagnifyingGlassIcon, 
    PencilSquareIcon, 
    TrashIcon,
    UsersIcon
} from '@heroicons/react/24/outline';
import { debounce } from 'lodash';

export default function Index({ employees, filters }) {
    const { flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);

    const { delete: destroy, processing: deleteProcessing } = useForm();

    const debouncedSearch = useCallback(
        debounce((query) => {
            router.get(
                route('admin.employee.index'),
                { search: query },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 500),
        []
    );

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchTerm(query);
        debouncedSearch(query);
    };

    const confirmDelete = (employee) => {
        setEmployeeToDelete(employee);
        setConfirmingDeletion(true);
    };

    const closeModal = () => {
        setConfirmingDeletion(false);
        setEmployeeToDelete(null);
    };

    const deleteEmployee = (e) => {
        e.preventDefault();
        destroy(route('admin.employee.destroy', employeeToDelete.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Karyawan" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Page Header (Title & Add Button) */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-2 sm:px-0">
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 tracking-tight">Data Karyawan</h2>
                            <p className="mt-1 text-sm text-gray-500">Kelola daftar karyawan dan jabatannya</p>
                        </div>
                        <Link
                            href={route('admin.employee.create')}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0057B8] text-white rounded-full text-sm font-semibold hover:bg-[#004494] transition-all shadow-sm w-full md:w-auto"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Tambah Karyawan
                        </Link>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="bg-white shadow-sm sm:rounded-[2rem] overflow-hidden border border-gray-100 p-4 sm:p-6 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            {/* Search Bar */}
                            <div className="relative w-full sm:w-96">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari nama, jabatan, atau no hp..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="pl-11 pr-4 py-2.5 w-full border-gray-200 rounded-full text-sm focus:border-[#0057B8] focus:ring focus:ring-[#0057B8]/20 transition-shadow bg-gray-50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-500">
                                <thead className="bg-gray-50/50 text-xs uppercase text-gray-700 border-b border-gray-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Nama Karyawan</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Jabatan</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">No. HP</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Tanggal Bergabung</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {employees.data.length > 0 ? (
                                        employees.data.map((employee) => (
                                            <tr key={employee.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-zenith-orange/10 flex items-center justify-center text-zenith-orange">
                                                            <UsersIcon className="w-5 h-5" />
                                                        </div>
                                                        <span className="font-semibold text-gray-900">{employee.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                        {employee.title}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {employee.nohp}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {employee.join_date ? new Date(employee.join_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={route('admin.employee.edit', employee.id)}
                                                            className="p-2 text-gray-400 hover:text-[#0057B8] transition-colors rounded-lg hover:bg-blue-50"
                                                            title="Edit"
                                                        >
                                                            <PencilSquareIcon className="w-5 h-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => confirmDelete(employee)}
                                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                                            title="Hapus"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500 font-medium">Tidak ada data karyawan ditemukan.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {employees.links && employees.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center sm:justify-end">
                                <nav className="flex items-center gap-1">
                                    {employees.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-4 py-2 text-sm border rounded-md transition-colors shadow-sm ${
                                                link.active
                                                    ? 'bg-zenith-orange text-white border-zenith-orange'
                                                    : link.url
                                                        ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                        : 'bg-white/50 text-gray-400 border-gray-100 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            preserveScroll
                                            preserveState
                                        />
                                    ))}
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal show={confirmingDeletion} onClose={closeModal}>
                <form onSubmit={deleteEmployee} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900">
                        Hapus Karyawan
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Apakah Anda yakin ingin menghapus data karyawan <span className="font-bold">{employeeToDelete?.name}</span>? Data yang dihapus tidak dapat dikembalikan.
                    </p>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal} disabled={deleteProcessing}>
                            Batal
                        </SecondaryButton>
                        <DangerButton disabled={deleteProcessing}>
                            Hapus
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
