import { useState } from 'react';

const rituals = [
    {
        id: 'Pijat Tradisional',
        title: { ID: 'Pijat Tradisional', EN: 'Traditional Massage' },
        desc: { 
            ID: 'Layanan pijat panggilan profesional untuk relaksasi tubuh dan pikiran. Terapis bersertifikat siap datang ke lokasi Anda.', 
            EN: 'Professional on-call massage service for body and mind relaxation. Certified therapists ready to come to your location.' 
        },
        img: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'Bekam',
        title: { ID: 'Bekam Profesional', EN: 'Professional Cupping' },
        desc: { 
            ID: 'Terapi bekam steril untuk detoksifikasi dan melancarkan peredaran darah. Aman dan ditangani oleh ahli.', 
            EN: 'Sterile cupping therapy for detoxification and blood circulation. Safe and handled by experts.' 
        },
        img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'Kerokan',
        title: { ID: 'Terapi Kerokan', EN: 'Scraping Therapy' },
        desc: { 
            ID: 'Teknik tradisional yang efektif untuk meredakan masuk angin dan pegal-pegal dengan peralatan higienis.', 
            EN: 'Effective traditional technique to relieve colds and muscle aches with hygienic equipment.' 
        },
        img: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'Totok Wajah',
        title: { ID: 'Totok Wajah', EN: 'Face Acupressure' },
        desc: { 
            ID: 'Membantu wajah lebih segar, bercahaya (glowing), dan rileks. Solusi kecantikan tanpa macet.', 
            EN: 'Helps the face look fresher, glowing, and relaxed. Beauty solution without the traffic.' 
        },
        img: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'Pijat Refleksi',
        title: { ID: 'Pijat Refleksi', EN: 'Reflexology' },
        desc: { 
            ID: 'Melancarkan peredaran darah dan mengembalikan keseimbangan energi tubuh Anda.', 
            EN: 'Improves blood circulation and restores your body\'s energy balance.' 
        },
        img: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'Pijat Ibu Hamil',
        title: { ID: 'Pijat Ibu Hamil', EN: 'Pregnancy Massage' },
        desc: { 
            ID: 'Relaksasi khusus untuk meredakan stres dan nyeri punggung selama masa kehamilan.', 
            EN: 'Specialized relaxation to relieve stress and back pain during pregnancy.' 
        },
        img: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800'
    }
];

export default function SignatureRituals({ lang }) {
    const [activeTab, setActiveTab] = useState(null);

    return (
        <section id="rituals" className="py-24 md:py-32 bg-white overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center mb-16 md:mb-24">
                <span className="text-orange-600 font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block underline underline-offset-8 decoration-orange-200">
                    {lang === 'ID' ? 'Koleksi Kami' : 'The Collection'}
                </span>
                <h2 className="text-4xl md:text-6xl font-serif text-zenith-charcoal italic leading-tight">
                    {lang === 'ID' ? 'Signature Rituals' : 'Signature Rituals'}
                </h2>
            </div>
            
            <div className="relative">
                {/* Horizontal Scroll on Mobile, Grid on Desktop */}
                <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 md:gap-10 px-6 lg:px-8 pb-10 scrollbar-hide snap-x snap-mandatory">
                    {rituals.map((ritual, i) => (
                        <div 
                            key={i} 
                            onClick={() => setActiveTab(activeTab === i ? null : i)}
                            className="relative flex-none w-[85vw] md:w-auto h-[35rem] md:h-[40rem] rounded-[3rem] overflow-hidden group cursor-pointer snap-center shadow-2xl shadow-black/5"
                        >
                            {/* Background Image */}
                            <img 
                                src={ritual.img} 
                                alt={ritual.title[lang]}
                                className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                            />
                            
                            {/* Gradient Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                            
                            {/* Desktop Hover / Mobile Click Content */}
                            <div className={`absolute inset-x-0 bottom-0 p-8 md:p-12 transition-all duration-700 ease-out 
                                ${activeTab === i || 'md:group-hover:translate-y-0 translate-y-12'}
                            `}>
                                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em] mb-4 block">
                                    {lang === 'ID' ? 'Layanan Unggulan' : 'Signature Service'}
                                </span>
                                <h3 className="text-3xl md:text-4xl font-serif text-white mb-6 italic">
                                    {ritual.title[lang]}
                                </h3>
                                
                                {/* Description Section */}
                                <div className={`transition-all duration-700 
                                    ${activeTab === i ? 'opacity-100 max-h-40' : 'md:group-hover:opacity-100 md:group-hover:max-h-40 opacity-0 max-h-0'}
                                    overflow-hidden
                                `}>
                                    <p className="text-white/70 text-sm md:text-base leading-relaxed mb-8 font-sans">
                                        {ritual.desc[lang]}
                                    </p>
                                    <button className="rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:bg-white hover:text-orange-600 transition-all">
                                        {lang === 'ID' ? 'Pesan Sekarang' : 'Book Now'}
                                    </button>
                                </div>
                            </div>

                            {/* Indicator for Mobile */}
                            <div className="absolute top-8 right-8 md:hidden">
                                <div className={`h-10 w-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-transform duration-500 ${activeTab === i ? 'rotate-45' : ''}`}>
                                    <span className="material-symbols-outlined text-xl">add</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Decorative Elements */}
                <div className="hidden lg:block absolute -left-20 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none">
                    <span className="text-[100px] font-serif italic text-black/[0.03] whitespace-nowrap">Signature Experience</span>
                </div>
            </div>
        </section>
    );
}
