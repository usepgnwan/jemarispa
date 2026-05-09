import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import Footer from '@/Components/Landing/Footer';
import MobileNav from '@/Components/Landing/MobileNav';

const allServices = [
    { id: 1, name: 'Pijat Tradisional', duration: '60 Min', price: 125000, category: 'Massage' },
    { id: 2, name: 'Pijat Tradisional', duration: '90 Min', price: 175000, category: 'Massage' },
    { id: 3, name: 'Pijat Tradisional', duration: '120 Min', price: 225000, category: 'Massage' },
    { id: 4, name: 'Bekam Medik', duration: '45 Min', price: 150000, category: 'Therapy' },
    { id: 5, name: 'Bekam Premium + Steril', duration: '60 Min', price: 200000, category: 'Therapy' },
    { id: 6, name: 'Totok Wajah Aura', duration: '45 Min', price: 100000, category: 'Beauty' },
    { id: 7, name: 'Pijat Refleksi Kaki', duration: '60 Min', price: 90000, category: 'Massage' },
    { id: 8, name: 'Pijat Ibu Hamil', duration: '90 Min', price: 200000, category: 'Specialty' },
    { id: 9, name: 'Kerokan Tradisional', duration: '30 Min', price: 50000, category: 'Therapy' },
    { id: 10, name: 'Lulur Seluruh Tubuh', duration: '60 Min', price: 150000, category: 'Beauty' },
];

const translations = {
    'ID': {
        metaTitle: 'Harga - Jemari Spa',
        badge: 'Menu Lengkap',
        title: 'Daftar Harga & Paket',
        desc: 'Temukan berbagai pilihan layanan spa profesional untuk kebugaran maksimal Anda.',
        investment: 'Investasi',
        toastAdd: 'Berhasil menambahkan {name} ke keranjang!'
    },
    'EN': {
        metaTitle: 'Pricing - Jemari Spa ',
        badge: 'Complete Menu',
        title: 'Pricelist & Paket',
        desc: 'Discover our full range of professional home spa treatments designed for your ultimate wellness.',
        investment: 'Investment',
        toastAdd: 'Successfully added {name} to cart!'
    }
};

export default function Index({ auth }) {
    const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ID');
    const [cart, setCart] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '' });

    const t = translations[lang];

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('spa_cart') || '[]');
        setCart(savedCart);
    }, []);

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const addToCart = (service) => {
        const newCart = [...cart, service];
        setCart(newCart);
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
                            {allServices.map((service) => (
                                <div key={service.id} className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-zenith-orange/[0.02] transition-colors group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-x-3 mb-2">
                                            <span className="px-3 py-1 rounded-full bg-zenith-dim/10 text-[8px] font-bold text-zenith-charcoal/60 uppercase tracking-wider">{service.category}</span>
                                            <span className="text-zenith-orange text-[10px] font-bold uppercase tracking-widest">{service.duration}</span>
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-serif text-zenith-charcoal italic group-hover:text-zenith-orange transition-colors">{service.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-x-8">
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-zenith-charcoal/30 uppercase tracking-widest mb-1">{t.investment}</p>
                                            <p className="text-2xl font-serif text-zenith-charcoal">Rp {service.price.toLocaleString('id-ID')}</p>
                                        </div>
                                        <button
                                            onClick={() => addToCart(service)}
                                            className="h-14 w-14 rounded-full bg-zenith-orange text-white flex items-center justify-center shadow-lg shadow-zenith-orange/20 hover:bg-zenith-charcoal transition-all transform hover:scale-110 active:scale-95"
                                        >
                                            <span className="material-symbols-outlined">add_shopping_cart</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
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
