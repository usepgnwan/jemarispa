import { CheckIcon } from '@heroicons/react/24/solid';

const tiers = [
    {
        name: 'Essential',
        price: '75k',
        desc: 'Single session entry',
        features: ['1 Signature Massage', 'Locker access', 'Zen garden access'],
        featured: false
    },
    {
        name: 'The Ritual',
        price: '225k',
        desc: 'Our most popular sanctuary pass',
        features: ['Full day access', 'Unlimited sauna', '3 Custom treatments', 'Personal concierge'],
        featured: true
    },
    {
        name: 'Elite Circle',
        price: '500k',
        desc: 'Monthly premium membership',
        features: ['Priority booking', 'Unlimited treatments', 'Private lounge', 'Retail credit'],
        featured: false
    }
];

export default function Pricing() {
    return (
        <section id="pricing" className="py-section bg-zenith-surface">
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
                                <span className="text-6xl font-serif italic text-zenith-charcoal">{tier.price}</span>
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

                            <button className={`w-full py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${
                                tier.featured
                                    ? 'bg-zenith-orange text-white shadow-xl shadow-zenith-orange/40 hover:bg-zenith-orange/80 hover:-translate-y-1'
                                    : 'bg-zenith-dim/20 text-zenith-charcoal hover:bg-zenith-dim/40'
                            }`}>
                                Book This Path
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
