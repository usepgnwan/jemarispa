import { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import {
    ShoppingCartIcon,
    UserIcon,
    ClockIcon,
    CalendarIcon,
    MapPinIcon,
    BanknotesIcon,
    ChatBubbleLeftRightIcon,
    PlusIcon,
    TrashIcon,
    XMarkIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    InformationCircleIcon,
    MagnifyingGlassIcon,
    IdentificationIcon,
    CreditCardIcon,
    TruckIcon,
    ClipboardDocumentListIcon,
    ChevronRightIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import Modal from '@/Components/Modal';

export default function Index({ auth, packages = [], employees = [], todayTransactions = [], platforms = [], app_settings }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeGuestIndex, setActiveGuestIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDurations, setSelectedDurations] = useState({});
    const [toast, setToast] = useState({ show: false, message: '' });
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [lastTransaction, setLastTransaction] = useState(null);

    const [pax, setPax] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        paymentMethod: 'cash',
        source: 'Instagram',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':'),
        transport_fee: 0,
        notes: ''
    });

    const [guests, setGuests] = useState([{
        guestGender: 'wanita',
        therapistGender: 'wanita',
        employee_id: '',
        therapist_commission: 0,
        packages: []
    }]);

    const handlePaxChange = (newPax) => {
        const count = parseInt(newPax);
        setPax(count);

        const newGuests = [...guests];
        if (count > guests.length) {
            for (let i = guests.length; i < count; i++) {
                newGuests.push({
                    guestGender: 'wanita',
                    therapistGender: 'wanita',
                    employee_id: '',
                    therapist_commission: 0,
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

        const packageToAdd = {
            name: `${pkg.title_id} ${d.duration}`,
            groupName: pkg.title_id,
            price: parseFloat(d.price),
            duration: d.duration
        };

        const newGuests = [...guests];
        newGuests[activeGuestIndex].packages.push(packageToAdd);
        setGuests(newGuests);

        showToast(`Ditambahkan ke Orang ${activeGuestIndex + 1}`);
    };

    const removePackageFromGuest = (guestIndex, pkgIndex) => {
        const newGuests = [...guests];
        newGuests[guestIndex].packages.splice(pkgIndex, 1);
        setGuests(newGuests);
    };

    const calculateItemsTotal = () => {
        return guests.reduce((total, guest) => {
            return total + guest.packages.reduce((pTotal, pkg) => pTotal + pkg.price, 0);
        }, 0);
    };

    const calculateGrandTotal = () => {
        return calculateItemsTotal() + (parseFloat(formData.transport_fee) || 0);
    };

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const filteredPackages = packages.filter(p => {
        return p.title_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.category_id && p.category_id.toLowerCase().includes(searchQuery.toLowerCase()));
    });

    const handleCheckout = async (e) => {
        e.preventDefault();
        const hasPackages = guests.some(g => g.packages.length > 0);
        if (!hasPackages) {
            showToast('Pilih minimal satu paket!');
            return;
        }

        const payload = {
            customer_name: formData.name,
            phone: formData.phone,
            address: formData.address,
            schedule_date: formData.date,
            schedule_time: formData.time,
            payment_method: formData.paymentMethod,
            source: formData.source,
            notes: formData.notes,
            total_price: calculateGrandTotal(),
            transport_fee: formData.transport_fee,
            guests: guests,
        };

        try {
            const response = await axios.post(route('admin.pos.store'), payload);

            if (response.data.success) {
                setLastTransaction(response.data.transaction);
                setShowInvoiceModal(true);

                // Reset Form
                setFormData({
                    name: '',
                    phone: '',
                    address: '',
                    paymentMethod: 'cash',
                    source: 'Instagram',
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':'),
                    transport_fee: 0,
                    notes: ''
                });
                setPax(1);
                setGuests([{
                    guestGender: 'wanita',
                    therapistGender: 'wanita',
                    employee_id: '',
                    therapist_commission: 0,
                    packages: []
                }]);

                showToast('Transaksi POS berhasil disimpan');
            }
        } catch (error) {
            console.error(error);
            showToast('Terjadi kesalahan saat memproses pesanan.');
        }
    };

    const sendInvoice = (transaction) => {
        const phone = transaction.phone || app_settings?.phone || '';
        const rawTemplate = app_settings?.template_invoice || `Halo Kak [name], terlampir invoice [invoice_no]...`;

        const formatCurrency = (val) => `Rp ${parseFloat(val).toLocaleString('id-ID')}`;

        // Group items by guest_index
        const grouped = transaction.items.reduce((acc, item) => {
            if (!acc[item.guest_index]) acc[item.guest_index] = [];
            acc[item.guest_index].push(item);
            return acc;
        }, {});

        const detailsText = Object.entries(grouped).map(([index, items]) => {
            const personDetails = items.map(item => `  - ${item.package_name} (${item.package_duration})`).join('\n');
            return `*Person ${index}*:\n${personDetails}`;
        }).join('\n\n');

        const safeOrderNumber = transaction.order_number.replace(/\//g, '-');
        const link = `${window.location.origin}/invoice/${safeOrderNumber}`;

        const waData = {
            name: transaction.customer_name,
            invoice_no: transaction.order_number,
            details: detailsText,
            transport: formatCurrency(transaction.transport_fee || 0),
            total: formatCurrency(transaction.total_price),
            link: link
        };

        let message = rawTemplate;
        message = message.replace(/<\/p><p>/g, '\n').replace(/<p>/g, '').replace(/<\/p>/g, '\n').replace(/<br\s*\/?>/g, '\n').replace(/&nbsp;/g, ' ').replace(/<[^>]*>?/gm, '');

        for (const key in waData) {
            message = message.split(`[${key}]`).join(waData[key]);
        }

        const encodedMessage = encodeURIComponent(message);
        const cleanPhone = phone.toString().replace(/[^0-9]/g, '');
        const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;

        const waUrl = `https://wa.me/${waPhone}?text=${encodedMessage}`;
        window.open(waUrl, '_blank');
    };

    return (
        <AuthenticatedLayout
            auth={auth}
        >
            <Head title="Admin POS - Jemari Spa" />

            <div className="min-h-screen bg-[#FAFAF9] -mx-4 sm:-mx-6 lg:-mx-8">
                {/* Top Sticky Header */}
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zenith-orange/10 rounded-2xl flex items-center justify-center text-zenith-orange">
                            <ShoppingCartIcon className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Terminal POS</h1>
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Session • {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowHistoryModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-bold text-gray-600 hover:border-zenith-orange hover:text-zenith-orange transition-all uppercase tracking-widest shadow-sm"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                            History Transaksi
                        </button>
                    </div>
                </div>

                <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                        {/* LEFT: Guest & Package Area (8/12) */}
                        <div className="xl:col-span-8 space-y-8">
                            {/* Control Bar */}
                            <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Jumlah Orang:</span>
                                    <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => handlePaxChange(n)}
                                                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${pax === n
                                                        ? 'bg-zenith-orange text-white shadow-md'
                                                        : 'text-gray-400 hover:text-zenith-orange'
                                                    }`}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                        <select
                                            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-400 w-12 cursor-pointer"
                                            value={pax > 5 ? pax : ''}
                                            onChange={(e) => handlePaxChange(e.target.value)}
                                        >
                                            <option value="" disabled>+</option>
                                            {[6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-zenith-orange bg-zenith-orange/5 px-4 py-2 rounded-full">
                                    <InformationCircleIcon className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Pilih paket untuk setiap orang</span>
                                </div>
                            </div>

                            {/* Guest Tickets */}
                            <div className="grid grid-cols-1 gap-6">
                                {guests.map((guest, gIndex) => (
                                    <div key={gIndex} className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-zenith-orange/5 transition-all duration-500 overflow-hidden relative">
                                        {/* Decorative Ticket Notch */}
                                        <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#FAFAF9] rounded-full border border-gray-100"></div>
                                        <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#FAFAF9] rounded-full border border-gray-100"></div>

                                        <div className="p-8">
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-zenith-charcoal text-white rounded-2xl flex items-center justify-center font-serif italic text-xl shadow-lg">
                                                        {gIndex + 1}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">Treatment Ticket</h4>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Orang Ke-{gIndex + 1}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveGuestIndex(gIndex);
                                                        setShowAddModal(true);
                                                    }}
                                                    className="p-3 bg-zenith-orange text-white rounded-2xl shadow-lg shadow-zenith-orange/20 hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    <PlusIcon className="w-6 h-6" />
                                                </button>
                                            </div>

                                            {/* Packages Section */}
                                            <div className="space-y-4 mb-8 min-h-[120px]">
                                                {guest.packages.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center py-8 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100 group-hover:border-zenith-orange/20 transition-colors">
                                                        <ClipboardDocumentListIcon className="w-8 h-8 text-gray-200 mb-2" />
                                                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Belum ada paket</p>
                                                    </div>
                                                ) : (
                                                    guest.packages.map((pkg, pIndex) => (
                                                        <div key={pIndex} className="flex items-center justify-between bg-gray-50/80 p-4 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                                                            <div className="flex-1">
                                                                <p className="font-bold text-sm text-gray-800 leading-tight">{pkg.name}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-[9px] font-bold text-zenith-orange uppercase">{pkg.duration}</span>
                                                                    <span className="text-[9px] text-gray-300">•</span>
                                                                    <span className="text-[9px] font-bold text-gray-400">Rp {pkg.price.toLocaleString('id-ID')}</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removePackageFromGuest(gIndex, pIndex)}
                                                                className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            >
                                                                <XMarkIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            {/* Staff Assignment Section */}
                                            <div className="bg-zenith-charcoal/[0.02] p-6 rounded-[2rem] border border-gray-50 space-y-5">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                            <IdentificationIcon className="w-3.5 h-3.5" />
                                                            Pilih Terapis
                                                        </label>
                                                        <select
                                                            className="w-full bg-white border-gray-100 rounded-xl py-2.5 px-3 text-xs font-bold text-gray-700 focus:ring-zenith-orange shadow-sm"
                                                            value={guest.employee_id}
                                                            onChange={(e) => updateGuest(gIndex, 'employee_id', e.target.value)}
                                                        >
                                                            <option value="">(Belum Ada)</option>
                                                            {employees.map(emp => (
                                                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                            <BanknotesIcon className="w-3.5 h-3.5" />
                                                            Komisi
                                                        </label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">Rp</span>
                                                            <input
                                                                type="number"
                                                                className="w-full bg-white border-gray-100 rounded-xl py-2.5 pl-8 pr-3 text-xs font-bold text-zenith-orange focus:ring-zenith-orange shadow-sm"
                                                                value={guest.therapist_commission}
                                                                onChange={(e) => updateGuest(gIndex, 'therapist_commission', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Gender Guest</label>
                                                        <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                                                            {['pria', 'wanita'].map(g => (
                                                                <label key={g} className="flex-1 cursor-pointer">
                                                                    <input type="radio" name={`guestGender-${gIndex}`} className="hidden peer" checked={guest.guestGender === g} onChange={() => updateGuest(gIndex, 'guestGender', g)} />
                                                                    <div className="text-center py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-gray-400 peer-checked:bg-zenith-charcoal peer-checked:text-white transition-all">{g}</div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Gender Terapis</label>
                                                        <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                                                            {['pria', 'wanita'].map(g => (
                                                                <label key={g} className="flex-1 cursor-pointer">
                                                                    <input type="radio" name={`therapistGender-${gIndex}`} className="hidden peer" checked={guest.therapistGender === g} onChange={() => updateGuest(gIndex, 'therapistGender', g)} />
                                                                    <div className="text-center py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-gray-400 peer-checked:bg-zenith-orange peer-checked:text-white transition-all">{g}</div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: Checkout Sidebar (4/12) */}
                        <div className="xl:col-span-4 space-y-8">
                            <form onSubmit={handleCheckout} className="sticky top-28 space-y-8">
                                {/* Customer Data Card */}
                                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                                    <div className="bg-zenith-charcoal p-8">
                                        <div className="flex items-center gap-3 mb-1">
                                            <UserIcon className="w-5 h-5 text-zenith-orange" />
                                            <h4 className="font-bold text-white uppercase tracking-widest text-sm">Penanggung Jawab</h4>
                                        </div>
                                        <p className="text-gray-400 text-[10px]">Data utama untuk pengiriman invoice</p>
                                    </div>

                                    <div className="p-8 space-y-6">
                                        <div className="space-y-1">
                                            <input
                                                required type="text" placeholder="Nama Pelanggan"
                                                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-zenith-orange placeholder:text-gray-300"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-gray-200 pr-3">
                                                    <span className="text-sm font-bold text-gray-400">+62</span>
                                                </div>
                                                <input
                                                    required type="tel" placeholder="Nomor WhatsApp"
                                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-16 text-sm font-bold focus:ring-2 focus:ring-zenith-orange placeholder:text-gray-300"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative group">
                                                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-zenith-orange transition-colors" />
                                                <input
                                                    required type="date"
                                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-12 text-xs font-bold focus:ring-2 focus:ring-zenith-orange"
                                                    value={formData.date}
                                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                />
                                            </div>
                                            <div className="relative group">
                                                <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-zenith-orange transition-colors" />
                                                <input
                                                    required type="time"
                                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-12 text-xs font-bold focus:ring-2 focus:ring-zenith-orange"
                                                    value={formData.time}
                                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="relative">
                                                <MapPinIcon className="absolute left-4 top-4 w-5 h-5 text-gray-300" />
                                                <textarea
                                                    required placeholder="Alamat Lengkap..."
                                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-12 text-sm font-bold focus:ring-2 focus:ring-zenith-orange h-24 placeholder:text-gray-300"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                ></textarea>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="relative">
                                                <TruckIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                                <span className="absolute left-12 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-300">Rp</span>
                                                <input
                                                    type="number" placeholder="Biaya Transport"
                                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-20 text-sm font-bold focus:ring-2 focus:ring-zenith-orange placeholder:text-gray-300"
                                                    value={formData.transport_fee}
                                                    onChange={(e) => setFormData({ ...formData, transport_fee: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {['cash', 'transfer'].map(p => (
                                                <label key={p} className="flex-1 cursor-pointer">
                                                    <input type="radio" name="payment" className="hidden peer" checked={formData.paymentMethod === p} onChange={() => setFormData({ ...formData, paymentMethod: p })} />
                                                    <div className="text-center py-3 rounded-2xl bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400 peer-checked:bg-white peer-checked:text-zenith-orange peer-checked:ring-2 peer-checked:ring-zenith-orange transition-all shadow-sm">
                                                        <CreditCardIcon className="w-4 h-4 mx-auto mb-1 opacity-40 peer-checked:opacity-100" />
                                                        {p}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>

                                        {/* Platform Source Selection */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-1">Platform / Source</label>
                                            <div className="flex flex-wrap gap-2">
                                                {/* Manual 'Website' Option */}
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, source: 'Website' })}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                                                        formData.source === 'Website'
                                                            ? 'bg-zenith-orange text-white border-zenith-orange shadow-md'
                                                            : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-200'
                                                    }`}
                                                >
                                                    Website
                                                </button>
                                                
                                                {/* Dynamic Options from DB */}
                                                {platforms.map((platform) => (
                                                    <button
                                                        key={platform.id}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, source: platform.title })}
                                                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                                                            formData.source === platform.title
                                                                ? 'bg-zenith-orange text-white border-zenith-orange shadow-md'
                                                                : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-200'
                                                        }`}
                                                    >
                                                        {platform.title}
                                                    </button>
                                                ))}

                                                {/* Fallback Instagram if not in platforms */}
                                                {!platforms.find(p => p.title === 'Instagram') && formData.source !== 'Website' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, source: 'Instagram' })}
                                                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                                                            formData.source === 'Instagram'
                                                                ? 'bg-zenith-orange text-white border-zenith-orange shadow-md'
                                                                : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-200'
                                                        }`}
                                                    >
                                                        Instagram
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Summary Card */}
                                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-zenith-orange/10 relative overflow-hidden">
                                    {/* Abstract background element */}
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-zenith-orange/5 rounded-full blur-3xl"></div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <span>Subtotal Layanan</span>
                                            <span className="text-gray-900">Rp {calculateItemsTotal().toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <span>Biaya Transport</span>
                                            <span className="text-gray-900">Rp {(parseFloat(formData.transport_fee) || 0).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="h-px bg-dashed border-t border-gray-100 my-2"></div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] font-bold text-zenith-orange uppercase tracking-widest">Grand Total</p>
                                                <p className="text-3xl font-bold text-gray-900 tracking-tight">Rp {calculateGrandTotal().toLocaleString('id-ID')}</p>
                                            </div>
                                            <div className="bg-zenith-orange/10 px-3 py-1 rounded-lg">
                                                <span className="text-[10px] font-bold text-zenith-orange uppercase">{pax} Pax</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-5 bg-zenith-orange text-white rounded-2xl text-sm font-bold uppercase tracking-[0.2em] shadow-xl shadow-zenith-orange/20 hover:bg-zenith-charcoal hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                    >
                                        Konfirmasi & Simpan
                                        <ChevronRightIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Side Drawer Package Picker (Styled as Modal for now but with drawer feel) */}
            <Modal show={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="2xl">
                <div className="flex flex-col h-[85vh]">
                    <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 bg-zenith-orange text-white rounded-lg flex items-center justify-center text-xs font-bold">
                                    {activeGuestIndex + 1}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Katalog Layanan</h3>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pilih paket untuk orang ke-{activeGuestIndex + 1}</p>
                        </div>
                        <button onClick={() => setShowAddModal(false)} className="w-10 h-10 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-8 bg-gray-50 shrink-0">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input
                                type="text"
                                placeholder="Cari layanan (Massage, Totok, Lulur...)"
                                className="w-full pl-14 pr-6 py-4 bg-white border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-zenith-orange shadow-sm placeholder:text-gray-300"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 pt-0 space-y-4 scrollbar-hide">
                        {filteredPackages.length === 0 ? (
                            <div className="py-20 text-center opacity-40">
                                <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-4" />
                                <p className="font-bold uppercase tracking-widest text-xs">Paket tidak ditemukan</p>
                            </div>
                        ) : (
                            filteredPackages.map((pkg) => {
                                const durationIndex = selectedDurations[pkg.id] || 0;
                                const currentDuration = pkg.durations[durationIndex] || { duration: '-', price: 0 };

                                return (
                                    <div key={pkg.id} className="group p-5 rounded-[2rem] bg-white hover:bg-zenith-orange/[0.02] border border-gray-100 hover:border-zenith-orange/20 transition-all flex flex-col sm:flex-row gap-5 items-center shadow-sm hover:shadow-md">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-bold text-gray-900 truncate">{pkg.title_id}</h4>
                                                <span className="shrink-0 px-2 py-0.5 bg-gray-100 text-gray-400 text-[8px] font-bold uppercase rounded-md tracking-tighter">{pkg.category_id || 'SPA'}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 line-clamp-1 italic font-serif">Treatment berkualitas tinggi dari Jemari Spa</p>
                                        </div>

                                        <div className="flex items-center gap-4 w-full sm:w-auto shrink-0">
                                            <div className="w-full sm:w-28">
                                                {pkg.durations.length > 1 ? (
                                                    <select
                                                        className="w-full bg-gray-50 border-none rounded-xl py-2 px-3 text-[10px] font-bold text-gray-700 focus:ring-1 focus:ring-zenith-orange"
                                                        value={durationIndex}
                                                        onChange={(e) => handleDurationChange(pkg.id, e.target.value)}
                                                    >
                                                        {pkg.durations.map((d, i) => (
                                                            <option key={d.id} value={i}>{d.duration}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <div className="text-center bg-gray-50 py-2 px-3 rounded-xl border border-gray-100">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{currentDuration.duration}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right min-w-[100px]">
                                                <p className="text-xs font-bold text-gray-900">Rp {parseFloat(currentDuration.price).toLocaleString('id-ID')}</p>
                                            </div>
                                            <button
                                                onClick={() => addPackageToGuest(pkg)}
                                                className="w-10 h-10 bg-zenith-charcoal text-white rounded-xl flex items-center justify-center hover:bg-zenith-orange transition-all shadow-lg active:scale-90 shrink-0"
                                            >
                                                <PlusIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="p-8 border-t border-gray-100 bg-white shrink-0">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-zenith-orange transition-all"
                        >
                            Selesai Memilih
                        </button>
                    </div>
                </div>
            </Modal>

            {/* History Modal - Slide-over feel */}
            <Modal show={showHistoryModal} onClose={() => setShowHistoryModal(false)} maxWidth="4xl">
                <div className="flex flex-col h-[80vh]">
                    <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 uppercase tracking-tight">
                            <ArrowPathIcon className="w-6 h-6 text-zenith-orange" />
                            Aktivitas Hari Ini
                        </h3>
                        <button onClick={() => setShowHistoryModal(false)} className="w-10 h-10 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-gray-50/30">
                        {todayTransactions.length === 0 ? (
                            <div className="py-20 text-center opacity-30">
                                <ShoppingCartIcon className="w-16 h-16 mx-auto mb-4" />
                                <p className="font-bold uppercase tracking-[0.2em] text-sm">Tidak ada transaksi</p>
                            </div>
                        ) : (
                            todayTransactions.map((tx) => (
                                <div key={tx.id} className="p-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all flex flex-col md:flex-row gap-6 items-center">
                                    <div className="flex-1 w-full">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="px-3 py-1 bg-zenith-orange/10 text-zenith-orange text-[9px] font-bold uppercase tracking-widest rounded-full">{tx.order_number}</span>
                                            <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-bold uppercase tracking-widest rounded-full">{tx.status}</span>
                                        </div>
                                        <h5 className="font-bold text-lg text-gray-900">{tx.customer_name}</h5>
                                        <div className="flex items-center gap-4 mt-1 text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <ClockIcon className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase">{tx.schedule_time}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <UserGroupIcon className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase">{tx.items_count || tx.items?.length || 0} Pax</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Bayar</p>
                                        <p className="font-bold text-2xl text-gray-900 tracking-tight">Rp {tx.total_price.toLocaleString('id-ID')}</p>
                                    </div>
                                    <button
                                        onClick={() => sendInvoice(tx)}
                                        className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-zenith-charcoal text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-zenith-orange transition-all"
                                    >
                                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                        Invoice
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Modal>

            {/* Success Invoice Modal */}
            <Modal show={showInvoiceModal} onClose={() => setShowInvoiceModal(false)}>
                <div className="p-12 text-center">
                    <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative">
                        <CheckCircleIcon className="w-14 h-14 text-green-500" />
                        <div className="absolute inset-0 bg-green-400/20 rounded-[2rem] animate-ping pointer-events-none opacity-20"></div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Transaksi Berhasil!</h3>
                    <p className="text-gray-400 mb-10 leading-relaxed font-medium">Pesanan telah tercatat di sistem.<br />Silakan kirimkan invoice digital ke WhatsApp pelanggan.</p>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => {
                                sendInvoice(lastTransaction);
                                setShowInvoiceModal(false);
                            }}
                            className="w-full py-5 bg-zenith-orange text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-zenith-orange/20 hover:bg-zenith-charcoal transition-all scale-105"
                        >
                            KIRIM INVOICE (WHATSAPP)
                        </button>
                        <button
                            onClick={() => setShowInvoiceModal(false)}
                            className="w-full py-5 bg-white text-gray-400 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:text-gray-900 transition-all"
                        >
                            Tutup Jendela
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Premium Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] animate-slide-up">
                    <div className="bg-zenith-charcoal text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-x-4 border border-white/5 backdrop-blur-md">
                        <div className="w-8 h-8 bg-zenith-orange rounded-full flex items-center justify-center shadow-lg shadow-zenith-orange/20">
                            <CheckCircleIcon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-sm font-bold tracking-tight">{toast.message}</p>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slide-up {
                    from { transform: translate(-50%, 100%); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </AuthenticatedLayout>
    );
}
