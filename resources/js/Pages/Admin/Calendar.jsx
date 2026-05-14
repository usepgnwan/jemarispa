import { useState, Fragment, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog, Transition } from '@headlessui/react';
import { 
    CalendarIcon, 
    ClockIcon, 
    UserIcon, 
    MapPinIcon, 
    PhoneIcon,
    XMarkIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export default function Calendar({ auth, events, summary, employees }) {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTherapist, setSelectedTherapist] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [visibleRange, setVisibleRange] = useState({ start: null, end: null });

    const handleEventClick = (info) => {
        setSelectedEvent(info.event.extendedProps);
        setIsModalOpen(true);
    };

    const handleDatesSet = (info) => {
        setVisibleRange({
            start: info.view.activeStart,
            end: info.view.activeEnd
        });
    };

    const displayEvents = useMemo(() => {
        if (!events || !Array.isArray(events)) return [];
        return events.filter(event => {
            // Filter by Therapist
            const matchTherapist = selectedTherapist === 'all' || 
                event.extendedProps.items.some(item => item.employee_id === parseInt(selectedTherapist));
            
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
        send_terapis: 'Kirim Terapis',
        invoice: 'Invoice',
        success: 'Selesai',
        failed: 'Batal',
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
                                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-100">
                                    <button 
                                        onClick={() => setSelectedStatus('all')}
                                        className={`px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all ${selectedStatus === 'all' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Semua
                                    </button>
                                    <button 
                                        onClick={() => setSelectedStatus('pending')}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${selectedStatus === 'pending' ? 'bg-slate-400 text-white shadow-sm' : 'bg-white text-slate-500 border border-gray-100'}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${selectedStatus === 'pending' ? 'bg-white' : 'bg-slate-400'}`}></span>
                                        Pending
                                    </button>
                                    <button 
                                        onClick={() => setSelectedStatus('send_terapis')}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${selectedStatus === 'send_terapis' ? 'bg-blue-400 text-white shadow-sm' : 'bg-white text-blue-500 border border-gray-100'}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${selectedStatus === 'send_terapis' ? 'bg-white' : 'bg-blue-400'}`}></span>
                                        Proses
                                    </button>
                                    <button 
                                        onClick={() => setSelectedStatus('invoice')}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${selectedStatus === 'invoice' ? 'bg-amber-400 text-white shadow-sm' : 'bg-white text-amber-500 border border-gray-100'}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${selectedStatus === 'invoice' ? 'bg-white' : 'bg-amber-400'}`}></span>
                                        Invoice
                                    </button>
                                    <button 
                                        onClick={() => setSelectedStatus('success')}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${selectedStatus === 'success' ? 'bg-emerald-400 text-white shadow-sm' : 'bg-white text-emerald-500 border border-gray-100'}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${selectedStatus === 'success' ? 'bg-white' : 'bg-emerald-400'}`}></span>
                                        Selesai
                                    </button>
                                    <button 
                                        onClick={() => setSelectedStatus('failed')}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${selectedStatus === 'failed' ? 'bg-red-400 text-white shadow-sm' : 'bg-white text-red-500 border border-gray-100'}`}
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
                                    eventTimeFormat={{
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        meridiem: false,
                                        hour12: false
                                    }}
                                    height="auto"
                                    dayMaxEvents={true}
                                    locale="id"
                                />
                            </div>
                        </div>

                        {/* Therapist Sidebar */}
                        <div className="lg:w-80 shrink-0 space-y-6">
                            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Total Terapis</h3>
                                    <div className="p-2 rounded-xl bg-zenith-orange/10 text-zenith-orange">
                                        <UserIcon className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                                    {therapistTotals.map(therapist => (
                                        <div key={therapist.id} className={`p-4 rounded-3xl border transition-all duration-200 ${selectedTherapist == therapist.id ? 'bg-zenith-orange/5 border-zenith-orange/20 ring-1 ring-zenith-orange/10' : 'bg-zenith-surface border-gray-100'}`}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[10px] font-bold text-zenith-orange uppercase shadow-sm">
                                                    {therapist.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-gray-900 truncate">{therapist.name}</p>
                                                    <p className="text-[10px] text-gray-500">{therapist.count} Pesanan</p>
                                                </div>
                                            </div>
                                            <div className="flex items-baseline justify-between mb-1">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Komisi</span>
                                                <span className="text-sm font-bold text-zenith-orange">Rp {therapist.totalCommission.toLocaleString('id-ID')}</span>
                                            </div>
                                            <div className="flex items-baseline justify-between">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Omzet</span>
                                                <span className="text-[11px] font-bold text-gray-600">Rp {therapist.totalRevenue.toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {therapistTotals.length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-xs text-gray-400 italic">Belum ada data terapis</p>
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
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                    {selectedEvent && (
                                        <div className="p-8">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border mb-3 ${statusColors[selectedEvent.status]}`}>
                                                        {statusLabels[selectedEvent.status]}
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-gray-900">{selectedEvent.customer_name}</h3>
                                                </div>
                                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                                                </button>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex gap-4 items-start">
                                                    <div className="p-3 rounded-2xl bg-zenith-orange/10 text-zenith-orange">
                                                        <ClockIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Jadwal & Waktu</p>
                                                        <p className="text-sm font-bold text-gray-900">{selectedEvent.schedule_time || 'Belum diatur'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 items-start">
                                                    <div className="p-3 rounded-2xl bg-zenith-orange/10 text-zenith-orange">
                                                        <PhoneIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Kontak</p>
                                                        <p className="text-sm font-bold text-gray-900">{selectedEvent.phone}</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 items-start">
                                                    <div className="p-3 rounded-2xl bg-zenith-orange/10 text-zenith-orange">
                                                        <MapPinIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Alamat</p>
                                                        <p className="text-sm font-medium text-gray-600 leading-relaxed">{selectedEvent.address}</p>
                                                    </div>
                                                </div>

                                                <div className="border-t border-gray-100 pt-6">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Detail Perawatan</p>
                                                    <div className="space-y-6">
                                                        {Object.entries(
                                                            selectedEvent.items.reduce((acc, item) => {
                                                                const guestIdx = item.guest_index || 1;
                                                                if (!acc[guestIdx]) acc[guestIdx] = [];
                                                                acc[guestIdx].push(item);
                                                                return acc;
                                                            }, {})
                                                        ).map(([guestIdx, items], idx) => (
                                                            <div key={guestIdx} className="space-y-3">
                                                                <p className="text-[10px] font-extrabold text-zenith-orange uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                                                    <UserIcon className="w-3 h-3" />
                                                                    Orang {guestIdx}
                                                                </p>
                                                                <div className="space-y-2">
                                                                    {items.map((item, iIdx) => (
                                                                        <div key={iIdx} className="p-4 bg-zenith-surface rounded-2xl border border-gray-100">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-zenith-orange"></div>
                                                                                    <span className="text-sm font-bold text-gray-900">{item.package_name || 'Package'}</span>
                                                                                </div>
                                                                                <span className="text-xs font-bold text-zenith-orange">{item.duration} Menit</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-[10px] text-gray-500 ml-4">
                                                                    <span className="font-bold uppercase tracking-tighter">Terapis:</span>
                                                                    <span className="font-bold text-gray-900 px-2 py-0.5 bg-white rounded-lg border border-gray-100">
                                                                        {items[0].employee?.name || 'Belum dipilih'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between bg-zenith-charcoal p-6 rounded-3xl mt-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-xl bg-white/10 text-white">
                                                            <CurrencyDollarIcon className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-sm font-bold text-white">Total Bayar</span>
                                                    </div>
                                                    <p className="text-xl font-bold text-white">Rp {parseFloat(selectedEvent.total_price).toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            <style dangerouslySetInnerHTML={{ __html: `
                .full-calendar-custom .fc {
                    --fc-border-color: #f1f5f9;
                    --fc-daygrid-event-dot-width: 8px;
                    --fc-today-bg-color: #fff7ed;
                    font-family: inherit;
                }
                .full-calendar-custom .fc-header-toolbar {
                    margin-bottom: 2rem !important;
                }
                .full-calendar-custom .fc-toolbar-title {
                    font-size: 1.25rem !important;
                    font-weight: 800 !important;
                    color: #1e293b;
                    font-family: serif;
                    font-style: italic;
                }
                .full-calendar-custom .fc-button {
                    background: white !important;
                    border: 1px solid #e2e8f0 !important;
                    color: #64748b !important;
                    font-size: 0.75rem !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                    padding: 0.5rem 1rem !important;
                    border-radius: 0.75rem !important;
                    transition: all 0.2s !important;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
                }
                .full-calendar-custom .fc-button:hover {
                    background: #f8fafc !important;
                    color: #f47c51 !important;
                    border-color: #f47c51 !important;
                }
                .full-calendar-custom .fc-button-active {
                    background: #f47c51 !important;
                    color: white !important;
                    border-color: #f47c51 !important;
                }
                .full-calendar-custom .fc-event {
                    border-radius: 0.5rem !important;
                    padding: 2px 4px !important;
                    font-size: 10px !important;
                    font-weight: 700 !important;
                    border: none !important;
                    cursor: pointer !important;
                    transition: transform 0.2s !important;
                }
                .full-calendar-custom .fc-event:hover {
                    transform: scale(1.02);
                }
                .full-calendar-custom .fc-col-header-cell {
                    padding: 1rem 0 !important;
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
                    font-size: 12px !important;
                    font-weight: 600 !important;
                    color: #64748b !important;
                    padding: 10px !important;
                    text-decoration: none !important;
                }
            `}} />
        </AuthenticatedLayout>
    );
}
