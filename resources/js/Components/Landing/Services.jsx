const items = [
    { title: 'Stone Massage', img: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800' },
    { title: 'Aroma Therapy', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800' },
    { title: 'Skin Packages', img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800' },
    { title: 'Deep Tissue', img: 'https://images.unsplash.com/photo-1519415510236-8a199360b39d?auto=format&fit=crop&q=80&w=800' },
    { title: 'Sauna Session', img: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800' },
    { title: 'Zen Meditation', img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800' },
];

export default function Gallery({ lang = 'ID' }) {
    return (
        <section id="services" className="py-section bg-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center mb-20">
                <span className="text-orange-600 font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block underline underline-offset-8 decoration-orange-200">The Collection</span>
                <h2 className="text-4xl md:text-5xl font-serif text-zenith-charcoal italic leading-tight">Signature Packages</h2>
            </div>
            
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {items.map((item, i) => (
                        <div key={i} className="relative group overflow-hidden rounded-[2.5rem] h-[30rem] shadow-2xl shadow-black/5">
                            <img 
                                src={item.img} 
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-2 block opacity-0 group-hover:opacity-100 transition-opacity">{lang === 'EN' ? '90 Minutes' : '90 Menit'}</span>
                                <h3 className="text-2xl font-bold text-white uppercase tracking-tighter">{item.title}</h3>
                                <div className="h-0.5 w-0 group-hover:w-16 bg-orange-500 transition-all duration-700 mt-4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
