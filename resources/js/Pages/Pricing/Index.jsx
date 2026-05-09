import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import Footer from '@/Components/Landing/Footer';
import MobileNav from '@/Components/Landing/MobileNav';

const serviceGroups = [
    { 
        id: 'massage-trad', 
        name: 'Pijat Tradisional', 
        category: 'Massage',
        variants: [
            { duration: '60 Menit', price: 125000 },
            { duration: '90 Menit', price: 175000 },
            { duration: '120 Menit', price: 225000 },
        ]
    },
    { 
        id: 'bekam-medik', 
        name: 'Bekam Medik', 
        category: 'Therapy',
        variants: [
            { duration: '45 Menit', price: 150000 },
            { duration: '60 Menit', price: 200000 },
        ]
    },
    { 
        id: 'totok-wajah', 
        name: 'Totok Wajah Aura', 
        category: 'Beauty',
        variants: [
            { duration: '45 Menit', price: 100000 }
        ]
    },
    { 
        id: 'refleksi', 
        name: 'Pijat Refleksi Kaki', 
        category: 'Massage',
        variants: [
            { duration: '60 Menit', price: 90000 }
        ]
    },
    { 
        id: 'bumil', 
        name: 'Pijat Ibu Hamil', 
        category: 'Specialty',
        variants: [
            { duration: '90 Menit', price: 200000 }
        ]
    },
    { 
        id: 'kerokan', 
        name: 'Kerokan Tradisional', 
        category: 'Therapy',
        variants: [
            { duration: '30 Menit', price: 50000 }
        ]
    },
    { 
        id: 'lulur', 
        name: 'Lulur Seluruh Tubuh', 
        category: 'Beauty',
        variants: [
            { duration: '60 Menit', price: 150000 }
        ]
    },
];

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
        toastAdd: 'Berhasil menambahkan {name} ke keranjang!'
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
        toastAdd: 'Successfully added {name} to cart!'
    }
};

export default function Index({ auth }) {
    const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ID');
    const [selectedDurations, setSelectedDurations] = useState({}); // { groupId: variantIndex }
    const [toast, setToast] = useState({ show: false, message: '' });

    const t = translations[lang];

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const handleDurationChange = (groupId, variantIndex) => {
        setSelectedDurations(prev => ({
            ...prev,
            [groupId]: parseInt(variantIndex)
        }));
    };

    const addToCart = (group) => {
        const variantIndex = selectedDurations[group.id] || 0;
        const variant = group.variants[variantIndex];
        
        const service = {
            id: `${group.id}-${variant.duration}`,
            name: `${group.name} ${variant.duration}`,
            price: variant.price,
            duration: variant.duration,
            category: group.category
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

                            {serviceGroups.map((group) => {
                                const variantIndex = selectedDurations[group.id] || 0;
                                const currentVariant = group.variants[variantIndex];

                                return (
                                    <div key={group.id} className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-zenith-orange/[0.02] transition-colors group">
                                        <div className="flex-1 w-full">
                                            <span className="px-3 py-1 rounded-full bg-zenith-dim/10 text-[8px] font-bold text-zenith-charcoal/60 uppercase tracking-wider mb-3 inline-block">{group.category}</span>
                                            <h3 className="text-xl md:text-2xl font-serif text-zenith-charcoal italic group-hover:text-zenith-orange transition-colors">{group.name}</h3>
                                        </div>
                                        
                                        <div className="flex items-center gap-x-8 w-full md:w-auto justify-between md:justify-end">
                                            <div className="w-full md:w-48">
                                                {group.variants.length > 1 ? (
                                                    <div className="flex flex-col md:items-center gap-y-2">
                                                        <span className="md:hidden text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest">{t.selectDuration}</span>
                                                        <select 
                                                            className="w-full md:w-32 bg-zenith-surface border-none rounded-xl px-4 py-2 text-[10px] font-bold text-zenith-charcoal focus:ring-1 focus:ring-zenith-orange appearance-none cursor-pointer text-center"
                                                            value={variantIndex}
                                                            onChange={(e) => handleDurationChange(group.id, e.target.value)}
                                                        >
                                                            {group.variants.map((v, i) => (
                                                                <option key={i} value={i}>{v.duration}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <span className="inline-block text-[10px] font-bold text-zenith-orange bg-zenith-orange/5 px-4 py-2 rounded-xl border border-zenith-orange/10">
                                                            {currentVariant.duration}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-right min-w-[120px] md:w-40 pr-0 md:pr-4">
                                                <p className="md:hidden text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest mb-1">{t.investment}</p>
                                                <p className="text-2xl font-serif text-zenith-charcoal">Rp {currentVariant.price.toLocaleString('id-ID')}</p>
                                            </div>

                                            <button
                                                onClick={() => addToCart(group)}
                                                className="h-14 w-14 rounded-full bg-zenith-orange text-white flex items-center justify-center shadow-lg shadow-zenith-orange/20 hover:bg-zenith-charcoal transition-all transform hover:scale-110 active:scale-95 shrink-0"
                                            >
                                                <span className="material-symbols-outlined">add_shopping_cart</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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
