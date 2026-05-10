import { Link, Head } from '@inertiajs/react';
import { HomeIcon, ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Error({ status }) {
    const title = {
        503: '503: Service Unavailable',
        500: '500: Server Error',
        404: '404: Page Not Found',
        403: '403: Forbidden',
        401: '401: Unauthorized',
        419: '419: Page Expired',
    }[status] || `Error ${status}`;

    const description = {
        503: 'Maaf, sistem kami sedang dalam pemeliharaan. Silakan coba beberapa saat lagi.',
        500: 'Oops, terjadi kesalahan pada server kami. Tim kami sedang menanganinya.',
        404: 'Halaman yang Anda cari tidak ditemukan atau telah dipindahkan.',
        403: 'Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.',
        401: 'Silakan login kembali untuk melanjutkan.',
        419: 'Halaman telah kedaluwarsa karena terlalu lama tidak ada aktivitas. Silakan segarkan halaman.',
    }[status] || 'Terjadi kesalahan yang tidak terduga. Silakan hubungi tim dukungan kami.';

    const Illustration = () => {
        if (status === 404) {
            return (
                <div className="relative w-64 h-64 mx-auto mb-8">
                    <div className="absolute inset-0 bg-zenith-orange/10 rounded-full animate-pulse"></div>
                    <div className="absolute inset-4 bg-zenith-orange/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                    <div className="relative flex items-center justify-center h-full">
                        <span className="text-[120px] font-black text-zenith-orange/20 select-none">404</span>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white p-6 rounded-3xl shadow-2xl shadow-zenith-orange/20 transform -rotate-6 border border-gray-100">
                                <ExclamationTriangleIcon className="h-16 w-16 text-zenith-orange" />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className="text-[120px] font-black text-gray-100 mb-8 select-none">
                {status}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
            <Head title={title} />
            
            <div className="max-w-2xl w-full text-center">
                <Illustration />
                
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                    {title.split(': ')[1]}
                </h1>
                
                <p className="text-lg text-gray-500 mb-10 max-w-md mx-auto leading-relaxed">
                    {description}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Kembali
                    </button>
                    
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-zenith-orange border border-transparent rounded-2xl font-bold text-white hover:bg-zenith-orange/90 transition-all shadow-lg shadow-zenith-orange/20 active:scale-95"
                    >
                        <HomeIcon className="h-5 w-5 mr-2" />
                        Ke Beranda
                    </Link>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">
                        Jemari Spa & Wellness • Admin Panel
                    </p>
                </div>
            </div>
        </div>
    );
}
