import { useState, useCallback, useRef } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import PrimaryButton from '@/Components/PrimaryButton';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    TrashIcon,
    UsersIcon,
    IdentificationIcon,
    QrCodeIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { debounce } from 'lodash';
import { QRCodeCanvas } from 'qrcode.react';

export default function Index({ employees, filters }) {
    const { flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);

    // QR Code Modal state
    const [selectedEmployeeQr, setSelectedEmployeeQr] = useState(null);
    const [showQrModal, setShowQrModal] = useState(false);

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

    const openQrModal = (employee) => {
        setSelectedEmployeeQr(employee);
        setShowQrModal(true);
    };

    const closeQrModal = () => {
        setShowQrModal(false);
        setSelectedEmployeeQr(null);
    };

    const [processingFront, setProcessingFront] = useState(false);
    const [processingBack, setProcessingBack] = useState(false);

    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
            img.src = src;
        });
    };

    // Download only the QR code PNG image
    const downloadPureQrCode = () => {
        if (!selectedEmployeeQr) return;
        const canvas = document.getElementById('qr-canvas-preview');
        if (!canvas) return;

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `QR-Code-Jemari-${selectedEmployeeQr.nip || selectedEmployeeQr.id}-${selectedEmployeeQr.name}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    // Download Official Front ID Card (Front layout + photo + name/title/id + QR Code)
    const downloadFrontCard = async () => {
        if (!selectedEmployeeQr) return;
        const qrCanvas = document.getElementById('qr-canvas-preview');
        if (!qrCanvas) return;

        setProcessingFront(true);
        try {
            await document.fonts.ready;
            try {
                await document.fonts.load('800 72px Poppins');
                await document.fonts.load('600 36px Poppins');
                await document.fonts.load('600 32px Poppins');
                await document.fonts.load('400 22px Poppins');
            } catch (e) {
                console.warn('Font loading check:', e);
            }

            const canvas = document.createElement('canvas');
            canvas.width = 1129;
            canvas.height = 1797;
            const ctx = canvas.getContext('2d');

            // 1. Background white
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Draw employee photo at upper area if available
            if (selectedEmployeeQr.photo) {
                try {
                    const photoImg = await loadImage(`/storage/${selectedEmployeeQr.photo}`);
                    const maxW = 1129;
                    const maxH = 1180;
                    const scale = Math.min(maxW / photoImg.width, maxH / photoImg.height);
                    const drawW = photoImg.width * scale;
                    const drawH = photoImg.height * scale;
                    const drawX = (maxW - drawW) / 2;
                    const drawY = maxH - drawH;

                    ctx.drawImage(photoImg, drawX, drawY, drawW, drawH);
                } catch (e) {
                    console.error('Failed to load employee photo for canvas', e);
                }
            }

            // 3. Draw Front Template Overlay
            const frontImg = await loadImage('/images/kartu_layout/front.png');
            ctx.drawImage(frontImg, 0, 0, canvas.width, canvas.height);

            // 4. Draw Employee Details Text
            ctx.textAlign = 'left';

            // 1) Nama Panggilan (Nickname) - Poppins Extra Bold
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '800 72px Poppins, sans-serif';
            ctx.fillText((selectedEmployeeQr.name || '').toUpperCase(), 92, 1265);

            // 2) Nama Lengkap | Jabatan - Poppins SemiBold
            ctx.font = '600 32px Poppins, sans-serif';
            const fullNameText = (selectedEmployeeQr.fullname || selectedEmployeeQr.name || '').toUpperCase();
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(fullNameText, 92, 1325);

            const fullNameWidth = ctx.measureText(fullNameText).width;
            const titleText = `    |    ${(selectedEmployeeQr.title || 'MASSAGE THERAPIST').toUpperCase()}`;
            ctx.fillStyle = '#EAB308'; // Golden Amber
            ctx.fillText(titleText, 92 + fullNameWidth, 1325);

            // 3) ID Karyawan - Poppins Regular
            ctx.fillStyle = '#9CA3AF';
            ctx.font = '400 22px Poppins, sans-serif';
            ctx.fillText(`NO ID ${selectedEmployeeQr.nip || selectedEmployeeQr.id}`, 92, 1380);

            // 5. Draw QR Code inside the white rounded box (92, 1479, 218, 218)
            ctx.drawImage(qrCanvas, 101, 1488, 200, 200);

            // Trigger Download
            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `Kartu-Depan-${selectedEmployeeQr.nip || selectedEmployeeQr.id}-${selectedEmployeeQr.fullname || selectedEmployeeQr.name}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } catch (err) {
            console.error('Error generating front card', err);
        } finally {
            setProcessingFront(false);
        }
    };

    // Download Official Back ID Card (Back layout + QR Code)
    const downloadBackCard = async () => {
        if (!selectedEmployeeQr) return;
        const qrCanvas = document.getElementById('qr-canvas-preview');
        if (!qrCanvas) return;

        setProcessingBack(true);
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 1128;
            canvas.height = 1797;
            const ctx = canvas.getContext('2d');

            // 1. Draw Back Template
            const backImg = await loadImage('/images/kartu_layout/back.png');
            ctx.drawImage(backImg, 0, 0, canvas.width, canvas.height);

            // 2. Draw QR Code inside white rounded box (387, 1318, 353, 354)
            ctx.drawImage(qrCanvas, 400, 1331, 328, 328);

            // Trigger Download
            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `Kartu-Belakang-${selectedEmployeeQr.nip || selectedEmployeeQr.id}-${selectedEmployeeQr.name}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } catch (err) {
            console.error('Error generating back card', err);
        } finally {
            setProcessingBack(false);
        }
    };

    const getEmployeeCardUrl = (emp) => {
        if (!emp) return '';
        return `${window.location.origin}/kartu/karyawan/${emp.nip || emp.id}`;
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
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">NIP</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Nama Karyawan</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Jabatan</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Status Karyawan</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">No. HP</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Tanggal Bergabung</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Akses Login</th>
                                        <th scope="col" className="px-6 py-4 font-bold tracking-wider text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {employees.data.length > 0 ? (
                                        employees.data.map((employee) => (
                                            <tr key={employee.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                                                        {employee.nip || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        {employee.photo ? (
                                                            <img
                                                                src={`/storage/${employee.photo}`}
                                                                alt={employee.name}
                                                                className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-zenith-orange/10 flex items-center justify-center text-zenith-orange shrink-0">
                                                                <UsersIcon className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-gray-900">{employee.fullname || employee.name}</span>
                                                            {employee.fullname && employee.fullname !== employee.name && (
                                                                <span className="text-xs text-gray-500">Panggilan: {employee.name}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                        {employee.title}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {employee.status === 'tidak_aktif' ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
                                                            Tidak Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                                                            Aktif
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {employee.nohp}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {employee.join_date ? new Date(employee.join_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {employee.user ? (
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-sm font-medium text-gray-900">{employee.user.email}</span>
                                                            {employee.user.is_active ? (
                                                                <span className="inline-flex w-fit items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                                    Aktif
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex w-fit items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-100">
                                                                    Nonaktif
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-600 border border-gray-200">
                                                            Belum Punya Akses
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => openQrModal(employee)}
                                                            className="p-2 text-gray-400 hover:text-zenith-orange transition-colors rounded-lg hover:bg-orange-50"
                                                            title="Unduh QR Code / Barcode ID"
                                                        >
                                                            <QrCodeIcon className="w-5 h-5" />
                                                        </button>
                                                        <a
                                                            href={`/kartu/karyawan/${employee.nip || employee.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-gray-400 hover:text-emerald-600 transition-colors rounded-lg hover:bg-emerald-50"
                                                            title="Lihat Kartu Identitas Staf (Public)"
                                                        >
                                                            <IdentificationIcon className="w-5 h-5" />
                                                        </a>
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
                                            <td colSpan="8" className="px-6 py-12 text-center">
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
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${link.active
                                                ? 'bg-[#0057B8] text-white shadow-sm'
                                                : link.url
                                                    ? 'text-gray-600 hover:bg-gray-100'
                                                    : 'text-gray-300 cursor-not-allowed'
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

            {/* QR Code / Barcode Download Modal */}
            <Modal show={showQrModal} onClose={closeQrModal}>
                <div className="p-6 sm:p-8 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-zenith-orange mx-auto mb-4">
                        <QrCodeIcon className="w-6 h-6" />
                    </div>

                    <h2 className="text-xl font-bold text-gray-900">
                        Kartu Digital &amp; Barcode Staf
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Pindai (scan) barcode di bawah untuk verifikasi langsung identitas dan sertifikat staf.
                    </p>

                    {selectedEmployeeQr && (
                        <div className="mt-6 p-6 rounded-3xl bg-gray-50 border border-gray-200/80 flex flex-col items-center">
                            {/* Hidden or displayed QRCodeCanvas for generating high-res QR */}
                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-200">
                                <QRCodeCanvas
                                    id="qr-canvas-preview"
                                    value={getEmployeeCardUrl(selectedEmployeeQr)}
                                    size={210}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>

                            <div className="mt-4 font-bold text-gray-900 text-lg">
                                {selectedEmployeeQr.name}
                            </div>
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zenith-orange/10 text-zenith-orange text-xs font-mono font-bold mt-1">
                                NO ID STAFF: #{selectedEmployeeQr.nip || selectedEmployeeQr.id}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 font-semibold">
                                {selectedEmployeeQr.title || 'Terapis Spa Profesional'}
                            </div>
                        </div>
                    )}

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            onClick={downloadFrontCard}
                            disabled={processingFront}
                            className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-zenith-orange hover:bg-zenith-orange/90 text-white text-xs font-extrabold shadow-md transition-all disabled:opacity-50"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            <span>{processingFront ? 'Memproses...' : 'Unduh Kartu Depan (Front)'}</span>
                        </button>
                        <button
                            onClick={downloadBackCard}
                            disabled={processingBack}
                            className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-extrabold shadow-md transition-all disabled:opacity-50"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            <span>{processingBack ? 'Memproses...' : 'Unduh Kartu Belakang (Back)'}</span>
                        </button>
                    </div>

                    <div className="mt-3">
                        <button
                            onClick={downloadPureQrCode}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            Unduh QR Code Saja (PNG)
                        </button>
                    </div>

                    <div className="mt-4">
                        <SecondaryButton onClick={closeQrModal} className="w-full justify-center">
                            Tutup
                        </SecondaryButton>
                    </div>
                </div>
            </Modal>

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
