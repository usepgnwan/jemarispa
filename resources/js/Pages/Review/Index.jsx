import { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { StarIcon, SparklesIcon, CheckCircleIcon, HeartIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

export default function ReviewIndex({ transaction, token, already_reviewed }) {
    const [hoverStar, setHoverStar] = useState(0);
    const [submitted, setSubmitted] = useState(already_reviewed || false);
    const [showToast, setShowToast] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        description: '',
        star: 5,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('review.submit', token), {
            onSuccess: () => {
                setSubmitted(true);
                setShowToast(true);
                // Auto-hide toast after 5 seconds
                setTimeout(() => setShowToast(false), 5000);
            },
        });
    };

    return (
        <>
            <Head title="Berikan Ulasan Anda - Jemari Home Spa" />

            {/* Toast Notification */}
            <div
                className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
                    showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6 pointer-events-none'
                }`}
            >
                <div className="flex items-center gap-3 bg-[#2D2D2D] text-white px-6 py-4 rounded-2xl shadow-2xl shadow-black/20 min-w-[280px]">
                    <div className="flex-shrink-0 w-9 h-9 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold leading-tight">Terima kasih sudah mengisi review!</p>
                        <p className="text-xs text-gray-400 mt-0.5">Ulasan Anda sedang kami tinjau 💛</p>
                    </div>
                </div>
            </div>

            <div className="min-h-screen bg-gradient-to-br from-[#FFF8F3] via-[#FFF3EC] to-[#FDEEE4] flex items-center justify-center p-4">
                {/* Decorative blobs */}
                <div className="fixed top-0 left-0 w-96 h-96 bg-[#E07A5F]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="fixed bottom-0 right-0 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

                <div className="relative w-full max-w-lg">
                    {/* Brand Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 bg-[#2D2D2D] rounded-2xl flex items-center justify-center shadow-xl">
                                <SparklesIcon className="w-8 h-8 text-[#E07A5F]" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-[#2D2D2D] tracking-tight">Jemari Home Spa</h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Ulasan Pelanggan</p>
                    </div>

                    {submitted ? (
                        /* SUCCESS STATE */
                        <div className="bg-white rounded-[3rem] shadow-2xl shadow-[#E07A5F]/10 p-12 text-center border border-orange-50 animate-fade-in">
                            <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative">
                                <CheckCircleIcon className="w-14 h-14 text-green-500" />
                                <div className="absolute inset-0 bg-green-400/10 rounded-[2rem] animate-ping" style={{ animationDuration: '2s', opacity: 0.3 }}></div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                                {already_reviewed ? 'Anda Sudah Mereview! ✨' : 'Terima Kasih! 🙏'}
                            </h2>
                            <p className="text-gray-500 leading-relaxed">
                                {already_reviewed 
                                    ? 'Anda telah memberikan ulasan untuk pesanan ini. Terima kasih banyak atas dukungan Anda!' 
                                    : 'Ulasan Anda sangat berarti bagi kami. Tim Jemari akan segera meninjau dan mempublikasikannya.'}
                            </p>
                            <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                <p className="text-sm text-amber-700 font-medium">
                                    ✨ Terima kasih sudah mempercayakan perawatan Anda kepada Jemari Home Spa
                                </p>
                            </div>
                            <div className="mt-8 flex items-center justify-center gap-2 text-[#E07A5F]">
                                <HeartIcon className="w-5 h-5" />
                                <span className="text-sm font-bold">Sampai jumpa di sesi berikutnya!</span>
                            </div>
                        </div>
                    ) : (
                        /* REVIEW FORM */
                        <div className="bg-white rounded-[3rem] shadow-2xl shadow-[#E07A5F]/10 overflow-hidden border border-orange-50">
                            {/* Card Header */}
                            <div className="bg-[#2D2D2D] px-10 py-8">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Pesanan</p>
                                <p className="text-white font-bold text-lg tracking-tight">{transaction.customer_name}</p>
                                <p className="text-gray-400 text-xs mt-1 font-mono">{transaction.order_number}</p>
                                {transaction.packages.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {transaction.packages.map((pkg, i) => (
                                            <span key={i} className="px-3 py-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                                                {pkg}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                {/* Star Rating */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block">
                                        Rating Layanan
                                    </label>
                                    <div className="flex gap-2 justify-center py-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onMouseEnter={() => setHoverStar(star)}
                                                onMouseLeave={() => setHoverStar(0)}
                                                onClick={() => setData('star', star)}
                                                className="transition-transform hover:scale-125 active:scale-95"
                                            >
                                                {(hoverStar || data.star) >= star ? (
                                                    <StarIcon className="w-10 h-10 text-amber-400 drop-shadow-sm" />
                                                ) : (
                                                    <StarOutline className="w-10 h-10 text-gray-200" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-center text-sm font-bold text-[#E07A5F]">
                                        {data.star === 5 ? '✨ Luar Biasa!' :
                                         data.star === 4 ? '👍 Bagus!' :
                                         data.star === 3 ? '😊 Cukup Baik' :
                                         data.star === 2 ? '😐 Perlu Perbaikan' :
                                         '😞 Kurang Memuaskan'}
                                    </p>
                                </div>

                                {/* Review Text */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block">
                                        Ceritakan Pengalaman Anda
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        required
                                        rows={5}
                                        placeholder="Bagaimana layanan kami? Apakah terapis kami profesional? Apa yang paling Anda sukai?.."
                                        className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm text-gray-800 focus:ring-2 focus:ring-[#E07A5F] resize-none placeholder:text-gray-300 font-medium leading-relaxed outline-none"
                                    />
                                    {errors.description && (
                                        <p className="text-red-500 text-xs font-bold">{errors.description}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-5 bg-[#E07A5F] text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-[#E07A5F]/20 hover:bg-[#2D2D2D] disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Mengirim...
                                        </>
                                    ) : (
                                        <>
                                            <HeartIcon className="w-4 h-4" />
                                            Kirim Ulasan
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                                    Ulasan akan ditinjau sebelum dipublikasikan
                                </p>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
