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
        clearLabel: 'Hapus',
        bookBtn: 'Pesan Paket'
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
        clearLabel: 'Clear',
        bookBtn: 'Book This Package'
    }
};

export default function Index({ auth, packages = [], signaturePackages = [], initialSlug = null, currentPackage = null, meta = null }) {
    const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ID');
    const [activeService, setActiveService] = useState(() => {
        if (currentPackage) {
            return currentPackage.title_id;
        }
        if (initialSlug) {
            return 'Default';
        }
        return 'Default';
    });
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

        if (initialSlug && (signaturePackages.length > 0 || packages.length > 0)) {
            const allKnown = [...signaturePackages, ...packages];
            const matchingService = allKnown.find(s =>
                (s.title_id && s.title_id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') === initialSlug) ||
                (s.title_en && s.title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') === initialSlug)
            );
            if (matchingService) {
                const targetService = matchingService.is_signature
                    ? matchingService.title_id
                    : (signaturePackages.find(sp => sp.id === matchingService.parent_id)?.title_id || matchingService.title_id);

                setActiveService(targetService);
                localStorage.setItem('active_service', targetService);
            }
        } else {
            // When accessing /treatment without a slug, always reset active filter to Default
            setActiveService('Default');
            localStorage.setItem('active_service', 'Default');
            window.dispatchEvent(new Event('active-service-updated'));
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
    }, [initialSlug, signaturePackages, packages]);

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

    // Compute dynamic meta title and description reactively
    const pageMeta = useMemo(() => {
        if (activeService && activeService !== 'Default') {
            const sName = displayService || activeService;
            const matchSig = signaturePackages.find(s =>
                s.title_id.toLowerCase() === activeService.toLowerCase() ||
                (s.title_en && s.title_en.toLowerCase() === activeService.toLowerCase())
            );
            const title = lang === 'EN'
                ? `Price & Packages ${sName} - Jemari Home Spa Bandung`
                : `Harga ${sName} - Jemari Home Spa Bandung`;

            let desc = '';
            if (matchSig) {
                desc = lang === 'EN'
                    ? (matchSig.description_en || matchSig.description_id)
                    : matchSig.description_id;
                if (desc) desc = desc.replace(/<[^>]*>?/gm, '').trim();
            }

            if (!desc) {
                desc = lang === 'EN'
                    ? `Professional on-call ${sName} services in Bandung & Cimahi by Jemari Home Spa.`
                    : `Daftar harga & info layanan ${sName} panggilan profesional di Bandung & Cimahi oleh Jemari Home Spa.`;
            }

            return {
                title,
                description: desc
            };
        }

        // If backend provided meta for a specific slug and matches current page
        if (meta?.title) {
            return {
                title: meta.title,
                description: meta.description || t.metaDesc
            };
        }

        return {
            title: t.metaTitle,
            description: t.metaDesc
        };
    }, [activeService, displayService, lang, meta, signaturePackages, t]);

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
                <title>{pageMeta.title}</title>
                <meta name="description" content={pageMeta.description} />
                <meta property="og:title" content={pageMeta.title} />
                <meta property="og:description" content={pageMeta.description} />
                <meta name="keywords" content="harga pijat panggilan bandung, pricelist jemari home spa, biaya bekam bandung, paket spa rumah bandung" />
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
                <Hero 
                    activeService={activeService} 
                    lang={lang} 
                    hideButtonsAndStats={true} 
                    signaturePackages={signaturePackages}
                    titlePrefix={lang === 'EN' ? 'Price & Packages ' : 'Harga '}
                />
            )}

            <main className={activeService !== 'Default' ? "pb-20 px-6 -mt-20 md:-mt-32 lg:-mt-48 relative z-20" : "pt-32 md:pt-40 pb-20 px-6"}>
                <div className="max-w-7xl mx-auto">
                    {activeService === 'Default' && (
                        <div className="text-center mb-12 md:mb-16">
                            <span className="text-zenith-orange font-bold tracking-[0.3em] uppercase text-[8px] md:text-[10px] mb-3 md:mb-4 block">{t.badge}</span>
                            <h1 className="text-3xl md:text-6xl font-bold text-zenith-charcoal mb-4 md:mb-6 leading-tight">{t.title}</h1>
                            <p className="text-zenith-charcoal/60 text-xs md:text-sm max-w-md mx-auto px-4 md:px-0 leading-relaxed">{t.desc}</p>
                        </div>
                    )}

                    {activeService !== 'Default' && (
                        <div className="flex items-center justify-center gap-4 mb-8 md:mb-12">
                            <span className="px-4 py-2 rounded-full bg-zenith-orange/10 text-zenith-orange text-[10px] font-bold uppercase tracking-widest border border-zenith-orange/20">
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

                    {/* Mobile View: 2-Row Slider */}
                    <div className="md:hidden flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory scrollbar-hide no-scrollbar">
                        {(() => {
                            const pairs = [];
                            for (let i = 0; i < filteredPackages.length; i += 2) {
                                pairs.push(filteredPackages.slice(i, i + 2));
                            }
                            return pairs.map((pair, pIdx) => (
                                <div key={pIdx} className="flex flex-col gap-4 w-[85%] shrink-0 snap-center">
                                    {pair.map((pkg, idx) => {
                                        const durationIndex = selectedDurations[pkg.id] || 0;
                                        const currentVariant = pkg.durations[durationIndex] || { duration: '-', price: 0 };
                                        const title = lang === 'EN' ? (pkg.title_en || pkg.title_id) : pkg.title_id;
                                        const category = lang === 'EN' ? (pkg.category_en || pkg.category_id) : pkg.category_id;
                                        const description = lang === 'EN' ? (pkg.description_en || pkg.description_id) : pkg.description_id;

                                        return (
                                            <div
                                                key={pkg.id}
                                                className="snap-center shrink-0 w-full rounded-[2rem] p-5 transition-all duration-700 flex flex-col bg-white/50 border border-white hover:bg-white hover:shadow-xl"
                                            >
                                                <h3 className="text-[7px] font-bold uppercase tracking-[0.2em] text-zenith-orange mb-3">{category || (lang === 'EN' ? 'Package' : 'Paket')}</h3>

                                                <div className="mb-4">
                                                    <div className="flex items-baseline gap-1 mb-1">
                                                        <span className="text-[10px] font-bold text-gray-400">Rp</span>
                                                        <span className="text-3xl font-bold text-zenith-charcoal transition-all">
                                                            {(parseFloat(currentVariant.price) / 1000).toFixed(0)}k
                                                        </span>
                                                    </div>

                                                    <div className="mt-2">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[7px] font-bold text-zenith-charcoal/40 uppercase tracking-widest">
                                                                {t.selectDuration}:
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2">
                                                            {pkg.durations && pkg.durations.length > 0 ? (
                                                                pkg.durations.map((v, i) => {
                                                                    const isSelected = durationIndex === i;
                                                                    return (
                                                                        <button
                                                                            key={v.id || i}
                                                                            type="button"
                                                                            onClick={() => handleDurationChange(pkg.id, i)}
                                                                            className={`flex-1 min-w-[80px] p-2 rounded-xl border text-left transition-all duration-300 relative cursor-pointer group ${isSelected
                                                                                ? 'bg-zenith-orange/10 border-zenith-orange shadow-sm ring-1 ring-zenith-orange/30 -translate-y-0.5'
                                                                                : 'bg-white/70 border-gray-200/80 hover:border-zenith-orange/40 hover:bg-white text-gray-600'
                                                                                }`}
                                                                        >
                                                                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                                                                <span className={`text-[8px] font-bold uppercase tracking-wider ${isSelected ? 'text-zenith-orange' : 'text-gray-500 group-hover:text-zenith-charcoal'}`}>
                                                                                    {formatDuration(v.duration)}
                                                                                </span>
                                                                                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${isSelected
                                                                                    ? 'bg-zenith-orange border-zenith-orange text-white shadow-xs'
                                                                                    : 'border-gray-300 bg-white group-hover:border-zenith-orange/50'
                                                                                    }`}>
                                                                                    {isSelected && (
                                                                                        <span className="material-symbols-outlined text-[9px] font-bold leading-none">check</span>
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                            {v.description && (
                                                                                <p className="mt-0.5 text-[8px] text-gray-400 italic line-clamp-1">
                                                                                    *{v.description}
                                                                                </p>
                                                                            )}
                                                                        </button>
                                                                    );
                                                                })
                                                            ) : (
                                                                <span className="text-[8px] font-bold text-zenith-charcoal/60 uppercase tracking-widest">
                                                                    {formatDuration(currentVariant.duration)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <h4 className="text-sm text-zenith-charcoal mb-2 truncate">{title}</h4>

                                                <div
                                                    className="text-[10px] text-gray-500 mb-6 font-sans leading-relaxed flex-1 line-clamp-3 overflow-hidden"
                                                    dangerouslySetInnerHTML={{ __html: description }}
                                                />

                                                <button
                                                    onClick={() => addToCart(pkg)}
                                                    className={`w-full py-3 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${cartItems.includes(String(pkg.id))
                                                        ? 'bg-zenith-orange text-white shadow-xl shadow-zenith-orange/40 hover:-translate-y-1'
                                                        : 'bg-zenith-dim/20 text-zenith-charcoal hover:bg-zenith-orange hover:text-white shadow-lg'
                                                        }`}>
                                                    {cartItems.includes(String(pkg.id)) ? (lang === 'EN' ? 'Selected' : 'Terpilih') : t.bookBtn}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ));
                        })()}
                    </div>

                    {/* Desktop View: Grid */}
                    <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-12 items-stretch">
                        {filteredPackages.length > 0 ? (
                            filteredPackages.map((pkg, index) => {
                                const durationIndex = selectedDurations[pkg.id] || 0;
                                const currentVariant = pkg.durations[durationIndex] || { duration: '-', price: 0 };
                                const title = lang === 'EN' ? (pkg.title_en || pkg.title_id) : pkg.title_id;
                                const category = lang === 'EN' ? (pkg.category_en || pkg.category_id) : pkg.category_id;
                                const description = lang === 'EN' ? (pkg.description_en || pkg.description_id) : pkg.description_id;
                                const isFeatured = index === 1;

                                return (
                                    <div
                                        key={pkg.id}
                                        className={`rounded-[3rem] p-10 transition-all duration-700 flex flex-col ${isFeatured
                                            ? 'bg-white shadow-[0_32px_64px_-16px_rgba(244,124,81,0.1)] border border-zenith-orange/10 lg:scale-105 z-10'
                                            : 'bg-white/50 border border-white hover:bg-white hover:shadow-xl'
                                            }`}
                                    >
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zenith-orange mb-8">{category || (lang === 'EN' ? 'Package' : 'Paket')}</h3>

                                        <div className="mb-6">
                                            <div className="flex items-baseline gap-1 mb-2">
                                                <span className="text-sm font-bold text-gray-400">Rp</span>
                                                <span className="text-5xl lg:text-6xl font-bold text-zenith-charcoal transition-all">
                                                    {(parseFloat(currentVariant.price) / 1000).toFixed(0)}k
                                                </span>
                                            </div>

                                            <div className="mt-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[9px] font-bold text-zenith-charcoal/40 uppercase tracking-widest">
                                                        {t.selectDuration}:
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {pkg.durations && pkg.durations.length > 0 ? (
                                                        pkg.durations.map((v, i) => {
                                                            const isSelected = durationIndex === i;
                                                            return (
                                                                <button
                                                                    key={v.id || i}
                                                                    type="button"
                                                                    onClick={() => handleDurationChange(pkg.id, i)}
                                                                    className={`flex-1 min-w-[80px] p-2.5 rounded-2xl border text-left transition-all duration-300 relative cursor-pointer group ${isSelected
                                                                        ? 'bg-zenith-orange/10 border-zenith-orange shadow-sm ring-2 ring-zenith-orange/30 -translate-y-0.5'
                                                                        : 'bg-white/70 border-gray-200/80 hover:border-zenith-orange/40 hover:bg-white text-gray-600'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center justify-between gap-1 mb-0.5">
                                                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-zenith-orange' : 'text-gray-500 group-hover:text-zenith-charcoal'}`}>
                                                                            {formatDuration(v.duration)}
                                                                        </span>
                                                                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${isSelected
                                                                            ? 'bg-zenith-orange border-zenith-orange text-white shadow-xs'
                                                                            : 'border-gray-300 bg-white group-hover:border-zenith-orange/50'
                                                                            }`}>
                                                                            {isSelected && (
                                                                                <span className="material-symbols-outlined text-[10px] font-bold leading-none">check</span>
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    {v.description && (
                                                                        <p className="mt-0.5 text-[8px] text-gray-400 italic line-clamp-1">
                                                                            *{v.description}
                                                                        </p>
                                                                    )}
                                                                </button>
                                                            );
                                                        })
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-zenith-charcoal/60 uppercase tracking-widest">
                                                            {formatDuration(currentVariant.duration)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <h4 className="text-xl text-zenith-charcoal mb-4 truncate">{title}</h4>

                                        <div
                                            className="text-xs text-gray-500 mb-10 font-sans leading-relaxed flex-1 line-clamp-4 overflow-hidden"
                                            dangerouslySetInnerHTML={{ __html: description }}
                                        />

                                        <button
                                            onClick={() => addToCart(pkg)}
                                            className={`w-full py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${cartItems.includes(String(pkg.id))
                                                ? 'bg-zenith-orange text-white shadow-xl shadow-zenith-orange/40 hover:-translate-y-1'
                                                : isFeatured
                                                    ? 'bg-zenith-orange text-white shadow-xl shadow-zenith-orange/40 hover:bg-zenith-charcoal hover:-translate-y-1'
                                                    : 'bg-zenith-dim/20 text-zenith-charcoal hover:bg-zenith-orange hover:text-white shadow-lg'
                                                }`}>
                                            {cartItems.includes(String(pkg.id)) ? (lang === 'EN' ? 'Selected' : 'Terpilih') : t.bookBtn}
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full p-20 text-center text-zenith-charcoal/40 font-bold uppercase tracking-[0.2em] text-xs">
                                {t.noData}
                            </div>
                        )}
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
