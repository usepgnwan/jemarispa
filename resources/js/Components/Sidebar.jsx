import { Link, usePage } from '@inertiajs/react';
import { 
    HomeIcon, 
    ChartBarIcon, 
    Square3Stack3DIcon, 
    DocumentTextIcon, 
    TicketIcon, 
    UsersIcon, 
    ShoppingCartIcon
} from '@heroicons/react/24/outline';

const navigation = [
    { 
        section: 'UTAMA',
        items: [
            { name: 'Overview', href: route('dashboard'), icon: HomeIcon, current: route().current('dashboard') },
            { name: 'Analitik', href: '#', icon: ChartBarIcon, current: false },
        ]
    },
    { 
        section: 'KONTEN',
        items: [
            { name: 'Paket & Soal', href: '#', icon: Square3Stack3DIcon, current: false },
            { name: 'Blog', href: '#', icon: DocumentTextIcon, current: false },
        ]
    },
    { 
        section: 'MARKETING',
        items: [
            { name: 'Voucher & Promo', href: '#', icon: TicketIcon, current: false },
        ]
    },
    { 
        section: 'PENGGUNA',
        items: [
            { name: 'Pengguna', href: '#', icon: UsersIcon, current: false },
            { name: 'Pesanan', href: '#', icon: ShoppingCartIcon, current: false },
        ]
    }
];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function Sidebar({ collapsed }) {
    const user = usePage().props.auth.user;

    return (
        <div className="flex grow flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden">
            {/* Logo Section */}
            <div className="flex h-20 shrink-0 items-center px-6 gap-x-3 overflow-hidden">
                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
                    K
                </div>
                {!collapsed && (
                    <div className="transition-opacity duration-300">
                        <h1 className="text-lg font-bold text-gray-900 leading-tight">Kantan</h1>
                        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">ADMIN PANEL</p>
                    </div>
                )}
            </div>
            
            {/* Navigation Section - Scrollable */}
            <nav className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    {navigation.map((group) => (
                        <li key={group.section}>
                            {!collapsed && (
                                <div className="text-[10px] font-bold leading-6 text-gray-400 tracking-widest mb-2 uppercase">
                                    {group.section}
                                </div>
                            )}
                            <ul role="list" className="-mx-2 space-y-1">
                                {group.items.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={classNames(
                                                item.current
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50',
                                                'group flex gap-x-3 rounded-xl p-2.5 text-sm leading-6 font-semibold transition-all duration-200',
                                                collapsed ? 'justify-center' : ''
                                            )}
                                            title={collapsed ? item.name : ''}
                                        >
                                            <item.icon
                                                className={classNames(
                                                    item.current ? 'text-white' : 'text-gray-400 group-hover:text-blue-600',
                                                    'h-5 w-5 shrink-0 transition-colors'
                                                )}
                                                aria-hidden="true"
                                            />
                                            {!collapsed && (
                                                <span className="truncate transition-opacity duration-300">
                                                    {item.name}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer Section - Fixed (Sticky at the bottom) */}
            <div className="shrink-0 border-t border-gray-100 bg-white p-4">
                <div className={classNames(
                    "flex items-center gap-x-3 rounded-xl p-2 hover:bg-gray-50 transition-colors cursor-pointer",
                    collapsed ? 'justify-center' : ''
                )}>
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 overflow-hidden shrink-0">
                        <span className="font-bold text-sm uppercase">{user.name.charAt(0)}</span>
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0 transition-opacity duration-300">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
