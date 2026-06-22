import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import Footer from '@/Components/Landing/Footer';
import MobileNav from '@/Components/Landing/MobileNav';

import 'quill-table-better/dist/quill-table-better.css';
const translations = {
    'ID': {
        metaTitle: 'Blog & Tips Kesehatan - Jemari Spa Sanctuary',
        metaDesc: 'Temukan artikel menarik seputar kesehatan, manfaat pijat, dan tips gaya hidup sehat dari Jemari Spa.',
        latestStories: 'Cerita Terbaru',
        discoverRecent: 'Temukan publikasi terbaru dan tips kesehatan kami.',
        searchPlaceholder: 'Cari artikel...',
        noArticles: 'Artikel tidak ditemukan.',
        readMore: 'Baca Selengkapnya',
        defaultSubtitle: 'Jemari Blog Sanctuary',
        defaultTitle: 'Insight & Wellness Guide',
        defaultDesc: 'Temukan artikel menarik seputar kesehatan, tips kecantikan, dan panduan gaya hidup sehat langsung dari ahlinya.'
    },
    'EN': {
        metaTitle: 'Blog & Wellness Guide - Jemari Spa Sanctuary',
        metaDesc: 'Explore our latest articles about wellness, massage benefits, and healthy lifestyle tips.',
        latestStories: 'Latest Stories',
        discoverRecent: 'Discover our recent publications and health tips.',
        searchPlaceholder: 'Search articles...',
        noArticles: 'No articles found.',
        readMore: 'Read More',
        defaultSubtitle: 'Jemari Blog Sanctuary',
        defaultTitle: 'Insight & Wellness Guide',
        defaultDesc: 'Explore our latest articles about wellness, massage benefits, and healthy lifestyle tips.'
    }
};

export default function Index({ auth, blogs, filters, signaturePackages = [] }) {
    const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ID');
    const [search, setSearch] = useState(filters.search || '');
    const [currentSlider, setCurrentSlider] = useState(0);

    const t = translations[lang];

    // Generate dynamic slider items from signature packages
    const sliderItems = signaturePackages.length > 0
        ? signaturePackages.map(pkg => ({
            title: lang === 'EN' ? (pkg.title_en || pkg.title_id) : pkg.title_id,
            subtitle: lang === 'EN' ? (pkg.category_en || pkg.category_id || 'Treatments') : (pkg.category_id || 'Ritual Signature'),
            desc: lang === 'EN' ? (pkg.description_en || pkg.description_id) : pkg.description_id,
            bg: pkg.image ? `/storage/${pkg.image}` : "/images/services.jpg"
        }))
        : [
            {
                title: t.defaultTitle,
                subtitle: t.defaultSubtitle,
                desc: t.defaultDesc,
                bg: "/images/services.jpg"
            }
        ];

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
        if (sliderItems.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlider((prev) => (prev + 1) % sliderItems.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [sliderItems.length]);

    useEffect(() => {
        localStorage.setItem('app_lang', lang);
    }, [lang]);

    return (
        <div className="font-sans text-zenith-charcoal antialiased bg-zenith-surface">
            <Head>
                <title>{t.metaTitle}</title>
                <meta name="description" content={t.metaDesc} />
                <meta property="og:title" content={t.metaTitle} />
                <meta name="keywords" content="blog kesehatan, tips wellness, manfaat pijat, gaya hidup sehat, jemari spa articles" />
            </Head>

            <Navbar
                auth={auth}
                lang={lang}
                setLang={setLang}
                activeService="Blog"
                setActiveService={() => { }}
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
                            <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">{sliderItems[currentSlider]?.subtitle}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight">
                            {sliderItems[currentSlider]?.title}
                        </h1>
                        <div
                            className="text-white/80 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: sliderItems[currentSlider]?.desc }}
                        />
                    </div>
                </section>

                {/* Search & Content */}
                <section className="py-20 px-6 max-w-7xl mx-auto -mt-20 relative z-20">
                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-zenith-orange/10 mb-16">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                            <div>
                                <h2 className="text-3xl font-serif italic text-zenith-charcoal mb-2">{t.latestStories}</h2>
                                <p className="text-zenith-charcoal/40 text-sm font-medium tracking-wide">{t.discoverRecent}</p>
                            </div>
                            <div className="relative w-full md:w-96">
                                <input
                                    type="text"
                                    placeholder={t.searchPlaceholder}
                                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-zenith-surface border-none focus:ring-2 focus:ring-zenith-orange transition-all text-sm font-medium"
                                    value={search}
                                    onChange={handleSearch}
                                />
                                <span aria-hidden="true" className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zenith-charcoal/30">search</span>
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
                                            {new Date(blog.created_at).toLocaleDateString(lang === 'EN' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                        <h3 className="text-xl font-bold text-zenith-charcoal mb-4 leading-tight group-hover:text-zenith-orange transition-colors">
                                            {blog.title}
                                        </h3>
                                        <p className="text-zenith-charcoal/50 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                                            {blog.description ? blog.description.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') : ''}
                                        </p>
                                        <div className="flex items-center gap-x-2 text-zenith-orange font-bold text-[10px] uppercase tracking-widest pt-4 border-t border-zenith-orange/5">
                                            {t.readMore}
                                            <span aria-hidden="true" className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="col-span-full py-20 text-center">
                                    <p className="text-zenith-charcoal/40 text-lg">{t.noArticles}</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center items-center gap-x-2 mt-16 overflow-x-auto pb-4">
                            {blogs.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`h-10 min-w-[40px] px-3 rounded-full flex items-center justify-center text-sm font-bold transition-all ${link.active
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

            <Footer lang={lang} setLang={setLang} />
            <MobileNav lang={lang} />
        </div>
    );
}
