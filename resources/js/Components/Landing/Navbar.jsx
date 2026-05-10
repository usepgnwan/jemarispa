import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Navbar({ auth, activeService, setActiveService, lang, setLang, forceSolid = false }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [showServices, setShowServices] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [activeHash, setActiveHash] = useState('');

    const isSolid = isScrolled || forceSolid;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const logAnalytic = (category, title) => {
        try {
            fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify({ category, title })
            });
        } catch (e) {
            // Silently fail
        }
    };

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
        
        const updateCartCount = () => {
            const savedCart = JSON.parse(localStorage.getItem('spa_cart') || '[]');
            const savedGuests = JSON.parse(localStorage.getItem('jemari_checkout_guests') || '[]');
            
            const guestsCount = savedGuests.reduce((acc, guest) => acc + (guest.packages?.length || 0), 0);
            setCartCount(savedCart.length + guestsCount);
        };

        const handleHashChange = () => {
            setActiveHash(window.location.hash);
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('hashchange', handleHashChange);
        updateCartCount();

        window.addEventListener('storage', updateCartCount);
        window.addEventListener('cart-updated', updateCartCount);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('storage', updateCartCount);
            window.removeEventListener('cart-updated', updateCartCount);
        };
    }, []);

    const isActive = (path, hash = '') => {
        if (hash) return activeHash === hash;
        return currentPath === path && !activeHash;
    };

    const activeClass = "text-zenith-orange font-black";
    const inactiveClass = isSolid ? "text-zenith-charcoal/60 hover:text-zenith-orange" : "text-white/60 hover:text-white";

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isSolid ? 'py-2 md:py-4' : 'py-4 md:py-8'}`}>
            <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                {/* Desktop Navbar */}
                <div className={`hidden md:flex items-center justify-between px-10 rounded-full border transition-all duration-700 ${isSolid
                    ? 'h-16 bg-white/80 backdrop-blur-xl border-zenith-orange/10 shadow-xl shadow-zenith-charcoal/5'
                    : 'h-20 bg-white/5 backdrop-blur-md border-white/10'
                    }`}>
                    <Link href="/" className="flex items-center gap-x-2 py-2">
                        <img src="/images/Jemari Logo - 1.png" alt="Jemari Spa" className={`h-12 w-auto transition-all duration-500 ${isSolid ? 'brightness-100' : 'brightness-0 invert'}`} />
                    </Link>

                    <div className="flex items-center gap-x-10 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-500">
                        <Link 
                            href="/" 
                            onClick={() => logAnalytic('Menu', 'Klik Beranda')}
                            className={`transition-colors ${isActive('/') ? activeClass : inactiveClass}`}
                        >
                            {t.home}
                        </Link>

                        <div className="relative" onMouseEnter={() => setShowServices(true)} onMouseLeave={() => setShowServices(false)}>
                            <button className={`flex items-center gap-x-1 uppercase transition-colors ${activeService !== 'Default' ? 'text-zenith-orange' : inactiveClass}`}>
                                {t.service} <span className="material-symbols-outlined text-[12px]">expand_more</span>
                            </button>

                            <div className={`absolute top-full left-0 pt-4 transition-all duration-300 ${showServices ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                                <div className="bg-white rounded-2xl shadow-2xl border-t-4 border-t-zenith-gold border border-zenith-orange/10 p-4 min-w-[220px]">
                                    {services.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => {
                                                logAnalytic('Layanan', `Pilih ${s}`);
                                                if (window.location.pathname === '/') {
                                                    setActiveService(s);
                                                } else {
                                                    window.location.href = '/';
                                                    localStorage.setItem('pending_service', s);
                                                }
                                                setShowServices(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-between group ${activeService === s ? 'bg-zenith-orange/5 text-zenith-orange' : 'text-zenith-charcoal/60 hover:text-zenith-orange hover:bg-zenith-orange/5'}`}
                                        >
                                            {sLabel[s]}
                                            <span className={`material-symbols-outlined text-[14px] transition-opacity ${activeService === s ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>arrow_forward</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Link 
                            href="/#testimonials" 
                            onClick={() => logAnalytic('Menu', 'Klik Testimoni')}
                            className={`transition-colors ${isActive('/', '#testimonials') ? activeClass : inactiveClass}`}
                        >
                            {t.testimonial}
                        </Link>
                        <Link 
                            href="/pricing" 
                            onClick={() => logAnalytic('Menu', 'Klik Harga')}
                            className={`transition-colors ${isActive('/pricing') ? activeClass : inactiveClass}`}
                        >
                            {t.pricing}
                        </Link>
                        <Link 
                            href="/blog" 
                            onClick={() => logAnalytic('Menu', 'Klik Blog')}
                            className={`transition-colors ${isActive('/blog') ? activeClass : inactiveClass}`}
                        >
                            {t.blog}
                        </Link>
                        <Link 
                            href="/#contact" 
                            onClick={() => logAnalytic('Menu', 'Klik Kontak')}
                            className={`transition-colors ${isActive('/', '#contact') ? activeClass : inactiveClass}`}
                        >
                            {t.contact}
                        </Link>
                    </div>

                    <div className="flex items-center gap-x-6">
                        <div className="flex bg-zenith-charcoal/5 rounded-full p-1 border border-zenith-charcoal/10">
                            {['ID', 'EN'].map((l) => (
                                <button
                                    key={l}
                                    onClick={() => {
                                        setLang(l);
                                        localStorage.setItem('app_lang', l);
                                    }}
                                    className={`px-3 py-1 rounded-full text-[8px] font-bold transition-all ${lang === l ? 'bg-zenith-orange text-white shadow-lg shadow-zenith-orange/20' : 'text-zenith-charcoal/40 hover:text-zenith-charcoal'}`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>

                        <Link 
                            href="/cart" 
                            onClick={() => logAnalytic('Menu', 'Klik Keranjang')}
                            className={`relative h-12 w-12 flex items-center justify-center rounded-full transition-all shadow-lg shadow-zenith-orange/5 group ${currentPath === '/cart' ? 'bg-zenith-orange text-white' : 'bg-zenith-orange/10 text-zenith-orange hover:bg-zenith-orange hover:text-white'}`}
                        >
                            <span className="material-symbols-outlined">shopping_bag</span>
                            {cartCount > 0 && (
                                <span className={`absolute -top-1 -right-1 h-5 w-5 text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-md ${currentPath === '/cart' ? 'bg-zenith-gold text-zenith-charcoal' : 'bg-zenith-gold text-zenith-charcoal'}`}>
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Mobile Navbar Layout */}
                <div className={`md:hidden flex items-center justify-between px-6 transition-all duration-700 border rounded-full ${isSolid
                    ? 'h-14 bg-white/80 backdrop-blur-xl border-zenith-orange/10 shadow-xl'
                    : 'h-16 bg-white/5 backdrop-blur-md border-white/10'
                    }`}>
                    <div className="flex bg-zenith-charcoal/5 rounded-full p-0.5 border border-zenith-charcoal/10">
                        {['ID', 'EN'].map((l) => (
                            <button
                                key={l}
                                onClick={() => {
                                    setLang(l);
                                    localStorage.setItem('app_lang', l);
                                }}
                                className={`px-2 py-1 rounded-full text-[7px] font-bold transition-all ${lang === l ? 'bg-zenith-orange text-white' : 'text-zenith-charcoal/40'}`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>

                    <Link href="/" className="flex items-center">
                        <img src="/images/Jemari Logo - 1.png" alt="Jemari Spa" className={`h-8 w-auto transition-all duration-500 ${isSolid ? 'brightness-100' : 'brightness-0 invert'}`} />
                    </Link>

                    <div className="flex items-center gap-x-2">
                        <div className="relative">
                            <button 
                                onClick={() => setShowServices(!showServices)}
                                className={`h-10 w-10 flex items-center justify-center rounded-full active:scale-90 transition-all ${showServices ? 'bg-zenith-orange text-white' : 'bg-zenith-orange/10 text-zenith-orange'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">spa</span>
                            </button>
                            
                            {/* Mobile Services Dropdown */}
                            <div className={`absolute top-full right-0 mt-4 transition-all duration-300 z-50 ${showServices ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                                <div className="bg-white rounded-2xl shadow-2xl border-t-4 border-t-zenith-gold border border-zenith-orange/10 p-3 min-w-[200px]">
                                    {services.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => {
                                                logAnalytic('Layanan Mobile', `Pilih ${s}`);
                                                if (window.location.pathname === '/') {
                                                    setActiveService(s);
                                                } else {
                                                    window.location.href = '/';
                                                    localStorage.setItem('pending_service', s);
                                                }
                                                setShowServices(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-between group ${activeService === s ? 'bg-zenith-orange/5 text-zenith-orange' : 'text-zenith-charcoal/60 hover:text-zenith-orange hover:bg-zenith-orange/5'}`}
                                        >
                                            {sLabel[s]}
                                            <span className={`material-symbols-outlined text-[14px] transition-opacity ${activeService === s ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>arrow_forward</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Link 
                            href="/cart" 
                            onClick={() => logAnalytic('Menu', 'Klik Keranjang (Mobile)')}
                            className={`relative h-10 w-10 flex items-center justify-center rounded-full active:scale-90 transition-all ${currentPath === '/cart' ? 'bg-zenith-orange text-white' : 'bg-zenith-orange/10 text-zenith-orange'}`}
                        >
                            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-zenith-gold text-zenith-charcoal text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
