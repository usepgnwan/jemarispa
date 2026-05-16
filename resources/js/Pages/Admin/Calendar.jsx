import { useState, Fragment, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog, Transition } from '@headlessui/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import {
    CalendarIcon,
    ClockIcon,
    UserIcon,
    MapPinIcon,
    PhoneIcon,
    XMarkIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    PlusIcon,
    TrashIcon,
    ArrowPathIcon,
    CreditCardIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export default function Calendar({ auth, events, summary, employees, packages, app_settings }) {
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newItems, setNewItems] = useState([]);
    const [deletedItems, setDeletedItems] = useState([]);
    const [penaltyPercent, setPenaltyPercent] = useState(0);
    const [originalScheduleDate, setOriginalScheduleDate] = useState('');
    const [selectedTherapist, setSelectedTherapist] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [visibleRange, setVisibleRange] = useState({ start: null, end: null });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const calculateEndTime = (startTime, durationMinutes) => {
        if (!startTime) return '';
        const [hours, minutes] = startTime.split(/[:.]/).map(Number);
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes + durationMinutes);
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
    };

    const getTransactionTimeRange = (transaction) => {
        if (!transaction || !transaction.items) return '';
        const guestDurations = {};
        transaction.items.forEach(item => {
            const g = item.guest_index || 1;
            guestDurations[g] = (guestDurations[g] || 0) + parseInt(item.package_duration || 0);
        });
        const maxDuration = Math.max(...Object.values(guestDurations), 0);
        const startTime = (transaction.schedule_time || '00:00').substring(0, 5).replace('.', ':');
        return `${startTime} - ${calculateEndTime(startTime, maxDuration)}`;
    };

    const handleEventClick = (info) => {
        const data = info.event.extendedProps;
        // Normalize schedule_time to HH:MM (MySQL returns HH:MM:SS)
        const rawTime = data.schedule_time || '';
        const scheduleTime = rawTime.substring(0, 5);
        const transaction = {
            id: info.event.id,
            ...data,
            schedule_time: scheduleTime,
        };
        setSelectedEvent(transaction);
        setSelectedTransaction(transaction);
        setOriginalScheduleDate(data.schedule_date || '');
        setPenaltyPercent(data.penalty_percent || 0);
        setNewItems([]);
        setDeletedItems([]);
        setIsModalOpen(true);
        setIsEditing(false);
    };

    const saveTransaction = () => {
        // Calculate total price including existing items, new items, transport, and penalty
        const baseTotal = selectedTransaction.items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
        const newItemsTotal = newItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
        const transport = parseFloat(selectedTransaction.transport_fee || 0);

        // Apply discount if exists
        const subtotal = baseTotal + newItemsTotal;
        const discountAmount = parseFloat(selectedTransaction.discount_amount || 0);

        const totalBeforePenalty = subtotal + transport - discountAmount;
        const pPercent = parseFloat(penaltyPercent || 0);
        const penaltyAmount = totalBeforePenalty * (pPercent / 100);
        const finalTotal = totalBeforePenalty + penaltyAmount;

        router.patch(route('admin.transaction.update', selectedTransaction.id), {
            ...selectedTransaction,
            new_items: newItems,
            deleted_items: deletedItems,
            items: selectedTransaction.items || [],
            penalty_percent: pPercent,
            penalty_amount: penaltyAmount,
            total_price: finalTotal
        }, {
            onSuccess: () => {
                setIsModalOpen(false);
                setIsEditing(false);
                setNewItems([]);
                setDeletedItems([]);
                setPenaltyPercent(0);
            }
        });
    };

    const recalculateCommission = (guestIndex) => {
        if (!packages || !selectedTransaction) return;

        const guestItems = [...selectedTransaction.items, ...newItems].filter(item => item.guest_index == guestIndex);
        let totalCommission = 0;

        guestItems.forEach(item => {
            const pkg = packages.find(p =>
                item.package_name === p.title_id ||
                (item.package_name && item.package_name.startsWith(p.title_id))
            );

            if (pkg) {
                let cleanDuration = item.package_duration || '';
                if (typeof cleanDuration === 'number') cleanDuration = cleanDuration.toString();
                cleanDuration = cleanDuration.replace(/ Menit Menit/g, ' Menit');

                if (cleanDuration && !cleanDuration.includes(' Menit')) {
                    const match = cleanDuration.match(/^\d+/);
                    if (match) cleanDuration = match[0] + ' Menit';
                }

                const duration = pkg.durations.find(d => d.duration === cleanDuration || d.duration === cleanDuration + ' Menit');
                if (duration) {
                    totalCommission += parseFloat(duration.commission) || 0;
                }
            }
        });

        const updatedItems = (selectedTransaction.items || []).map(it =>
            it.guest_index == guestIndex ? { ...it, therapist_commission: totalCommission } : it
        );
        const updatedNewItems = (newItems || []).map(ni =>
            ni.guest_index == guestIndex ? { ...ni, therapist_commission: totalCommission } : ni
        );

        setSelectedTransaction({ ...selectedTransaction, items: updatedItems });
        setNewItems(updatedNewItems);
    };

    const copyInvoiceText = async (transaction) => {
        const text = await prepareInvoiceText(transaction);
        navigator.clipboard.writeText(text);
        alert('Text invoice berhasil disalin!');
    };

    const sendInvoice = async (transaction) => {
        const text = await prepareInvoiceText(transaction);
        const phone = transaction.phone.replace(/[^0-9]/g, '');
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    const prepareInvoiceText = async (transaction) => {
        if (!transaction) return '';
        
        let message = app_settings?.template_invoice || `Halo, Kak [name],\n\nTerlampir Invoice [invoice_no] dengan detail pesanan sebagai berikut :\n\n[details]\n\nBiaya Transport : [transport]\n\nTotal Pembayaran : [total]\n\nUntuk file invoice bisa di download di sini [link]\n\n-\n\nPembayaran bisa melalui terapis kami atau transfer melalui rekening berikut :\n\nBCA a.n Acep Dani : 7772554756\n(Kirimkan bukti transfer, dan nama pemilik rekening setelah melakukan pembayaran)\n\n-\n\nUntuk kritik dan saran, silahkan lampirkan di link berikut\n[link_review]\n\nTerima kasih telah menggunakan jasa Jemari Home Spa\n\njemarihomespa.com`;

        const grouped = [...(transaction.items || []), ...newItems].reduce((acc, item) => {
            if (!acc[item.guest_index]) acc[item.guest_index] = [];
            acc[item.guest_index].push(item);
            return acc;
        }, {}) || {};

        const detailsText = Object.entries(grouped).map(([index, items]) => {
            const personDetails = items.map(item => `  - ${item.package_name} (${item.package_duration})`).join('\n');
            return `*Customer ke-${index}*:\n${personDetails}`;
        }).join('\n\n');

        const safeOrderNumber = transaction.order_number?.replace(/\//g, '-') || 'POS';
        const link = `${window.location.origin}/invoice/${safeOrderNumber}`;

        message = message.replace(/\[name\]/g, transaction.customer_name)
            .replace(/\[invoice_no\]/g, transaction.order_number || 'POS')
            .replace(/\[details\]/g, detailsText)
            .replace(/\[transport\]/g, formatCurrency(transaction.transport_fee || 0))
            .replace(/\[total\]/g, formatCurrency(transaction.total_price))
            .replace(/\[link\]/g, link)
            .replace(/\[link_review\]/g, '');

        return message;
    };

    const handleDatesSet = (info) => {
        setVisibleRange({
            start: info.view.activeStart,
            end: info.view.activeEnd
        });
    };

    const handleDateClick = (info) => {
        setSelectedDate(info.dateStr);
    };

    const displayEvents = useMemo(() => {
        if (!events || !Array.isArray(events)) return [];
        return events.filter(event => {
            // Filter by Therapist
            const matchTherapist = selectedTherapist === 'all' ||
                (event.extendedProps.items || []).some(item => item.employee_id === parseInt(selectedTherapist));

            // Filter by Status
            const matchStatus = selectedStatus === 'all' || event.extendedProps.status === selectedStatus;

            return matchTherapist && matchStatus;
        });
    }, [events, selectedTherapist, selectedStatus]);

    // Calculate totals by therapist for the visible range
    const therapistTotals = useMemo(() => {
        if (!employees || !Array.isArray(employees) || !events) return [];
        return employees.map(emp => {
            const empEvents = events.filter(event => {
                const eventDate = new Date(event.start);
                const isInRange = visibleRange.start && visibleRange.end
                    ? (eventDate >= visibleRange.start && eventDate < visibleRange.end)
                    : true;

                return isInRange && event.extendedProps.items.some(item => item.employee_id === emp.id);
            });

            let totalCommission = 0;
            let totalRevenue = 0;
            let count = 0;

            empEvents.forEach(event => {
                // Get unique guests for this therapist in this event
                const guestIndices = [...new Set(event.extendedProps.items
                    .filter(item => item.employee_id === emp.id)
                    .map(item => item.guest_index))];

                guestIndices.forEach(idx => {
                    // Get the first item for this guest/therapist to get the commission
                    // (Commission is stored per item but represents the total for that guest/therapist)
                    const item = event.extendedProps.items.find(i => i.employee_id === emp.id && i.guest_index === idx);
                    if (item) {
                        totalCommission += parseFloat(item.therapist_commission || 0);
                        count++;
                    }
                });

                // Sum of prices of items performed by this therapist
                const therapistItems = event.extendedProps.items.filter(item => item.employee_id === emp.id);
                totalRevenue += therapistItems.reduce((sum, i) => sum + parseFloat(i.price || 0), 0);
            });

            return {
                ...emp,
                totalCommission,
                totalRevenue,
                count
            };
        }).sort((a, b) => b.totalCommission - a.totalCommission)
            .filter(t => t.count > 0 || selectedTherapist == t.id);
    }, [employees, events, visibleRange, selectedTherapist]);

    const dailySchedules = useMemo(() => {
        if (!displayEvents || !selectedDate) return [];

        const dayEvents = displayEvents.filter(event => {
            const eventDate = event.start.split('T')[0];
            return eventDate === selectedDate;
        });

        const groups = {};

        dayEvents.forEach(event => {
            const items = event.extendedProps.items || [];
            
            // 1. Calculate total duration PER GUEST for this event
            const totalDurationPerGuest = {};
            items.forEach(item => {
                const gIdx = item.guest_index || 1;
                totalDurationPerGuest[gIdx] = (totalDurationPerGuest[gIdx] || 0) + parseInt(item.package_duration || 0);
            });

            // 2. Map therapists to their guests and use the guest's total duration
            const therapistsInEvent = {}; // { therapistName: Set of guestIdx }

            items.forEach(item => {
                const therapistName = item.employee?.name || 'Belum terpilih terapis';
                const gIdx = item.guest_index || 1;
                
                if (!therapistsInEvent[therapistName]) therapistsInEvent[therapistName] = new Set();
                therapistsInEvent[therapistName].add(gIdx);
            });

            Object.entries(therapistsInEvent).forEach(([therapistName, guestIndices]) => {
                if (!groups[therapistName]) groups[therapistName] = [];
                
                guestIndices.forEach(gIdx => {
                    const startTime = event.extendedProps.schedule_time || '00:00';
                    const duration = totalDurationPerGuest[gIdx] || 0;
                    const endTime = calculateEndTime(startTime, duration);

                    groups[therapistName].push({
                        timeRange: `${startTime.substring(0, 5).replace('.', ':')} - ${endTime}`,
                        customer: event.extendedProps.customer_name + (Object.keys(totalDurationPerGuest).length > 1 ? ` (Orang ${gIdx})` : ''),
                        id: event.id,
                        guestIdx: gIdx,
                        startTime: startTime
                    });
                });
            });
        });

        return Object.entries(groups).map(([therapist, schedules]) => [
            therapist,
            schedules.sort((a, b) => a.startTime.localeCompare(b.startTime))
        ]).sort(([a], [b]) => {
            if (a === 'Belum terpilih terapis') return 1;
            if (b === 'Belum terpilih terapis') return -1;
            return a.localeCompare(b);
        });
    }, [displayEvents, selectedDate]);

    const visibleSummary = useMemo(() => {
        if (!events || !Array.isArray(events)) return { pending: 0, send_terapis: 0, invoice: 0, success: 0, failed: 0, total: 0 };

        return events.filter(event => {
            const eventDate = new Date(event.start);
            return visibleRange.start && visibleRange.end
                ? (eventDate >= visibleRange.start && eventDate < visibleRange.end)
                : true;
        }).reduce((acc, event) => {
            const status = event.extendedProps.status;
            if (status === 'pending') acc.pending++;
            else if (status === 'send_terapis') acc.send_terapis++;
            else if (status === 'invoice') acc.invoice++;
            else if (status === 'success') acc.success++;
            else if (status === 'failed') acc.failed++;
            acc.total++;
            return acc;
        }, { pending: 0, send_terapis: 0, invoice: 0, success: 0, failed: 0, total: 0 });
    }, [events, visibleRange]);

    const statusColors = {
        pending: 'bg-slate-100 text-slate-700 border-slate-200',
        send_terapis: 'bg-blue-100 text-blue-700 border-blue-200',
        invoice: 'bg-amber-100 text-amber-700 border-amber-200',
        success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        failed: 'bg-red-100 text-red-700 border-red-200',
    };

    const statusLabels = {
        pending: 'Pending',
        send_terapis: 'Proses',
        invoice: 'Invoice',
        success: 'Selesai',
        failed: 'Batal',
    };

    const statusIcons = {
        pending: ClockIcon,
        send_terapis: UserIcon,
        invoice: InformationCircleIcon,
        success: CheckCircleIcon,
        failed: XMarkIcon,
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title="Kalender Pesanan" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 font-serif italic">Kalender Pesanan</h2>
                            <p className="mt-1 text-sm text-gray-500">Pantau jadwal layanan spa harian Anda</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Terapis:</span>
                                <select
                                    className="text-xs border-gray-200 rounded-xl focus:ring-zenith-orange focus:border-zenith-orange bg-white shadow-sm pr-8 py-1.5"
                                    value={selectedTherapist}
                                    onChange={(e) => setSelectedTherapist(e.target.value)}
                                >
                                    <option value="all">Semua Terapis</option>
                                    {employees?.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 overflow-x-auto scrollbar-hide max-w-[90vw] sm:max-w-none">
                                    <button
                                        onClick={() => setSelectedStatus('all')}
                                        className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${selectedStatus === 'all' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Semua
                                    </button>
                                    <button
                                        onClick={() => setSelectedStatus('pending')}
                                        className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${selectedStatus === 'pending' ? 'bg-slate-400 text-white shadow-sm' : 'bg-white text-slate-500 border border-gray-100'}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${selectedStatus === 'pending' ? 'bg-white' : 'bg-slate-400'}`}></span>
                                        Pending
                                    </button>
                                    <button
                                        onClick={() => setSelectedStatus('send_terapis')}
                                        className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${selectedStatus === 'send_terapis' ? 'bg-blue-400 text-white shadow-sm' : 'bg-white text-blue-500 border border-gray-100'}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${selectedStatus === 'send_terapis' ? 'bg-white' : 'bg-blue-400'}`}></span>
                                        Proses
                                    </button>
                                    <button
                                        onClick={() => setSelectedStatus('invoice')}
                                        className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${selectedStatus === 'invoice' ? 'bg-amber-400 text-white shadow-sm' : 'bg-white text-amber-500 border border-gray-100'}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${selectedStatus === 'invoice' ? 'bg-white' : 'bg-amber-400'}`}></span>
                                        Invoice
                                    </button>
                                    <button
                                        onClick={() => setSelectedStatus('success')}
                                        className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${selectedStatus === 'success' ? 'bg-emerald-400 text-white shadow-sm' : 'bg-white text-emerald-500 border border-gray-100'}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${selectedStatus === 'success' ? 'bg-white' : 'bg-emerald-400'}`}></span>
                                        Selesai
                                    </button>
                                    <button
                                        onClick={() => setSelectedStatus('failed')}
                                        className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${selectedStatus === 'failed' ? 'bg-red-400 text-white shadow-sm' : 'bg-white text-red-500 border border-gray-100'}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${selectedStatus === 'failed' ? 'bg-white' : 'bg-red-400'}`}></span>
                                        Batal
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending</span>
                                <div className="p-2 rounded-xl bg-slate-50 text-slate-400">
                                    <ClockIcon className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{visibleSummary.pending}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Proses</span>
                                <div className="p-2 rounded-xl bg-blue-50 text-blue-400">
                                    <InformationCircleIcon className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{visibleSummary.send_terapis + visibleSummary.invoice}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selesai</span>
                                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-400">
                                    <CheckCircleIcon className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{visibleSummary.success}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Batal</span>
                                <div className="p-2 rounded-xl bg-red-50 text-red-400">
                                    <XMarkIcon className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{visibleSummary.failed}</p>
                        </div>
                        <div className="bg-zenith-orange p-6 rounded-3xl shadow-lg shadow-zenith-orange/20">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Total</span>
                                <div className="p-2 rounded-xl bg-white/20 text-white">
                                    <CalendarIcon className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-white">{visibleSummary.total}</p>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Calendar Section */}
                        <div className="flex-1 bg-white p-6 md:p-8 rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="full-calendar-custom">
                                <FullCalendar
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                    }}
                                    events={displayEvents}
                                    eventClick={handleEventClick}
                                    datesSet={handleDatesSet}
                                    dateClick={handleDateClick}
                                    eventTimeFormat={{
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        meridiem: false,
                                        hour12: false
                                    }}
                                    height="auto"
                                    dayMaxEvents={5}
                                    locale="id"
                                    eventContent={(arg) => {
                                        const items = arg.event.extendedProps.items || [];
                                        const therapistNames = [...new Set(items.map(item => item.employee?.name).filter(Boolean))].join(', ');
                                        const displayTherapist = therapistNames || 'Belum dipilih';
                                        
                                        // Calculate max duration for this booking
                                        const guestDurations = {};
                                        items.forEach(item => {
                                            const gIdx = item.guest_index || 1;
                                            guestDurations[gIdx] = (guestDurations[gIdx] || 0) + parseInt(item.package_duration || 0);
                                        });
                                        const maxDuration = Math.max(...Object.values(guestDurations), 0);
                                        
                                        const startTime = arg.event.extendedProps.schedule_time || '00:00';
                                        const endTime = calculateEndTime(startTime, maxDuration);
                                        
                                        return (
                                            <div className="flex flex-col gap-0.5 min-w-0 overflow-hidden leading-tight py-0.5">
                                                <span className="shrink-0 text-[8px] opacity-75">{startTime.substring(0, 5).replace('.', ':')} - {endTime}</span>
                                                <span className="truncate">{displayTherapist}</span>
                                            </div>
                                        );
                                    }}
                                />
                            </div>
                        </div>

                        {/* Schedule Sidebar */}
                        <div className="lg:w-80 shrink-0 space-y-6">
                            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">
                                        Jadwal: {new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </h3>
                                    <div className="p-2 rounded-xl bg-zenith-orange/10 text-zenith-orange">
                                        <ClockIcon className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                                    {dailySchedules.map(([therapist, schedules]) => (
                                        <div key={therapist} className="space-y-3">
                                            <h4 className={`text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-2 ${therapist === 'Belum terpilih terapis' ? 'text-red-400' : 'text-zenith-orange'}`}>
                                                <div className={`w-1 h-3 rounded-full ${therapist === 'Belum terpilih terapis' ? 'bg-red-400' : 'bg-zenith-orange'}`}></div>
                                                {therapist}
                                            </h4>
                                            <div className="space-y-2 ml-3">
                                                {schedules.map((s, idx) => (
                                                    <div key={`${s.id}-${idx}`} className="flex flex-col gap-0.5">
                                                        <span className="text-[10px] text-gray-400 font-bold">{s.timeRange}</span>
                                                        <span className="text-xs text-gray-900 font-medium truncate">{s.customer}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {dailySchedules.length === 0 && (
                                        <div className="text-center py-12">
                                            <CalendarIcon className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                                            <p className="text-xs text-gray-400 italic">Tidak ada jadwal</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Detail Modal */}
            <Transition.Root show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[60]" onClose={setIsModalOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative w-full max-w-[95%] sm:max-w-2xl transform overflow-hidden rounded-[2rem] sm:rounded-[3rem] bg-white text-left shadow-2xl transition-all border border-gray-100 mx-auto">
                                    {(selectedEvent || selectedTransaction) && (() => {
                                        const currentData = isEditing ? selectedTransaction : selectedEvent;
                                        if (!currentData) return null;

                                        // Group items by guest_index
                                        const allItems = isEditing 
                                            ? [...(selectedTransaction.items || []), ...newItems].filter(it => !deletedItems.includes(it.id))
                                            : (selectedEvent.items || []);

                                        const byGuest = allItems.reduce((acc, item) => {
                                            const g = item.guest_index || 1;
                                            if (!acc[g]) acc[g] = [];
                                            acc[g].push(item);
                                            return acc;
                                        }, {});

                                        const startTime = (currentData.schedule_time || '00:00').substring(0, 5).replace('.', ':');

                                        return (
                                            <>
                                                {/* Modal Header */}
                                                <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-6 border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-white sticky top-0 z-10 backdrop-blur-md">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border mb-2 ${statusColors[currentData.status]}`}>
                                                                {statusLabels[currentData.status]}
                                                            </div>
                                                            <h3 className="text-xl font-black text-gray-900">{currentData.customer_name}</h3>
                                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
                                                                <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-gray-400">
                                                                    <PhoneIcon className="w-3 h-3" />
                                                                    {currentData.phone}
                                                                </span>
                                                                <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-gray-400 shrink-0">
                                                                    <MapPinIcon className="w-3 h-3" />
                                                                    {currentData.address}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {!isEditing && (
                                                                <button 
                                                                    onClick={() => setIsEditing(true)}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-zenith-orange/10 text-zenith-orange rounded-xl text-xs font-bold hover:bg-zenith-orange/20 transition-all"
                                                                >
                                                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                                                    Edit
                                                                </button>
                                                            )}
                                                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                                                <XMarkIcon className="w-5 h-5 text-gray-400" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Schedule info row */}
                                                    <div className="flex items-start sm:items-center gap-2 mt-4 bg-zenith-orange/5 rounded-2xl px-4 py-3">
                                                        <div className="p-1.5 rounded-xl bg-zenith-orange/10 text-zenith-orange shrink-0">
                                                            <ClockIcon className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jadwal</p>
                                                            {isEditing ? (
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <input 
                                                                        type="date"
                                                                        className="bg-transparent border-none p-0 text-xs font-bold text-gray-900 focus:ring-0 cursor-pointer"
                                                                        value={selectedTransaction.schedule_date || ''}
                                                                        onChange={(e) => setSelectedTransaction({...selectedTransaction, schedule_date: e.target.value})}
                                                                    />
                                                                    <input 
                                                                        type="time"
                                                                        className="bg-transparent border-none p-0 text-xs font-bold text-gray-900 focus:ring-0 cursor-pointer"
                                                                        value={selectedTransaction.schedule_time || ''}
                                                                        onChange={(e) => setSelectedTransaction({...selectedTransaction, schedule_time: e.target.value})}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm font-bold text-gray-900">
                                                                    {new Date(currentData.schedule_date || '').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                                    {' · '}
                                                                    {getTransactionTimeRange(currentData)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Per-Guest Cards */}
                                                <div className="px-6 sm:px-10 py-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar bg-white">
                                                    {isEditing && (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                            <div>
                                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Update Status</label>
                                                                <div className="grid grid-cols-1 gap-1.5">
                                                                    {Object.keys(statusLabels).map((status) => {
                                                                        const Icon = statusIcons[status];
                                                                        const isActive = selectedTransaction.status === status;
                                                                        return (
                                                                            <button
                                                                                key={status}
                                                                                onClick={() => setSelectedTransaction({ ...selectedTransaction, status })}
                                                                                className={`flex items-center justify-between p-2 rounded-xl border transition-all ${isActive
                                                                                    ? `ring-1 ring-offset-0 ${statusColors[status]}`
                                                                                    : 'bg-white border-gray-100 text-gray-600 hover:border-zenith-orange'
                                                                                    }`}
                                                                            >
                                                                                <div className="flex items-center gap-2">
                                                                                    <Icon className="w-3.5 h-3.5" />
                                                                                    <span className="text-[10px] font-bold uppercase tracking-wider">{statusLabels[status]}</span>
                                                                                </div>
                                                                                {isActive && <CheckCircleIcon className="w-3.5 h-3.5" />}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Transport Fee</label>
                                                                    <div className="relative">
                                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rp</span>
                                                                        <input
                                                                            type="number"
                                                                            className="w-full pl-8 bg-gray-50 border-gray-100 rounded-xl text-sm focus:ring-zenith-orange focus:border-zenith-orange"
                                                                            value={selectedTransaction.transport_fee || ''}
                                                                            onChange={(e) => setSelectedTransaction({ ...selectedTransaction, transport_fee: e.target.value })}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {selectedTransaction.schedule_date !== originalScheduleDate && (
                                                                    <div>
                                                                        <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-1">Penalty (%)</label>
                                                                        <div className="relative">
                                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                                                                            <input
                                                                                type="number"
                                                                                className="w-full pr-8 bg-red-50 border-red-100 text-red-600 rounded-xl text-sm focus:ring-red-500 focus:border-red-500 font-bold"
                                                                                value={penaltyPercent}
                                                                                onChange={(e) => setPenaltyPercent(e.target.value)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {Object.entries(byGuest).map(([guestIdx, items]) => {
                                                        const guestDuration = items.reduce((s, it) => s + parseInt(it.package_duration || 0), 0);
                                                        const therapistName = employees.find(e => e.id == items[0]?.employee_id)?.name || 'Belum dipilih';
                                                        const guestCommission = items.reduce((s, it) => s + parseFloat(it.therapist_commission || 0), 0);

                                                        return (
                                                            <div key={guestIdx} className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                                {/* Guest Header */}
                                                                <div className="bg-gray-50/50 px-4 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                                        <div>
                                                                            <span className="text-xs font-bold text-gray-700 block">Customer ke-{guestIdx}</span>
                                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                                                                                {startTime} - {calculateEndTime(startTime, guestDuration)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-gray-200 pt-3 sm:pt-0 sm:pl-4">
                                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Terapis:</span>
                                                                            {isEditing ? (
                                                                                <select 
                                                                                    className="appearance-none bg-white border border-gray-200 text-[10px] font-bold text-gray-600 px-3 py-1 rounded-xl pr-8 focus:ring-zenith-orange focus:border-zenith-orange cursor-pointer"
                                                                                    value={items[0]?.employee_id || ''}
                                                                                    onChange={(e) => {
                                                                                        const newId = e.target.value;
                                                                                        const updatedItems = selectedTransaction.items.map(it => 
                                                                                            it.guest_index == guestIdx ? { ...it, employee_id: newId } : it
                                                                                        );
                                                                                        const updatedNewItems = newItems.map(ni => 
                                                                                            ni.guest_index == guestIdx ? { ...ni, employee_id: newId } : ni
                                                                                        );
                                                                                        setSelectedTransaction({...selectedTransaction, items: updatedItems});
                                                                                        setNewItems(updatedNewItems);
                                                                                    }}
                                                                                >
                                                                                    <option value="">Pilih...</option>
                                                                                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                                                                </select>
                                                                            ) : (
                                                                                <span className={`text-[10px] font-bold px-3 py-1 rounded-xl border ${therapistName === 'Belum dipilih' ? 'text-red-500 bg-red-50 border-red-100' : 'text-gray-700 bg-white border-gray-200'}`}>
                                                                                    {therapistName}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {isEditing && (
                                                                            <div className="relative">
                                                                                <select
                                                                                    className="appearance-none bg-zenith-orange/10 border-none text-[9px] font-bold text-zenith-orange uppercase px-3 py-1 rounded-full pr-7 focus:ring-0 cursor-pointer"
                                                                                    onChange={(e) => {
                                                                                        if (!e.target.value) return;
                                                                                        const [pkgId, durIdx] = e.target.value.split('|');
                                                                                        const pkg = packages.find(p => p.id == pkgId);
                                                                                        const duration = pkg.durations[durIdx];
                                                                                        const newItem = {
                                                                                            guest_index: parseInt(guestIdx),
                                                                                            package_name: pkg.title_id,
                                                                                            package_duration: duration.duration,
                                                                                            price: parseFloat(duration.price),
                                                                                            therapist_commission: parseFloat(duration.commission),
                                                                                            employee_id: items[0]?.employee_id || '',
                                                                                            isNew: true,
                                                                                            tempId: Date.now() + Math.random()
                                                                                        };
                                                                                        setNewItems([...newItems, newItem]);
                                                                                        e.target.value = '';
                                                                                    }}
                                                                                >
                                                                                    <option value="">+ Paket</option>
                                                                                    {(packages || []).map(pkg => (pkg.durations || []).map((dur, dIdx) => (
                                                                                        <option key={`${pkg.id}-${dIdx}`} value={`${pkg.id}|${dIdx}`}>
                                                                                            {pkg.title_id} ({dur.duration})
                                                                                        </option>
                                                                                    )))}
                                                                                </select>
                                                                                <PlusIcon className="w-3 h-3 text-zenith-orange absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                                            </div>
                                                                        )}
                                                                        <div className="bg-gray-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                                                            <span className="text-[8px] text-gray-400 font-bold uppercase">Komisi</span>
                                                                            <span className="text-[10px] font-black text-gray-700">{formatCurrency(guestCommission)}</span>
                                                                            {isEditing && (
                                                                                <button onClick={() => recalculateCommission(guestIdx)} className="ml-1 p-0.5 hover:text-zenith-orange transition-colors">
                                                                                    <ArrowPathIcon className="w-3 h-3" />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Package Table */}
                                                                <table className="w-full text-xs">
                                                                    <tbody className="divide-y divide-gray-50">
                                                                        {items.map((item, idx) => (
                                                                            <tr key={idx} className={item.isNew ? 'bg-green-50/30' : ''}>
                                                                                <td className="px-4 py-2.5">
                                                                                    <div className="flex items-center gap-2">
                                                                                        {item.isNew && <span className="bg-green-100 text-green-600 px-1 py-0.5 rounded text-[7px] font-black uppercase">BARU</span>}
                                                                                        <span className="font-semibold text-gray-800">{item.package_name}</span>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-4 py-2.5 text-center text-gray-500">{item.package_duration} mnt</td>
                                                                                <td className="px-4 py-2.5 text-right font-bold text-gray-700">{formatCurrency(item.price)}</td>
                                                                                {isEditing && (
                                                                                    <td className="px-4 py-2.5 text-right">
                                                                                        <button 
                                                                                            onClick={() => {
                                                                                                if (item.isNew) {
                                                                                                    setNewItems(newItems.filter(ni => ni.tempId !== item.tempId));
                                                                                                } else {
                                                                                                    setDeletedItems([...deletedItems, item.id]);
                                                                                                }
                                                                                            }}
                                                                                            className="p-1 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                                                        >
                                                                                            <TrashIcon className="w-3.5 h-3.5" />
                                                                                        </button>
                                                                                    </td>
                                                                                )}
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Footer Summary */}
                                                <div className="px-6 sm:px-10 py-8 bg-gray-50/80 border-t border-gray-100 rounded-b-[3rem] sticky bottom-0 z-10 backdrop-blur-md">
                                                    <div className="flex flex-col sm:flex-row gap-6 justify-between sm:items-end">
                                                        <div className="flex-1 space-y-2">
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Ringkasan Komisi</p>
                                                            {Object.entries(byGuest).map(([gIdx, items]) => {
                                                                const therapist = employees.find(e => e.id == items[0]?.employee_id);
                                                                const totalKomisi = items.reduce((s, it) => s + (parseFloat(it.therapist_commission) || 0), 0);
                                                                return (
                                                                    <div key={gIdx} className="flex items-center justify-between bg-white px-4 py-2 rounded-xl border border-gray-100">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[8px] font-bold text-zenith-orange uppercase tracking-widest">Customer ke-{gIdx}</span>
                                                                            <span className="text-[10px] font-bold text-gray-700 uppercase">{therapist?.name || 'Belum dipilih'}</span>
                                                                        </div>
                                                                        <span className="text-xs font-black text-gray-900">{formatCurrency(totalKomisi)}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        <div className="text-left sm:text-right sm:ml-8 shrink-0 border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                                                            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest block mb-1">Grand Total</span>
                                                            <span className="text-2xl font-black text-zenith-orange">
                                                                {(() => {
                                                                    const subtotal = allItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
                                                                    const transport = parseFloat(currentData.transport_fee || 0);
                                                                    const discount = parseFloat(currentData.discount_amount || 0);
                                                                    const totalBeforePenalty = subtotal + transport - discount;
                                                                    const penalty = totalBeforePenalty * (penaltyPercent / 100);
                                                                    return formatCurrency(totalBeforePenalty + penalty);
                                                                })()}
                                                            </span>
                                                            <div className="flex flex-col items-end gap-1 mt-1">
                                                                {currentData.transport_fee > 0 && <p className="text-[9px] text-gray-400 font-medium">Transport {formatCurrency(currentData.transport_fee)}</p>}
                                                                {currentData.voucher && <p className="text-[9px] text-blue-500 font-bold uppercase">Voucher: {currentData.voucher.code} (-{formatCurrency(currentData.voucher.discount_amount)})</p>}
                                                                {currentData.discount_percent > 0 && <p className="text-[9px] text-red-400 font-bold uppercase">Diskon {parseFloat(currentData.discount_percent)}% (-{formatCurrency(currentData.discount_amount)})</p>}
                                                                {penaltyPercent > 0 && <p className="text-[9px] text-orange-500 font-bold uppercase">Reschedule {penaltyPercent}%</p>}
                                                            </div>
                                                            
                                                            {isEditing ? (
                                                                <div className="mt-4 flex gap-2 justify-end">
                                                                    <SecondaryButton onClick={() => setIsEditing(false)}>Batal</SecondaryButton>
                                                                    <PrimaryButton onClick={saveTransaction} className="bg-zenith-orange hover:bg-zenith-orange/90">Simpan</PrimaryButton>
                                                                </div>
                                                            ) : (
                                                                <div className="mt-4 flex gap-2 justify-end">
                                                                    <PrimaryButton onClick={() => sendInvoice(selectedEvent)} className="bg-green-600 hover:bg-green-700">WA</PrimaryButton>
                                                                    <PrimaryButton onClick={() => copyInvoiceText(selectedEvent)} className="bg-blue-600 hover:bg-blue-700 text-[10px]">Salin Text</PrimaryButton>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            <style dangerouslySetInnerHTML={{
                __html: `                .full-calendar-custom .fc {
                    --fc-border-color: #f1f5f9;
                    --fc-daygrid-event-dot-width: 8px;
                    --fc-today-bg-color: #fff7ed;
                    font-family: inherit;
                }
                .full-calendar-custom .fc-header-toolbar {
                    display: flex !important;
                    flex-direction: row !important;
                    flex-wrap: wrap !important;
                    gap: 1rem !important;
                    margin-bottom: 2.5rem !important;
                    justify-content: space-between !important;
                }
                @media (max-width: 640px) {
                    .full-calendar-custom .fc-header-toolbar {
                        flex-direction: column !important;
                        align-items: center !important;
                        text-align: center !important;
                    }
                    .full-calendar-custom .fc-toolbar-chunk {
                        display: flex !important;
                        justify-content: center !important;
                        width: 100% !important;
                    }
                    .full-calendar-custom .fc-toolbar-title {
                        font-size: 1.5rem !important;
                        order: -1 !important;
                    }
                }
                .full-calendar-custom .fc-toolbar-title {
                    font-size: 1.75rem !important;
                    font-weight: 800 !important;
                    color: #1e293b;
                    font-family: serif;
                    font-style: italic;
                    letter-spacing: -0.02em;
                }
                .full-calendar-custom .fc-button-group {
                    background: #f8fafc !important;
                    padding: 3px !important;
                    border-radius: 1rem !important;
                    border: 1px solid #e2e8f0 !important;
                }
                .full-calendar-custom .fc-button {
                    background: transparent !important;
                    border: none !important;
                    color: #64748b !important;
                    font-size: 0.7rem !important;
                    font-weight: 800 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                    padding: 0.6rem 1rem !important;
                    border-radius: 0.8rem !important;
                    transition: all 0.2s !important;
                    box-shadow: none !important;
                    margin: 0 !important;
                }
                @media (max-width: 640px) {
                    .full-calendar-custom .fc-button {
                        padding: 0.5rem 0.8rem !important;
                        font-size: 0.65rem !important;
                    }
                }
                .full-calendar-custom .fc-today-button {
                    background: white !important;
                    border: 1px solid #e2e8f0 !important;
                    margin-left: 0.5rem !important;
                    border-radius: 0.8rem !important;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
                }
                .full-calendar-custom .fc-button:hover:not(.fc-button-active) {
                    background: white !important;
                    color: #f47c51 !important;
                }
                .full-calendar-custom .fc-button-active, 
                .full-calendar-custom .fc-today-button:disabled {
                    background: #f47c51 !important;
                    color: white !important;
                    opacity: 1 !important;
                }
                .full-calendar-custom .fc-event {
                    border-radius: 0.6rem !important;
                    padding: 4px 6px !important;
                    font-size: 10px !important;
                    font-weight: 700 !important;
                    border: none !important;
                    cursor: pointer !important;
                    transition: all 0.2s !important;
                    margin: 1px 0 !important;
                }
                .full-calendar-custom .fc-event:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                }
                .full-calendar-custom .fc-col-header-cell {
                    padding: 1.25rem 0 !important;
                    background: #f8fafc !important;
                    border: none !important;
                }
                .full-calendar-custom .fc-col-header-cell-cushion {
                    font-size: 10px !important;
                    font-weight: 800 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em !important;
                    color: #94a3b8 !important;
                    text-decoration: none !important;
                }
                .full-calendar-custom .fc-daygrid-day {
                    border-color: #f1f5f9 !important;
                }
                .full-calendar-custom .fc-daygrid-day-number {
                    font-size: 13px !important;
                    font-weight: 700 !important;
                    color: #64748b !important;
                    padding: 12px !important;
                    text-decoration: none !important;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}} />
        </AuthenticatedLayout>
    );
}
