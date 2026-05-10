import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import Footer from '@/Components/Landing/Footer';
import MobileNav from '@/Components/Landing/MobileNav';

const mockBlogs = [
    {
        id: 1,
        title: "Manfaat Bekam untuk Kesehatan Tubuh",
        excerpt: "Bekam adalah terapi tradisional yang telah digunakan selama berabad-abad untuk membantu sirkulasi darah dan detoksifikasi...",
        image: "/images/bekam.webp",
        date: "12 Mei 2024",
        category: "Therapy"
    },
    {
        id: 2,
        title: "Pijat Tradisional vs Modern: Mana yang Lebih Baik?",
        excerpt: "Banyak orang bingung memilih antara pijat tradisional yang kuat atau pijat modern yang lebih lembut. Mari kita bahas perbedaannya...",
        image: "/images/pijat tradisional.JPG",
        date: "10 Mei 2024",
        category: "Wellness"
    },
    {
        id: 3,
        title: "Tips Relaksasi di Rumah Saat Akhir Pekan",
        excerpt: "Tidak perlu ke luar rumah untuk merasa segar kembali. Berikut adalah beberapa tips sederhana untuk menciptakan suasana spa di rumah...",
        image: "/images/services.jpg",
        date: "08 Mei 2024",
        category: "Lifestyle"
    },
    {
        id: 4,
        title: "Rahasia Wajah Glowing dengan Totok Wajah",
        excerpt: "Totok wajah bukan hanya soal kecantikan, tapi juga soal kesehatan syaraf wajah dan melancarkan aliran energi...",
        image: "/images/totok wajah.jpg",
        date: "05 Mei 2024",
        category: "Beauty"
    }
];

const sliderItems = [
    {
        title: "Insight & Wellness Guide",
        subtitle: "Jemari Blog Sanctuary",
        desc: "Temukan artikel menarik seputar kesehatan, tips kecantikan, dan panduan gaya hidup sehat langsung dari ahlinya.",
        bg: "/images/services.jpg"
    },
    {
        title: "Art of Relaxation",
        subtitle: "Traditional Wisdom",
        desc: "Mempelajari teknik kuno yang diadaptasi untuk kenyamanan modern dalam memulihkan kebugaran tubuh Anda.",
        bg: "/images/pijat tradisional.JPG"
    }
];

export default function Index({ auth, blogs, filters, signaturePackages = [] }) {
    const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ID');
    const [search, setSearch] = useState(filters.search || '');
    const [currentSlider, setCurrentSlider] = useState(0);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        
        // Debounce search
        const timeoutId = setTimeout(() => {
            router.get(route('blog.index'), { search: value }, {
                preserveState: true,
                preserveScroll: true,
                replace: true
            });
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlider((prev) => (prev + 1) % sliderItems.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        localStorage.setItem('app_lang', lang);
    }, [lang]);

    return (
        <div className="font-sans text-zenith-charcoal antialiased bg-zenith-surface">
            <Head>
                <title>{lang === 'EN' ? 'Blog & Wellness Guide - Jemari Spa Sanctuary' : 'Blog & Tips Kesehatan - Jemari Spa Sanctuary'}</title>
                <meta name="description" content={lang === 'EN' ? 'Explore our latest articles about wellness, massage benefits, and healthy lifestyle tips.' : 'Temukan artikel menarik seputar kesehatan, manfaat pijat, dan tips gaya hidup sehat dari Jemari Spa.'} />
                <meta property="og:title" content={lang === 'EN' ? 'Blog & Wellness Guide - Jemari Spa Sanctuary' : 'Blog & Tips Kesehatan - Jemari Spa Sanctuary'} />
                <meta name="keywords" content="blog kesehatan, tips wellness, manfaat pijat, gaya hidup sehat, jemari spa articles" />
            </Head>

            <Navbar 
                auth={auth} 
                lang={lang} 
                setLang={setLang} 
                activeService="Blog"
                setActiveService={() => {}}
                signaturePackages={signaturePackages}
            />

            <main>
                {/* Hero Slider */}
                <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
                    {sliderItems.map((item, index) => (
                        <div 
                            key={index}
                            className={`absolute inset-0 transition-all duration-1000 ${index === currentSlider ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                        >
                            <img src={item.bg} className="w-full h-full object-cover" alt={item.title} />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-zenith-surface"></div>
                        </div>
                    ))}
                    
                    <div className="relative z-10 text-center px-6 max-w-4xl">
                        <div className="inline-flex items-center gap-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-6">
                            <span className="h-1.5 w-1.5 rounded-full bg-zenith-orange animate-pulse"></span>
                            <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">{sliderItems[currentSlider].subtitle}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight">
                            {sliderItems[currentSlider].title}
                        </h1>
                        <p className="text-white/80 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
                            {sliderItems[currentSlider].desc}
                        </p>
                    </div>
                </section>

                {/* Search & Content */}
                <section className="py-20 px-6 max-w-7xl mx-auto -mt-20 relative z-20">
                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-zenith-orange/10 mb-16">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                            <div>
                                <h2 className="text-3xl font-serif italic text-zenith-charcoal mb-2">Latest Stories</h2>
                                <p className="text-zenith-charcoal/40 text-sm font-medium tracking-wide">Discover our recent publications and health tips.</p>
                            </div>
                            <div className="relative w-full md:w-96">
                                <input 
                                    type="text" 
                                    placeholder="Search articles..."
                                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-zenith-surface border-none focus:ring-2 focus:ring-zenith-orange transition-all text-sm font-medium"
                                    value={search}
                                    onChange={handleSearch}
                                />
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zenith-charcoal/30">search</span>
                            </div>
                        </div>

                        {/* Blog Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {blogs.data.length > 0 ? blogs.data.map((blog) => (
                                <Link 
                                    key={blog.id} 
                                    href={route('blog.show', blog.slug)}
                                    className="group flex flex-col bg-zenith-surface rounded-3xl overflow-hidden border border-transparent hover:border-zenith-orange/20 transition-all hover:-translate-y-2 hover:shadow-2xl shadow-zenith-orange/5"
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <img src={blog.thumbnail ? `/storage/${blog.thumbnail}` : '/images/services.jpg'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={blog.title} />
                                        <div className="absolute top-4 left-4">
                                            <span className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-zenith-orange uppercase tracking-wider shadow-lg">
                                                {blog.tag || blog.type_package || 'Article'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-8 flex flex-col flex-1">
                                        <p className="text-zenith-charcoal/30 text-[10px] font-bold uppercase tracking-widest mb-4">
                                            {new Date(blog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                        <h3 className="text-xl font-bold text-zenith-charcoal mb-4 leading-tight group-hover:text-zenith-orange transition-colors">
                                            {blog.title}
                                        </h3>
                                        <div 
                                            className="text-zenith-charcoal/50 text-sm leading-relaxed mb-6 flex-1 line-clamp-3 prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: blog.description }}
                                        />
                                        <div className="flex items-center gap-x-2 text-zenith-orange font-bold text-[10px] uppercase tracking-widest pt-4 border-t border-zenith-orange/5">
                                            Read More 
                                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="col-span-full py-20 text-center">
                                    <p className="text-zenith-charcoal/40 text-lg">No articles found matching your search.</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination Mockup */}
                        <div className="flex justify-center items-center gap-x-2 mt-16 overflow-x-auto pb-4">
                            {blogs.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`h-10 min-w-[40px] px-3 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                                        link.active 
                                            ? 'bg-zenith-orange text-white shadow-lg shadow-zenith-orange/20' 
                                            : 'border border-zenith-orange/10 text-zenith-charcoal/40 hover:bg-zenith-orange/5'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <MobileNav lang={lang} />
        </div>
    );
}
