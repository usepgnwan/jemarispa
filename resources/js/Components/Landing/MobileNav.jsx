import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function MobileNav() {
    const [cartCount, setCartCount] = useState(0);
    const [activeHash, setActiveHash] = useState('');
    
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    useEffect(() => {
        const updateCartCount = () => {
            const savedCart = JSON.parse(localStorage.getItem('spa_cart') || '[]');
            setCartCount(savedCart.length);
        };

        const handleHashChange = () => {
            setActiveHash(window.location.hash);
        };

        updateCartCount();
        handleHashChange();

        window.addEventListener('scroll', () => {
            // Simple hash detection on scroll if needed, but for now hashchange is fine
        });
        
        window.addEventListener('hashchange', handleHashChange);
        window.addEventListener('storage', updateCartCount);
        window.addEventListener('cart-updated', updateCartCount);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('storage', updateCartCount);
            window.removeEventListener('cart-updated', updateCartCount);
        };
    }, []);

    const isActive = (path, hash = '') => {
        if (hash) return activeHash === hash;
        // For home, only active if no hash
        if (path === '/') return currentPath === '/' && !activeHash;
        return currentPath === path;
    };

    const navItems = [
        { label: 'Home', icon: 'home', href: '/', active: isActive('/') },
        { label: 'Blog', icon: 'newspaper', href: '/blog', active: isActive('/blog') },
        { label: 'Prices', icon: 'receipt_long', href: '/pricing', active: isActive('/pricing') },
        { label: 'Cart', icon: 'shopping_bag', href: '/cart', isCart: true, active: isActive('/cart') },
        { label: 'Contact', icon: 'chat_bubble', href: '/#contact', active: isActive('/', '#contact') },
    ];

    return (
        <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[60]">
            <div className="bg-white/80 backdrop-blur-2xl border border-zenith-orange/10 rounded-[2.5rem] shadow-2xl shadow-zenith-charcoal/10 px-8 py-4">
                <div className="flex items-center justify-between">
                    {navItems.map((item, i) => (
                        <Link 
                            key={i} 
                            href={item.href} 
                            className="flex flex-col items-center gap-y-1 relative group"
                        >
                            <div className="relative">
                                <span className={`material-symbols-outlined text-[22px] transition-colors duration-300 ${item.active ? 'text-zenith-orange' : 'text-zenith-charcoal/60 group-hover:text-zenith-orange'}`}>
                                    {item.icon}
                                </span>
                                {item.isCart && cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-zenith-gold text-zenith-charcoal text-[7px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white shadow-sm">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[8px] font-bold uppercase tracking-widest transition-colors duration-300 ${item.active ? 'text-zenith-orange' : 'text-zenith-charcoal/40 group-hover:text-zenith-orange'}`}>
                                {item.label}
                            </span>
                            
                            {/* Active Indicator Dot */}
                            <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-zenith-orange rounded-full transition-all duration-300 ${item.active ? 'opacity-100 scale-125' : 'opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100'}`}></div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
