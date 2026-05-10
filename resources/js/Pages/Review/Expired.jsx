import { Head } from '@inertiajs/react';
import { ClockIcon } from '@heroicons/react/24/outline';

export default function Expired() {
    return (
        <>
            <Head title="Link Ulasan Kedaluwarsa - Jemari Home Spa" />
            <div className="min-h-screen bg-gradient-to-br from-[#FFF8F3] via-[#FFF3EC] to-[#FDEEE4] flex items-center justify-center p-4">
                <div className="bg-white rounded-[3rem] shadow-2xl p-12 text-center max-w-sm w-full border border-orange-50">
                    <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                        <ClockIcon className="w-10 h-10 text-gray-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Link Kedaluwarsa</h2>
                    <p className="text-gray-400 leading-relaxed text-sm">
                        Link ulasan ini hanya berlaku selama <strong className="text-gray-600">1×24 jam</strong> setelah invoice dikirimkan dan kini sudah tidak aktif.
                    </p>
                    <div className="mt-10 text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">
                        Jemari Home Spa
                    </div>
                </div>
            </div>
        </>
    );
}
