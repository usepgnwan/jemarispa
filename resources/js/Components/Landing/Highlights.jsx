export default function Highlights({ lang = 'ID' }) {
    const items = {
        'ID': [
            { id: '01', title: 'Terapis Berpengalaman', desc: 'Profesional & terlatih' },
            { id: '02', title: 'Terapis Sehat', desc: 'Menggunakan protokol kesehatan' },
            { id: '03', title: 'Respon Cepat', desc: 'One Day Service' },
            { id: '04', title: 'Harga Hemat', desc: 'Free ongkos transport' },
            { id: '05', title: 'Bahan Berkualitas', desc: 'Menggunakan produk yang aman' },
        ],
        'EN': [
            { id: '01', title: 'Experienced Therapists', desc: 'Professional & trained' },
            { id: '02', title: 'Healthy Therapists', desc: 'Following health protocols' },
            { id: '03', title: 'Fast Response', desc: 'One Day Service' },
            { id: '04', title: 'Affordable Prices', desc: 'Free transportation fee' },
            { id: '05', title: 'Quality Materials', desc: 'Using safe products' },
        ]
    };

    const displayItems = items[lang] || items['ID'];

    return (
        <section className="py-section bg-zenith-surface">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">
                    {displayItems.map((item) => (
                        <div key={item.id} className="group">
                            <span className="text-5xl font-serif italic text-zenith-orange/20 group-hover:text-zenith-orange/40 transition-colors duration-500 mb-6 block">
                                {item.id}
                            </span>
                            <h3 className="text-sm font-bold text-zenith-charcoal mb-3 uppercase tracking-[0.1em]">{item.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed font-sans">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
