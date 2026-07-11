import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    BriefcaseIcon,
    CalendarIcon,
    MapPinIcon,
    SparklesIcon,
    AcademicCapIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    DocumentTextIcon,
    ShareIcon,
    PhoneIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon, CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

export default function EmployeeCard({ employee }) {
    const [currentCertIndex, setCurrentCertIndex] = useState(0);
    const [copied, setCopied] = useState(false);

    const skills = employee.skills || [];
    const certifications = employee.certifications || [];
    const serviceAreas = employee.service_areas || employee.serviceAreas || [];

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const nextCert = () => {
        if (certifications.length > 0) {
            setCurrentCertIndex((prev) => (prev + 1) % certifications.length);
        }
    };

    const prevCert = () => {
        if (certifications.length > 0) {
            setCurrentCertIndex((prev) => (prev - 1 + certifications.length) % certifications.length);
        }
    };

    const formatDateIndo = (dateStr) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="min-h-screen bg-zenith-surface text-zenith-charcoal font-sans selection:bg-zenith-orange/20 selection:text-zenith-orange antialiased">
            <Head title={`Kartu Identitas Staf - ${employee.name} | Jemari Home Spa`} />

            {/* Header bergaya Home dengan Logo Jemari */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-2">
                    <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
                        <img
                            src="/images/Jemari Logo - 1.png"
                            alt="Jemari Home Spa"
                            className="h-8 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
                        />
                        <div className="hidden sm:block border-l border-gray-200 pl-3">
                            <span className="block text-xs font-bold text-zenith-orange uppercase tracking-wider">
                                Verifikasi Staf Resmi
                            </span>
                            <span className="block text-[11px] text-gray-500">
                                Layanan Home Service Massage
                            </span>
                        </div>
                    </Link>

                    <div className="flex items-center shrink-0">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm shrink-0">
                            <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Terverifikasi Digital</span>
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
                {/* Decorative Subtle Background Glow */}
                <div className="absolute top-10 right-10 w-96 h-96 bg-zenith-orange/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Main Card Container */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-gray-200/60 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                        {/* =========================================================
                            LEFT COLUMN: PHOTO, STATUS, NAMA, NO ID STAFF
                        ========================================================= */}
                        <div className="lg:col-span-4 flex flex-col items-center text-center">
                            {/* Photo Container 1:1 Aspect Ratio */}
                            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gray-100 shrink-0 group">
                                {employee.photo ? (
                                    <img
                                        src={`/storage/${employee.photo}`}
                                        alt={employee.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-b from-gray-50 to-gray-100">
                                        <UserIcon className="w-24 h-24 stroke-1 mb-2 text-gray-300" />
                                        <span className="text-xs uppercase font-medium text-gray-500">Foto Belum Tersedia</span>
                                    </div>
                                )}

                                {/* Status Badge Overlay Right on Photo Bottom */}
                                <div className="absolute bottom-4 inset-x-4 flex justify-center">
                                    {employee.status === 'tidak_aktif' ? (
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/95 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider shadow-lg border border-red-400">
                                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                            <span>Staff Tidak Aktif</span>
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-600/95 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider shadow-lg border border-emerald-400">
                                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                            <span>Staff Aktif</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Name & ID Staff Info */}
                            <div className="mt-6 w-full">
                                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-zenith-orange/10 text-xs font-mono font-bold text-zenith-orange tracking-wider border border-zenith-orange/20 mb-2">
                                    NO ID STAFF: #{employee.nip || employee.id}
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 tracking-tight flex items-center justify-center gap-2">
                                    <span>{employee.name}</span>
                                    <CheckBadgeIcon className="w-7 h-7 text-zenith-orange shrink-0" title="Staf Terverifikasi" />
                                </h1>
                                <p className="text-sm font-semibold text-gray-700 mt-6 flex items-center justify-center flex-wrap">
                                    <span>{employee.fullname || employee.name}</span>
                                    <span className="mx-3 sm:mx-4 text-gray-300 font-light">|</span>
                                    <span className="text-zenith-orange">{employee.title || 'Terapis Spa Profesional'}</span>
                                </p>
                            </div>

                            {/* Official System Notice Card & Highlight Status */}
                            <div className="mt-6 w-full p-4 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm text-left">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                                        <ShieldCheckIcon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                                            Identitas Terdaftar Resmi
                                        </div>
                                        <div className="text-[11px] text-gray-600 leading-relaxed mt-0.5">
                                            Kartu digital resmi dari sistem Jemari Home Spa.
                                        </div>


                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* =========================================================
                            RIGHT COLUMN: DETAILS, BIDANG KEAHLIAN, SLIDER SERTIFIKAT
                        ========================================================= */}
                        <div className="lg:col-span-8 flex flex-col justify-between space-y-8">
                            {/* 1. Informasi Detail Karyawan */}
                            <div>
                                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                    <BriefcaseIcon className="w-4 h-4 text-zenith-orange" />
                                    Informasi Staf
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                                        <div className="text-xs text-gray-500 flex items-center gap-1.5 font-semibold">
                                            <BriefcaseIcon className="w-4 h-4 text-zenith-orange" />
                                            Jabatan
                                        </div>
                                        <div className="mt-1.5 text-base font-bold text-gray-900">
                                            {employee.title || 'Terapis Spa'}
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                                        <div className="text-xs text-gray-500 flex items-center gap-1.5 font-semibold">
                                            <CalendarIcon className="w-4 h-4 text-zenith-orange" />
                                            Tanggal Bergabung
                                        </div>
                                        <div className="mt-1.5 text-base font-bold text-gray-900">
                                            {formatDateIndo(employee.join_date)}
                                        </div>
                                    </div>


                                </div>
                            </div>

                            {/* 2. Bidang Keahlian: Treatment di Jemari yang dikuasai terapis */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <SparklesIcon className="w-4 h-4 text-zenith-orange" />
                                        Bidang Keahlian
                                    </h2>
                                    <span className="text-xs font-semibold text-gray-500">
                                        {skills.length} Treatment Dikuasai
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mb-4">
                                    Treatment di Jemari Home Spa yang dikuasai terapis:
                                </p>

                                {skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2.5">
                                        {skills.map((skill) => (
                                            <div
                                                key={skill.id}
                                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 text-gray-900 text-sm font-semibold shadow-sm hover:border-zenith-orange transition-colors"
                                            >
                                                <CheckCircleSolid className="w-4 h-4 text-zenith-orange shrink-0" />
                                                <span>{skill.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center text-sm text-gray-500">
                                        Belum ada data keahlian treatment terdaftar.
                                    </div>
                                )}
                            </div>

                            {/* Cakupan Area Layanan (1 ke N) */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <MapPinIcon className="w-4 h-4 text-zenith-orange" />
                                        Cakupan Area Layanan
                                    </h2>
                                    <span className="text-xs font-semibold text-gray-500">
                                        {serviceAreas.length} Wilayah Operasional
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mb-4">
                                    Wilayah pelayanan home service yang dicakup oleh terapis:
                                </p>

                                {serviceAreas.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {serviceAreas.map((area) => (
                                            <div
                                                key={area.id}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 text-gray-800 text-xs font-semibold shadow-sm"
                                            >
                                                <MapPinIcon className="w-3.5 h-3.5 text-[#0057B8] shrink-0" />
                                                <span>{area.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center text-xs text-gray-500">
                                        Seluruh wilayah operasional Jemari Home Spa ({employee.work_area || 'Bandung & Sekitarnya'})
                                    </div>
                                )}
                            </div>

                            {/* 3. Status Sertifikasi & Pelatihan (Slider Sertifikat) */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <AcademicCapIcon className="w-4 h-4 text-zenith-orange" />
                                        Status Sertifikasi &amp; Pelatihan
                                    </h2>
                                    {certifications.length > 1 && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={prevCert}
                                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                                title="Sertifikat Sebelumnya"
                                            >
                                                <ChevronLeftIcon className="w-4 h-4" />
                                            </button>
                                            <span className="text-xs font-mono text-gray-600 font-semibold">
                                                {currentCertIndex + 1}/{certifications.length}
                                            </span>
                                            <button
                                                onClick={nextCert}
                                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                                title="Sertifikat Berikutnya"
                                            >
                                                <ChevronRightIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mb-4">
                                    Pelatihan Internal Jemari Home Spa &amp; Sertifikasi Profesional:
                                </p>

                                {certifications.length > 0 ? (
                                    <div className="relative">
                                        {/* Certificate Carousel Item */}
                                        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-orange-50/50 border border-amber-200/70 shadow-sm transition-all duration-300">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                                                        <AcademicCapIcon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-200 mb-1">
                                                            Sertifikasi Lulus
                                                        </div>
                                                        <h3 className="text-lg font-bold text-gray-900">
                                                            {certifications[currentCertIndex].name}
                                                        </h3>
                                                        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-600">
                                                            <div>
                                                                <span className="text-gray-500 mr-1">No. Sertifikat:</span>
                                                                <span className="font-mono font-semibold text-gray-800">
                                                                    {certifications[currentCertIndex].pivot?.certificate_number || 'Internal-JHS'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 mr-1">Masa Berlaku:</span>
                                                                <span className="font-semibold text-gray-800">
                                                                    {certifications[currentCertIndex].pivot?.valid_until
                                                                        ? formatDateIndo(certifications[currentCertIndex].pivot.valid_until)
                                                                        : 'Berlaku Selamanya'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Button preview certificate file if uploaded */}
                                                {certifications[currentCertIndex].pivot?.certificate_file && (
                                                    <a
                                                        href={`/storage/${certifications[currentCertIndex].pivot.certificate_file}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zenith-orange hover:bg-zenith-orange/90 text-white text-xs font-bold shadow-md transition-all shrink-0"
                                                    >
                                                        <DocumentTextIcon className="w-4 h-4" />
                                                        Lihat File
                                                    </a>
                                                )}
                                            </div>

                                            {/* Slider dots if multiple */}
                                            {certifications.length > 1 && (
                                                <div className="flex items-center justify-center gap-1.5 mt-5 pt-4 border-t border-gray-100">
                                                    {certifications.map((_, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setCurrentCertIndex(idx)}
                                                            className={`h-2 rounded-full transition-all duration-300 ${idx === currentCertIndex
                                                                ? 'w-8 bg-zenith-orange'
                                                                : 'w-2 bg-gray-200 hover:bg-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center text-sm text-gray-500">
                                        Belum ada catatan sertifikasi atau pelatihan staf.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* =========================================================
                    BOTTOM WARNING / CALLOUT NOTICE
                ========================================================= */}
                <div className="mt-8 sm:mt-10 p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50/50 to-red-50/60 border border-amber-200/80 shadow-md">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                                <ExclamationTriangleIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="text-sm sm:text-base font-bold text-gray-900">
                                    Apabila identitas staf tidak sesuai dengan informasi di atas, segera hubungi:
                                </div>
                                <div className="text-xs text-gray-600 mt-0.5">
                                    Pastikan nama, foto, dan nomor ID staf sesuai saat pelayanan di lokasi Anda.
                                </div>
                            </div>
                        </div>

                        <a
                            href="https://wa.me/6289516166090?text=Halo%20Jemari%20Home%20Spa,%20saya%20ingin%20konfirmasi%20identitas%20staf%20terapis"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 shrink-0"
                        >
                            <PhoneIcon className="w-5 h-5" />
                            <span>0895 1616 6090</span>
                        </a>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200/60 mt-12 py-8 text-center text-xs text-gray-500 bg-white/40">
                <div className="max-w-5xl mx-auto px-4">
                    <p className="font-semibold text-gray-700">Jemari Home Spa — Layanan Pijat Panggilan Profesional</p>
                    <p className="mt-1">&copy; {new Date().getFullYear()} Jemari Home Spa. Seluruh Hak Cipta Dilindungi.</p>
                </div>
            </footer>
        </div>
    );
}
