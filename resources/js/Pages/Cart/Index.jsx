import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import Footer from '@/Components/Landing/Footer';
import MobileNav from '@/Components/Landing/MobileNav';

const allServices = [
    { id: 1, name: 'Pijat Tradisional 60 Menit', price: 125000, category: 'Massage' },
    { id: 2, name: 'Pijat Tradisional 90 Menit', price: 175000, category: 'Massage' },
    { id: 3, name: 'Pijat Tradisional 120 Menit', price: 225000, category: 'Massage' },
    { id: 4, name: 'Bekam Medik 45 Menit', price: 150000, category: 'Therapy' },
    { id: 5, name: 'Bekam Premium + Steril 60 Menit', price: 200000, category: 'Therapy' },
    { id: 6, name: 'Totok Wajah Aura 45 Menit', price: 100000, category: 'Beauty' },
    { id: 7, name: 'Pijat Refleksi Kaki 60 Menit', price: 90000, category: 'Massage' },
    { id: 8, name: 'Pijat Ibu Hamil 90 Menit', price: 200000, category: 'Specialty' },
    { id: 9, name: 'Kerokan Tradisional 30 Menit', price: 50000, category: 'Therapy' },
    { id: 10, name: 'Lulur Seluruh Tubuh 60 Menit', price: 150000, category: 'Beauty' },
];

const translations = {
    'ID': {
        step1: '1. Periksa Pesanan',
        step2: '2. Data Pemesan',
        title: 'Paket yang Dipilih',
        empty: 'Keranjang packages Anda kosong. segera pilih paket melalui button di bawah ini',
        addMore: 'Tambah Paket Lainnya',
        explore: 'Pilih Paket Sekarang',
        secureBooking: 'Konfirmasi Pesanan',
        fullName: 'Nama Utama (Penanggung Jawab)',
        phone: 'Nomor WhatsApp',
        pax: 'Jumlah Orang (Pax)',
        guestTitle: 'Detail Orang ke-{n}',
        guestGender: 'Gender Pemesan',
        therapistGender: 'Gender Terapis',
        address: 'Alamat Lengkap',
        date: 'Tanggal Booking',
        time: 'Jam Booking',
        payment: 'Metode Pembayaran',
        source: 'Tau Jemari dari mana?',
        sourceOptions: ['Instagram', 'Facebook', 'WhatsApp', 'Teman/Keluarga', 'Lainnya'],
        notes: 'Catatan Tambahan',
        notesPlaceholder: 'Contoh: Patokan rumah, atau permintaan khusus...',
        checkout: 'Kirim Pesanan (WhatsApp)',
        modalTitle: 'Pilihan Paket',
        modalDesc: 'Klik paket yang ingin ditambahkan ke pesanan',
        finish: 'Selesai',
        toastAdd: 'Ditambahkan: {name}',
        toastRemove: 'Dihapus: {name}',
        total: 'Total Bayar',
        remove: 'Hapus',
        pria: 'Pria',
        wanita: 'Wanita',
        cash: 'Tunai',
        transfer: 'Transfer'
    },
    'EN': {
        step1: '1. Review Order',
        step2: '2. Customer Info',
        title: 'Selected Packages',
        empty: 'Your packages basket is empty. please select a package via the button below',
        addMore: 'Add More Packages',
        explore: 'Explore Packages Now',
        secureBooking: 'Confirm Booking',
        fullName: 'Main Name (PIC)',
        phone: 'WhatsApp Number',
        pax: 'Number of People',
        guestTitle: 'Person {n} Details',
        guestGender: 'Guest Gender',
        therapistGender: 'Therapist Gender',
        address: 'Full Address',
        date: 'Booking Date',
        time: 'Booking Time',
        payment: 'Payment Method',
        source: 'How did you hear about us?',
        sourceOptions: ['Instagram', 'Facebook', 'WhatsApp', 'Friend/Family', 'Other'],
        notes: 'Additional Notes',
        notesPlaceholder: 'Example: House landmarks or special requests...',
        checkout: 'Send via WhatsApp',
        modalTitle: 'Select Packages',
        modalDesc: 'Select treatments to add to your order',
        finish: 'Done',
        toastAdd: 'Added: {name}',
        toastRemove: 'Removed: {name}',
        total: 'Total Amount',
        remove: 'Remove',
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
    const [pax, setPax] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        paymentMethod: 'cash',
        source: 'Instagram',
        date: '',
        time: '',
        notes: ''
    });
    
    // Manage individual guest genders
    const [guests, setGuests] = useState([{ guestGender: 'wanita', therapistGender: 'wanita' }]);

    const t = translations[lang];

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('spa_cart') || '[]');
        setCart(savedCart);
    }, []);

    const handlePaxChange = (newPax) => {
        const count = parseInt(newPax);
        setPax(count);
        
        // Update guests array to match new pax count
        const newGuests = [...guests];
        if (count > guests.length) {
            for (let i = guests.length; i < count; i++) {
                newGuests.push({ guestGender: 'wanita', therapistGender: 'wanita' });
            }
        } else {
            newGuests.splice(count);
        }
        setGuests(newGuests);
    };

    const updateGuest = (index, field, value) => {
        const newGuests = [...guests];
        newGuests[index][field] = value;
        setGuests(newGuests);
    };

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
        
        const guestDetails = guests.map((g, i) => 
            `Orang ${i + 1}: [Pemesan: ${g.guestGender === 'pria' ? t.pria : t.wanita}, Terapis: ${g.therapistGender === 'pria' ? t.pria : t.wanita}]`
        ).join('\n');

        const message = `Halo Jemari Spa, saya ingin memesan:\n\n` + 
            cart.map(item => `- ${item.name} @ Rp ${item.price.toLocaleString('id-ID')}`).join('\n') + 
            `\n\nTotal: Rp ${calculateTotal().toLocaleString('id-ID')}` +
            `\n\nData Pemesan:\nNama: ${formData.name}\nWhatsApp: ${formData.phone}\nJumlah: ${pax} orang\n\nDetail Per Orang:\n${guestDetails}\n\nAlamat: ${formData.address}` +
            `\n\nDetail:\nTanggal: ${formData.date}\nJam: ${formData.time}\nBayar via: ${formData.paymentMethod === 'cash' ? t.cash : t.transfer}\nSumber: ${formData.source}\nCatatan: ${formData.notes}`;
        
        window.open(`https://wa.me/628123456789?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="font-sans text-zenith-charcoal antialiased bg-zenith-surface">
            <Head title={`${lang === 'ID' ? 'Keranjang Belanja' : 'Shopping Cart'} - Jemari Spa`} />

            <Navbar auth={auth} lang={lang} setLang={setLang} forceSolid={true} />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Left: Cart Items */}
                        <div className="flex-1">
                            <div className="mb-6">
                                <h1 className="text-[10px] font-bold text-zenith-orange uppercase tracking-[0.3em] mb-1">{t.step1}</h1>
                                <h2 className="text-3xl font-serif italic text-zenith-charcoal">{t.title}</h2>
                            </div>
                            
                            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-zenith-orange/5 overflow-hidden">
                                <div className="p-8 md:p-10">
                                    {cart.length === 0 ? (
                                        <div className="py-16 text-center border-2 border-dashed border-zenith-orange/10 rounded-3xl">
                                            <p className="text-zenith-charcoal/40 mb-8 font-medium px-6">{t.empty}</p>
                                            <button 
                                                onClick={() => setShowAddModal(true)}
                                                className="px-10 py-4 bg-zenith-orange text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-zenith-orange/20 hover:bg-zenith-charcoal transition-all"
                                            >
                                                {t.explore}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-zenith-orange/5">
                                            {cart.map((item, index) => (
                                                <div key={index} className="py-6 flex justify-between items-center group">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-serif italic text-zenith-charcoal group-hover:text-zenith-orange transition-colors">{item.name}</h3>
                                                        <p className="text-sm font-bold text-zenith-charcoal/40">Rp {item.price.toLocaleString('id-ID')}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => removeFromCart(index)}
                                                        className="flex items-center gap-x-2 text-zenith-charcoal/20 hover:text-red-500 transition-all px-4 py-2 rounded-xl hover:bg-red-50"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                        <span className="text-[9px] font-bold uppercase tracking-widest">{t.remove}</span>
                                                    </button>
                                                </div>
                                            ))}
                                            
                                            <div className="pt-8 mt-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-zenith-charcoal/40 uppercase tracking-[0.2em]">{t.total}</span>
                                                    <span className="text-3xl font-serif italic text-zenith-charcoal">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button 
                                        onClick={() => setShowAddModal(true)}
                                        className="w-full mt-10 inline-flex items-center justify-center gap-x-2 px-8 py-5 rounded-full border-2 border-dashed border-zenith-orange/20 text-zenith-orange text-[10px] font-bold uppercase tracking-widest hover:border-zenith-orange hover:bg-zenith-orange/5 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                        {t.addMore}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Checkout Form */}
                        <div className="w-full lg:w-[480px]">
                            <div className="mb-6">
                                <h1 className="text-[10px] font-bold text-zenith-orange uppercase tracking-[0.3em] mb-1">{t.step2}</h1>
                                <h2 className="text-3xl font-serif italic text-zenith-charcoal">{t.secureBooking}</h2>
                            </div>

                            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-zenith-orange/5">
                                <form onSubmit={handleCheckout} className="space-y-8">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[9px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.fullName}</label>
                                            <input 
                                                required type="text" placeholder="Nama Anda"
                                                className="w-full bg-zenith-surface border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="text-[9px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.phone}</label>
                                            <input 
                                                required type="tel" placeholder="081..."
                                                className="w-full bg-zenith-surface border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[9px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.pax}</label>
                                            <select 
                                                className="w-full bg-zenith-surface border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange appearance-none cursor-pointer"
                                                value={pax}
                                                onChange={(e) => handlePaxChange(e.target.value)}
                                            >
                                                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                                    <option key={n} value={n}>{n} {t.pax.split('(')[0]}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Dynamic Guest Cards */}
                                    <div className="space-y-6 pt-4">
                                        {guests.map((guest, index) => (
                                            <div key={index} className="p-6 rounded-[2rem] bg-zenith-surface/50 border border-zenith-orange/10">
                                                <h4 className="text-[10px] font-bold text-zenith-orange uppercase tracking-widest mb-4 flex items-center gap-x-2">
                                                    <span className="h-4 w-4 bg-zenith-orange text-white rounded-full flex items-center justify-center text-[8px]">{index + 1}</span>
                                                    {t.guestTitle.replace('{n}', index + 1)}
                                                </h4>
                                                
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest block mb-2">{t.guestGender}</label>
                                                        <div className="flex gap-2">
                                                            {['pria', 'wanita'].map((g) => (
                                                                <label key={g} className="flex-1 cursor-pointer">
                                                                    <input type="radio" name={`guestGender-${index}`} className="hidden peer" value={g} checked={guest.guestGender === g} onChange={(e) => updateGuest(index, 'guestGender', e.target.value)} />
                                                                    <div className="text-center py-2.5 rounded-xl bg-white text-[8px] font-bold uppercase peer-checked:bg-zenith-orange peer-checked:text-white transition-all border border-transparent shadow-sm">{t[g]}</div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest block mb-2">{t.therapistGender}</label>
                                                        <div className="flex gap-2">
                                                            {['pria', 'wanita'].map((g) => (
                                                                <label key={g} className="flex-1 cursor-pointer">
                                                                    <input type="radio" name={`therapistGender-${index}`} className="hidden peer" value={g} checked={guest.therapistGender === g} onChange={(e) => updateGuest(index, 'therapistGender', e.target.value)} />
                                                                    <div className="text-center py-2.5 rounded-xl bg-white text-[8px] font-bold uppercase peer-checked:bg-zenith-orange peer-checked:text-white transition-all border border-transparent shadow-sm">{t[g]}</div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[9px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.address}</label>
                                            <textarea 
                                                required placeholder="Alamat lengkap..."
                                                className="w-full bg-zenith-surface border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange h-24"
                                                value={formData.address}
                                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            ></textarea>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[9px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.date}</label>
                                                <input 
                                                    required type="date"
                                                    className="w-full bg-zenith-surface border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange"
                                                    value={formData.date}
                                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.time}</label>
                                                <input 
                                                    required type="time"
                                                    className="w-full bg-zenith-surface border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange"
                                                    value={formData.time}
                                                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-[9px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.payment}</label>
                                                <div className="flex gap-2">
                                                    {['cash', 'transfer'].map((p) => (
                                                        <label key={p} className="flex-1 cursor-pointer">
                                                            <input type="radio" name="paymentMethod" className="hidden peer" value={p} checked={formData.paymentMethod === p} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} />
                                                            <div className="text-center py-3 rounded-xl bg-zenith-surface text-[9px] font-bold uppercase peer-checked:bg-zenith-orange peer-checked:text-white transition-all border border-transparent">{t[p]}</div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.source}</label>
                                                <select 
                                                    className="w-full bg-zenith-surface border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange appearance-none cursor-pointer"
                                                    value={formData.source}
                                                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                                                >
                                                    {t.sourceOptions.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[9px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.notes}</label>
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
                                            className="w-full py-5 bg-zenith-orange text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-zenith-orange/40 hover:bg-zenith-charcoal transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                                        >
                                            {t.checkout}
                                        </button>
                                    </div>
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-zenith-charcoal/60 backdrop-blur-md" onClick={() => setShowAddModal(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl max-h-[80vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col transform animate-scale-in">
                        <div className="p-8 border-b border-zenith-orange/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-serif italic text-zenith-charcoal">{t.modalTitle}</h3>
                                <p className="text-zenith-charcoal/40 text-[9px] font-bold uppercase tracking-widest mt-1">{t.modalDesc}</p>
                            </div>
                            <button 
                                onClick={() => setShowAddModal(false)}
                                className="h-10 w-10 rounded-full bg-zenith-surface flex items-center justify-center text-zenith-charcoal/40 hover:bg-zenith-orange/10 hover:text-zenith-orange transition-all"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {allServices.map((service) => (
                                <button 
                                    key={service.id}
                                    onClick={() => addToCart(service)}
                                    className="w-full p-5 rounded-2xl bg-zenith-surface/50 border border-transparent hover:border-zenith-orange/20 hover:bg-white transition-all flex items-center justify-between group text-left"
                                >
                                    <div className="flex-1 pr-4">
                                        <h4 className="text-sm font-serif italic text-zenith-charcoal group-hover:text-zenith-orange transition-colors">{service.name}</h4>
                                        <p className="text-[10px] font-bold text-zenith-charcoal/30">Rp {service.price.toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-zenith-orange/10 text-zenith-orange flex items-center justify-center group-hover:bg-zenith-orange group-hover:text-white transition-all">
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="p-6 bg-zenith-surface/50 border-t border-zenith-orange/5 text-center">
                            <button 
                                onClick={() => setShowAddModal(false)}
                                className="px-12 py-4 bg-zenith-charcoal text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-zenith-orange transition-all shadow-xl"
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
