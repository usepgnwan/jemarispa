import { Link } from '@inertiajs/react';

export default function MobileNav() {
    const navItems = [
        { label: 'Home', icon: 'home', href: '/' },
        { label: 'Blog', icon: 'newspaper', href: '/blog' },
        { label: 'Prices', icon: 'receipt_long', href: '#pricing' },
        { label: 'Cart', icon: 'shopping_bag', href: '/cart', badge: '0' },
        { label: 'Contact', icon: 'chat_bubble', href: '#contact' },
    ];

    return (
        <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[60]">
            <div className="bg-white/80 backdrop-blur-2xl border border-orange-100 rounded-[2.5rem] shadow-2xl shadow-orange-900/10 px-8 py-4">
                <div className="flex items-center justify-between">
                    {navItems.map((item, i) => (
                        <a 
                            key={i} 
                            href={item.href} 
                            className="flex flex-col items-center gap-y-1 relative group"
                        >
                            <div className="relative">
                                <span className="material-symbols-outlined text-[22px] text-zenith-charcoal/60 group-hover:text-orange-600 transition-colors duration-300">
                                    {item.icon}
                                </span>
                                {item.badge && (
                                    <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[8px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center border border-white">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className="text-[8px] font-bold uppercase tracking-widest text-zenith-charcoal/40 group-hover:text-orange-600 transition-colors duration-300">
                                {item.label}
                            </span>
                            
                            {/* Active Indicator Dot */}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
