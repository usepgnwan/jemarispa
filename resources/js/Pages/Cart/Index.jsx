import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import Footer from '@/Components/Landing/Footer';
import MobileNav from '@/Components/Landing/MobileNav';

// Grouped services with duration variants
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
        step1: '1. Periksa Pesanan & Paket',
        step2: '2. Data Pemesan',
        title: 'Paket Per Orang',
        empty: 'Belum ada paket yang dipilih untuk orang ini.',
        seePackages: 'Klik Lihat Paket Disini',
        addMore: 'Tambah Paket',
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
        modalTitle: 'Pilih Paket untuk Orang ke-{n}',
        modalDesc: 'Pilih layanan dan tentukan durasinya',
        searchPlaceholder: 'Cari paket (misal: Pijat, Bekam...)',
        selectDuration: 'Pilih Durasi',
        pkgName: 'Nama Paket',
        duration: 'Durasi',
        price: 'Harga',
        finish: 'Selesai',
        toastAdd: 'Ditambahkan ke Orang {n}: {name}',
        toastRemove: 'Dihapus dari Orang {n}: {name}',
        total: 'Total Keseluruhan',
        remove: 'Hapus',
        pria: 'Pria',
        wanita: 'Wanita',
        cash: 'Tunai',
        transfer: 'Transfer'
    },
    'EN': {
        step1: '1. Review Order & Packages',
        step2: '2. Customer Info',
        title: 'Packages Per Person',
        empty: 'No packages selected for this person.',
        seePackages: 'Click to View Packages Here',
        addMore: 'Add Package',
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
        modalTitle: 'Select Package for Person {n}',
        modalDesc: 'Choose treatment and duration',
        searchPlaceholder: 'Search packages (e.g., Massage, Therapy...)',
        selectDuration: 'Select Duration',
        pkgName: 'Package Name',
        duration: 'Duration',
        price: 'Price',
        finish: 'Done',
        toastAdd: 'Added to Person {n}: {name}',
        toastRemove: 'Removed from Person {n}: {name}',
        total: 'Grand Total',
        remove: 'Remove',
        pria: 'Male',
        wanita: 'Female',
        cash: 'Cash',
        transfer: 'Transfer'
    }
};

export default function Index({ auth }) {
    const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ID');
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeGuestIndex, setActiveGuestIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDurations, setSelectedDurations] = useState({}); // { groupId: variantIndex }
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
    
    const [guests, setGuests] = useState([{ 
        guestGender: 'wanita', 
        therapistGender: 'wanita',
        packages: [] 
    }]);

    const t = translations[lang];

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('spa_cart') || '[]');
        const pendingService = JSON.parse(localStorage.getItem('pending_service') || 'null');
        
        let initialPackages = [];
        if (savedCart.length > 0) {
            initialPackages = savedCart;
        } else if (pendingService) {
            // Flatten variants to find the initial one
            const allVariants = serviceGroups.flatMap(g => g.variants.map(v => ({ ...v, name: `${g.name} ${v.duration}` })));
            const service = allVariants.find(s => s.name.includes(pendingService.name));
            if (service) initialPackages = [service];
        }

        if (initialPackages.length > 0) {
            setGuests([{ 
                guestGender: 'wanita', 
                therapistGender: 'wanita',
                packages: initialPackages 
            }]);
            localStorage.removeItem('spa_cart');
            localStorage.removeItem('pending_service');
        }
    }, []);

    const handlePaxChange = (newPax) => {
        const count = parseInt(newPax);
        setPax(count);
        
        const newGuests = [...guests];
        if (count > guests.length) {
            for (let i = guests.length; i < count; i++) {
                newGuests.push({ 
                    guestGender: 'wanita', 
                    therapistGender: 'wanita',
                    packages: [] 
                });
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

    const handleDurationChange = (groupId, variantIndex) => {
        setSelectedDurations(prev => ({
            ...prev,
            [groupId]: parseInt(variantIndex)
        }));
    };

    const addPackageToGuest = (group) => {
        if (activeGuestIndex === null) return;
        
        const variantIndex = selectedDurations[group.id] || 0;
        const variant = group.variants[variantIndex];
        
        const packageToAdd = {
            name: `${group.name} ${variant.duration}`,
            groupName: group.name,
            price: variant.price,
            duration: variant.duration
        };
        
        const newGuests = [...guests];
        newGuests[activeGuestIndex].packages.push(packageToAdd);
        setGuests(newGuests);
        
        showToast(t.toastAdd.replace('{n}', activeGuestIndex + 1).replace('{name}', packageToAdd.name));
    };

    const removePackageFromGuest = (guestIndex, pkgIndex) => {
        const newGuests = [...guests];
        const removedPkg = newGuests[guestIndex].packages[pkgIndex];
        newGuests[guestIndex].packages.splice(pkgIndex, 1);
        setGuests(newGuests);
        
        showToast(t.toastRemove.replace('{n}', guestIndex + 1).replace('{name}', removedPkg.name));
    };

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const calculateTotal = () => {
        return guests.reduce((total, guest) => {
            return total + guest.packages.reduce((pTotal, pkg) => pTotal + pkg.price, 0);
        }, 0);
    };

    const filteredServiceGroups = serviceGroups.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCheckout = (e) => {
        e.preventDefault();
        const hasPackages = guests.some(g => g.packages.length > 0);
        if (!hasPackages) {
            showToast(lang === 'ID' ? 'Pilih minimal satu paket!' : 'Select at least one package!');
            return;
        }

        const guestDetails = guests.map((g, i) => {
            const pkgs = g.packages.map(p => `- ${p.name}`).join('\n  ');
            return `Orang ${i + 1}:\n  Gender: ${g.guestGender === 'pria' ? t.pria : t.wanita}\n  Terapis: ${g.therapistGender === 'pria' ? t.pria : t.wanita}\n  Paket:\n  ${pkgs || '(Belum pilih paket)'}`;
        }).join('\n\n');

        const message = `Halo Jemari Spa, saya ingin memesan untuk ${pax} orang:\n\n` + 
            guestDetails + 
            `\n\nTotal Bayar: Rp ${calculateTotal().toLocaleString('id-ID')}` +
            `\n\nData Penanggung Jawab:\nNama: ${formData.name}\nWhatsApp: ${formData.phone}\nAlamat: ${formData.address}` +
            `\n\nDetail Kedatangan:\nTanggal: ${formData.date}\nJam: ${formData.time}\nBayar via: ${formData.paymentMethod === 'cash' ? t.cash : t.transfer}\nSumber: ${formData.source}\nCatatan: ${formData.notes}`;
        
        window.open(`https://wa.me/628123456789?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="font-sans text-zenith-charcoal antialiased bg-zenith-surface">
            <Head title={`${lang === 'ID' ? 'Checkout Pesanan' : 'Checkout Order'} - Jemari Spa`} />

            <Navbar auth={auth} lang={lang} setLang={setLang} forceSolid={true} />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Left: Per-Guest Packages */}
                        <div className="flex-1">
                            <div className="mb-6">
                                <h1 className="text-[10px] font-bold text-zenith-orange uppercase tracking-[0.3em] mb-1">{t.step1}</h1>
                                <h2 className="text-3xl font-serif italic text-zenith-charcoal">{t.title}</h2>
                            </div>
                            
                            <div className="space-y-8">
                                {guests.map((guest, gIndex) => (
                                    <div key={gIndex} className="bg-white rounded-[2.5rem] shadow-2xl border border-zenith-orange/5 overflow-hidden">
                                        <div className="p-8 md:p-10">
                                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-zenith-orange/5">
                                                <h3 className="text-xl font-serif italic flex items-center gap-x-3">
                                                    <span className="h-6 w-6 bg-zenith-orange text-white rounded-full flex items-center justify-center text-[10px] font-sans not-italic">{gIndex + 1}</span>
                                                    {t.guestTitle.replace('{n}', gIndex + 1)}
                                                </h3>
                                                {guest.packages.length > 0 && (
                                                    <button 
                                                        onClick={() => {
                                                            setActiveGuestIndex(gIndex);
                                                            setShowAddModal(true);
                                                        }}
                                                        className="inline-flex items-center gap-x-2 px-6 py-3 rounded-full bg-zenith-orange text-white text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-zenith-orange/20 hover:bg-zenith-charcoal transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                                                        {t.addMore}
                                                    </button>
                                                )}
                                            </div>

                                            {guest.packages.length === 0 ? (
                                                <div className="py-12 px-6 text-center bg-zenith-surface/30 rounded-[2rem] border-2 border-dashed border-zenith-orange/10">
                                                    <p className="text-zenith-charcoal/40 text-sm font-medium mb-8 leading-relaxed max-w-xs mx-auto">{t.empty}</p>
                                                    <button 
                                                        onClick={() => {
                                                            setActiveGuestIndex(gIndex);
                                                            setShowAddModal(true);
                                                        }}
                                                        className="w-full md:w-auto px-12 py-5 bg-white text-zenith-orange border-2 border-zenith-orange/20 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-zenith-orange hover:text-white hover:border-zenith-orange transition-all transform active:scale-95"
                                                    >
                                                        {t.seePackages}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {/* Table Header */}
                                                    <div className="hidden md:flex items-center px-4 py-2 border-b border-zenith-orange/5">
                                                        <span className="flex-1 text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest">{t.pkgName}</span>
                                                        <span className="w-24 text-center text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest">{t.duration}</span>
                                                        <span className="w-24 text-right text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest mr-10">{t.price}</span>
                                                    </div>

                                                    {guest.packages.map((pkg, pIndex) => (
                                                        <div key={pIndex} className="flex flex-col md:flex-row md:items-center bg-zenith-surface/50 p-4 rounded-2xl group transition-all hover:bg-zenith-orange/[0.03]">
                                                            <div className="flex-1">
                                                                <h4 className="text-sm font-serif italic text-zenith-charcoal">{pkg.groupName || pkg.name.split(' ').slice(0, -2).join(' ') || pkg.name}</h4>
                                                                <p className="md:hidden text-[10px] font-bold text-zenith-orange mt-1">{pkg.duration} • Rp {pkg.price.toLocaleString('id-ID')}</p>
                                                            </div>
                                                            
                                                            <div className="hidden md:flex items-center gap-x-0">
                                                                <div className="w-24 text-center">
                                                                    <span className="text-[10px] font-bold text-zenith-orange bg-white px-2 py-1 rounded-lg border border-zenith-orange/10">{pkg.duration}</span>
                                                                </div>
                                                                <div className="w-24 text-right">
                                                                    <p className="text-[10px] font-bold text-zenith-charcoal/60">Rp {pkg.price.toLocaleString('id-ID')}</p>
                                                                </div>
                                                            </div>

                                                            <button 
                                                                onClick={() => removePackageFromGuest(gIndex, pIndex)}
                                                                className="h-8 w-8 rounded-full bg-white text-zenith-charcoal/20 hover:text-red-500 flex items-center justify-center transition-all shadow-sm ml-2 md:ml-10"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">close</span>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {guests.length > 0 && (
                                    <div className="bg-zenith-charcoal rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl flex justify-between items-center mt-12 border-4 border-zenith-orange/20">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">{t.total}</span>
                                        <span className="text-3xl md:text-4xl font-serif italic text-zenith-orange">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                                    </div>
                                )}
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
                                                required type="text" placeholder="Nama penanggung jawab"
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

                                    <div className="space-y-6 pt-4">
                                        {guests.map((guest, index) => (
                                            <div key={index} className="p-6 rounded-[2rem] bg-zenith-surface/50 border border-zenith-orange/10">
                                                <h4 className="text-[10px] font-bold text-zenith-orange uppercase tracking-widest mb-4 flex items-center gap-x-2">
                                                    <span className="h-4 w-4 bg-zenith-orange text-white rounded-full flex items-center justify-center text-[8px] font-sans not-italic">{index + 1}</span>
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
                                                required placeholder="Alamat lengkap lokasi spa..."
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
                                            className="w-full py-5 bg-zenith-orange text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-zenith-orange/40 hover:bg-zenith-charcoal transition-all transform active:scale-95"
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
                    <div className="absolute inset-0 bg-zenith-charcoal/60 backdrop-blur-md" onClick={() => {
                        setShowAddModal(false);
                        setSearchQuery('');
                    }}></div>
                    <div className="relative bg-white w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col transform animate-scale-in">
                        <div className="p-8 border-b border-zenith-orange/5">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-serif italic text-zenith-charcoal">{t.modalTitle.replace('{n}', activeGuestIndex + 1)}</h3>
                                    <p className="text-zenith-charcoal/40 text-[9px] font-bold uppercase tracking-widest mt-1">{t.modalDesc}</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setSearchQuery('');
                                    }}
                                    className="h-10 w-10 rounded-full bg-zenith-surface flex items-center justify-center text-zenith-charcoal/40 hover:bg-zenith-orange/10 hover:text-zenith-orange transition-all"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            
                            {/* Search Bar */}
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-zenith-charcoal/20 group-focus-within:text-zenith-orange transition-colors">search</span>
                                <input 
                                    type="text" 
                                    placeholder={t.searchPlaceholder}
                                    className="w-full bg-zenith-surface border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Modal Table Header */}
                            <div className="hidden md:flex items-center px-6 py-2">
                                <span className="flex-1 text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest">{t.pkgName}</span>
                                <span className="w-32 text-center text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest">{t.duration}</span>
                                <span className="w-32 text-right text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest pr-14">{t.price}</span>
                            </div>

                            {filteredServiceGroups.length > 0 ? (
                                filteredServiceGroups.map((group) => {
                                    const variantIndex = selectedDurations[group.id] || 0;
                                    const currentVariant = group.variants[variantIndex];

                                    return (
                                        <div key={group.id} className="p-5 rounded-2xl bg-zenith-surface/50 border border-transparent hover:border-zenith-orange/20 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center">
                                            <div className="flex-1 w-full">
                                                <h4 className="text-lg font-serif italic text-zenith-charcoal">{group.name}</h4>
                                                <p className="text-[10px] font-bold text-zenith-charcoal/30 uppercase tracking-widest">{group.category}</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 w-full md:w-auto">
                                                <div className="w-full md:w-32">
                                                    {group.variants.length > 1 ? (
                                                        <select 
                                                            className="w-full bg-white border border-zenith-orange/10 rounded-xl px-3 py-2 text-xs font-bold text-zenith-charcoal focus:ring-1 focus:ring-zenith-orange"
                                                            value={variantIndex}
                                                            onChange={(e) => handleDurationChange(group.id, e.target.value)}
                                                        >
                                                            {group.variants.map((v, i) => (
                                                                <option key={i} value={i}>{v.duration}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <div className="text-center">
                                                            <span className="inline-block text-[10px] font-bold text-zenith-orange bg-zenith-orange/5 px-3 py-2 rounded-xl border border-zenith-orange/10">
                                                                {currentVariant.duration}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="text-right min-w-[100px] md:w-32">
                                                    <p className="text-sm font-bold text-zenith-charcoal">Rp {currentVariant.price.toLocaleString('id-ID')}</p>
                                                </div>

                                                <button 
                                                    onClick={() => addPackageToGuest(group)}
                                                    className="h-10 w-10 rounded-full bg-zenith-orange text-white flex items-center justify-center hover:bg-zenith-charcoal transition-all shadow-lg shadow-zenith-orange/20 shrink-0"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-20 text-center">
                                    <span className="material-symbols-outlined text-4xl text-zenith-charcoal/10 mb-2">search_off</span>
                                    <p className="text-zenith-charcoal/40 text-xs italic">Paket tidak ditemukan.</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 bg-zenith-surface/50 border-t border-zenith-orange/5 text-center">
                            <button 
                                onClick={() => {
                                    setShowAddModal(false);
                                    setSearchQuery('');
                                }}
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
