import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ClockIcon, UserIcon, MapPinIcon, PhoneIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Calendar({ auth, transactions }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const handleEventClick = (info) => {
        setSelectedEvent(info.event.extendedProps);
        setIsModalOpen(true);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const statusLabels = {
        pending: 'Pending',
        send_terapis: 'Proses',
        invoice: 'Invoice',
        success: 'Selesai',
        failed: 'Batal',
    };

    const statusColors = {
        pending: 'bg-slate-100 text-slate-600 border-slate-200',
        send_terapis: 'bg-blue-100 text-blue-600 border-blue-200',
        invoice: 'bg-amber-100 text-amber-600 border-amber-200',
        success: 'bg-emerald-100 text-emerald-600 border-emerald-200',
        failed: 'bg-red-100 text-red-600 border-red-200',
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title="Kalender Jadwal Terapis" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 font-serif italic">Kalender Jadwal Anda</h2>
                        <p className="mt-1 text-sm text-gray-500">Lihat seluruh jadwal layanan yang ditugaskan kepada Anda</p>
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-[3rem] shadow-sm border border-gray-100">
                        <div className="full-calendar-custom">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="timeGridWeek"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                }}
                                events={transactions}
                                eventClick={handleEventClick}
                                eventTimeFormat={{
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    meridiem: false,
                                    hour12: false
                                }}
                                height="auto"
                                dayMaxEvents={5}
                                locale="id"
                                slotMinTime="08:00:00"
                                slotMaxTime="23:00:00"
                            />
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
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative w-full max-w-lg transform overflow-hidden rounded-[2rem] bg-white text-left shadow-2xl transition-all border border-gray-100">
                                    {selectedEvent && (
                                        <>
                                            <div className="px-8 pt-8 pb-6 border-b border-gray-100 bg-gray-50">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border mb-2 ${statusColors[selectedEvent.status] || ''}`}>
                                                            {statusLabels[selectedEvent.status]}
                                                        </div>
                                                        <h3 className="text-xl font-black text-gray-900">{selectedEvent.customer_name}</h3>
                                                        <div className="flex flex-wrap items-center gap-3 mt-2">
                                                            <span className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
                                                                <PhoneIcon className="w-3.5 h-3.5" />
                                                                {selectedEvent.phone}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
                                                                <MapPinIcon className="w-3.5 h-3.5" />
                                                                {selectedEvent.address}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                                                        <XMarkIcon className="w-5 h-5 text-gray-400" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="px-8 py-6 space-y-6">
                                                <div className="flex items-center gap-3 bg-zenith-orange/5 p-4 rounded-2xl">
                                                    <div className="p-2 bg-zenith-orange/10 rounded-xl text-zenith-orange">
                                                        <ClockIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jadwal</p>
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {new Date(selectedEvent.schedule_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                            {' · '}
                                                            {selectedEvent.schedule_time ? selectedEvent.schedule_time.substring(0,5) : ''}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Layanan yang ditugaskan kepada Anda</h4>
                                                    <div className="space-y-3">
                                                        {(selectedEvent.items || []).map((item, idx) => (
                                                            <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-gray-100 bg-gray-50">
                                                                <div>
                                                                    <p className="text-xs font-bold text-gray-900">{item.package_name}</p>
                                                                    <p className="text-[10px] text-gray-500">{item.package_duration}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Komisi</p>
                                                                    <p className="text-xs font-bold text-zenith-orange">{formatCurrency(item.therapist_commission || 0)}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {selectedEvent.notes && (
                                                    <div>
                                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Catatan</h4>
                                                        <p className="text-xs text-gray-600 bg-yellow-50 p-3 rounded-xl border border-yellow-100">{selectedEvent.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </AuthenticatedLayout>
    );
}
