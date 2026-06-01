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
    UserGroupIcon,
    TicketIcon
} from '@heroicons/react/24/outline';
import Modal from '@/Components/Modal';
import Select from 'react-select';

export default function Index({ auth, packages = [], employees = [], todayTransactions = [], platforms = [], app_settings }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeGuestIndex, setActiveGuestIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDurations, setSelectedDurations] = useState({});
    const [toast, setToast] = useState({ show: false, message: '' });
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [lastTransaction, setLastTransaction] = useState(null);
    const [voucherCode, setVoucherCode] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

    const [pax, setPax] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        paymentMethod: 'cash',
        source: 'Website',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':'),
        transport_fee: 0,
        discount_percent: 0,
        notes: ''
    });

    const [guests, setGuests] = useState([{
        guestGender: 'wanita',
        therapistGender: 'wanita',
        employee_id: '',
        therapist_commission: 0,
        packages: []
    }]);

    const defaultInvoiceTemplate = `Halo, Kak [name],
Terlampir Invoice [invoice_no] dengan detail pesanan sebagai berikut :

[details]
Biaya Transport : [transport]
-
*Total Pembayaran : [total]*


Untuk file invoice bisa di download di sini [link]
-


Pembayaran bisa melalui terapis kami atau transfer melalui rekening berikut :
BCA a.n Acep Dani : 7772554756
(Kirimkan bukti transfer, dan nama pemilik rekening setelah melakukan pembayaran)


-
Silahkan lampirkan kritik dan saran untuk pelayanan kami melalui link berikut
[link_review]


Terima kasih telah menggunakan jasa Jemari Home Spa
jemarihomespa.com`;

    const cleanPackageName = (name) => String(name || '').replace(/\s+\d+\s*(menit|minutes|mins|min)\b/gi, '').trim();
    const formatDurationLabel = (duration) => {
        const minutes = String(duration || '').match(/\d+/)?.[0];
        return minutes ? `${minutes} menit` : '';
    };
    const formatPackagePrice = (price) => `Rp. ${Math.round(parseFloat(price || 0)).toLocaleString('id-ID').replace(/\./g, ' ')}`;

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
            duration: d.duration,
            commission: parseFloat(d.commission) || 0
        };

        const newGuests = [...guests];
        const activeGuest = newGuests[activeGuestIndex];

        // Check if already added (prevent duplicates for same person)
        const isAlreadyAdded = activeGuest.packages.some(p => p.name === packageToAdd.name);
        if (isAlreadyAdded) {
            showToast('Paket ini sudah ada untuk orang ini');
            return;
        }

        activeGuest.packages.push(packageToAdd);

        // Auto-calculate commission based on selected packages
        const totalCommission = activeGuest.packages.reduce((sum, p) => sum + (p.commission || 0), 0);
        activeGuest.therapist_commission = totalCommission;

        setGuests(newGuests);

        showToast(`Ditambahkan ke Orang ${activeGuestIndex + 1}: ${packageToAdd.name}`);
        // Keep modal open so admin can add more packages if needed
        // setShowAddModal(false); 
    };

    const removePackageFromGuest = (guestIndex, pkgIndex) => {
        const newGuests = [...guests];
        newGuests[guestIndex].packages.splice(pkgIndex, 1);

        // Recalculate commission after removal
        const totalCommission = newGuests[guestIndex].packages.reduce((sum, p) => sum + (p.commission || 0), 0);
        newGuests[guestIndex].therapist_commission = totalCommission;

        setGuests(newGuests);
    };

    const calculateItemsTotal = () => {
        return guests.reduce((total, guest) => {
            return total + guest.packages.reduce((pTotal, pkg) => pTotal + pkg.price, 0);
        }, 0);
    };

    const calculateManualDiscountAmount = () => {
        const itemsTotal = calculateItemsTotal();
        const percent = parseFloat(formData.discount_percent) || 0;
        return (itemsTotal * percent) / 100;
    };

    const getAppliedVoucherDiscountAmount = () => {
        if (!appliedVoucher || appliedVoucher.category === 'bundle') return 0;
        return appliedVoucher.discount_type === 'percent'
            ? (calculateItemsTotal() * parseFloat(appliedVoucher.discount_amount)) / 100
            : parseFloat(appliedVoucher.discount_amount);
    };

    const calculateDiscountAmount = () => {
        const percentDiscount = calculateManualDiscountAmount();
        const voucherDiscount = getAppliedVoucherDiscountAmount();
        return percentDiscount + voucherDiscount;
    };

    const calculateGrandTotal = () => {
        const transport = parseFloat(formData.transport_fee) || 0;

        // Jika voucher bundle, total bayar hanya menghitung item NON-bundle + transport
        if (appliedVoucher && appliedVoucher.category === 'bundle') {
            const nonBundleItemsTotal = guests.reduce((total, guest) => {
                return total + guest.packages.reduce((pTotal, pkg) => {
                    return pTotal + (pkg.isBundleItem ? 0 : pkg.price);
                }, 0);
            }, 0);
            const subtotal = calculateItemsTotal();
            // const percentDiscount = (nonBundleItemsTotal * (parseFloat(formData.discount_percent) || 0)) / 100;
            // alert(subtotal)
            return subtotal + transport;
        }

        const subtotal = calculateItemsTotal();
        const discount = calculateDiscountAmount();
        return subtotal + transport - discount;
    };

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const filteredPackages = packages.filter(p => {
        const hasDurations = p.durations && p.durations.length > 0;
        const matchesSearch = p.title_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.category_id && p.category_id.toLowerCase().includes(searchQuery.toLowerCase()));
        return hasDurations && matchesSearch;
    });

    const handleApplyVoucher = async () => {
        if (!voucherCode) return;
        setIsValidatingVoucher(true);
        try {
            const response = await axios.post(route('admin.voucher.validate'), { code: voucherCode });
            if (response.data.success) {
                const voucher = response.data.voucher;
                setAppliedVoucher(voucher);

                // Auto-fill customer info if available
                setFormData(prev => ({
                    ...prev,
                    name: voucher.customer_name || prev.name,
                    phone: voucher.customer_phone || prev.phone
                }));

                // Special handling for bundle packets
                if (voucher.category === 'bundle' && voucher.bundle_packages) {
                    const newGuests = [...guests];

                    // Add all bundle packages to the first guest
                    voucher.bundle_packages.forEach(bp => {
                        // Find original package data to get commission
                        const masterPkg = packages.find(p => p.title_id === bp.name);
                        const durationData = masterPkg?.durations.find(d => d.duration === bp.duration);

                        newGuests[0].packages.push({
                            name: `${bp.name} ${bp.duration}`,
                            groupName: bp.name,
                            price: parseFloat(bp.price), // Restore original price to show in subtotal
                            duration: bp.duration,
                            commission: parseFloat(durationData?.commission || 0),
                            isBundleItem: true,
                            voucherCode: voucher.code
                        });
                    });

                    // Recalculate therapist commission for the first guest
                    newGuests[0].therapist_commission = newGuests[0].packages.reduce((sum, p) => sum + (p.commission || 0), 0);

                    setGuests(newGuests);
                    showToast(`Voucher Bundle ${voucher.code} berhasil dipasang! ${voucher.bundle_packages.length} paket ditambahkan.`);
                } else {
                    showToast(`Voucher ${voucher.code} berhasil dipasang!`);
                }
            }
        } catch (error) {
            console.error(error);
            showToast(error.response?.data?.message || 'Voucher tidak valid');
            setAppliedVoucher(null);
        } finally {
            setIsValidatingVoucher(false);
        }
    };

    const removeVoucher = () => {
        if (appliedVoucher && appliedVoucher.category === 'bundle') {
            const newGuests = guests.map(guest => ({
                ...guest,
                packages: guest.packages.filter(p => !p.isBundleItem)
            }));

            // Recalculate commissions for all guests
            newGuests.forEach(guest => {
                guest.therapist_commission = guest.packages.reduce((sum, p) => sum + (p.commission || 0), 0);
            });

            setGuests(newGuests);
        }
        setAppliedVoucher(null);
        setVoucherCode('');
        showToast('Voucher dihapus');
    };

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
            discount_percent: formData.discount_percent,
            discount_amount: calculateDiscountAmount(),
            voucher_id: appliedVoucher?.id,
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
                    source: 'Website',
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':'),
                    transport_fee: 0,
                    discount_percent: 0,
                    notes: ''
                });
                setAppliedVoucher(null);
                setVoucherCode('');
                setPax(1);
                setGuests([{
                    guestGender: 'wanita',
                    therapistGender: 'wanita',
                    employee_id: '',
                    therapist_commission: app_settings?.default_commission || 0,
                    packages: []
                }]);

                showToast('Transaksi POS berhasil disimpan');

                // Refresh todayTransactions prop
                router.reload({ only: ['todayTransactions'] });
            }
        } catch (error) {
            console.error(error);
            showToast('Terjadi kesalahan saat memproses pesanan.');
        }
    };

    const getInvoiceMessageAsync = async (transaction) => {
        const rawTemplate = app_settings?.template_invoice || defaultInvoiceTemplate;
        const formatCurrency = (val) => `Rp ${parseFloat(val).toLocaleString('id-ID')}`;

        const grouped = (transaction.items || []).reduce((acc, item) => {
            const idx = item.guest_index || 1;
            if (!acc[idx]) acc[idx] = [];
            acc[idx].push(item);
            return acc;
        }, {});

        const detailsText = Object.entries(grouped).map(([index, items]) => {
            const personDetails = items.map(item => {
                const duration = formatDurationLabel(item.package_duration);
                return `  - ${cleanPackageName(item.package_name)}${duration ? ` ${duration}` : ''} : ${formatPackagePrice(item.price)}`;
            }).join('\n');
            return `Person ${index}:\n${personDetails}`;
        }).join('\n\n');

        const safeOrderNumber = transaction.order_number.replace(/\//g, '-');
        const link = `${window.location.origin}/invoice/${safeOrderNumber}`;

        let message = rawTemplate;
        message = message.replace(/<\/p><p>/g, '\n').replace(/<p>/g, '').replace(/<\/p>/g, '\n').replace(/<br\s*\/?>/g, '\n').replace(/&nbsp;/g, ' ').replace(/<[^>]*>?/gm, '');

        let linkReview = '';
        if (message.includes('[link_review]')) {
            try {
                const response = await axios.post(route('admin.transaction.review_link', transaction.id));
                if (response.data.success) {
                    linkReview = response.data.link;
                }
            } catch (err) {
                console.error('Failed to generate review link:', err);
            }
        }

        const waData = {
            name: transaction.customer_name,
            invoice_no: transaction.order_number,
            details: detailsText,
            transport: formatCurrency(transaction.transport_fee || 0),
            discount: transaction.discount_amount > 0 ? `-${formatCurrency(transaction.discount_amount)}${parseFloat(transaction.discount_percent) > 0 ? ` (${parseFloat(transaction.discount_percent)}%)` : ''}` : '',
            total: formatCurrency(transaction.total_price),
            link: link,
            link_review: linkReview
        };

        for (const key in waData) {
            message = message.split(`[${key}]`).join(waData[key] || '');
        }

        return message;
    };

    const copyInvoiceText = async (transaction) => {
        const target = transaction || lastTransaction;
        if (!target) return;
        const message = await getInvoiceMessageAsync(target);

        navigator.clipboard.writeText(message).then(() => {
            showToast('Teks invoice berhasil disalin!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            showToast('Gagal menyalin teks.');
        });
    };

    const sendInvoice = async (transaction) => {
        const phone = transaction.phone || app_settings?.phone || '';
        const message = await getInvoiceMessageAsync(transaction);
        const encodedMessage = encodeURIComponent(message);

        if (!phone) {
            showToast('Nomor WhatsApp tidak ditemukan');
            return;
        }

        const cleanPhone = phone.toString().replace(/[^0-9]/g, '');
        let waPhone = cleanPhone;
        if (waPhone.startsWith('0')) {
            waPhone = '62' + waPhone.substring(1);
        } else if (waPhone.startsWith('8')) {
            waPhone = '62' + waPhone;
        }

        if (!waPhone) {
            showToast('Nomor WhatsApp tidak valid');
            return;
        }

        const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const waUrl = isMobileDevice
            ? `https://wa.me/${waPhone}?text=${encodedMessage}`
            : `https://web.whatsapp.com/send?phone=${waPhone}&text=${encodedMessage}`;

        window.open(waUrl, '_blank');
    };

    const sendWhatsApp = () => {
        if (!lastTransaction) return;
        sendInvoice(lastTransaction);
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
                            <div className="bg-white p-5 sm:p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest sm:ml-2">Jumlah Orang:</span>
                                    <div className="grid grid-cols-4 sm:flex sm:flex-wrap bg-gray-50 p-1.5 rounded-2xl border border-gray-100 w-full sm:w-fit gap-2">
                                        {[1, 2, 3, 4, 5, 6].map(n => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => handlePaxChange(n)}
                                                className={`h-10 rounded-xl text-sm font-bold transition-all sm:w-10 ${pax === n
                                                    ? 'bg-zenith-orange text-white shadow-md shadow-zenith-orange/20'
                                                    : 'text-gray-400 hover:text-zenith-orange'
                                                    }`}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                        <div className="relative col-span-2 sm:col-span-1">
                                            <select
                                                className={`w-full h-10 pl-3 pr-8 rounded-xl text-[10px] font-bold appearance-none cursor-pointer border-none focus:ring-0 transition-all ${pax > 6
                                                    ? 'bg-zenith-orange text-white'
                                                    : 'bg-transparent text-gray-400'
                                                    }`}
                                                value={pax > 6 ? pax : ''}
                                                onChange={(e) => handlePaxChange(e.target.value)}
                                            >
                                                <option value="" disabled>Lain</option>
                                                {[7, 8, 9, 10, 11, 12, 13, 14, 15].map(n => <option key={n} value={n} className="text-gray-900">{n}</option>)}
                                            </select>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronRightIcon className={`w-3 h-3 rotate-90 ${pax > 6 ? 'text-white' : 'text-gray-300'}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-zenith-orange bg-zenith-orange/5 px-5 py-3 rounded-2xl md:rounded-full w-fit">
                                    <InformationCircleIcon className="w-4 h-4 shrink-0" />
                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest leading-none">Pilih paket untuk setiap orang</span>
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
                                                    <div className="w-12 h-12 bg-zenith-charcoal text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">
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
                                                    className="flex items-center gap-2 px-6 py-3 bg-zenith-orange text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-zenith-orange/20 hover:bg-zenith-charcoal transition-all"
                                                >
                                                    <PlusIcon className="w-4 h-4" />
                                                    Pilih Paket
                                                </button>
                                            </div>

                                            {/* Package List for Guest */}
                                            <div className="space-y-3 mb-8">
                                                {guest.packages.length === 0 ? (
                                                    <div className="py-8 px-6 text-center border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/50">
                                                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Belum ada paket dipilih</p>
                                                    </div>
                                                ) : (
                                                    guest.packages.map((pkg, pIndex) => (
                                                        <div key={pIndex} className="flex items-center justify-between p-5 bg-zenith-surface/50 rounded-2xl border border-zenith-orange/5 group/item transition-all hover:bg-white">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-2 w-2 rounded-full bg-zenith-orange"></div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-gray-900">
                                                                        {pkg.groupName || pkg.name}
                                                                        {pkg.isBundleItem && (
                                                                            <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-600 text-[8px] font-bold rounded uppercase">Voucher Bundle</span>
                                                                        )}
                                                                    </p>
                                                                    <p className="text-[10px] font-bold text-zenith-orange uppercase tracking-widest mt-0.5">
                                                                        {pkg.duration} • Rp {pkg.price.toLocaleString('id-ID')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => removePackageFromGuest(gIndex, pIndex)}
                                                                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                            >
                                                                <XMarkIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            {/* Staff Assignment Section */}
                                            <div className="bg-zenith-charcoal/[0.02] p-6 rounded-[2rem] border border-gray-50 space-y-5">
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="space-y-2 col-span-2">
                                                        <label className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                            <IdentificationIcon className="w-3.5 h-3.5" />
                                                            Terapis
                                                        </label>
                                                        <Select
                                                            options={employees.map(emp => ({ value: emp.id, label: emp.name }))}
                                                            value={employees.filter(emp => emp.id === guest.employee_id).map(emp => ({ value: emp.id, label: emp.name }))[0] || null}
                                                            onChange={(selectedOption) => updateGuest(gIndex, 'employee_id', selectedOption ? selectedOption.value : '')}
                                                            placeholder="Pilih Terapis"
                                                            isClearable
                                                            menuPortalTarget={document.body}
                                                            styles={{
                                                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                                control: (base, state) => ({
                                                                    ...base,
                                                                    minHeight: '44px',
                                                                    backgroundColor: 'white',
                                                                    border: state.isFocused ? '1px solid #f97316' : '1px solid #f3f4f6',
                                                                    borderRadius: '0.75rem',
                                                                    boxShadow: state.isFocused ? '0 0 0 1px #f97316' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                                                    '&:hover': {
                                                                        border: state.isFocused ? '1px solid #f97316' : '1px solid #e5e7eb'
                                                                    }
                                                                }),
                                                                option: (base, state) => ({
                                                                    ...base,
                                                                    backgroundColor: state.isSelected ? '#f97316' : state.isFocused ? '#fff7ed' : 'white',
                                                                    color: state.isSelected ? 'white' : '#374151',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: '700',
                                                                    cursor: 'pointer'
                                                                }),
                                                                singleValue: (base) => ({
                                                                    ...base,
                                                                    color: '#374151',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: '700'
                                                                }),
                                                                placeholder: (base) => ({
                                                                    ...base,
                                                                    color: '#9ca3af',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: '700'
                                                                }),
                                                                menu: (base) => ({
                                                                    ...base,
                                                                    borderRadius: '0.75rem',
                                                                    overflow: 'hidden',
                                                                    zIndex: 50
                                                                })
                                                            }}
                                                        />
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

                        {/* RIGHT: Transaction Summary (4/12) */}
                        <div className="xl:col-span-4 sticky top-24">
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">
                                <div className="p-8 bg-zenith-charcoal text-white">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                            <ClipboardDocumentListIcon className="w-5 h-5 text-zenith-orange" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Ringkasan Pesanan</h3>
                                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">Transaction Summary</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm font-medium text-white/60">
                                            <span>Subtotal</span>
                                            <span>Rp {calculateItemsTotal().toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-medium text-white/60">
                                            <span>Biaya Transport</span>
                                            <span>Rp {(parseFloat(formData.transport_fee) || 0).toLocaleString('id-ID')}</span>
                                        </div>
                                        {parseFloat(formData.discount_percent) > 0 && (
                                            <div className="flex justify-between items-center text-sm font-medium text-red-400/80">
                                                <span>Diskon ({formData.discount_percent}%)</span>
                                                <span>- Rp {calculateDiscountAmount().toLocaleString('id-ID')}</span>
                                            </div>
                                        )}

                                        {appliedVoucher && appliedVoucher.category !== 'bundle' && (
                                            <div className="flex justify-between items-center text-sm font-medium text-red-400/80">
                                                <span>
                                                    Voucher
                                                </span>
                                                <span>
                                                    (-Rp {getAppliedVoucherDiscountAmount().toLocaleString('id-ID')})
                                                </span>
                                            </div>
                                        )}
                                        <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Total Bayar</span>
                                            <span className="text-3xl font-bold text-zenith-orange">Rp {calculateGrandTotal().toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 space-y-6">
                                    {/* Order Info Form */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block px-1">Informasi Pelanggan</label>
                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="relative">
                                                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                                    <input
                                                        type="text" placeholder="Nama Pelanggan"
                                                        className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-gray-700 focus:ring-zenith-orange transition-all"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <ChatBubbleLeftRightIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                                    <input
                                                        type="tel" placeholder="Nomor WhatsApp"
                                                        className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-gray-700 focus:ring-zenith-orange transition-all"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block px-1">Lokasi & Waktu</label>
                                            <div className="space-y-3">
                                                <div className="relative">
                                                    <MapPinIcon className="absolute left-3.5 top-3 w-4 h-4 text-gray-300" />
                                                    <textarea
                                                        placeholder="Alamat Customer"
                                                        className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-gray-700 focus:ring-zenith-orange h-20 transition-all resize-none"
                                                        value={formData.address}
                                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="relative">
                                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                                        <input
                                                            type="date"
                                                            className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pl-10 pr-3 text-xs font-bold text-gray-700 focus:ring-zenith-orange"
                                                            value={formData.date}
                                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="relative">
                                                        <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                                        <input
                                                            type="time"
                                                            className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pl-10 pr-3 text-xs font-bold text-gray-700 focus:ring-zenith-orange"
                                                            value={formData.time}
                                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Metode Bayar</label>
                                                <select
                                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-4 text-xs font-bold text-gray-700 focus:ring-zenith-orange"
                                                    value={formData.paymentMethod}
                                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                                >
                                                    <option value="cash">Tunai (Cash)</option>
                                                    <option value="transfer">Transfer</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block px-1">Sumber Booking</label>
                                                <select
                                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-4 text-xs font-bold text-gray-700 focus:ring-zenith-orange appearance-none"
                                                    value={formData.source}
                                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                                >
                                                    <option value="Website">Website</option>
                                                    <option value="Instagram">Instagram</option>
                                                    <option value="Facebook">Facebook</option>
                                                    <option value="WhatsApp">WhatsApp</option>
                                                    <option value="Teman/Keluarga">Teman/Keluarga</option>
                                                    <option value="Lainnya">Lainnya</option>
                                                    {platforms.map(p => (
                                                        <option key={p.id} value={p.title}>{p.title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Biaya Transport</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">Rp</span>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pl-8 pr-3 text-xs font-bold text-gray-700 focus:ring-zenith-orange"
                                                        value={formData.transport_fee}
                                                        onChange={(e) => setFormData({ ...formData, transport_fee: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Diskon (%)</label>
                                                <div className="relative">
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">%</span>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pl-4 pr-8 text-xs font-bold text-gray-700 focus:ring-zenith-orange"
                                                        value={formData.discount_percent}
                                                        onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                                                        min="0"
                                                        max="100"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block px-1">Voucher</label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <TicketIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                                    <input
                                                        type="text"
                                                        placeholder="Kode Voucher"
                                                        className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-gray-700 focus:ring-zenith-orange uppercase"
                                                        value={voucherCode}
                                                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                                        disabled={!!appliedVoucher}
                                                    />
                                                </div>
                                                {appliedVoucher ? (
                                                    <button
                                                        type="button"
                                                        onClick={removeVoucher}
                                                        className="px-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={handleApplyVoucher}
                                                        disabled={isValidatingVoucher || !voucherCode}
                                                        className="px-4 bg-zenith-orange/10 text-zenith-orange rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-zenith-orange hover:text-white transition-all disabled:opacity-50"
                                                    >
                                                        {isValidatingVoucher ? '...' : 'Pasang'}
                                                    </button>
                                                )}
                                            </div>
                                            {appliedVoucher && (
                                                <p className="text-[9px] text-green-600 font-bold px-1">
                                                    Terpasang: {appliedVoucher.description || appliedVoucher.code} (-Rp {getAppliedVoucherDiscountAmount().toLocaleString('id-ID')})
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        className="w-full py-5 bg-zenith-orange text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-zenith-orange/40 hover:bg-zenith-charcoal transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
                                    >
                                        <ShoppingCartIcon className="w-5 h-5" />
                                        Simpan Transaksi
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal & Toast Components */}
            {/* ... rest of the modal logic (unchanged) ... */}

            <Modal show={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="2xl">
                <div className="p-5 sm:p-8">
                    <div className="flex justify-between items-center mb-6 sm:mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Pilih Layanan</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Pilih paket untuk Pelanggan ke-{activeGuestIndex + 1}</p>
                        </div>
                        <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-400 hover:text-zenith-orange transition-colors">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="relative mb-6">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                        <input
                            type="text" placeholder="Cari nama paket atau kategori..."
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-gray-700 focus:ring-zenith-orange transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="max-h-[60vh] sm:max-h-[500px] overflow-y-auto pr-2 space-y-4">
                        {filteredPackages.map(pkg => {
                            const durationIndex = selectedDurations[pkg.id] || 0;
                            const currentDuration = pkg.durations[durationIndex] || { duration: '-', price: 0 };

                            return (
                                <div key={pkg.id} className="p-4 sm:p-5 rounded-3xl border border-gray-100 bg-gray-50/30 hover:border-zenith-orange/30 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 group-hover:text-zenith-orange transition-colors">{pkg.title_id}</h4>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{pkg.category_id}</p>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-none border-gray-100">
                                        <div className="w-28 sm:w-32">
                                            <select
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-[10px] sm:text-xs font-bold text-gray-700 focus:ring-zenith-orange"
                                                value={durationIndex}
                                                onChange={(e) => handleDurationChange(pkg.id, e.target.value)}
                                            >
                                                {pkg.durations.map((d, i) => (
                                                    <option key={d.id} value={i}>{d.duration}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="text-right sm:w-32">
                                            <p className="text-xs sm:text-sm font-bold text-zenith-orange whitespace-nowrap">Rp {parseFloat(currentDuration.price).toLocaleString('id-ID')}</p>
                                        </div>
                                        {activeGuestIndex !== null && guests[activeGuestIndex] && guests[activeGuestIndex].packages.findIndex(p => p.name === `${pkg.title_id} ${currentDuration.duration}`) !== -1 ? (
                                            <div className="flex items-center gap-2 shrink-0">
                                                {/* Checklist Status */}
                                                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20">
                                                    <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                                </div>
                                                {/* Unchecklist Action */}
                                                <button
                                                    onClick={() => {
                                                        if (!guests[activeGuestIndex]) return;
                                                        const pkgIdx = guests[activeGuestIndex].packages.findIndex(p => p.name === `${pkg.title_id} ${currentDuration.duration}`);
                                                        if (pkgIdx !== -1) removePackageFromGuest(activeGuestIndex, pkgIdx);
                                                    }}
                                                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                                                    title="Hapus"
                                                >
                                                    <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => addPackageToGuest(pkg)}
                                                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-zenith-orange text-white flex items-center justify-center hover:bg-zenith-charcoal transition-all shadow-lg shadow-zenith-orange/20"
                                                title="Tambah"
                                            >
                                                <PlusIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Modal>

            {/* History Modal */}
            <Modal show={showHistoryModal} onClose={() => setShowHistoryModal(false)} maxWidth="4xl">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-zenith-orange/10 rounded-2xl flex items-center justify-center text-zenith-orange">
                                <ArrowPathIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">History Transaksi Hari Ini</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Today's Transactions Session</p>
                            </div>
                        </div>
                        <button onClick={() => setShowHistoryModal(false)} className="p-2 text-gray-400 hover:text-zenith-orange">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {todayTransactions.length === 0 ? (
                            <div className="py-20 text-center">
                                <ClipboardDocumentListIcon className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Belum ada transaksi hari ini</p>
                            </div>
                        ) : (
                            todayTransactions.map(t => (
                                <div key={t.id} className="p-6 rounded-[2rem] border border-gray-100 bg-white hover:border-zenith-orange/30 transition-all flex items-center justify-between group shadow-sm">
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(t.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                                            <p className="text-sm font-bold text-zenith-charcoal mt-1">{t.order_number.split('/').pop()}</p>
                                        </div>
                                        <div className="h-8 w-px bg-gray-100"></div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{t.customer_name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${t.payment_status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-zenith-orange/5 text-zenith-orange'}`}>
                                                    {t.payment_status}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400">• Rp {parseFloat(t.total_price).toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => sendInvoice(t)}
                                            className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                            title="Kirim WA"
                                        >
                                            <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => copyInvoiceText(t)}
                                            className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                            title="Copy Text WA"
                                        >
                                            <ClipboardDocumentListIcon className="w-5 h-5" />
                                        </button>
                                        <Link
                                            href={route('admin.transaction.index', { search: t.order_number })}
                                            className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-zenith-charcoal hover:text-white transition-all shadow-sm"
                                        >
                                            <ChevronRightIcon className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Modal>

            {/* Success Invoice Modal */}
            <Modal show={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} maxWidth="md">
                <div className="p-10 text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6 shadow-lg shadow-green-500/10">
                        <CheckCircleIcon className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Transaksi Berhasil!</h3>
                    <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed">
                        Data transaksi telah disimpan secara otomatis ke dalam sistem. Klik tombol di bawah untuk mengirim invoice via WhatsApp.
                    </p>

                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={sendWhatsApp}
                                className="py-4 bg-green-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-green-500/20 hover:bg-green-600 transition-all flex items-center justify-center gap-3"
                            >
                                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                Kirim WA
                            </button>
                            <button
                                onClick={() => copyInvoiceText()}
                                className="py-4 bg-zenith-charcoal text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-zenith-charcoal/20 hover:bg-black transition-all flex items-center justify-center gap-3"
                            >
                                <ClipboardDocumentListIcon className="w-5 h-5" />
                                Copy Text
                            </button>
                        </div>
                        <button
                            onClick={() => setShowInvoiceModal(false)}
                            className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
                    <div className="bg-zenith-charcoal text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-x-4 border border-white/10">
                        <CheckCircleIcon className="w-5 h-5 text-zenith-orange" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">{toast.message}</p>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
