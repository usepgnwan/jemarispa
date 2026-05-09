export default function Highlights() {
    const items = [
        { id: '01', title: 'Terapis Berpengalaman', desc: 'Profesional & terlatih' },
        { id: '02', title: 'Terapis Sehat', desc: 'Menggunakan protokol kesehatan' },
        { id: '03', title: 'Respon Cepat', desc: 'One Day Service' },
        { id: '04', title: 'Harga Hemat', desc: 'Free ongkos transport' },
        { id: '05', title: 'Bahan Berkualitas', desc: 'Menggunakan produk yang aman' },
    ];

    return (
        <section className="py-section bg-zenith-surface">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">
                    {items.map((item) => (
                        <div key={item.id} className="group">
                            <span className="text-5xl font-serif italic text-orange-500/20 group-hover:text-orange-500/40 transition-colors duration-500 mb-6 block">
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
