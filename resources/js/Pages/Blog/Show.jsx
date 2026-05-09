import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import Footer from '@/Components/Landing/Footer';
import MobileNav from '@/Components/Landing/MobileNav';

const mockSuggestions = [
    {
        id: 2,
        title: "Pijat Tradisional vs Modern",
        image: "/images/pijat tradisional.JPG",
        category: "Wellness"
    },
    {
        id: 3,
        title: "Tips Relaksasi di Rumah",
        image: "/images/services.jpg",
        category: "Lifestyle"
    },
    {
        id: 4,
        title: "Rahasia Wajah Glowing",
        image: "/images/totok wajah.jpg",
        category: "Beauty"
    }
];

export default function Show({ auth, blogId }) {
    const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ID');

    useEffect(() => {
        localStorage.setItem('app_lang', lang);
    }, [lang]);

    // Mock active blog data
    const blog = {
        title: "Manfaat Bekam untuk Kesehatan Tubuh dan Detoksifikasi Alami",
        subtitle: "Traditional Healing Wisdom",
        image: "/images/bekam.webp",
        date: "12 Mei 2024",
        category: "Therapy",
        author: "Admin Jemari",
        content: `
            <p className="mb-6">Terapi bekam merupakan salah satu teknik pengobatan tradisional yang telah dipraktikkan selama ribuan tahun di berbagai belahan dunia, termasuk Timur Tengah dan Asia. Metode ini bekerja dengan cara menciptakan tekanan negatif pada permukaan kulit menggunakan cup khusus untuk menarik darah statis atau racun dari dalam tubuh.</p>
            
            <h3 className="text-2xl font-serif italic text-zenith-charcoal mb-4">Melancarkan Sirkulasi Darah</h3>
            <p className="mb-6">Salah satu manfaat utama bekam adalah meningkatkan aliran darah ke area yang dibekam. Dengan menarik kulit ke dalam cup, pembuluh darah akan melebar dan aliran darah menjadi lebih lancar, yang pada gilirannya membantu proses penyembuhan jaringan yang rusak.</p>
            
            <blockquote className="border-l-4 border-zenith-orange pl-6 my-8 italic text-lg text-zenith-charcoal/60 bg-zenith-orange/5 py-6 rounded-r-2xl">
                "Bekam bukan sekadar mengeluarkan darah kotor, melainkan menstimulasi sistem imun tubuh untuk bekerja lebih optimal."
            </blockquote>

            <h3 className="text-2xl font-serif italic text-zenith-charcoal mb-4">Detoksifikasi Alami</h3>
            <p className="mb-6">Bekam membantu membuang zat-zat sisa metabolisme yang menumpuk di bawah jaringan kulit. Proses ini sering disebut sebagai detoksifikasi mekanis yang sangat efektif untuk meredakan nyeri otot dan kelelahan kronis.</p>

            <p className="mb-6">Bagi Anda yang sering merasa pegal di area punggung atau bahu karena aktivitas pekerjaan yang padat, terapi bekam di Jemari Spa bisa menjadi solusi relaksasi yang menyembuhkan.</p>
        `
    };

    return (
        <div className="font-sans text-zenith-charcoal antialiased bg-zenith-surface">
            <Head title={`${blog.title} - Jemari Blog`} />

            <Navbar 
                auth={auth} 
                lang={lang} 
                setLang={setLang} 
                activeService="Blog"
                setActiveService={() => {}}
            />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-12">
                        
                        {/* Sidebar Left: Suggestions */}
                        <aside className="w-full lg:w-1/4 order-2 lg:order-1">
                            <div className="sticky top-32">
                                <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zenith-orange mb-8 border-b border-zenith-orange/10 pb-4">
                                    Recommended Stories
                                </h4>
                                <div className="space-y-8">
                                    {mockSuggestions.map((item) => (
                                        <Link key={item.id} href={`/blog/${item.id}`} className="group flex items-center gap-x-4">
                                            <div className="h-20 w-20 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg">
                                                <img src={item.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={item.title} />
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-bold text-zenith-orange uppercase tracking-widest mb-1">{item.category}</p>
                                                <h5 className="text-sm font-bold leading-tight group-hover:text-zenith-orange transition-colors">{item.title}</h5>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                <div className="mt-12 p-8 rounded-3xl bg-zenith-charcoal text-white relative overflow-hidden">
                                    <div className="relative z-10">
                                        <h4 className="text-xl font-serif italic mb-4 text-zenith-gold">Siap untuk Relaksasi?</h4>
                                        <p className="text-white/60 text-xs leading-relaxed mb-6">Pesan layanan spa kami sekarang dan rasakan manfaatnya langsung di rumah Anda.</p>
                                        <Link href="/" className="inline-block px-6 py-3 bg-zenith-orange text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-zenith-gold transition-colors">
                                            Pesan Sekarang
                                        </Link>
                                    </div>
                                    <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-white/5 text-8xl rotate-12">spa</span>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="w-full lg:w-3/4 order-1 lg:order-2">
                            <div className="mb-12">
                                <div className="inline-flex items-center gap-x-2 px-3 py-1 rounded-full bg-zenith-orange/10 border border-zenith-orange/10 mb-6">
                                    <span className="h-1.5 w-1.5 rounded-full bg-zenith-orange animate-pulse"></span>
                                    <span className="text-[10px] font-bold text-zenith-orange tracking-[0.2em] uppercase">{blog.subtitle}</span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-serif text-zenith-charcoal leading-tight mb-8">
                                    {blog.title}
                                </h1>
                                <div className="flex items-center gap-x-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zenith-charcoal/40 border-b border-zenith-orange/5 pb-8">
                                    <div className="flex items-center gap-x-2">
                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                        {blog.date}
                                    </div>
                                    <div className="flex items-center gap-x-2 text-zenith-orange">
                                        <span className="material-symbols-outlined text-[14px]">person</span>
                                        {blog.author}
                                    </div>
                                </div>
                            </div>

                            <div className="relative h-[40vh] md:h-[60vh] rounded-3xl overflow-hidden shadow-2xl mb-12">
                                <img src={blog.image} className="w-full h-full object-cover" alt={blog.title} />
                            </div>

                            <div className="prose prose-zenith max-w-none text-zenith-charcoal/70 leading-relaxed font-sans text-lg">
                                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                            </div>

                            {/* Share & Tags */}
                            <div className="mt-16 pt-8 border-t border-zenith-orange/10 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex gap-x-4 items-center">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zenith-charcoal/30">Share:</span>
                                    <div className="flex gap-x-2">
                                        {['FB', 'IG', 'X', 'WA'].map(s => (
                                            <button key={s} className="h-8 w-8 rounded-full border border-zenith-orange/10 flex items-center justify-center text-[10px] font-bold text-zenith-charcoal/60 hover:bg-zenith-orange hover:text-white hover:border-zenith-orange transition-all">
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-x-2">
                                    {['Therapy', 'Health', 'Detox'].map(tag => (
                                        <span key={tag} className="px-4 py-1 rounded-full bg-zenith-surface border border-zenith-orange/5 text-[8px] font-bold text-zenith-charcoal/40 uppercase tracking-widest italic">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
            <MobileNav lang={lang} />
        </div>
    );
}
