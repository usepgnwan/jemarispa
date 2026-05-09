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
        title: 'Pilihan Anda',
        empty: 'Keranjang packages Anda kosong. segera pilih paket melalui button di bawah ini',
        addMore: 'Pilih Paket Lainnya',
        explore: 'Pilih Paket Sekarang',
        secureBooking: 'Pemesanan Aman',
        fullName: 'Nama Lengkap',
        phone: 'Nomor Telepon',
        gender: 'Gender Pemesan',
        pax: 'Jumlah Order (Pax)',
        address: 'Alamat Lengkap',
        date: 'Tanggal',
        time: 'Jam',
        therapistGender: 'Gender Terapis',
        payment: 'Metode Pembayaran',
        source: 'Sumber Informasi',
        sourceOptions: ['Instagram', 'Facebook', 'WhatsApp', 'Teman/Keluarga', 'Lainnya'],
        notes: 'Catatan',
        notesPlaceholder: 'Catatan tambahan...',
        checkout: 'Lanjutkan ke WhatsApp',
        modalTitle: 'Menu Ritual',
        modalDesc: 'Pilih jalan menuju kebugaran',
        finish: 'Selesai Memilih',
        toastAdd: 'Berhasil menambahkan {name} ke keranjang!',
        toastRemove: '{name} dihapus dari keranjang.',
        total: 'Estimasi Total',
        waHeader: 'Halo Jemari Spa, saya ingin memesan:',
        waCustomer: 'Data Pemesan:',
        waTreatment: 'Detail Treatment:',
        pria: 'Pria',
        wanita: 'Wanita',
        cash: 'Tunai',
        transfer: 'Transfer'
    },
    'EN': {
        title: 'Your Selections',
        empty: 'Your packages basket is empty. please select a package via the button below',
        addMore: 'Add More Packages',
        explore: 'Explore Packages Now',
        secureBooking: 'Secure Booking',
        fullName: 'Full Name',
        phone: 'Phone Number',
        gender: 'Customer Gender',
        pax: 'Number of Pax',
        address: 'Full Address',
        date: 'Date',
        time: 'Time',
        therapistGender: 'Therapist Gender',
        payment: 'Payment Method',
        source: 'Information Source',
        sourceOptions: ['Instagram', 'Facebook', 'WhatsApp', 'Friend/Family', 'Other'],
        notes: 'Notes',
        notesPlaceholder: 'Additional notes...',
        checkout: 'Proceed to WhatsApp',
        modalTitle: 'Ritual Menu',
        modalDesc: 'Select more paths to wellness',
        finish: 'Finish Selection',
        toastAdd: 'Successfully added {name} to cart!',
        toastRemove: '{name} removed from cart.',
        total: 'Estimated Total',
        waHeader: 'Hello Jemari Spa, I would like to book:',
        waCustomer: 'Customer Data:',
        waTreatment: 'Treatment Details:',
        pria: 'Male',
        wanita: 'Female',
        cash: 'Cash',
        transfer: 'Transfer'
    }
};

export default function Index({ auth }) {
    const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ID');
    const [cart, setCart] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        pax: '1',
        gender: 'wanita',
        therapistGender: 'wanita',
        paymentMethod: 'cash',
        source: 'Instagram',
        date: '',
        time: '',
        notes: ''
    });

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

    const removeFromCart = (index) => {
        const itemToRemove = cart[index];
        const newCart = cart.filter((_, i) => i !== index);
        setCart(newCart);
        localStorage.setItem('spa_cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cart-updated'));
        showToast(t.toastRemove.replace('{name}', itemToRemove.name));
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.price, 0);
    };

    const handleCheckout = (e) => {
        e.preventDefault();
        const message = `${t.waHeader}\n\n` + 
            cart.map(item => `- ${item.name} (${item.duration}) - Rp ${item.price.toLocaleString('id-ID')}`).join('\n') + 
            `\n\nTotal: Rp ${calculateTotal().toLocaleString('id-ID')}` +
            `\n\n${t.waCustomer}\n${t.fullName}: ${formData.name}\n${t.phone}: ${formData.phone}\n${t.gender}: ${formData.gender === 'pria' ? t.pria : t.wanita}\n${t.pax}: ${formData.pax}\n${t.address}: ${formData.address}` +
            `\n\n${t.waTreatment}\n${t.date}: ${formData.date}\n${t.time}: ${formData.time}\n${t.therapistGender}: ${formData.therapistGender === 'pria' ? t.pria : t.wanita}\n${t.payment}: ${formData.paymentMethod === 'cash' ? t.cash : t.transfer}\n${t.source}: ${formData.source}\n${t.notes}: ${formData.notes}`;
        
        window.open(`https://wa.me/628123456789?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="font-sans text-zenith-charcoal antialiased bg-zenith-surface">
            <Head title={`${t.title} - Jemari Spa Sanctuary`} />

            <Navbar auth={auth} lang={lang} setLang={setLang} forceSolid={true} />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Left: Cart Items */}
                        <div className="flex-1">
                            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-zenith-orange/5">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                                    <h2 className="text-3xl font-serif italic flex items-center gap-x-4">
                                        {t.title} 
                                        <span className="text-sm font-sans not-italic text-zenith-orange bg-zenith-orange/10 px-4 py-1 rounded-full">{cart.length}</span>
                                    </h2>
                                    <button 
                                        onClick={() => setShowAddModal(true)}
                                        className="inline-flex items-center gap-x-2 px-6 py-3 rounded-full bg-zenith-orange/10 text-zenith-orange text-[10px] font-bold uppercase tracking-widest hover:bg-zenith-orange hover:text-white transition-all shadow-lg shadow-zenith-orange/5"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                        {t.addMore}
                                    </button>
                                </div>

                                {cart.length === 0 ? (
                                    <div className="py-20 text-center border-2 border-dashed border-zenith-orange/10 rounded-3xl">
                                        <span className="material-symbols-outlined text-6xl text-zenith-orange/20 mb-6">shopping_basket</span>
                                        <p className="text-zenith-charcoal/40 mb-8 font-medium max-w-sm mx-auto">{t.empty}</p>
                                        <button 
                                            onClick={() => setShowAddModal(true)}
                                            className="px-10 py-4 bg-zenith-orange text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-zenith-orange/20 hover:bg-zenith-charcoal transition-all"
                                        >
                                            {t.explore}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {cart.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center group bg-zenith-surface/50 p-6 rounded-3xl border border-transparent hover:border-zenith-orange/10 transition-all">
                                                <div>
                                                    <p className="text-[10px] font-bold text-zenith-orange uppercase tracking-widest mb-1">{item.duration}</p>
                                                    <h3 className="text-xl font-serif italic text-zenith-charcoal">{item.name}</h3>
                                                    <p className="text-sm font-bold text-zenith-charcoal/40 mt-1">Rp {item.price.toLocaleString('id-ID')}</p>
                                                </div>
                                                <button 
                                                    onClick={() => removeFromCart(index)}
                                                    className="h-12 w-12 rounded-full flex items-center justify-center text-zenith-charcoal/20 hover:text-zenith-orange hover:bg-zenith-orange/5 transition-all"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                        ))}
                                        
                                        <div className="pt-10 border-t border-zenith-orange/5 mt-10">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-[10px] font-bold text-zenith-charcoal/40 uppercase tracking-[0.3em]">{t.total}</span>
                                                <span className="text-4xl font-serif italic text-zenith-charcoal">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Checkout Form */}
                        <div className="w-full lg:w-[500px]">
                            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-zenith-orange/5">
                                <h2 className="text-2xl font-serif italic mb-8">{t.secureBooking}</h2>
                                <form onSubmit={handleCheckout} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.fullName}</label>
                                            <input 
                                                required
                                                type="text" 
                                                className="w-full bg-zenith-surface border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.phone}</label>
                                            <input 
                                                required
                                                type="tel" 
                                                className="w-full bg-zenith-surface border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.gender}</label>
                                            <div className="flex gap-4">
                                                {['pria', 'wanita'].map((g) => (
                                                    <label key={g} className="flex-1 cursor-pointer">
                                                        <input type="radio" name="gender" className="hidden peer" value={g} checked={formData.gender === g} onChange={(e) => setFormData({...formData, gender: e.target.value})} />
                                                        <div className="text-center py-3 rounded-xl bg-zenith-surface text-[10px] font-bold uppercase tracking-widest peer-checked:bg-zenith-orange peer-checked:text-white transition-all">{t[g]}</div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.pax}</label>
                                            <input 
                                                required
                                                type="number" 
                                                min="1"
                                                className="w-full bg-zenith-surface border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange"
                                                value={formData.pax}
                                                onChange={(e) => setFormData({...formData, pax: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.address}</label>
                                        <textarea 
                                            required
                                            className="w-full bg-zenith-surface border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange h-24"
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        ></textarea>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.date}</label>
                                            <input 
                                                required
                                                type="date" 
                                                className="w-full bg-zenith-surface border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange"
                                                value={formData.date}
                                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.time}</label>
                                            <input 
                                                required
                                                type="time" 
                                                className="w-full bg-zenith-surface border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange"
                                                value={formData.time}
                                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.therapistGender}</label>
                                            <div className="flex gap-4">
                                                {['pria', 'wanita'].map((g) => (
                                                    <label key={g} className="flex-1 cursor-pointer">
                                                        <input type="radio" name="therapistGender" className="hidden peer" value={g} checked={formData.therapistGender === g} onChange={(e) => setFormData({...formData, therapistGender: e.target.value})} />
                                                        <div className="text-center py-3 rounded-xl bg-zenith-surface text-[10px] font-bold uppercase tracking-widest peer-checked:bg-zenith-orange peer-checked:text-white transition-all">{t[g]}</div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.payment}</label>
                                            <div className="flex gap-4">
                                                {['cash', 'transfer'].map((p) => (
                                                    <label key={p} className="flex-1 cursor-pointer">
                                                        <input type="radio" name="paymentMethod" className="hidden peer" value={p} checked={formData.paymentMethod === p} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} />
                                                        <div className="text-center py-3 rounded-xl bg-zenith-surface text-[10px] font-bold uppercase tracking-widest peer-checked:bg-zenith-orange peer-checked:text-white transition-all">{t[p]}</div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.source}</label>
                                        <select 
                                            className="w-full bg-zenith-surface border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange appearance-none"
                                            value={formData.source}
                                            onChange={(e) => setFormData({...formData, source: e.target.value})}
                                        >
                                            {t.sourceOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.notes}</label>
                                        <textarea 
                                            className="w-full bg-zenith-surface border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange h-24"
                                            placeholder={t.notesPlaceholder}
                                            value={formData.notes}
                                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        ></textarea>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={cart.length === 0}
                                        className="w-full py-5 bg-zenith-orange text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-zenith-orange/40 hover:bg-zenith-charcoal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {t.checkout}
                                    </button>
                                </form>
                            </div>
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

            {/* Add Service Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
                    <div className="absolute inset-0 bg-zenith-charcoal/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    <div className="relative bg-white w-full max-w-4xl max-h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-zenith-orange/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-serif italic text-zenith-charcoal">{t.modalTitle}</h3>
                                <p className="text-zenith-charcoal/40 text-[10px] font-bold uppercase tracking-widest mt-1">{t.modalDesc}</p>
                            </div>
                            <button 
                                onClick={() => setShowAddModal(false)}
                                className="h-10 w-10 rounded-full bg-zenith-surface flex items-center justify-center text-zenith-charcoal/40 hover:bg-zenith-orange/10 hover:text-zenith-orange transition-all"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 divide-y divide-zenith-orange/5">
                            {allServices.map((service) => (
                                <div key={service.id} className="py-6 flex justify-between items-center group">
                                    <div>
                                        <div className="flex items-center gap-x-3 mb-1">
                                            <span className="text-zenith-orange text-[8px] font-bold uppercase tracking-widest">{service.duration}</span>
                                            <span className="text-zenith-charcoal/20 text-[8px] uppercase font-bold tracking-widest">{service.category}</span>
                                        </div>
                                        <h4 className="text-lg font-serif italic text-zenith-charcoal group-hover:text-zenith-orange transition-colors">{service.name}</h4>
                                        <p className="text-sm font-bold text-zenith-charcoal/40">Rp {service.price.toLocaleString('id-ID')}</p>
                                    </div>
                                    <button 
                                        onClick={() => addToCart(service)}
                                        className="h-12 w-12 rounded-full bg-zenith-orange/10 text-zenith-orange flex items-center justify-center hover:bg-zenith-orange hover:text-white transition-all shadow-lg shadow-zenith-orange/5"
                                    >
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="p-8 bg-zenith-surface/50 border-t border-zenith-orange/5 text-center">
                            <button 
                                onClick={() => setShowAddModal(false)}
                                className="px-12 py-4 bg-zenith-charcoal text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-zenith-orange transition-all"
                            >
                                {t.finish}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
            <MobileNav lang={lang} />
        </div>
    );
}
