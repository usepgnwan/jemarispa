import { Link, router } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';

const translations = {
    'ID': {
        tagline: 'Invitations',
        title: 'Select Your Journey',
        durationLabel: 'Durasi:',
        bookBtn: 'Pesan Paket',
        seeAll: 'Lihat Semua Paket',
        minute: 'Menit',
        toastAdd: '{name} berhasil ditambahkan!',
        selected: 'Selected'
    },
    'EN': {
        tagline: 'Invitations',
        title: 'Select Your Journey',
        durationLabel: 'Duration:',
        bookBtn: 'Book This Path',
        seeAll: 'See All Packages',
        minute: 'Minutes',
        toastAdd: '{name} added successfully!',
        selected: 'Selected'
    }
};

export default function Pricing({ packages = [], lang = 'ID' }) {
    const [selectedDurations, setSelectedDurations] = useState({}); // { packageId: durationIndex }
    const [toast, setToast] = useState({ show: false, message: '' });
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const checkSelection = () => {
            const savedCart = JSON.parse(localStorage.getItem('spa_cart') || '[]');
            const savedGuests = JSON.parse(localStorage.getItem('jemari_checkout_guests') || '[]');
            
            // Collect all unique package IDs from both storages
            const selectedIds = new Set();
            
            // From landing page cart
            savedCart.forEach(item => {
                const baseId = item.id.split('-')[0];
                selectedIds.add(baseId);
            });
            
            // From all guests in checkout
            savedGuests.forEach(guest => {
                (guest.packages || []).forEach(p => {
                    if (p.id) selectedIds.add(String(p.id));
                });
            });
            
            setCartItems(Array.from(selectedIds));
        };

        checkSelection();
        window.addEventListener('cart-updated', checkSelection);
        return () => window.removeEventListener('cart-updated', checkSelection);
    }, []);

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
        const durationStr = String(d);
        if (durationStr.toLowerCase().includes('menit') || durationStr.toLowerCase().includes('min')) {
            return durationStr;
        }
        return `${durationStr} ${t.minute}`;
    };

    const addToCart = (pkg) => {
        const durationIndex = selectedDurations[pkg.id] || 0;
        const variant = pkg.durations[durationIndex];
        
        const title = lang === 'EN' ? (pkg.title_en || pkg.title_id) : pkg.title_id;
        const category = lang === 'EN' ? (pkg.category_en || pkg.category_id) : pkg.category_id;
        
        const savedCart = JSON.parse(localStorage.getItem('spa_cart') || '[]');
        const savedGuests = JSON.parse(localStorage.getItem('jemari_checkout_guests') || '[]');
        const itemId = `${pkg.id}-${variant.duration}`;

        // Check if ANY variant of this package is selected for ANY person
        const isPackageSelected = 
            savedCart.some(item => item.id.split('-')[0] === String(pkg.id)) || 
            savedGuests.some(guest => (guest.packages || []).some(p => String(p.id) === String(pkg.id)));

        // If already selected, just go to cart
        if (isPackageSelected) {
            router.visit('/cart');
            return;
        }

        const newItem = {
            id: itemId,
            name: `${title} ${variant.duration}`,
            price: parseFloat(variant.price),
            duration: variant.duration,
            category: category || 'Package'
        };
        
        const newCart = [...savedCart, newItem];
        localStorage.setItem('spa_cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cart-updated'));
        
        // Redirect immediately as requested
        router.visit('/cart');
    };

    // Chunks packages into pairs for the mobile 2-row layout
    const packagePairs = useMemo(() => {
        const pairs = [];
        for (let i = 0; i < packages.length; i += 2) {
            pairs.push(packages.slice(i, i + 2));
        }
        return pairs;
    }, [packages]);

    const renderCard = (pkg, index, isMobile = false) => {
        const durationIndex = selectedDurations[pkg.id] || 0;
        const currentVariant = pkg.durations[durationIndex] || { duration: '-', price: 0 };
        
        const title = lang === 'EN' ? (pkg.title_en || pkg.title_id) : pkg.title_id;
        const category = lang === 'EN' ? (pkg.category_en || pkg.category_id) : pkg.category_id;
        const description = lang === 'EN' ? (pkg.description_en || pkg.description_id) : pkg.description_id;

        // Featured styling for visual variety (only on desktop or specific index)
        const isFeatured = !isMobile && index === 1;

        return (
            <div 
                key={pkg.id}
                className={`snap-center shrink-0 w-full md:w-auto rounded-[2rem] md:rounded-[3rem] p-5 md:p-10 transition-all duration-700 flex flex-col ${
                    isFeatured 
                        ? 'bg-white shadow-[0_32px_64px_-16px_rgba(244,124,81,0.1)] border border-zenith-orange/10 lg:scale-105 z-10' 
                        : 'bg-white/50 border border-white hover:bg-white hover:shadow-xl'
                }`}
            >
                <h3 className="text-[7px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-zenith-orange mb-3 md:mb-8">{category || (lang === 'EN' ? 'Package' : 'Paket')}</h3>
                
                <div className="mb-4 md:mb-6">
                    <div className="flex items-baseline gap-1 mb-1 md:mb-3">
                        <span className="text-[10px] md:text-sm font-bold text-gray-400">Rp</span>
                        <span className="text-3xl md:text-5xl lg:text-6xl font-serif italic text-zenith-charcoal">
                            {(parseFloat(currentVariant.price) / 1000).toFixed(0)}k
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-x-2 mt-1 md:mt-2">
                        <span className="text-[7px] md:text-[10px] font-bold text-zenith-charcoal/30 uppercase tracking-widest">{t.durationLabel}</span>
                        {pkg.durations?.length > 1 ? (
                            <select 
                                className="bg-zenith-surface border-none rounded-lg px-2 py-1 md:px-3 md:py-1.5 text-[8px] md:text-[10px] font-bold text-zenith-charcoal focus:ring-1 focus:ring-zenith-orange appearance-none cursor-pointer"
                                value={durationIndex}
                                onChange={(e) => handleDurationChange(pkg.id, e.target.value)}
                            >
                                {pkg.durations.map((v, i) => (
                                    <option key={i} value={i}>{formatDuration(v.duration)}</option>
                                ))}
                            </select>
                        ) : (
                            <span className="text-[8px] md:text-[10px] font-bold text-zenith-charcoal/60 uppercase tracking-widest">
                                {formatDuration(currentVariant.duration)}
                            </span>
                        )}
                    </div>
                </div>

                <h4 className="text-sm md:text-xl font-serif italic text-zenith-charcoal mb-2 md:mb-4 truncate">{title}</h4>
                
                <div 
                    className="text-[10px] md:text-xs text-gray-500 mb-6 md:mb-10 font-sans leading-relaxed flex-1 line-clamp-3 md:line-clamp-4 overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: description }}
                />
                
                <button 
                    onClick={() => addToCart(pkg)}
                    className={`w-full py-3 md:py-5 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${
                    cartItems.includes(String(pkg.id))
                        ? 'bg-zenith-orange text-white shadow-xl shadow-zenith-orange/40 hover:-translate-y-1'
                        : isFeatured
                            ? 'bg-zenith-orange text-white shadow-xl shadow-zenith-orange/40 hover:bg-zenith-charcoal hover:-translate-y-1'
                            : 'bg-zenith-dim/20 text-zenith-charcoal hover:bg-zenith-orange hover:text-white shadow-lg'
                }`}>
                    {cartItems.includes(String(pkg.id)) ? t.selected : t.bookBtn}
                </button>
            </div>
        );
    };

    return (
        <section id="pricing" className="py-section bg-zenith-surface relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center mb-12 md:mb-20">
                <span className="text-zenith-orange font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">{t.tagline}</span>
                <h2 className="text-4xl md:text-5xl font-serif text-zenith-charcoal italic">{t.title}</h2>
            </div>

            <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                {/* Mobile View: 2-Row Slider */}
                <div className="md:hidden flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory scrollbar-hide no-scrollbar">
                    {packagePairs.map((pair, pIdx) => (
                        <div key={pIdx} className="flex flex-col gap-4 w-[85%] shrink-0 snap-center">
                            {pair.map((pkg, idx) => renderCard(pkg, idx, true))}
                        </div>
                    ))}
                </div>

                {/* Desktop View: Grid */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-12 items-stretch">
                    {packages.map((pkg, index) => renderCard(pkg, index, false))}
                </div>

                <div className="mt-8 md:mt-20 text-center">
                    <Link 
                        href="/pricing"
                        className="inline-flex items-center gap-x-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zenith-orange hover:text-zenith-charcoal transition-all group"
                    >
                        {t.seeAll}
                        <span className="material-symbols-outlined text-[18px] group-hover:translate-x-2 transition-transform">arrow_forward</span>
                    </Link>
                </div>
            </div>

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-10 right-10 z-[110] animate-slide-up">
                    <div className="bg-zenith-charcoal text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-x-4 border border-white/10">
                        <span className="material-symbols-outlined text-zenith-orange">check_circle</span>
                        <p className="text-[10px] font-bold uppercase tracking-widest">{toast.message}</p>
                    </div>
                </div>
            )}
        </section>
    );
}
