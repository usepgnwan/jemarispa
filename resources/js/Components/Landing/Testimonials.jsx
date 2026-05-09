import { StarIcon } from '@heroicons/react/24/solid';

const translations = {
    'ID': {
        tagline: 'Testimoni Pelanggan',
        title: 'Suara Ketenangan',
        subtitle: 'Kisah nyata dari mereka yang telah merasakan sentuhan Jemari.'
    },
    'EN': {
        tagline: 'Customer Testimonials',
        title: 'Voices of Serenity',
        subtitle: 'Real stories from those who have experienced the Jemari touch.'
    }
};

export default function Testimonials({ testimonials = [], lang = 'ID' }) {
    const t = translations[lang];

    // Fallback data if table is empty
    const displayTestimonials = testimonials.length > 0 ? testimonials : [
        {
            name: 'Siska Amelia',
            packages_description: 'Travel Enthusiast',
            description: 'Pelayanan terbaik yang pernah saya rasakan. Atmosfer Zen-nya sangat terasa sejak pertama kali masuk.',
            source: 'Traveloka',
            star: 5,
        },
        {
            name: 'Budi Santoso',
            packages_description: 'Entrepreneur',
            description: 'Paketnya bener-bener worth it. Terapisnya sangat profesional dan paham titik lelah badan.',
            source: 'Tiket.com',
            star: 5,
        }
    ];

    return (
        <section id="testimonials" className="py-24 md:py-32 bg-zenith-surface relative overflow-hidden">
            {/* Background elements for elegance */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-zenith-orange/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-zenith-gold/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20 max-w-2xl mx-auto">
                    <span className="text-zenith-orange font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">{t.tagline}</span>
                    <h2 className="text-4xl md:text-6xl font-serif text-zenith-charcoal italic leading-tight mb-6">{t.title}</h2>
                    <p className="text-gray-400 text-sm md:text-base font-sans leading-relaxed italic">{t.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayTestimonials.slice(0, 6).map((review, i) => (
                        <div key={review.id || i} className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-zenith-orange/10 shadow-[0_32px_64px_-16px_rgba(244,124,81,0.05)] hover:-translate-y-2 transition-all duration-700 group flex flex-col">
                            <div className="flex items-center gap-x-1 mb-6">
                                {[...Array(parseInt(review.star || 5))].map((_, i) => (
                                    <StarIcon key={i} className="h-4 w-4 text-zenith-gold drop-shadow-sm" />
                                ))}
                            </div>

                            <div 
                                className="text-zenith-charcoal text-base md:text-lg font-serif italic leading-relaxed mb-10 flex-1 prose prose-sm max-w-none prose-p:italic"
                                dangerouslySetInnerHTML={{ __html: review.description }}
                            />

                            <div className="flex items-center justify-between border-t border-zenith-dim/10 pt-8">
                                <div>
                                    <h4 className="text-[10px] font-bold text-zenith-charcoal uppercase tracking-widest">{review.name}</h4>
                                    <p className="text-[9px] text-zenith-orange font-bold uppercase tracking-widest mt-1 opacity-60">{review.packages_description}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="h-10 w-10 rounded-full bg-zenith-dim/5 flex items-center justify-center mb-3 group-hover:bg-zenith-orange group-hover:text-white transition-all duration-500">
                                        <span className="material-symbols-outlined text-base">format_quote</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-sm ${
                                        review.source?.toLowerCase() === 'traveloka' ? 'bg-blue-50 text-blue-600' :
                                        review.source?.toLowerCase() === 'tiket.com' ? 'bg-yellow-50 text-yellow-600' :
                                        'bg-zenith-dim/5 text-zenith-charcoal/40'
                                    }`}>
                                        {review.source || 'Verified'}
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
