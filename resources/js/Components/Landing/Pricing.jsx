import { CheckIcon } from '@heroicons/react/24/solid';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

const tiers = [
    {
        id: 'tier-essential',
        name: 'Essential Ritual',
        price: 75000,
        priceDisplay: '75k',
        duration: '60 Min',
        desc: 'Single session entry',
        features: ['1 Signature Massage', 'Locker access', 'Zen garden access'],
        featured: false
    },
    {
        id: 'tier-ritual',
        name: 'The Ritual Pass',
        price: 225000,
        priceDisplay: '225k',
        duration: 'Full Day',
        desc: 'Our most popular sanctuary pass',
        features: ['Full day access', 'Unlimited sauna', '3 Custom treatments', 'Personal concierge'],
        featured: true
    },
    {
        id: 'tier-elite',
        name: 'Elite Circle',
        price: 500000,
        priceDisplay: '500k',
        duration: 'Monthly',
        desc: 'Monthly premium membership',
        features: ['Priority booking', 'Unlimited treatments', 'Private lounge', 'Retail credit'],
        featured: false
    }
];

export default function Pricing() {
    const [toast, setToast] = useState({ show: false, message: '' });

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const addToCart = (tier) => {
        const savedCart = JSON.parse(localStorage.getItem('spa_cart') || '[]');
        const newItem = {
            id: tier.id,
            name: tier.name,
            price: tier.price,
            duration: tier.duration,
            category: 'Package'
        };
        const newCart = [...savedCart, newItem];
        localStorage.setItem('spa_cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cart-updated'));
        showToast(`${tier.name} berhasil ditambahkan!`);
    };

    return (
        <section id="pricing" className="py-section bg-zenith-surface relative">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center mb-20">
                <span className="text-zenith-orange font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Invitations</span>
                <h2 className="text-4xl md:text-5xl font-serif text-zenith-charcoal italic">Select Your Journey</h2>
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                    {tiers.map((tier) => (
                        <div 
                            key={tier.name}
                            className={`rounded-[3rem] p-10 transition-all duration-700 ${
                                tier.featured 
                                    ? 'bg-white shadow-[0_32px_64px_-16px_rgba(244,124,81,0.1)] border border-zenith-orange/10 py-16 scale-105 z-10' 
                                    : 'bg-white/50 border border-white hover:bg-white hover:shadow-xl'
                            }`}
                        >
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zenith-orange mb-8">{tier.name}</h3>
                            <div className="flex items-baseline gap-1 mb-3">
                                <span className="text-sm font-bold text-gray-400">Rp</span>
                                <span className="text-6xl font-serif italic text-zenith-charcoal">{tier.priceDisplay}</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-10 font-sans">{tier.desc}</p>
                            
                            <ul className="space-y-5 mb-12">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-x-3 text-xs text-zenith-charcoal font-semibold tracking-wide uppercase">
                                        <div className="h-1.5 w-1.5 rounded-full bg-zenith-orange"></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button 
                                onClick={() => addToCart(tier)}
                                className={`w-full py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${
                                tier.featured
                                    ? 'bg-zenith-orange text-white shadow-xl shadow-zenith-orange/40 hover:bg-zenith-charcoal hover:-translate-y-1'
                                    : 'bg-zenith-dim/20 text-zenith-charcoal hover:bg-zenith-orange hover:text-white'
                            }`}>
                                Book This Path
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <Link 
                        href="/pricing"
                        className="inline-flex items-center gap-x-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zenith-orange hover:text-zenith-charcoal transition-all group"
                    >
                        See All Rituals
                        <span className="material-symbols-outlined text-[18px] group-hover:translate-x-2 transition-transform">arrow_forward</span>
                    </Link>
                </div>
            </div>

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-10 right-10 z-[110] animate-slide-up">
                    <div className="bg-zenith-charcoal text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-x-4 border border-white/10">
                        <span className="material-symbols-outlined text-zenith-orange">check_circle</span>
                        <p className="text-[10px] font-bold uppercase tracking-widest">{toast.message}</p>
                    </div>
                </div>
            )}
        </section>
    );
}
