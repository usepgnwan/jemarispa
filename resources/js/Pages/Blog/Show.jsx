import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import Footer from '@/Components/Landing/Footer';
import MobileNav from '@/Components/Landing/MobileNav';

export default function Show({ auth, blog, suggestions }) {
    const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ID');

    useEffect(() => {
        localStorage.setItem('app_lang', lang);
    }, [lang]);

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
                                    {suggestions.map((item) => (
                                        <Link key={item.id} href={route('blog.show', item.slug)} className="group flex items-center gap-x-4">
                                            <div className="h-20 w-20 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg">
                                                <img src={item.thumbnail ? `/storage/${item.thumbnail}` : '/images/services.jpg'} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={item.title} />
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-bold text-zenith-orange uppercase tracking-widest mb-1">{item.tag || item.type_package || 'Article'}</p>
                                                <h5 className="text-sm font-bold leading-tight group-hover:text-zenith-orange transition-colors line-clamp-2">{item.title}</h5>
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
                                    <span className="text-[10px] font-bold text-zenith-orange tracking-[0.2em] uppercase">{blog.type_package || 'Wellness Insight'}</span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-serif text-zenith-charcoal leading-tight mb-8">
                                    {blog.title}
                                </h1>
                                <div className="flex items-center gap-x-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zenith-charcoal/40 border-b border-zenith-orange/5 pb-8">
                                    <div className="flex items-center gap-x-2">
                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                        {new Date(blog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                    <div className="flex items-center gap-x-2 text-zenith-orange">
                                        <span className="material-symbols-outlined text-[14px]">person</span>
                                        {blog.user?.name || 'Admin Jemari'}
                                    </div>
                                </div>
                            </div>

                            <div className="relative h-[40vh] md:h-[60vh] rounded-3xl overflow-hidden shadow-2xl mb-12">
                                <img src={blog.thumbnail ? `/storage/${blog.thumbnail}` : '/images/services.jpg'} className="w-full h-full object-cover" alt={blog.title} />
                            </div>

                            <div className="prose prose-zenith max-w-none text-zenith-charcoal/70 leading-relaxed font-sans text-lg">
                                <div dangerouslySetInnerHTML={{ __html: blog.description }} />
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
                                    {blog.tag?.split(',').map(tag => (
                                        <span key={tag} className="px-4 py-1 rounded-full bg-zenith-surface border border-zenith-orange/5 text-[8px] font-bold text-zenith-charcoal/40 uppercase tracking-widest italic">
                                            #{tag.trim()}
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
