import { useEffect, useState } from 'react';

const serviceContent = {
    'ID': {
        'Default': {
            title: <>Nikmati Hidup Sehat <br /><span className="italic text-orange-500 font-normal">Tanpa Keluar Rumah</span></>,
            subtitle: "Jemari Home Spa Bandung",
            desc: "Nikmati perawatan spa profesional di kenyamanan rumah Anda. Terapis bersertifikat, peralatan higienis, dan pengalaman relaksasi yang menenangkan. Kami hadir untuk Anda.",
            bg: "/images/services.jpg"
        },
        'Pijat Tradisional': {
            title: <>Ingin Pijat Tradisional <br /><span className="italic text-orange-500 font-normal">Tanpa Harus Keluar Rumah?</span></>,
            subtitle: "Jemari Home Spa Bandung",
            desc: "Menghadirkan layanan jasa Pijat panggilan Profesional. Terapis bersertifikat dan peralatan higienis. Kami siap datang ke rumah, hotel, atau kantor Anda untuk memberikan perawatan yang aman dan nyaman.",
            bg: "/images/pijat tradisional.jpg"
        },
        'Bekam': {
            title: <>Layanan Bekam Profesional <br /><span className="italic text-orange-500 font-normal">Langsung di Rumah Anda</span></>,
            subtitle: "Jemari Home Spa Bandung",
            desc: "Layanan jasa bekam panggilan Profesional. Terapis bersertifikat dan peralatan higienis. Kami siap datang ke rumah, hotel, atau kantor Anda untuk memberikan perawatan bekam yang aman dan menenangkan.",
            bg: "/images/bekam.webp"
        },
        'Kerokan': {
            title: <>Layanan Kerokan Panggilan <br /><span className="italic text-orange-500 font-normal">Tradisional & Higienis</span></>,
            subtitle: "Jemari Home Spa Bandung",
            desc: "Ingin kerokan tanpa harus keluar rumah? Jemari Home Spa hadir sebagai solusi kesehatan Anda. Terapi kerokan profesional untuk meredakan masuk angin dan pegal-pegal dengan teknik yang aman.",
            bg: "/images/kerokan.jpg"
        },
        'Totok Wajah': {
            title: <>Ingin Totok Wajah <br /><span className="italic text-orange-500 font-normal">Agar Wajah Lebih Glowing?</span></>,
            subtitle: "Jemari Home Spa Bandung",
            desc: "Jemari Home Spa hadir sebagai solusi kecantikan Anda. Terapi totok wajah profesional untuk membantu wajah lebih segar, bercahaya, dan rileks tanpa perlu menembus kemacetan kota.",
            bg: "/images/totok wajah.jpg"
        },
        'Pijat Refleksi': {
            title: <>Pulihkan Keseimbangan Tubuh <br /><span className="italic text-orange-500 font-normal">Dengan Pijat Refleksi</span></>,
            subtitle: "Jemari Home Spa Bandung",
            desc: "Tubuh terasa lelah atau kaki pegal? Layanan panggilan ke rumah pijat refleksi profesional untuk melancarkan peredaran darah dan mengembalikan keseimbangan energi tubuh Anda.",
            bg: "/images/pijat refleksi.jpg"
        },
        'Pijat Ibu Hamil': {
            title: <>Relaksasi Khusus Ibu Hamil <br /><span className="italic text-orange-500 font-normal">Aman & Menenangkan</span></>,
            subtitle: "Jemari Home Spa Bandung",
            desc: "Dirancang khusus untuk meredakan pegal dan stres selama kehamilan. Dengan terapis wanita bersertifikat dan teknik pijat yang lembut, Anda bisa menikmati pijat aman di rumah.",
            bg: "/images/pijat ibu hamil.jpg"
        }
    },
    'EN': {
        'Default': {
            title: <>Enjoy Healthy Living <br /><span className="italic text-orange-500 font-normal">Without Leaving Home</span></>,
            subtitle: "Jemari Home Spa Bandung",
            desc: "Professional spa treatments in the comfort of your home. Certified therapists, hygienic equipment, and a soothing relaxation experience. We are here for you.",
            bg: "/images/services.jpg"
        },
        'Pijat Tradisional': {
            title: <>Traditional Massage <br /><span className="italic text-orange-500 font-normal">At Your Doorstep</span></>,
            subtitle: "Jemari Home Spa Bandung",
            desc: "Professional on-call massage services. Certified therapists and hygienic equipment. Ready to visit your home, hotel, or office for a safe and comfortable treatment.",
            bg: "/images/pijat tradisional.jpg"
        },
        'Bekam': {
            title: <>Professional Cupping <br /><span className="italic text-orange-500 font-normal">Service at Your Home</span></>,
            subtitle: "Jemari Home Spa Bandung",
            desc: "Professional mobile cupping services. Certified therapists and hygienic equipment. Safe, sterile, and soothing treatments at your preferred location.",
            bg: "/images/bekam.webp"
        },
        'Kerokan': {
            title: <>Traditional Scraping <br /><span className="italic text-orange-500 font-normal">Therapy & Hygiene</span></>,
            subtitle: "Jemari Home Spa Bandung",
            desc: "Relieve colds and muscle aches with our professional scraping therapy. Safe techniques delivered directly to your home by experienced therapists.",
            bg: "/images/kerokan.jpg"
        },
        'Totok Wajah': {
            title: <>Face Acupressure <br /><span className="italic text-orange-500 font-normal">For a Glowing Look</span></>,
            subtitle: "Jemari Home Spa Bandung",
            desc: "Professional facial acupressure to help your face look fresher, glowing, and relaxed without needing to face city traffic.",
            bg: "/images/totok wajah.jpg"
        },
        'Pijat Refleksi': {
            title: <>Restore Your Balance <br /><span className="italic text-orange-500 font-normal">With Reflexology</span></>,
            subtitle: "Jemari Home Spa Bandung",
            desc: "Feeling tired or sore? Our professional mobile reflexology service improves blood circulation and restores your body's energy balance.",
            bg: "/images/pijat refleksi.jpg"
        },
        'Pijat Ibu Hamil': {
            title: <>Specialized Pregnancy <br /><span className="italic text-orange-500 font-normal">Safe & Soothing Relaxation</span></>,
            subtitle: "Jemari Home Spa Bandung",
            desc: "Specifically designed to relieve aches and stress during pregnancy. Safe home treatments with certified female therapists and gentle techniques.",
            bg: "/images/pijat ibu hamil.jpg"
        }
    }
};

export default function Hero({ activeService, lang }) {
    const langContent = serviceContent[lang] || serviceContent['ID'];
    const content = langContent[activeService] || langContent['Default'];
    const [isVisible, setIsVisible] = useState(true);

    const buttons = {
        'ID': { book: 'Pesan Sekarang', contact: 'Hubungi Kami' },
        'EN': { book: 'Book Now', contact: 'Contact Us' }
    };

    const b = buttons[lang] || buttons['ID'];

    useEffect(() => {
        setIsVisible(false);
        const timer = setTimeout(() => setIsVisible(true), 300);
        return () => clearTimeout(timer);
    }, [activeService, lang]);

    return (
        <section className="relative min-h-[110vh] lg:min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 transition-opacity duration-700">
                <img
                    src={content.bg}
                    alt="Spa Background"
                    className="w-full h-full object-cover transition-all duration-1000 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 via-transparent to-[#fef8f7]"></div>
            </div>

            <div className={`relative mx-auto max-w-5xl px-6 lg:px-8 text-center pt-32 pb-40 lg:pb-60 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="inline-flex items-center gap-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-8">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">{content.subtitle}</span>
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif text-white leading-tight mb-8">
                    {content.title}
                </h1>

                <p className="max-w-2xl mx-auto text-sm md:text-lg text-white/80 leading-relaxed mb-12 font-sans">
                    {content.desc}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button className="w-full sm:w-auto rounded-full bg-orange-600 px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-2xl shadow-orange-600/40 hover:bg-orange-500 transition-all transform hover:scale-105 active:scale-95">
                        {b.book}
                    </button>
                    <button className="w-full sm:w-auto rounded-full border border-white/30 backdrop-blur-md px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-all">
                        {b.contact}
                    </button>
                </div>
            </div>

            {/* Bottom Stats Grid (Improved Visibility & Added Stars) */}
            <div className="absolute bottom-8 lg:bottom-12 left-0 right-0 hidden lg:block">
                <div className="mx-auto max-w-xl px-6">
                    <div className="grid grid-cols-3 gap-x-4 items-center justify-center bg-black/20 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 shadow-2xl scale-90">
                        <div className="text-center">
                            <p className="text-white text-2xl font-serif italic">12+</p>
                            <p className="text-white/60 text-[8px] font-bold uppercase tracking-[0.1em] mt-1">{lang === 'ID' ? 'Layanan' : 'Practices'}</p>
                        </div>
                        <div className="h-8 w-px bg-white/20 mx-auto"></div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                                <p className="text-white text-2xl font-serif italic">4.9</p>
                                <span className="material-symbols-outlined text-orange-500 text-lg">star</span>
                            </div>
                            <p className="text-white/60 text-[8px] font-bold uppercase tracking-[0.1em] mt-1">{lang === 'ID' ? 'Rating Member' : 'Member Rating'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
