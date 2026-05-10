import { Link, usePage } from '@inertiajs/react';
import { 
    HomeIcon, 
    ChartBarIcon, 
    CalculatorIcon,
    ShoppingCartIcon,
    Square3Stack3DIcon, 
    StarIcon,
    DocumentTextIcon, 
    QuestionMarkCircleIcon,
    UsersIcon, 
    GlobeAltIcon,
    Cog6ToothIcon,
    ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function Sidebar({ collapsed }) {
    const user = usePage().props.auth.user;

    const navigation = [
        { 
            section: 'UTAMA',
            items: [
                { name: 'Dashboard', href: route('dashboard'), icon: HomeIcon, current: route().current('dashboard') },
                { name: 'Analitik', href: route('admin.analytics.index'), icon: ChartBarIcon, current: route().current('admin.analytics.index') },
            ]
        },
        { 
            section: 'PENGGUNA',
            items: [
                { name: 'Fitur POS', href: route('admin.pos.index'), icon: CalculatorIcon, current: route().current('admin.pos.*') },
                { name: 'Pesanan', href: route('admin.transaction.index'), icon: ShoppingCartIcon, current: route().current('admin.transaction.*') },
                { name: 'Laporan Terapis', href: route('admin.therapist.report'), icon: ClipboardDocumentListIcon, current: route().current('admin.therapist.*') },
            ]
        },
        { 
            section: 'KONTEN',
            items: [
                { name: 'Paket', href: route('admin.package.index'), icon: Square3Stack3DIcon, current: route().current('admin.package.*') },
                { name: 'Testimoni', href: route('testimoni.index'), icon: StarIcon, current: route().current('testimoni.*') },
                { name: 'Blog', href: route('admin.blog.index'), icon: DocumentTextIcon, current: route().current('admin.blog.*') },
                { name: 'FAQ', href: route('faq.index'), icon: QuestionMarkCircleIcon, current: route().current('faq.*') },
            ]
        },
        { 
            section: 'MASTER',
            items: [
                { name: 'Data Karyawan', href: route('admin.employee.index'), icon: UsersIcon, current: route().current('admin.employee.*') },
                { name: 'Platform', href: route('platform.index'), icon: GlobeAltIcon, current: route().current('platform.*') },
            ]
        },
        { 
            section: 'SETTING',
            items: [
                { name: 'Setting', href: route('admin.settings.index'), icon: Cog6ToothIcon, current: route().current('admin.settings.*') },
            ]
        }
    ];

    return (
        <div className="flex grow flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden">
            {/* Logo Section */}
            <div className="flex h-20 shrink-0 items-center px-6 gap-x-3 overflow-hidden">
                <div className="h-10 w-10 flex items-center justify-center shrink-0">
                    <img src="/images/Jemari Logo - 1.png" alt="Jemari Spa" className="h-full w-full object-contain drop-shadow-sm" />
                </div>
                {!collapsed && (
                    <div className="transition-opacity duration-300">
                        <h1 className="text-lg font-bold text-zenith-charcoal leading-tight font-serif italic">Jemari Spa</h1>
                        <p className="text-[10px] font-bold text-zenith-orange tracking-widest uppercase">ADMIN PANEL</p>
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
                                                    ? 'bg-zenith-orange text-white shadow-lg shadow-zenith-orange/20'
                                                    : 'text-gray-600 hover:text-zenith-orange hover:bg-zenith-orange/5',
                                                'group flex gap-x-3 rounded-xl p-2.5 text-sm leading-6 font-semibold transition-all duration-200',
                                                collapsed ? 'justify-center' : ''
                                            )}
                                            title={collapsed ? item.name : ''}
                                        >
                                            <item.icon
                                                className={classNames(
                                                    item.current ? 'text-white' : 'text-gray-400 group-hover:text-zenith-orange',
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
                    <div className="h-10 w-10 rounded-full bg-zenith-orange/10 flex items-center justify-center text-zenith-orange overflow-hidden shrink-0">
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
