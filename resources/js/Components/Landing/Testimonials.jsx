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
        <section className="py-section bg-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-20">
                    <span className="text-orange-600 font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Testimonials</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-zenith-charcoal italic leading-tight">Voices of Serenity</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((review, i) => (
                        <div key={i} className="bg-zenith-surface rounded-[2.5rem] p-10 border border-orange-50 shadow-xl shadow-orange-900/5 hover:-translate-y-2 transition-all duration-500">
                            <div className="flex items-center gap-x-1 mb-6">
                                {[...Array(review.rating)].map((_, i) => (
                                    <StarIcon key={i} className="h-4 w-4 text-orange-500" />
                                ))}
                            </div>
                            
                            <p className="text-zenith-charcoal text-lg font-serif italic leading-relaxed mb-10">
                                "{review.content}"
                            </p>

                            <div className="flex items-center justify-between border-t border-orange-100 pt-8">
                                <div>
                                    <h4 className="text-sm font-bold text-zenith-charcoal uppercase tracking-tighter">{review.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{review.role}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${
                                        review.source === 'Traveloka' ? 'bg-blue-50 text-blue-600' :
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
