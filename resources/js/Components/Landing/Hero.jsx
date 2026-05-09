import { useEffect, useState } from 'react';

const serviceContent = {
    'ID': {
        'Default': {
            title: <>Seni <br /><span className="italic text-orange-500 font-normal">Hidup Sehat</span></>,
            subtitle: "Kini Hadir di Valley View",
            desc: "Masuki dunia di mana waktu seolah berhenti. Perawatan holistik kami dirancang untuk mengharmonisasikan tubuh, pikiran, dan jiwa Anda dalam suasana kebahagiaan murni.",
            bg: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=2000"
        },
        'Pijat Tradisional': {
            title: <>Ingin Pijat Tradisional <br /><span className="italic text-orange-500 font-normal">Tanpa Keluar Rumah?</span></>,
            subtitle: "Layanan Panggilan Profesional",
            desc: "Jemari Home Spa Bandung menghadirkan layanan jasa Pijat panggilan Profesional. Terapis bersertifikat dan peralatan higienis. Kami siap datang ke rumah, hotel, atau kantor Anda.",
            bg: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=2000"
        },
        'Bekam': {
            title: <>Detoks Tubuh dengan <br /><span className="italic text-orange-500 font-normal">Terapi Bekam</span></>,
            subtitle: "Sunnah & Kesehatan",
            desc: "Layanan bekam profesional dengan peralatan steril sekali pakai. Membantu melancarkan peredaran darah dan meningkatkan imunitas tubuh Anda.",
            bg: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=2000"
        }
    },
    'EN': {
        'Default': {
            title: <>The Art of <br /><span className="italic text-orange-500 font-normal">Living Well</span></>,
            subtitle: "Now Open in Valley View",
            desc: "Step into a world where time stands still. Our holistic treatments are designed to harmonize your body, mind, and spirit in a setting of pure architectural bliss.",
            bg: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=2000"
        },
        'Pijat Tradisional': {
            title: <>Want Traditional Massage <br /><span className="italic text-orange-500 font-normal">Without Leaving Home?</span></>,
            subtitle: "Professional Home Service",
            desc: "Jemari Home Spa Bandung presents professional on-call massage services. Certified therapists and hygienic equipment. We are ready to come to your home, hotel, or office.",
            bg: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=2000"
        },
        'Bekam': {
            title: <>Body Detox with <br /><span className="italic text-orange-500 font-normal">Cupping Therapy</span></>,
            subtitle: "Sunnah & Health",
            desc: "Professional cupping service with single-use sterile equipment. Helps improve blood circulation and boost your body's immunity.",
            bg: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=2000"
        }
    }
};

export default function Hero({ activeService, lang }) {
    const langContent = serviceContent[lang] || serviceContent['ID'];
    const content = langContent[activeService] || langContent['Default'];
    const [isVisible, setIsVisible] = useState(true);

    const buttons = {
        'ID': { book: 'Pesan Ritual', story: 'Cerita Kami' },
        'EN': { book: 'Book Ritual', story: 'Our Story' }
    };

    const b = buttons[lang];

    // Animation trigger when activeService or lang changes
    useEffect(() => {
        setIsVisible(false);
        const timer = setTimeout(() => setIsVisible(true), 300);
        return () => clearTimeout(timer);
    }, [activeService, lang]);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 transition-opacity duration-700">
                <img 
                    src={content.bg} 
                    alt="Spa Background"
                    className="w-full h-full object-cover transition-all duration-1000 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#fef8f7]"></div>
            </div>
            
            <div className={`relative mx-auto max-w-5xl px-6 lg:px-8 text-center pt-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="inline-flex items-center gap-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-8">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">{content.subtitle}</span>
                </div>
                
                <h1 className="text-4xl md:text-8xl font-serif text-white leading-[1.1] mb-8">
                    {content.title}
                </h1>
                
                <p className="max-w-2xl mx-auto text-sm md:text-lg text-white/70 leading-relaxed mb-12 font-sans">
                    {content.desc}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button className="w-full sm:w-auto rounded-full bg-[#ff7d00] px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-2xl shadow-orange-600/40 hover:bg-orange-500 transition-all transform hover:scale-105">
                        {b.book}
                    </button>
                    <button className="w-full sm:w-auto rounded-full border border-white/20 backdrop-blur-md px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-all">
                        {b.story}
                    </button>
                </div>
            </div>

            {/* Bottom Stats Grid */}
            <div className="absolute bottom-16 left-0 right-0 hidden md:block">
                <div className="mx-auto max-w-2xl px-6">
                    <div className="grid grid-cols-3 gap-x-8 items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <div className="text-center">
                            <p className="text-white text-2xl font-serif italic">12+</p>
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.1em] mt-1">{lang === 'ID' ? 'Layanan' : 'Practices'}</p>
                        </div>
                        <div className="h-10 w-px bg-white/10 mx-auto"></div>
                        <div className="text-center">
                            <p className="text-white text-2xl font-serif italic">4.9</p>
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.1em] mt-1">{lang === 'ID' ? 'Rating Member' : 'Member Rating'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
