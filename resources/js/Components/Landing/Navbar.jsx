import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Navbar({ auth, activeService, setActiveService, lang, setLang }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [showServices, setShowServices] = useState(false);
    const [showMobileServices, setShowMobileServices] = useState(false);

    const services = [
        'Bekam',
        'Kerokan',
        'Totok Wajah',
        'Pijat Refleksi',
        'Pijat Ibu Hamil',
        'Pijat Tradisional'
    ];

    const serviceLabels = {
        'ID': {
            'Bekam': 'Bekam',
            'Kerokan': 'Kerokan',
            'Totok Wajah': 'Totok Wajah',
            'Pijat Refleksi': 'Pijat Refleksi',
            'Pijat Ibu Hamil': 'Pijat Ibu Hamil',
            'Pijat Tradisional': 'Pijat Tradisional'
        },
        'EN': {
            'Bekam': 'Professional Cupping',
            'Kerokan': 'Scraping Therapy',
            'Totok Wajah': 'Face Acupressure',
            'Pijat Refleksi': 'Reflexology',
            'Pijat Ibu Hamil': 'Pregnancy Massage',
            'Pijat Tradisional': 'Traditional Massage'
        }
    };

    const menuItems = {
        'ID': { home: 'Beranda', service: 'Layanan', testimonial: 'Testimoni', pricing: 'Harga', blog: 'Blog', contact: 'Kontak', login: 'Masuk', book: 'Pesan Sekarang' },
        'EN': { home: 'Home', service: 'Service', testimonial: 'Testimonial', pricing: 'Pricing', blog: 'Blog', contact: 'Contact', login: 'Log in', book: 'Book Now' }
    };

    const t = menuItems[lang];
    const sLabel = serviceLabels[lang];

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled ? 'py-2 md:py-4' : 'py-4 md:py-8'}`}>
            <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                {/* Desktop Navbar */}
                <div className={`hidden md:flex items-center justify-between px-10 rounded-full border transition-all duration-700 ${isScrolled
                    ? 'h-16 bg-white/80 backdrop-blur-xl border-zenith-orange/10 shadow-xl shadow-zenith-charcoal/5'
                    : 'h-20 bg-white/5 backdrop-blur-md border-white/10'
                    }`}>
                    <div className="flex items-center gap-x-2 py-2">
                        <img src="/images/Jemari Logo - 1.png" alt="Jemari Spa" className={`h-12 w-auto transition-all duration-500 ${isScrolled ? 'brightness-100' : 'brightness-0 invert'}`} />
                    </div>

                    <div className={`flex items-center gap-x-10 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-500 ${isScrolled ? 'text-zenith-charcoal/60' : 'text-white/60'
                        }`}>
                        <a href="/" className="hover:text-zenith-orange transition-colors">{t.home}</a>

                        {/* Services Dropdown */}
                        <div className="relative" onMouseEnter={() => setShowServices(true)} onMouseLeave={() => setShowServices(false)}>
                            <button className="flex items-center gap-x-1 hover:text-zenith-orange transition-colors uppercase">
                                {t.service} <span className="material-symbols-outlined text-[12px]">expand_more</span>
                            </button>

                            {/* Dropdown Menu */}
                            <div className={`absolute top-full left-0 pt-4 transition-all duration-300 ${showServices ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                                <div className="bg-white rounded-2xl shadow-2xl border-t-4 border-t-zenith-gold border border-zenith-orange/10 p-4 min-w-[220px]">
                                    {services.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => {
                                                setActiveService(s);
                                                setShowServices(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-xl transition-all text-zenith-charcoal/60 hover:text-zenith-orange hover:bg-zenith-orange/5 ${activeService === s ? 'text-zenith-orange bg-zenith-orange/5 font-bold' : ''}`}
                                        >
                                            {sLabel[s]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <a href="#testimonials" className="hover:text-zenith-orange transition-colors">{t.testimonial}</a>
                        <a href="#pricing" className="hover:text-zenith-orange transition-colors">{t.pricing}</a>
                        <a href="/blog" className="hover:text-zenith-orange transition-colors">{t.blog}</a>
                        <a href="#contact" className="hover:text-zenith-orange transition-colors">{t.contact}</a>
                    </div>

                    <div className="flex items-center gap-x-6">
                        {/* Desktop Language Switch */}
                        <div className={`flex items-center gap-x-2 text-[10px] font-bold tracking-widest ${isScrolled ? 'text-zenith-charcoal/40' : 'text-white/40'}`}>
                            <button onClick={() => setLang('ID')} className={`${lang === 'ID' ? 'text-zenith-orange' : ''} hover:text-zenith-orange transition-colors`}>ID</button>
                            <span className="opacity-20">|</span>
                            <button onClick={() => setLang('EN')} className={`${lang === 'EN' ? 'text-zenith-orange' : ''} hover:text-zenith-orange transition-colors`}>EN</button>
                        </div>

                        {/* Cart Icon */}
                        <div className="relative group cursor-pointer">
                            <span className={`material-symbols-outlined transition-colors duration-500 ${isScrolled ? 'text-zenith-charcoal' : 'text-white'} group-hover:text-zenith-orange`}>
                                shopping_bag
                            </span>
                            <span className="absolute -top-2 -right-2 bg-zenith-orange text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">0</span>
                        </div>

                        {/* {auth.user ? (
                            <Link href={route('dashboard')} className="rounded-full bg-zenith-orange px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-zenith-orange/20 hover:bg-zenith-orange/80 transition-all">
                                Member Area
                            </Link>
                        ) : (
                            <div className="flex items-center gap-x-6">
                                <Link href={route('login')} className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${isScrolled ? 'text-zenith-charcoal' : 'text-white'} hover:text-zenith-orange`}>{t.login}</Link>
                                <Link href={route('register')} className="rounded-full bg-zenith-orange px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-zenith-orange/20 hover:bg-zenith-orange/80 transition-all">{t.book}</Link>
                            </div>
                        )} */}
                    </div>
                </div>

                {/* Mobile Navbar */}
                <div className={`md:hidden flex items-center justify-between px-6 rounded-full border transition-all duration-500 ${isScrolled
                    ? 'h-14 bg-white/80 backdrop-blur-xl border-zenith-orange/10 shadow-lg'
                    : 'h-16 bg-white/10 backdrop-blur-md border-white/10'
                    }`}>

                    {/* Left: Lang & Cart */}
                    <div className="flex items-center gap-x-4">
                        <div className={`flex items-center gap-x-1 text-[8px] font-bold tracking-widest ${isScrolled ? 'text-zenith-charcoal/40' : 'text-white/40'}`}>
                            <button onClick={() => setLang('ID')} className={lang === 'ID' ? 'text-zenith-orange' : ''}>ID</button>
                            <span className="opacity-20">|</span>
                            <button onClick={() => setLang('EN')} className={lang === 'EN' ? 'text-zenith-orange' : ''}>EN</button>
                        </div>
                        <div className="relative">
                            <span className={`material-symbols-outlined text-lg ${isScrolled ? 'text-zenith-orange' : 'text-white'}`}>shopping_bag</span>
                            <span className="absolute -top-1 -right-1 bg-zenith-orange text-white text-[7px] font-bold h-3 w-3 rounded-full flex items-center justify-center border border-white">0</span>
                        </div>
                    </div>

                    {/* Center: Logo */}
                    <div className="absolute left-1/2 -translate-x-1/2">
                        <img src="/images/Jemari Logo - 1.png" alt="JEMARI SPA" className={`h-8 w-auto transition-all ${isScrolled ? 'brightness-100' : 'brightness-0 invert'}`} />
                    </div>

                    {/* Right: Service Dropdown Trigger */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMobileServices(!showMobileServices)}
                            className={`flex items-center justify-center h-10 w-10 rounded-full transition-all ${showMobileServices ? 'bg-zenith-orange text-white' : (isScrolled ? 'text-zenith-orange' : 'text-white')}`}
                        >
                            <span className="material-symbols-outlined text-xl">spa</span>
                        </button>

                        {/* Mobile Dropdown Content */}
                        <div className={`absolute top-full right-0 mt-4 transition-all duration-300 ${showMobileServices ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                            <div className="bg-white rounded-2xl shadow-2xl border-t-4 border-t-zenith-gold border border-zenith-orange/10 p-4 min-w-[200px]">
                                {services.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => {
                                            setActiveService(s);
                                            setShowMobileServices(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all text-zenith-charcoal/60 hover:text-zenith-orange hover:bg-zenith-orange/5 ${activeService === s ? 'text-zenith-orange bg-zenith-orange/5 font-bold' : ''}`}
                                    >
                                        <p className="text-[10px] font-bold uppercase tracking-widest">{sLabel[s]}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
