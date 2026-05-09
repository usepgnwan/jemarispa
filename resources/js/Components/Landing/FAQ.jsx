import { useState } from 'react';

const faqs = [
    {
        q: 'Apakah terapis sudah membawa semua perlengkapan sendiri?',
        a: 'Ya, terapis kami akan membawa seluruh perlengkapan yang dibutuhkan, termasuk matras lipat/alas pijat, minyak aromaterapi, handuk bersih, dan peralatan khusus sesuai layanan yang dipesan.'
    },
    {
        q: 'Bagaimana cara melakukan reservasi?',
        a: 'Anda dapat melakukan reservasi dengan mudah melalui tombol "Pesan Sekarang" yang terhubung langsung ke WhatsApp kami, atau melalui aplikasi partner kami seperti Traveloka dan Tiket.com.'
    },
    {
        q: 'Apakah ada biaya transport tambahan?',
        a: 'Biaya layanan kami sudah termasuk biaya transportasi untuk area jangkauan utama di Bandung. Untuk lokasi yang berada jauh di luar area layanan, mungkin akan dikenakan biaya tambahan yang transparan.'
    },
    {
        q: 'Apakah bisa pilih terapis pria atau wanita?',
        a: 'Demi kenyamanan Anda, kami menyediakan pilihan terapis sesuai gender. Pelanggan wanita akan ditangani oleh terapis wanita (Therapist), dan pelanggan pria akan ditangani oleh terapis pria (Therapist).'
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section className="py-section bg-zenith-surface">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Pertanyaan yang Sering Diajukan</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Left Column: Image */}
                    <div className="rounded-[2.5rem] overflow-hidden h-[600px] shadow-2xl">
                        <img
                            src="/images/pijat tradisional.JPG"
                            alt="Spa Treatment"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Right Column: Accordion */}
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className={`rounded-3xl bg-white transition-all duration-500 overflow-hidden shadow-sm hover:shadow-md border border-orange-50 ${openIndex === i ? 'ring-1 ring-orange-200' : ''
                                    }`}
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                    className="w-full px-8 py-6 flex items-center justify-between text-left group"
                                >
                                    <span className="font-bold text-zenith-charcoal tracking-tight text-sm pr-4">{faq.q}</span>
                                    <span className={`material-symbols-outlined transition-transform duration-500 text-orange-500 text-sm ${openIndex === i ? 'rotate-180' : ''}`}>
                                        expand_more
                                    </span>
                                </button>

                                <div className={`transition-all duration-500 ease-in-out ${openIndex === i ? 'max-h-96 opacity-100 pb-8 px-8' : 'max-h-0 opacity-0 pointer-events-none'
                                    }`}>
                                    <p className="text-sm text-gray-500 leading-relaxed font-sans border-t border-orange-50/50 pt-6">
                                        {faq.a}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
