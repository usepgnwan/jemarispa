import { CheckIcon } from '@heroicons/react/24/solid';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

const serviceGroups = [
    { 
        id: 'massage-trad', 
        name: 'Pijat Tradisional', 
        desc: 'Our signature balancing massage ritual',
        features: ['Full body massage', 'Choice of essential oils', 'Traditional techniques'],
        featured: true,
        variants: [
            { duration: '60 Min', price: 125000, display: '125k' },
            { duration: '90 Min', price: 175000, display: '175k' },
            { duration: '120 Min', price: 225000, display: '225k' },
        ]
    },
    { 
        id: 'bekam-medik', 
        name: 'Bekam Medik', 
        desc: 'Medical-grade detoxification therapy',
        features: ['Sterile equipment', 'Expert therapist', 'Post-therapy care'],
        featured: false,
        variants: [
            { duration: '45 Min', price: 150000, display: '150k' },
            { duration: '60 Min', price: 200000, display: '200k' },
        ]
    },
    { 
        id: 'lulur-aura', 
        name: 'Lulur & Totok', 
        desc: 'Complete beauty and aura refreshment',
        features: ['Organic scrub', 'Face acupressure', 'Skin rejuvenation'],
        featured: false,
        variants: [
            { duration: '60 Min', price: 150000, display: '150k' },
            { duration: '90 Min', price: 220000, display: '220k' },
        ]
    }
];

export default function Pricing() {
    const [selectedDurations, setSelectedDurations] = useState({}); // { groupId: variantIndex }
    const [toast, setToast] = useState({ show: false, message: '' });

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const handleDurationChange = (groupId, variantIndex) => {
        setSelectedDurations(prev => ({
            ...prev,
            [groupId]: parseInt(variantIndex)
        }));
    };

    const addToCart = (group) => {
        const variantIndex = selectedDurations[group.id] || 0;
        const variant = group.variants[variantIndex];
        
        const savedCart = JSON.parse(localStorage.getItem('spa_cart') || '[]');
        const newItem = {
            id: `${group.id}-${variant.duration}`,
            name: `${group.name} ${variant.duration}`,
            price: variant.price,
            duration: variant.duration,
            category: 'Package'
        };
        const newCart = [...savedCart, newItem];
        localStorage.setItem('spa_cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cart-updated'));
        showToast(`${newItem.name} berhasil ditambahkan!`);
    };

    return (
        <section id="pricing" className="py-section bg-zenith-surface relative">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center mb-20">
                <span className="text-zenith-orange font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Invitations</span>
                <h2 className="text-4xl md:text-5xl font-serif text-zenith-charcoal italic">Select Your Journey</h2>
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                    {serviceGroups.map((group) => {
                        const variantIndex = selectedDurations[group.id] || 0;
                        const currentVariant = group.variants[variantIndex];

                        return (
                            <div 
                                key={group.id}
                                className={`rounded-[3rem] p-10 transition-all duration-700 ${
                                    group.featured 
                                        ? 'bg-white shadow-[0_32px_64px_-16px_rgba(244,124,81,0.1)] border border-zenith-orange/10 py-16 scale-105 z-10' 
                                        : 'bg-white/50 border border-white hover:bg-white hover:shadow-xl'
                                }`}
                            >
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zenith-orange mb-8">{group.name}</h3>
                                
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1 mb-3">
                                        <span className="text-sm font-bold text-gray-400">Rp</span>
                                        <span className="text-6xl font-serif italic text-zenith-charcoal">{currentVariant.display}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-x-2 mt-2">
                                        <span className="text-[10px] font-bold text-zenith-charcoal/30 uppercase tracking-widest">Duration:</span>
                                        <select 
                                            className="bg-zenith-surface border-none rounded-lg px-3 py-1.5 text-[10px] font-bold text-zenith-charcoal focus:ring-1 focus:ring-zenith-orange appearance-none cursor-pointer"
                                            value={variantIndex}
                                            onChange={(e) => handleDurationChange(group.id, e.target.value)}
                                        >
                                            {group.variants.map((v, i) => (
                                                <option key={i} value={i}>{v.duration}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500 mb-10 font-sans">{group.desc}</p>
                                
                                <ul className="space-y-5 mb-12">
                                    {group.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-x-3 text-xs text-zenith-charcoal font-semibold tracking-wide uppercase">
                                            <div className="h-1.5 w-1.5 rounded-full bg-zenith-orange"></div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button 
                                    onClick={() => addToCart(group)}
                                    className={`w-full py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${
                                    group.featured
                                        ? 'bg-zenith-orange text-white shadow-xl shadow-zenith-orange/40 hover:bg-zenith-charcoal hover:-translate-y-1'
                                        : 'bg-zenith-dim/20 text-zenith-charcoal hover:bg-zenith-orange hover:text-white'
                                }`}>
                                    Book This Path
                                </button>
                            </div>
                        );
                    })}
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
