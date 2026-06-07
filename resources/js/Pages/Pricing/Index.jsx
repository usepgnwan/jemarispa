import { useState, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import Footer from '@/Components/Landing/Footer';
import MobileNav from '@/Components/Landing/MobileNav';
import Hero from '@/Components/Landing/Hero';

const translations = {
    'ID': {
        metaTitle: 'Harga & Paket Pijat Panggilan Bandung Cimahi - Jemari Spa',
        metaDesc: 'Lihat daftar harga layanan pijat tradisional, bekam, totok wajah, dan refleksi panggilan di Bandung. Investasi kesehatan terbaik di rumah Anda.',
        badge: 'Menu Lengkap',
        title: 'Daftar Harga & Paket',
        desc: 'Temukan berbagai pilihan layanan spa profesional untuk kebugaran maksimal Anda.',
        investment: 'Harga',
        selectDuration: 'Pilih Durasi',
        pkgName: 'Nama Paket',
        duration: 'Durasi',
        price: 'Harga',
        toastAdd: 'Berhasil menambahkan {name} ke keranjang!',
        loading: 'Memuat paket...',
        noData: 'Belum ada paket tersedia.',
        selected: 'Selected',
        minute: 'Menit',
        filterLabel: 'Filter',
        clearLabel: 'Hapus'
    },
    'EN': {
        metaTitle: 'Pricing & Packages Home Service Massage Bandung - Jemari Spa',
        metaDesc: 'Full price list for professional home service massage, cupping, and reflexology in Bandung. Your best wellness investment at home.',
        badge: 'Complete Menu',
        title: 'Pricelist & Packages',
        desc: 'Discover our full range of professional home spa treatments designed for your ultimate wellness.',
        investment: 'Price',
        selectDuration: 'Select Duration',
        pkgName: 'Package Name',
        duration: 'Duration',
        price: 'Price',
        toastAdd: 'Successfully added {name} to cart!',
        loading: 'Loading packages...',
        noData: 'No packages available yet.',
        selected: 'Selected',
        minute: 'Minutes',
        filterLabel: 'Filter',
        clearLabel: 'Clear'
    }
};

export default function Index({ auth, packages = [], signaturePackages = [], initialSlug = null }) {
    const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ID');
    const [activeService, setActiveService] = useState(() => localStorage.getItem('active_service') || 'Default');
    const [selectedDurations, setSelectedDurations] = useState({}); // { packageId: durationIndex }
    const [toast, setToast] = useState({ show: false, message: '' });
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const checkSelection = () => {
            const savedCart = JSON.parse(localStorage.getItem('spa_cart') || '[]');
            const savedGuests = JSON.parse(localStorage.getItem('jemari_checkout_guests') || '[]');
            const selectedIds = new Set();
            savedCart.forEach(item => selectedIds.add(item.id.split('-')[0]));
            savedGuests.forEach(guest => (guest.packages || []).forEach(p => { if (p.id) selectedIds.add(String(p.id)); }));
            setCartItems(Array.from(selectedIds));
        };

        const syncService = () => {
            const currentService = localStorage.getItem('active_service') || 'Default';
            setActiveService(currentService);
        };

        checkSelection();
        syncService();

        if (initialSlug && signaturePackages.length > 0) {
            const matchingService = signaturePackages.find(s => 
                (s.title_id && s.title_id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') === initialSlug) ||
                (s.title_en && s.title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') === initialSlug)
            );
            if (matchingService) {
                setActiveService(matchingService.title_id);
                localStorage.setItem('active_service', matchingService.title_id);
            }
        }

        window.addEventListener('cart-updated', checkSelection);
        window.addEventListener('storage', syncService);
        
        // Listen for custom event if Navbar uses it
        window.addEventListener('active-service-updated', syncService);

        return () => {
            window.removeEventListener('cart-updated', checkSelection);
            window.removeEventListener('storage', syncService);
            window.removeEventListener('active-service-updated', syncService);
        };
    }, []);

    // Also update setActiveService to sync with localStorage
    const handleSetActiveService = (service) => {
        setActiveService(service);
        localStorage.setItem('active_service', service);
        window.dispatchEvent(new Event('active-service-updated'));
    };

    // Filter packages based on activeService
    const filteredPackages = useMemo(() => {
        if (!activeService || activeService === 'Default') return packages;
        
        // Find matching signature package by title
        const matchingSignature = signaturePackages.find(s => 
            s.title_id.toLowerCase() === activeService.toLowerCase() ||
            (s.title_en && s.title_en.toLowerCase() === activeService.toLowerCase())
        );

        const search = activeService.toLowerCase();
        
        return packages.filter(pkg => {
            // If we found a matching Signature Ritual (Main Service), 
            // filter EXCLUSIVELY by parent_id for maximum precision.
            if (matchingSignature) {
                return String(pkg.parent_id) === String(matchingSignature.id);
            }

            // Fallback: If chosen service isn't a Signature Ritual (e.g. from a text search or legacy link),
            // use the title/category LIKE search.
            const catId = (pkg.category_id || '').toLowerCase();
            const catEn = (pkg.category_en || '').toLowerCase();
            const titleId = (pkg.title_id || '').toLowerCase();
            const titleEn = (pkg.title_en || '').toLowerCase();
            
            return catId.includes(search) || 
                   catEn.includes(search) || 
                   titleId.includes(search) || 
                   titleEn.includes(search);
        });
    }, [packages, activeService, signaturePackages]);

    // Get reactive display name for the active service
    const displayService = useMemo(() => {
        if (!activeService || activeService === 'Default') return '';
        
        const matchingSignature = signaturePackages.find(s => 
            s.title_id.toLowerCase() === activeService.toLowerCase() ||
            (s.title_en && s.title_en.toLowerCase() === activeService.toLowerCase())
        );

        if (matchingSignature) {
            return lang === 'EN' ? (matchingSignature.title_en || matchingSignature.title_id) : matchingSignature.title_id;
        }

        return activeService;
    }, [activeService, signaturePackages, lang]);

    const t = translations[lang];

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const handleDurationChange = (packageId, durationIndex) => {
        setSelectedDurations(prev => ({
            ...prev,
            [packageId]: parseInt(durationIndex)
        }));
    };

    const formatDuration = (d) => {
        if (!d) return '';
        const durationStr = String(d);
        // Clean any existing duration labels to ensure reactivity
        const numericPart = durationStr.replace(/(menit|minutes|mins|min)/gi, '').trim();
        return `${numericPart} ${t.minute}`;
    };

    const addToCart = (pkg) => {
        const durationIndex = selectedDurations[pkg.id] || 0;
        const durationItem = pkg.durations[durationIndex];

        const title = lang === 'EN' ? (pkg.title_en || pkg.title_id) : pkg.title_id;
        const category = lang === 'EN' ? (pkg.category_en || pkg.category_id) : pkg.category_id;

        const savedCart = JSON.parse(localStorage.getItem('spa_cart') || '[]');
        const savedGuests = JSON.parse(localStorage.getItem('jemari_checkout_guests') || '[]');
        const isPackageSelected =
            savedCart.some(item => item.id.split('-')[0] === String(pkg.id)) ||
            savedGuests.some(guest => (guest.packages || []).some(p => String(p.id) === String(pkg.id)));

        if (isPackageSelected) {
            router.visit('/cart');
            return;
        }

        const service = {
            id: `${pkg.id}-${durationItem.duration}`,
            name: `${title} ${formatDuration(durationItem.duration)}`,
            price: parseFloat(durationItem.price),
            duration: durationItem.duration,
            category: category
        };

        const newCart = [...savedCart, service];
        localStorage.setItem('spa_cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cart-updated'));
        router.visit('/cart');
    };

    return (
        <div className="font-sans text-zenith-charcoal antialiased bg-zenith-surface">
            <Head>
                <title>{t.metaTitle}</title>
                <meta name="description" content={t.metaDesc} />
                <meta property="og:title" content={t.metaTitle} />
                <meta property="og:description" content={t.metaDesc} />
                <meta name="keywords" content="harga pijat panggilan bandung, pricelist jemari spa, biaya bekam bandung, paket spa rumah bandung" />
            </Head>

            <Navbar 
                auth={auth} 
                lang={lang} 
                setLang={setLang} 
                forceSolid={activeService === 'Default'} 
                signaturePackages={signaturePackages} 
                activeService={activeService} 
                setActiveService={handleSetActiveService}
            />

            {activeService !== 'Default' && (
                <Hero activeService={activeService} lang={lang} hideButtonsAndStats={true} />
            )}

            <main className={activeService !== 'Default' ? "pb-20 px-6 -mt-40 md:-mt-64 lg:-mt-80 relative z-20" : "pt-32 md:pt-40 pb-20 px-6"}>
                <div className="max-w-5xl mx-auto">
                    {activeService === 'Default' && (
                        <div className="text-center mb-12 md:mb-16">
                            <span className="text-zenith-orange font-bold tracking-[0.3em] uppercase text-[8px] md:text-[10px] mb-3 md:mb-4 block">{t.badge}</span>
                            <h1 className="text-3xl md:text-6xl font-bold text-zenith-charcoal mb-4 md:mb-6 leading-tight">{t.title}</h1>
                            <p className="text-zenith-charcoal/60 text-xs md:text-sm max-w-md mx-auto px-4 md:px-0 leading-relaxed">{t.desc}</p>
                        </div>
                    )}

                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-zenith-orange/5 overflow-hidden border border-zenith-orange/5">
                        {activeService !== 'Default' && (
                            <div className="bg-zenith-orange/5 px-6 md:px-10 py-5 flex items-center justify-between border-b border-zenith-orange/10">
                                <span className="text-zenith-orange text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm md:text-base">filter_list</span>
                                    {t.filterLabel}: {displayService}
                                </span>
                                <button 
                                    onClick={() => handleSetActiveService('Default')}
                                    className="text-[10px] font-bold text-gray-500 hover:text-white transition-all uppercase tracking-widest flex items-center gap-1 bg-white hover:bg-zenith-orange px-4 py-2 rounded-full shadow-sm border border-gray-100"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                    {t.clearLabel}
                                </button>
                            </div>
                        )}
                        <div className="divide-y divide-zenith-orange/5">
                            {/* Table Header */}
                            <div className="hidden md:flex items-center px-8 md:px-10 py-4 bg-zenith-surface/30">
                                <span className="flex-1 text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest">{t.pkgName}</span>
                                <span className="w-48 text-center text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest">{t.duration}</span>
                                <span className="w-40 text-right text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest pr-20">{t.price}</span>
                            </div>

                            {filteredPackages.length > 0 ? (
                                filteredPackages.map((pkg) => {
                                    const durationIndex = selectedDurations[pkg.id] || 0;
                                    const currentDuration = pkg.durations[durationIndex] || { duration: '-', price: 0 };

                                    const primaryTitle = lang === 'EN' ? (pkg.title_en || pkg.title_id) : pkg.title_id;
                                    const secondaryTitle = lang === 'EN' ? pkg.title_id : pkg.title_en;
                                    const category = lang === 'EN' ? (pkg.category_en || pkg.category_id) : pkg.category_id;
                                    const description = lang === 'EN' ? (pkg.description_en || pkg.description_id) : pkg.description_id;

                                    return (
                                        <div key={pkg.id} className="p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 hover:bg-zenith-orange/[0.02] transition-colors group">
                                            <div className="flex-1 w-full text-left">
                                                <span className="px-3 py-1 rounded-full bg-zenith-dim/10 text-[8px] font-bold text-zenith-charcoal/60 uppercase tracking-wider mb-4 inline-block">
                                                    {category || 'Package'}
                                                </span>
                                                <div className="mb-4">
                                                    <h3 className="text-xl md:text-2xl font-bold text-zenith-charcoal group-hover:text-zenith-orange transition-colors">
                                                        {primaryTitle}
                                                    </h3>
                                                    {/* {secondaryTitle && (
                                                        <p className="text-sm md:text-base text-gray-400 font-medium">
                                                            {secondaryTitle}
                                                        </p>
                                                    )} */}
                                                </div>

                                                {description && (
                                                    <div
                                                        className="text-xs md:text-sm text-gray-500 leading-relaxed max-w-2xl prose prose-sm prose-zenith"
                                                        dangerouslySetInnerHTML={{ __html: description }}
                                                    />
                                                )}
                                            </div>

                                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-x-12 w-full md:w-auto">
                                                {/* Duration Selection */}
                                                <div className="w-full md:w-32">
                                                    <p className="text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-[0.2em] mb-2">{t.selectDuration}</p>
                                                    {pkg.durations && pkg.durations.length > 1 ? (
                                                        <div className="relative">
                                                            <select
                                                                className="w-full bg-zenith-surface border border-zenith-orange/10 rounded-xl px-4 py-3 text-[10px] font-bold text-zenith-charcoal focus:ring-1 focus:ring-zenith-orange appearance-none cursor-pointer"
                                                                value={durationIndex}
                                                                onChange={(e) => handleDurationChange(pkg.id, e.target.value)}
                                                            >
                                                                {pkg.durations.map((d, i) => (
                                                                    <option key={d.id} value={i}>
                                                                        {formatDuration(d.duration)}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zenith-orange pointer-events-none">expand_more</span>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-zenith-orange/5 border border-zenith-orange/10 rounded-xl px-4 py-3">
                                                            <span className="text-[10px] font-bold text-zenith-orange uppercase tracking-wider">
                                                                {formatDuration(currentDuration.duration)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Price Display */}
                                                <div className="text-left md:text-right md:min-w-[140px]">
                                                    <p className="text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-[0.2em] mb-1">{t.investment}</p>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-xs font-bold text-zenith-charcoal/40">Rp</span>
                                                        <span className="text-2xl md:text-3xl font-bold text-zenith-charcoal">
                                                            {parseFloat(currentDuration.price).toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Add Button */}
                                                <button
                                                    onClick={() => addToCart(pkg)}
                                                    className={`w-full md:w-auto h-14 md:h-12 flex items-center justify-center px-8 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] ${cartItems.includes(String(pkg.id))
                                                        ? 'bg-zenith-orange text-white shadow-xl shadow-zenith-orange/30'
                                                        : 'bg-white text-zenith-orange border border-zenith-orange/20 hover:bg-zenith-orange hover:text-white shadow-sm'
                                                        }`}
                                                >
                                                    <span className="material-symbols-outlined text-sm mr-2">
                                                        {cartItems.includes(String(pkg.id)) ? 'check_circle' : 'add_shopping_cart'}
                                                    </span>
                                                    {cartItems.includes(String(pkg.id)) ? (lang === 'EN' ? 'Added' : 'Terpilih') : (lang === 'EN' ? 'Add' : 'Pesan')}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-20 text-center text-zenith-charcoal/40 font-bold uppercase tracking-[0.2em] text-xs">
                                    {t.noData}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-10 right-10 z-[110] animate-slide-up">
                    <div className="bg-zenith-charcoal text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-x-4 border border-white/10">
                        <span className="material-symbols-outlined text-zenith-orange">check_circle</span>
                        <p className="text-[10px] font-bold uppercase tracking-widest">{toast.message}</p>
                    </div>
                </div>
            )}

            <Footer lang={lang} setLang={setLang} />
            <MobileNav lang={lang} setActiveService={handleSetActiveService} />
        </div>
    );
}
