import Dropdown from '@/Components/Dropdown';
import Sidebar from '@/Components/Sidebar';
import { usePage, Link } from '@inertiajs/react';
import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    Bars3CenterLeftIcon,
    XMarkIcon,
    BellIcon,
    MoonIcon
} from '@heroicons/react/24/outline';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, notifications = [] } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="bg-zenith-surface min-h-screen">
            {/* Mobile Sidebar (Always full width when open) */}
            <Transition.Root show={sidebarOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative mr-16 flex w-full max-w-[280px] flex-1">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in-out duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                        <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                                            <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </button>
                                    </div>
                                </Transition.Child>
                                <Sidebar collapsed={false} />
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Static sidebar for desktop */}
            <div className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}>
                <Sidebar collapsed={isCollapsed} />
            </div>

            <div className={`transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
                {/* Header - Fixed with white background */}
                <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 bg-white border-b border-gray-100 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
                    <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
                        <Bars3CenterLeftIcon className="h-6 w-6" aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:block -m-2.5 p-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <Bars3CenterLeftIcon className="h-6 w-6" aria-hidden="true" />
                    </button>

                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                        <div className="flex-1"></div>
                        <div className="flex items-center gap-x-4 lg:gap-x-6">
                            <button type="button" className="text-gray-400 hover:text-gray-600">
                                <MoonIcon className="h-5 w-5" />
                            </button>

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button type="button" className="text-gray-400 hover:text-gray-600 relative p-1.5 focus:outline-none">
                                        <BellIcon className="h-5 w-5" />
                                        {notifications?.length > 0 && (
                                            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                                {notifications.length}
                                            </span>
                                        )}
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content width="80" align="right" contentClasses="py-2 bg-white max-h-[400px] overflow-y-auto">
                                    <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-sm z-10">
                                        <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Notifikasi Hari Ini</span>
                                        <span className="text-[10px] font-bold text-zenith-orange bg-zenith-orange/10 px-2 py-0.5 rounded-full">{notifications?.length || 0} Baru</span>
                                    </div>
                                    {notifications?.length > 0 ? (
                                        <div className="flex flex-col">
                                            {notifications.map((notif) => (
                                                <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-xs font-bold text-gray-900">{notif.customer_name}</span>
                                                        <span className="text-[10px] text-gray-400 font-medium">{notif.time}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{notif.order_number}</span>
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                            notif.status === 'pending' ? 'bg-slate-100 text-slate-600' : 
                                                            notif.status === 'send_terapis' ? 'bg-blue-100 text-blue-600' :
                                                            notif.status === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                                            notif.status === 'failed' ? 'bg-red-100 text-red-600' :
                                                            'bg-amber-100 text-amber-600'
                                                        }`}>
                                                            {notif.status === 'send_terapis' ? 'Proses' : notif.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-4 py-8 text-center flex flex-col items-center justify-center border-b border-gray-50">
                                            <BellIcon className="h-8 w-8 text-gray-200 mb-2" />
                                            <p className="text-xs text-gray-400 font-medium">Belum ada pesanan hari ini</p>
                                        </div>
                                    )}
                                    <div className="p-2 bg-gray-50 sticky bottom-0 border-t border-gray-100">
                                        <Link 
                                            href={route('admin.transaction.index')}
                                            className="block w-full text-center py-2 text-xs font-bold text-zenith-orange hover:text-zenith-orange/80 transition-colors"
                                        >
                                            Lihat Semua Pesanan
                                        </Link>
                                    </div>
                                </Dropdown.Content>
                            </Dropdown>

                            <div className="h-6 w-px bg-gray-200" aria-hidden="true" />

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="flex items-center gap-x-3 p-1.5 focus:outline-none group">
                                        <div className="h-8 w-8 rounded-full bg-zenith-orange/10 flex items-center justify-center text-zenith-orange overflow-hidden group-hover:ring-2 group-hover:ring-zenith-orange transition-all">
                                            <span className="text-xs font-bold">{user.name.charAt(0)}</span>
                                        </div>
                                        {!isCollapsed && (
                                            <span className="hidden lg:flex lg:items-center">
                                                <span className="text-sm font-bold text-gray-900 leading-none">{user.name}</span>
                                            </span>
                                        )}
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>

                <main>
                    <div className="px-4 sm:px-6 lg:px-5 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
