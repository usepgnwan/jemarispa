import { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import axios from 'axios';
import Navbar from '@/Components/Landing/Navbar';
import Footer from '@/Components/Landing/Footer';
import MobileNav from '@/Components/Landing/MobileNav';

const translations = {
    'ID': {
        step1: '1. Periksa Pesanan & Paket',
        step2: '2. Data Pemesan',
        title: 'Paket Per Pelanggan',
        empty: 'Belum ada paket yang dipilih untuk pelanggan ini.',
        seePackages: 'Klik Lihat Paket Disini',
        addMore: 'Tambah Paket',
        explore: 'Pilih Paket Sekarang',
        secureBooking: 'Konfirmasi Pesanan',
        fullName: 'Nama Pelanggan (Pemesan)',
        phone: 'Nomor WhatsApp',
        pax: 'Jumlah Pelanggan (Pax)',
        guestTitle: 'Detail Pelanggan ke-{n}',
        guestGender: 'Gender Pemesan',
        therapistGender: 'Gender Terapis',
        address: 'Alamat Lengkap',
        addressPlaceholder: 'Alamat lengkap customer...',
        date: 'Tanggal Booking',
        time: 'Jam Booking',
        payment: 'Metode Pembayaran',
        source: 'Tau Jemari dari mana?',
        sourceOptions: ['Instagram', 'Facebook', 'WhatsApp', 'Teman/Keluarga', 'Lainnya'],
        notes: 'Catatan Tambahan',
        notesPlaceholder: 'Contoh: Patokan rumah, atau permintaan khusus...',
        namePlaceholder: 'Nama Pelanggan',
        phonePlaceholder: '081...',
        checkout: 'Kirim Pesanan (WhatsApp)',
        modalTitle: 'Pilih Paket untuk Pelanggan ke-{n}',
        modalDesc: 'Pilih layanan dan tentukan durasinya',
        searchPlaceholder: 'Cari paket (misal: Pijat, Bekam...)',
        selectDuration: 'Pilih Durasi',
        pkgName: 'Nama Paket',
        duration: 'Durasi',
        price: 'Harga',
        finish: 'Selesai',
        toastAdd: 'Ditambahkan ke Pelanggan {n}: {name}',
        toastRemove: 'Dihapus dari Pelanggan {n}: {name}',
        total: 'Total pesanan',
        remove: 'Hapus',
        pria: 'Pria',
        wanita: 'Wanita',
        cash: 'Tunai',
        transfer: 'Transfer',
        minute: 'Menit',
        voucherInvalid: 'Voucher tidak ditemukan atau sudah kadaluarsa',
        voucherQuotaFull: 'Kuota voucher sudah habis',
        voucherSuccess: 'Voucher {code} berhasil dipasang!',
        voucherRemoved: 'Voucher dihapus',
        voucherApplied: 'Potongan Rp {amount} Berhasil!',
        haveVoucher: 'Punya Voucher?',
        enterVoucher: 'Masukkan kode...',
        apply: 'Pasang',
        removeVoucher: 'Hapus'
    },
    'EN': {
        step1: '1. Review Order & Packages',
        step2: '2. Customer Info',
        title: 'Packages Per Customer',
        empty: 'No packages selected for this customer.',
        seePackages: 'Click to View Packages Here',
        addMore: 'Add Package',
        explore: 'Explore Packages Now',
        secureBooking: 'Confirm Booking',
        fullName: 'Customer Name (PIC)',
        phone: 'WhatsApp Number',
        pax: 'Number of Customers',
        guestTitle: 'Customer {n} Details',
        guestGender: 'Guest Gender',
        therapistGender: 'Therapist Gender',
        address: 'Full Address',
        addressPlaceholder: 'Full customer address...',
        date: 'Booking Date',
        time: 'Booking Time',
        payment: 'Payment Method',
        source: 'How did you hear about us?',
        sourceOptions: ['Instagram', 'Facebook', 'WhatsApp', 'Friend/Family', 'Other'],
        notes: 'Additional Notes',
        notesPlaceholder: 'Example: House landmarks or special requests...',
        namePlaceholder: 'Customer Name',
        phonePlaceholder: '081...',
        checkout: 'Send via WhatsApp',
        modalTitle: 'Select Package for Customer {n}',
        modalDesc: 'Choose treatment and duration',
        searchPlaceholder: 'Search packages (e.g., Massage, Therapy...)',
        selectDuration: 'Select Duration',
        pkgName: 'Package Name',
        duration: 'Duration',
        price: 'Price',
        finish: 'Done',
        toastAdd: 'Added to Customer {n}: {name}',
        toastRemove: 'Removed from Customer {n}: {name}',
        total: 'Grand Total',
        remove: 'Remove',
        pria: 'Male',
        wanita: 'Female',
        cash: 'Cash',
        transfer: 'Transfer',
        minute: 'Minutes',
        voucherInvalid: 'Voucher not found or expired',
        voucherQuotaFull: 'Voucher quota is full',
        voucherSuccess: 'Voucher {code} applied successfully!',
        voucherRemoved: 'Voucher removed',
        voucherApplied: 'Discount Rp {amount} Applied!',
        haveVoucher: 'Have a Voucher?',
        enterVoucher: 'Enter code...',
        apply: 'Apply',
        removeVoucher: 'Remove'
    }
};

export default function Index({ auth, packages = [], signaturePackages = [] }) {
    const { app_settings } = usePage().props;
    const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ID');
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeGuestIndex, setActiveGuestIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDurations, setSelectedDurations] = useState({}); // { packageId: durationIndex }
    const [toast, setToast] = useState({ show: false, message: '' });

    // Initial State loading from LocalStorage
    const [pax, setPax] = useState(() => {
        const saved = localStorage.getItem('jemari_checkout_pax');
        return saved ? parseInt(saved) : 1;
    });

    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem('jemari_checkout_form');
        return saved ? JSON.parse(saved) : {
            name: '',
            phone: '',
            address: '',
            paymentMethod: 'cash',
            source: 'Instagram',
            date: '',
            time: '',
            notes: ''
        };
    });

    const [guests, setGuests] = useState(() => {
        const saved = localStorage.getItem('jemari_checkout_guests');
        return saved ? JSON.parse(saved) : [{
            guestGender: 'wanita',
            therapistGender: 'wanita',
            packages: []
        }];
    });

    const [voucherCode, setVoucherCode] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

    const isFirstRender = useRef(true);
    const t = translations[lang];

    // Page view analytic
    useEffect(() => {
        const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        axios.post(route('api.analytics.store'), {
            title: 'Halaman Keranjang',
            category: 'Cart',
            user_agent: navigator.userAgent,
            device_type: isMobileDevice ? 'mobile' : 'desktop'
        }).catch(err => console.error('Analytic failed', err));
    }, []);

    // Persist changes to LocalStorage
    useEffect(() => {
        if (!isFirstRender.current) {
            localStorage.setItem('jemari_checkout_pax', pax);
            localStorage.setItem('jemari_checkout_form', JSON.stringify(formData));
            localStorage.setItem('jemari_checkout_guests', JSON.stringify(guests));

            // Trigger reactivity for Navbar/MobileNav
            window.dispatchEvent(new Event('cart-updated'));
        }
    }, [pax, formData, guests]);

    // Handle items from Pricing Page (spa_cart)
    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('spa_cart') || '[]');

        if (savedCart.length > 0) {
            // Combine all cart items into Customer 1
            const newGuests = [...guests];
            if (newGuests.length === 0) {
                newGuests.push({
                    guestGender: 'wanita',
                    therapistGender: 'wanita',
                    packages: []
                });
            }

            const currentPackages = newGuests[0].packages || [];

            savedCart.forEach(item => {
                const pkgId = item.id.split('-')[0];
                const exists = currentPackages.some(p => p.id === pkgId && p.duration === item.duration);

                if (!exists) {
                    currentPackages.push({
                        id: pkgId,
                        name: item.name,
                        groupName: item.category || item.name,
                        price: parseFloat(item.price),
                        duration: item.duration
                    });
                }
            });

            newGuests[0].packages = currentPackages;
            setGuests(newGuests);
            // Don't change PAX, keep it as it was or at least 1
            if (pax < 1) setPax(1);

            localStorage.removeItem('spa_cart');
            localStorage.removeItem('pending_service');
            isFirstRender.current = false;
        }

        if (isFirstRender.current) {
            isFirstRender.current = false;
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

    const handleDurationChange = (packageId, durationIndex) => {
        setSelectedDurations(prev => ({
            ...prev,
            [packageId]: parseInt(durationIndex)
        }));
    };

    const addPackageToGuest = (pkg) => {
        if (activeGuestIndex === null) return;

        const durationIndex = selectedDurations[pkg.id] || 0;
        const d = pkg.durations[durationIndex];

        const title = lang === 'EN' ? (pkg.title_en || pkg.title_id) : pkg.title_id;
        const packageNameWithDuration = `${title} ${formatDuration(d.duration)}`;

        const newGuests = [...guests];
        const activeGuest = newGuests[activeGuestIndex];

        // Check if this specific package + duration is already added
        const isAlreadyAdded = activeGuest.packages.some(p => p.name === packageNameWithDuration);
        if (isAlreadyAdded) return;

        const packageToAdd = {
            name: packageNameWithDuration,
            groupName: title,
            price: parseFloat(d.price),
            duration: d.duration
        };

        activeGuest.packages.push(packageToAdd);
        setGuests(newGuests);

        showToast(t.toastAdd.replace('{n}', activeGuestIndex + 1).replace('{name}', packageToAdd.name));
        // Modal stays open as requested
    };

    const removePackageFromGuest = (guestIndex, pkgIndex) => {
        const newGuests = [...guests];
        const removedPkg = newGuests[guestIndex].packages[pkgIndex];
        newGuests[guestIndex].packages.splice(pkgIndex, 1);
        setGuests(newGuests);

        showToast(t.toastRemove.replace('{n}', guestIndex + 1).replace('{name}', removedPkg.name));
    };

    const handleApplyVoucher = async () => {
        if (!voucherCode) return;
        setIsValidatingVoucher(true);
        try {
            const response = await axios.post(route('admin.voucher.validate'), { code: voucherCode });
            if (response.data.success) {
                setAppliedVoucher(response.data.voucher);
                showToast(t.voucherSuccess.replace('{code}', response.data.voucher.code));
            }
        } catch (error) {
            console.error(error);
            let msg = t.voucherInvalid;
            if (error.response?.status === 422) {
                msg = t.voucherQuotaFull;
            }
            showToast(msg);
            setAppliedVoucher(null);
        } finally {
            setIsValidatingVoucher(false);
        }
    };

    const removeVoucher = () => {
        setAppliedVoucher(null);
        setVoucherCode('');
        showToast(t.voucherRemoved);
    };

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const calculateSubtotal = () => {
        return guests.reduce((total, guest) => {
            return total + guest.packages.reduce((pTotal, pkg) => pTotal + pkg.price, 0);
        }, 0);
    };

    const calculateGrandTotal = () => {
        const subtotal = calculateSubtotal();
        const voucherDiscount = appliedVoucher ? parseFloat(appliedVoucher.discount_amount) : 0;
        return Math.max(0, subtotal - voucherDiscount);
    };

    const filteredPackages = packages.filter(p => {
        const title = lang === 'EN' ? (p.title_en || p.title_id) : p.title_id;
        const category = lang === 'EN' ? (p.category_en || p.category_id) : p.category_id;
        return title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (category && category.toLowerCase().includes(searchQuery.toLowerCase()));
    });

    const formatDuration = (d) => {
        if (!d) return '';
        const durationStr = String(d);
        // Clean any existing duration labels to ensure reactivity
        const numericPart = durationStr.replace(/(menit|minutes|mins|min)/gi, '').trim();
        return `${numericPart} ${t.minute}`;
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        const hasPackages = guests.some(g => g.packages.length > 0);
        if (!hasPackages) {
            showToast(lang === 'ID' ? 'Pilih minimal satu paket!' : 'Select at least one package!');
            return;
        }

        const totalPrice = calculateGrandTotal();
        const guestDetails = guests.map((g, i) => {
            const pkgs = g.packages.map(p => `${p.name} @ Rp ${p.price.toLocaleString('id-ID')}`).join('\n    ');
            return `Pelanggan ${i + 1}:\n  Gender: ${g.guestGender === 'pria' ? t.pria : t.wanita}\n  Terapis: ${g.therapistGender === 'pria' ? t.pria : t.wanita}\n  Treatment:\n    ${pkgs || '(Belum pilih paket)'}`;
        }).join('\n\n');

        const payload = {
            customer_name: formData.name,
            phone: formData.phone,
            address: formData.address,
            schedule_date: formData.date,
            schedule_time: formData.time,
            payment_method: formData.paymentMethod === 'cash' ? t.cash : t.transfer,
            source: formData.source,
            notes: formData.notes,
            total_price: totalPrice,
            voucher_id: appliedVoucher?.id,
            guests: guests,
        };

        try {
            const response = await axios.post(route('transactions.store'), payload);

            if (response.data.success) {
                const transaction = response.data.transaction;

                // Open WhatsApp
                let adminPhone = app_settings?.phone || '6289516166090';
                adminPhone = adminPhone.toString().replace(/[^0-9]/g, '');
                if (adminPhone.startsWith('0')) {
                    adminPhone = '62' + adminPhone.substring(1);
                } else if (adminPhone.startsWith('8')) {
                    adminPhone = '62' + adminPhone;
                }

                const rawTemplate = app_settings?.template_order || `Halo Jemari Spa, saya ingin memesan untuk [pax] orang:\n\n[details]\n\nTotal Bayar: [total]\n\nData Customer:\nNama: [name]\nWhatsApp: [phone]\nAlamat: [address]\n\nDetail Kedatangan:\nTanggal: [date]\nJam: [time]\nBayar via: [payment]\nSumber: [source]\nCatatan: [notes]`;

                // Complex groupings for WA tags
                const allGenders = guests.map((g, i) => `Pelanggan ${i + 1}: ${g.guestGender === 'pria' ? t.pria : t.wanita}`).join(', ');
                const allTherapistGenders = guests.map((g, i) => `Pelanggan ${i + 1}: ${g.therapistGender === 'pria' ? t.pria : t.wanita}`).join(', ');
                const groupedPackages = guests.map((g, i) => {
                    const pkgs = g.packages.map(p => `${p.groupName} ${formatDuration(p.duration)} @ Rp ${p.price.toLocaleString('id-ID')}`).join('\n  - ');
                    return `Pelanggan ${i + 1}:\n  - ${pkgs}`;
                }).join('\n');

                const waData = {
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    date: formData.date,
                    time: formData.time,
                    schedule: `${formData.date}, ${formData.time}`,
                    payment: payload.payment_method,
                    pax: pax,
                    details: guestDetails, // Keeping this for backward compatibility
                    gender: allGenders,
                    package: `\n${groupedPackages}`,
                    therapist_pax: pax,
                    therapist_gender: allTherapistGenders,
                    total: `Rp ${totalPrice.toLocaleString('id-ID')}${appliedVoucher ? ` (Sudah potong Voucher ${appliedVoucher.code} -Rp ${parseFloat(appliedVoucher.discount_amount).toLocaleString('id-ID')})` : ''}`,
                    source: formData.source,
                    notes: formData.notes || '-',
                    order_number: transaction.order_number
                };

                let message = (app_settings?.template_order || `Halo Jemari Spa, saya ingin memesan untuk [pax] orang:\n\n[details]\n\nTotal Bayar: [total]\n\nData Pelanggan:\nNama: [name]\nWhatsApp: [phone]\nAlamat: [address]\n\nDetail Kedatangan:\nTanggal: [date]\nJam: [time]\nBayar via: [payment]\nSumber: [source]\nCatatan: [notes]`);

                // Convert HTML tags to newlines for WA compatibility
                message = message.replace(/<\/p><p>/g, '\n')
                    .replace(/<p>/g, '')
                    .replace(/<\/p>/g, '\n')
                    .replace(/<strong>/g, '*')
                    .replace(/<\/strong>/g, '*')
                    .replace(/<br\s*\/?>/g, '\n')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/<[^>]*>?/gm, ''); // Strip all other tags

                for (const key in waData) {
                    message = message.split(`[${key}]`).join(waData[key]);
                }

                const encodedMessage = encodeURIComponent(message);
                const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

                // Use WhatsApp Web for desktop
                const waUrl = isMobileDevice
                    ? `https://wa.me/${adminPhone}?text=${encodedMessage}`
                    : `https://web.whatsapp.com/send?phone=${adminPhone}&text=${encodedMessage}`;

                // Track interaction
                try {
                    await axios.post(route('api.analytics.store'), {
                        title: formData.name || 'Anonymous',
                        category: 'Checkout WA',
                        user_agent: navigator.userAgent,
                        device_type: isMobileDevice ? 'mobile' : 'desktop'
                    });
                } catch (e) {
                    console.error('Tracking failed', e);
                }

                window.open(waUrl, '_blank');

                // Clear cart and state
                localStorage.removeItem('jemari_checkout_pax');
                localStorage.removeItem('jemari_checkout_form');
                localStorage.removeItem('jemari_checkout_guests');

                router.visit('/');
            }
        } catch (error) {
            console.error(error);
            showToast(lang === 'ID' ? 'Terjadi kesalahan saat memproses pesanan.' : 'An error occurred while processing your order.');
        }
    };

    return (
        <div className="font-sans text-zenith-charcoal antialiased bg-zenith-surface">
            <Head title={`${lang === 'ID' ? 'Checkout Pesanan' : 'Checkout Order'} - Jemari Spa`} />

            <Navbar auth={auth} lang={lang} setLang={setLang} forceSolid={true} signaturePackages={signaturePackages} />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Left: Per-Guest Packages */}
                        <div className="flex-1">
                            <div className="mb-6">
                                <h1 className="text-[10px] font-bold text-zenith-orange uppercase tracking-[0.3em] mb-1">{t.step1}</h1>
                                <h2 className="text-3xl font-bold text-zenith-charcoal">{t.title}</h2>
                            </div>

                            {/* Pax Selection moved to left */}
                            <div className="mb-6 bg-white rounded-3xl p-5 shadow-lg border border-zenith-orange/5">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-[9px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block">{t.pax}</label>
                                    <span className="text-[10px] font-bold text-zenith-orange">{pax} {lang === 'ID' ? 'Pelanggan' : 'Customer'}</span>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-8 gap-2">
                                    {[1, 2, 3, 4, 5, 6].map(n => (
                                        <button
                                            key={n}
                                            type="button"
                                            onClick={() => handlePaxChange(n)}
                                            className={`h-10 rounded-xl text-[12px] font-bold transition-all border ${pax === n
                                                ? 'bg-zenith-orange text-white border-zenith-orange shadow-lg shadow-zenith-orange/20'
                                                : 'bg-zenith-surface text-zenith-charcoal/40 border-transparent hover:border-zenith-orange/20'
                                                }`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                    <div className="relative col-span-2 sm:col-span-1">
                                        <select
                                            className={`w-full h-10 pl-3 pr-8 rounded-xl text-[10px] font-bold appearance-none cursor-pointer border transition-all ${pax > 6
                                                ? 'bg-zenith-orange text-white border-zenith-orange'
                                                : 'bg-zenith-surface text-zenith-charcoal/40 border-transparent'
                                                }`}
                                            value={pax > 6 ? pax : ''}
                                            onChange={(e) => handlePaxChange(e.target.value)}
                                        >
                                            <option value="" disabled>{lang === 'ID' ? 'Lain' : 'Other'}</option>
                                            {[7, 8, 9, 10, 11, 12, 13, 14, 15].map(n => (
                                                <option key={n} value={n} className="text-zenith-charcoal">{n}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                            <span className={`material-symbols-outlined text-[14px] ${pax > 6 ? 'text-white' : 'text-zenith-charcoal/20'}`}>expand_more</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {guests.map((guest, gIndex) => (
                                    <div key={gIndex} className="bg-white rounded-[2.5rem] shadow-2xl border border-zenith-orange/5 overflow-hidden">
                                        <div className="p-8 md:p-10">
                                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8 pb-4 border-b border-zenith-orange/5">
                                                <div className="flex flex-col gap-4">
                                                    <h3 className="text-xl font-bold flex items-center gap-x-3">
                                                        <span className="h-6 w-6 bg-zenith-orange text-white rounded-full flex items-center justify-center text-[10px] font-sans not-italic">{gIndex + 1}</span>
                                                        {t.guestTitle.replace('{n}', gIndex + 1)}
                                                    </h3>

                                                    <div className="flex gap-x-6">
                                                        <div className="flex flex-col gap-y-1.5">
                                                            <label className="text-[7px] font-bold text-zenith-charcoal/30 uppercase tracking-[0.2em]">{t.guestGender}</label>
                                                            <div className="flex bg-zenith-surface p-1 rounded-xl border border-zenith-orange/5 w-fit">
                                                                {['pria', 'wanita'].map((g) => (
                                                                    <button
                                                                        key={g}
                                                                        type="button"
                                                                        onClick={() => updateGuest(gIndex, 'guestGender', g)}
                                                                        className={`px-4 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-all ${guest.guestGender === g
                                                                            ? 'bg-zenith-orange text-white shadow-sm'
                                                                            : 'text-zenith-charcoal/30 hover:text-zenith-orange'
                                                                            }`}
                                                                    >
                                                                        {t[g]}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-y-1.5">
                                                            <label className="text-[7px] font-bold text-zenith-charcoal/30 uppercase tracking-[0.2em]">{t.therapistGender}</label>
                                                            <div className="flex bg-zenith-surface p-1 rounded-xl border border-zenith-orange/5 w-fit">
                                                                {['pria', 'wanita'].map((g) => (
                                                                    <button
                                                                        key={g}
                                                                        type="button"
                                                                        onClick={() => updateGuest(gIndex, 'therapistGender', g)}
                                                                        className={`px-4 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-all ${guest.therapistGender === g
                                                                            ? 'bg-zenith-orange text-white shadow-sm'
                                                                            : 'text-zenith-charcoal/30 hover:text-zenith-orange'
                                                                            }`}
                                                                    >
                                                                        {t[g]}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {guest.packages.length > 0 && (
                                                    <button
                                                        onClick={() => {
                                                            setActiveGuestIndex(gIndex);
                                                            setShowAddModal(true);
                                                        }}
                                                        className="w-fit inline-flex items-center gap-x-2 px-6 py-3 rounded-full bg-zenith-orange text-white text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-zenith-orange/20 hover:bg-zenith-charcoal transition-all"
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
                                                    <div className="hidden md:flex items-center px-4 py-2 border-b border-zenith-orange/5">
                                                        <span className="flex-1 text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest">{t.pkgName}</span>
                                                        <span className="w-24 text-center text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest">{t.duration}</span>
                                                        <span className="w-24 text-right text-[8px] font-bold text-zenith-charcoal/30 uppercase tracking-widest mr-10">{t.price}</span>
                                                    </div>

                                                    {guest.packages.map((pkg, pIndex) => (
                                                        <div key={pIndex} className="flex flex-col md:flex-row md:items-center bg-zenith-surface/50 p-4 rounded-2xl group transition-all hover:bg-zenith-orange/[0.03]">
                                                            <div className="flex-1">
                                                                <span className="text-[7px] font-bold text-zenith-orange uppercase tracking-[0.2em] mb-1 block">{pkg.groupName}</span>
                                                                <h4 className="text-sm text-zenith-charcoal">{pkg.groupName} {formatDuration(pkg.duration)}</h4>
                                                                <p className="md:hidden text-[10px] font-bold text-zenith-orange mt-1">{formatDuration(pkg.duration)} • Rp {pkg.price.toLocaleString('id-ID')}</p>
                                                            </div>

                                                            <div className="hidden md:flex items-center gap-x-0">
                                                                <div className="w-24 text-center">
                                                                    <span className="text-[10px] font-bold text-zenith-orange bg-white px-2 py-1 rounded-lg border border-zenith-orange/10">{formatDuration(pkg.duration)}</span>
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
                                        <div className="text-right">
                                            {appliedVoucher && (
                                                <p className="text-[10px] text-zenith-orange font-bold uppercase mb-1">
                                                    Voucher: {appliedVoucher.code} (-Rp {parseFloat(appliedVoucher.discount_amount).toLocaleString('id-ID')})
                                                </p>
                                            )}
                                            <span className="text-3xl md:text-4xl font-bold text-zenith-orange">Rp {calculateGrandTotal().toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Checkout Form */}
                        <div className="w-full lg:w-[480px]">
                            <div className="mb-6">
                                <h1 className="text-[10px] font-bold text-zenith-orange uppercase tracking-[0.3em] mb-1">{t.step2}</h1>
                                <h2 className="text-3xl font-bold text-zenith-charcoal">{t.secureBooking}</h2>
                            </div>

                            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-zenith-orange/5">
                                <form onSubmit={handleCheckout} className="space-y-8">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[9px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.fullName}</label>
                                            <input
                                                required type="text" placeholder={t.namePlaceholder}
                                                className="w-full bg-zenith-surface border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[9px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.phone}</label>
                                            <input
                                                required type="tel" placeholder={t.phonePlaceholder}
                                                className="w-full bg-zenith-surface border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[9px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.address}</label>
                                            <textarea
                                                required placeholder={t.addressPlaceholder}
                                                className="w-full bg-zenith-surface border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange h-24"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            ></textarea>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[9px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.date}</label>
                                                <input
                                                    required type="date"
                                                    className="w-full bg-zenith-surface border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange"
                                                    value={formData.date}
                                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.time}</label>
                                                <input
                                                    required type="time"
                                                    className="w-full bg-zenith-surface border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-zenith-orange"
                                                    value={formData.time}
                                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-[9px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-2">{t.payment}</label>
                                                <div className="flex gap-2">
                                                    {['cash', 'transfer'].map((p) => (
                                                        <label key={p} className="flex-1 cursor-pointer">
                                                            <input type="radio" name="paymentMethod" className="hidden peer" value={p} checked={formData.paymentMethod === p} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} />
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
                                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
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
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            ></textarea>
                                        </div>

                                        <div className="bg-zenith-surface p-6 rounded-3xl border border-zenith-orange/5">
                                            <label className="text-[9px] font-bold text-zenith-charcoal/40 uppercase tracking-widest block mb-3">
                                                {t.haveVoucher}
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder={t.enterVoucher}
                                                    className="flex-1 bg-white border-none rounded-xl px-4 py-3 text-xs font-bold uppercase placeholder:text-gray-300 focus:ring-2 focus:ring-zenith-orange transition-all disabled:opacity-50"
                                                    value={voucherCode}
                                                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                                    disabled={appliedVoucher || isValidatingVoucher}
                                                />
                                                {appliedVoucher ? (
                                                    <button
                                                        type="button"
                                                        onClick={removeVoucher}
                                                        className="px-4 bg-red-500 text-white rounded-xl text-[10px] font-bold uppercase transition-all hover:bg-red-600"
                                                    >
                                                        {t.removeVoucher}
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={handleApplyVoucher}
                                                        disabled={!voucherCode || isValidatingVoucher}
                                                        className="px-6 bg-zenith-charcoal text-white rounded-xl text-[10px] font-bold uppercase transition-all hover:bg-zenith-orange disabled:opacity-50"
                                                    >
                                                        {isValidatingVoucher ? '...' : t.apply}
                                                    </button>
                                                )}
                                            </div>
                                            {appliedVoucher && (
                                                <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase">
                                                    <span className="material-symbols-outlined text-[14px]">verified</span>
                                                    <span>{t.voucherApplied.replace('{amount}', parseFloat(appliedVoucher.discount_amount).toLocaleString('id-ID'))}</span>
                                                </div>
                                            )}
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
                                    <h3 className="text-xl font-bold text-zenith-charcoal">{t.modalTitle.replace('{n}', activeGuestIndex + 1)}</h3>
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

                            {filteredPackages.length > 0 ? (
                                filteredPackages.map((pkg) => {
                                    const durationIndex = selectedDurations[pkg.id] || 0;
                                    const currentDuration = pkg.durations[durationIndex] || { duration: '-', price: 0 };

                                    const title = lang === 'EN' ? (pkg.title_en || pkg.title_id) : pkg.title_id;
                                    const category = lang === 'EN' ? (pkg.category_en || pkg.category_id) : pkg.category_id;

                                    return (
                                        <div key={pkg.id} className="p-5 rounded-2xl bg-zenith-surface/50 border border-transparent hover:border-zenith-orange/20 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center">
                                            <div className="flex-1 w-full">
                                                <h4 className="text-lg text-zenith-charcoal">{title}</h4>
                                                <p className="text-[10px] font-bold text-zenith-charcoal/30 uppercase tracking-widest">{category}</p>
                                            </div>

                                            <div className="flex items-center gap-4 w-full md:w-auto">
                                                <div className="w-full md:w-32">
                                                    {pkg.durations && pkg.durations.length > 1 ? (
                                                        <select
                                                            className="w-full bg-white border border-zenith-orange/10 rounded-xl px-3 py-2 text-xs font-bold text-zenith-charcoal focus:ring-1 focus:ring-zenith-orange"
                                                            value={durationIndex}
                                                            onChange={(e) => handleDurationChange(pkg.id, e.target.value)}
                                                        >
                                                            {pkg.durations.map((d, i) => (
                                                                <option key={d.id} value={i}>{formatDuration(d.duration)}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <div className="text-center">
                                                            <span className="inline-block text-[10px] font-bold text-zenith-orange bg-zenith-orange/5 px-3 py-2 rounded-xl border border-zenith-orange/10">
                                                                {formatDuration(currentDuration.duration)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="text-right min-w-[100px] md:w-32">
                                                    <p className="text-sm font-bold text-zenith-charcoal">Rp {parseFloat(currentDuration.price).toLocaleString('id-ID')}</p>
                                                </div>

                                                {guests[activeGuestIndex]?.packages.findIndex(p => p.name === `${title} ${formatDuration(currentDuration.duration)}`) !== -1 ? (
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {/* Checklist Status */}
                                                        <div className="h-10 w-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20">
                                                            <span className="material-symbols-outlined text-[20px]">check</span>
                                                        </div>
                                                        {/* Unchecklist Action */}
                                                        <button
                                                            onClick={() => {
                                                                const pkgIdx = guests[activeGuestIndex].packages.findIndex(p => p.name === `${title} ${formatDuration(currentDuration.duration)}`);
                                                                if (pkgIdx !== -1) removePackageFromGuest(activeGuestIndex, pkgIdx);
                                                            }}
                                                            className="h-10 w-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                                                            title="Hapus"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">close</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => addPackageToGuest(pkg)}
                                                        className="h-10 w-10 rounded-full bg-zenith-orange text-white flex items-center justify-center hover:bg-zenith-charcoal transition-all shadow-lg shadow-zenith-orange/20 shrink-0"
                                                        title="Tambah"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">add</span>
                                                    </button>
                                                )}
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

            <Footer lang={lang} setLang={setLang} />
            <MobileNav lang={lang} />
        </div>
    );
}
