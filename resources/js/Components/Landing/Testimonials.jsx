import { StarIcon } from '@heroicons/react/24/solid';

const reviews = [
    {
        name: 'Siska Amelia',
        role: 'Travel Enthusiast',
        content: 'Pelayanan terbaik yang pernah saya rasakan. Atmosfer Zen-nya sangat terasa sejak pertama kali masuk ke lobby.',
        source: 'Traveloka',
        rating: 5,
    },
    {
        name: 'Budi Santoso',
        role: 'Entrepreneur',
        content: 'Paket The Ritual bener-bener worth it. Sauna dan massage-nya bikin badan seger lagi buat kerja besoknya.',
        source: 'Tiket.com',
        rating: 5,
    },
    {
        name: 'Elena Gilbert',
        role: 'Digital Nomad',
        content: 'Design tempatnya instagramable banget tapi tetep tenang. Highly recommended buat yang mau escape sebentar.',
        source: 'Google Maps',
        rating: 5,
    }
];

export default function Testimonials() {
    return (
        <section className="py-24 md:py-32 bg-[#F9F4F2]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-20">
                    <span className="text-orange-600 font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block underline underline-offset-8 decoration-orange-200">Testimonials</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-zenith-charcoal italic leading-tight">Voices of Serenity</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {reviews.map((review, i) => (
                        <div key={i} className="bg-white rounded-[3rem] p-10 md:p-12 border border-orange-100/50 shadow-[0_20px_50px_rgba(154,113,94,0.15)] hover:-translate-y-3 transition-all duration-700 group relative">
                            <div className="flex items-center gap-x-1 mb-8">
                                {[...Array(review.rating)].map((_, i) => (
                                    <StarIcon key={i} className="h-6 w-6 text-zenith-gold drop-shadow-sm" />
                                ))}
                            </div>

                            <p className="text-zenith-charcoal text-lg md:text-xl font-serif italic leading-relaxed mb-12 relative z-10">
                                "{review.content}"
                            </p>

                            <div className="flex items-center justify-between border-t border-orange-50 pt-10">
                                <div>
                                    <h4 className="text-sm font-bold text-zenith-charcoal uppercase tracking-tighter">{review.name}</h4>
                                    <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-1">{review.role}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center mb-3 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                                        <span className="material-symbols-outlined text-lg">format_quote</span>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm ${review.source === 'Traveloka' ? 'bg-blue-50 text-blue-600' :
                                            review.source === 'Tiket.com' ? 'bg-yellow-50 text-yellow-600' :
                                                'bg-green-50 text-green-600'
                                        }`}>
                                        {review.source}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
