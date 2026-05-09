import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import Footer from '@/Components/Landing/Footer';
import MobileNav from '@/Components/Landing/MobileNav';

const translations = {
    'ID': {
        metaTitle: 'Harga - Jemari Spa',
        badge: 'Menu Lengkap',
        title: 'Daftar Harga & Paket',
        desc: 'Temukan berbagai pilihan layanan spa profesional untuk kebugaran maksimal Anda.',
        investment: 'Investasi',
        selectDuration: 'Pilih Durasi',
        pkgName: 'Nama Paket',
        duration: 'Durasi',
        price: 'Harga',
        toastAdd: 'Berhasil menambahkan {name} ke keranjang!',
        loading: 'Memuat paket...',
        noData: 'Belum ada paket tersedia.'
    },
    'EN': {
        metaTitle: 'Pricing - Jemari Spa',
        badge: 'Complete Menu',
        title: 'Pricelist & Packages',
        desc: 'Discover our full range of professional home spa treatments designed for your ultimate wellness.',
        investment: 'Investment',
        selectDuration: 'Select Duration',
        pkgName: 'Package Name',
        duration: 'Duration',
        price: 'Price',
        toastAdd: 'Successfully added {name} to cart!',
        loading: 'Loading packages...',
        noData: 'No packages available yet.'
    }
};

export default function Index({ auth, packages = [] }) {
    const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ID');
    const [selectedDurations, setSelectedDurations] = useState({}); // { packageId: durationIndex }
    const [toast, setToast] = useState({ show: false, message: '' });

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

    const addToCart = (pkg) => {
        const durationIndex = selectedDurations[pkg.id] || 0;
        const durationItem = pkg.durations[durationIndex];
        
        const title = lang === 'EN' ? (pkg.title_en || pkg.title_id) : pkg.title_id;
        const category = lang === 'EN' ? (pkg.category_en || pkg.category_id) : pkg.category_id;

        const service = {
            id: `${pkg.id}-${durationItem.duration}`,
            name: `${title} ${durationItem.duration}`,
            price: parseFloat(durationItem.price),
            duration: durationItem.duration,
            category: category
        };

        const savedCart = JSON.parse(localStorage.getItem('spa_cart') || '[]');
        const newCart = [...savedCart, service];
        localStorage.setItem('spa_cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cart-updated'));
        showToast(t.toastAdd.replace('{name}', service.name));
    };

    return (
        <div className="font-sans text-zenith-charcoal antialiased bg-zenith-surface">
            <Head title={t.metaTitle} />

            <Navbar auth={auth} lang={lang} setLang={setLang} forceSolid={true} />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-zenith-orange font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">{t.badge}</span>
                        <h1 className="text-4xl md:text-6xl font-serif text-zenith-charcoal italic mb-6">{t.title}</h1>
                        <p className="text-zenith-charcoal/40 text-sm max-w-lg mx-auto">{t.desc}</p>
                    </div>

                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-zenith-orange/5 overflow-hidden border border-zenith-orange/5">
                        <div className="divide-y divide-zenith-orange/5">
                            {/* Table Header */}
                            <div className="hidden md:flex items-center px-8 md:px-10 py-4 bg-zenith-surface/30">
                                <span className="flex-1 text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest">{t.pkgName}</span>
                                <span className="w-48 text-center text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest">{t.duration}</span>
                                <span className="w-40 text-right text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest pr-20">{t.price}</span>
                            </div>

                            {packages.length > 0 ? (
                                packages.map((pkg) => {
                                    const durationIndex = selectedDurations[pkg.id] || 0;
                                    const currentDuration = pkg.durations[durationIndex] || { duration: '-', price: 0 };
                                    
                                    const title = lang === 'EN' ? (pkg.title_en || pkg.title_id) : pkg.title_id;
                                    const category = lang === 'EN' ? (pkg.category_en || pkg.category_id) : pkg.category_id;

                                    return (
                                        <div key={pkg.id} className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-zenith-orange/[0.02] transition-colors group">
                                            <div className="flex-1 w-full">
                                                <span className="px-3 py-1 rounded-full bg-zenith-dim/10 text-[8px] font-bold text-zenith-charcoal/60 uppercase tracking-wider mb-3 inline-block">
                                                    {category || 'Package'}
                                                </span>
                                                <h3 className="text-xl md:text-2xl font-serif text-zenith-charcoal italic group-hover:text-zenith-orange transition-colors">
                                                    {title}
                                                </h3>
                                            </div>
                                            
                                            <div className="flex items-center gap-x-8 w-full md:w-auto justify-between md:justify-end">
                                                <div className="w-full md:w-48">
                                                    {pkg.durations && pkg.durations.length > 1 ? (
                                                        <div className="flex flex-col md:items-center gap-y-2">
                                                            <span className="md:hidden text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest">{t.selectDuration}</span>
                                                            <select 
                                                                className="w-full md:w-32 bg-zenith-surface border-none rounded-xl px-4 py-2 text-[10px] font-bold text-zenith-charcoal focus:ring-1 focus:ring-zenith-orange appearance-none cursor-pointer text-center"
                                                                value={durationIndex}
                                                                onChange={(e) => handleDurationChange(pkg.id, e.target.value)}
                                                            >
                                                                {pkg.durations.map((d, i) => (
                                                                    <option key={d.id} value={i}>
                                                                        {d.duration.toLowerCase().includes('menit') || d.duration.toLowerCase().includes('min') 
                                                                            ? d.duration 
                                                                            : `${d.duration} ${lang === 'EN' ? 'Minutes' : 'Menit'}`}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center">
                                                            <span className="inline-block text-[10px] font-bold text-zenith-orange bg-zenith-orange/5 px-4 py-2 rounded-xl border border-zenith-orange/10">
                                                                {currentDuration.duration.toLowerCase().includes('menit') || currentDuration.duration.toLowerCase().includes('min') 
                                                                    ? currentDuration.duration 
                                                                    : `${currentDuration.duration} ${lang === 'EN' ? 'Minutes' : 'Menit'}`}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="text-right min-w-[120px] md:w-40 pr-0 md:pr-4">
                                                    <p className="md:hidden text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest mb-1">{t.investment}</p>
                                                    <p className="text-2xl font-serif text-zenith-charcoal">
                                                        Rp {parseFloat(currentDuration.price).toLocaleString('id-ID')}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => addToCart(pkg)}
                                                    className="h-14 w-14 rounded-full bg-zenith-orange text-white flex items-center justify-center shadow-lg shadow-zenith-orange/20 hover:bg-zenith-charcoal transition-all transform hover:scale-110 active:scale-95 shrink-0"
                                                >
                                                    <span className="material-symbols-outlined">add_shopping_cart</span>
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

            <Footer />
            <MobileNav lang={lang} />
        </div>
    );
}
