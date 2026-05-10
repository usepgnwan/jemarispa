import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import Hero from '@/Components/Landing/Hero';
import Highlights from '@/Components/Landing/Highlights';
import SignatureRituals from '@/Components/Landing/SignatureRituals';
import Pricing from '@/Components/Landing/Pricing';
import Testimonials from '@/Components/Landing/Testimonials';
import Contact from '@/Components/Landing/Contact';
import FAQ from '@/Components/Landing/FAQ';
import FloatingWhatsApp from '@/Components/Landing/FloatingWhatsApp';
import MobileNav from '@/Components/Landing/MobileNav';
import Footer from '@/Components/Landing/Footer';

export default function Welcome({ auth, packages = [], signaturePackages = [], testimonials = [], platforms = [] }) {
    const [activeService, setActiveService] = useState(() => {
        return localStorage.getItem('active_service') || 'Default';
    });
    const [lang, setLang] = useState(() => {
        return localStorage.getItem('app_lang') || 'ID';
    });
    const [localPackages, setLocalPackages] = useState(signaturePackages);

    const logAnalytic = (category, title) => {
        try {
            fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify({ category, title })
            });
        } catch (e) {}
    };

    useEffect(() => {
        localStorage.setItem('app_lang', lang);
    }, [lang]);

    useEffect(() => {
        localStorage.setItem('active_service', activeService);
    }, [activeService]);

    useEffect(() => {
        if (signaturePackages && signaturePackages.length > 0) {
            localStorage.setItem('signature_packages', JSON.stringify(signaturePackages));
            setLocalPackages(signaturePackages);
        } else {
            const saved = localStorage.getItem('signature_packages');
            if (saved) {
                setLocalPackages(JSON.parse(saved));
            }
        }
    }, [signaturePackages]);

    // Handle pending service from navbar redirection
    useEffect(() => {
        const pending = localStorage.getItem('pending_service');
        if (pending) {
            setActiveService(pending);
            localStorage.removeItem('pending_service');
        }
    }, []);

    const getMeta = () => {
        const config = {
            'ID': {
                'Default': {
                    title: 'Jemari Spa - Home Service Massage Bandung Cimahi',
                    desc: 'Jemari Spa menghadirkan layanan massage & spa profesional ke rumah, hotel, atau kantor di Bandung dan Cimahi. Terapis terlatih, peralatan higienis, dan pengalaman relaksasi premium.'
                },
                'Pijat Tradisional': {
                    title: 'Pijat Tradisional Panggilan Bandung Cimahi - Jemari Spa',
                    desc: 'Layanan pijat tradisional panggilan profesional. Relaksasi tubuh tanpa keluar rumah dengan teknik pijat yang memulihkan kebugaran Anda.'
                },
                'Bekam': {
                    title: 'Layanan Bekam Panggilan Bandung Cimahi - Jemari Spa',
                    desc: 'Terapi bekam profesional di rumah Anda. Steril, aman, dan ditangani oleh terapis bersertifikat untuk kesehatan optimal.'
                },
                'Kerokan': {
                    title: 'Pijat Kerokan Panggilan Bandung Cimahi - Jemari Spa',
                    desc: 'Layanan kerokan tradisional yang higienis untuk meredakan masuk angin dan pegal-pegal langsung di lokasi Anda.'
                },
                'Totok Wajah': {
                    title: 'Totok Wajah Glowing Panggilan Bandung - Jemari Spa',
                    desc: 'Perawatan totok wajah profesional untuk melancarkan peredaran darah wajah dan membuat wajah lebih segar serta bercahaya.'
                },
                'Pijat Refleksi': {
                    title: 'Pijat Refleksi Kaki Panggilan Bandung - Jemari Spa',
                    desc: 'Pulihkan keseimbangan energi tubuh dengan pijat refleksi profesional tanpa harus menembus kemacetan kota.'
                },
                'Pijat Ibu Hamil': {
                    title: 'Pijat Ibu Hamil Panggilan Bandung - Jemari Spa',
                    desc: 'Relaksasi khusus untuk ibu hamil yang aman dan menenangkan. Ditangani oleh terapis wanita berpengalaman.'
                }
            },
            'EN': {
                'Default': {
                    title: 'Jemari Spa - Professional Home Service Massage Bandung Cimahi',
                    desc: 'Jemari Spa provides professional massage & spa services to your home, hotel, or office in Bandung and Cimahi. Well-trained therapists and premium relaxation experience.'
                },
                'Pijat Tradisional': {
                    title: 'Traditional Massage Home Service Bandung - Jemari Spa',
                    desc: 'Professional mobile traditional massage service. Body relaxation without leaving home with restoring massage techniques.'
                },
                'Bekam': {
                    title: 'Cupping Therapy Home Service Bandung - Jemari Spa',
                    desc: 'Professional cupping therapy at your home. Sterile, safe, and handled by certified therapists for optimal health.'
                },
                'Kerokan': {
                    title: 'Traditional Scraping Therapy Bandung - Jemari Spa',
                    desc: 'Hygienic traditional scraping (kerokan) service to relieve colds and aches directly at your location.'
                },
                'Totok Wajah': {
                    title: 'Face Acupressure for Glowing Skin Bandung - Jemari Spa',
                    desc: 'Professional face acupressure treatment to improve facial circulation for a fresher and glowing look.'
                },
                'Pijat Refleksi': {
                    title: 'Reflexology Home Service Bandung - Jemari Spa',
                    desc: 'Restore your body\'s energy balance with professional reflexology without facing city traffic.'
                },
                'Pijat Ibu Hamil': {
                    title: 'Pregnancy Massage Home Service Bandung - Jemari Spa',
                    desc: 'Safe and soothing relaxation specifically designed for pregnant mothers, handled by experienced female therapists.'
                }
            }
        };

        const currentLang = config[lang] || config['ID'];
        const content = currentLang[activeService] || currentLang['Default'];
        
        return content;
    };

    const meta = getMeta();

    return (
        <div className="font-sans text-zenith-charcoal antialiased selection:bg-zenith-orange/20 selection:text-zenith-orange bg-zenith-surface">
            <Head>
                <title>{meta.title}</title>
                <meta name="description" content={meta.desc} />
                <meta property="og:title" content={meta.title} />
                <meta property="og:description" content={meta.desc} />
                <meta property="og:image" content="/images/logo-jemari.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="keywords" content="pijat panggilan bandung, home service massage bandung, spa bandung, bekam bandung, pijat tradisional bandung, massage cimahi, jemari spa" />
            </Head>

            <Navbar
                auth={auth}
                activeService={activeService}
                setActiveService={setActiveService}
                lang={lang}
                setLang={setLang}
                signaturePackages={signaturePackages}
            />

            <main>
                <Hero activeService={activeService} lang={lang} />
                <Highlights />
                <SignatureRituals rituals={signaturePackages} lang={lang} />
                <Pricing packages={packages} lang={lang} />
                <Testimonials testimonials={testimonials} lang={lang} />

                {/* Multi-Platform Booking Section */}
                <section className="py-section bg-white overflow-hidden">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <span className="text-zenith-orange font-bold tracking-[0.3em] uppercase text-[10px] mb-6 block">
                                    {lang === 'ID' ? 'Dapatkan Layanan Terbaik Kami Dari Berbagai Platform' : 'Book Our Best Treatments From Any Platform'}
                                </span>
                                <h2 className="text-4xl md:text-6xl font-serif text-zenith-charcoal italic mb-8 leading-tight">
                                    {lang === 'ID' ? 'Pesan Sekarang.' : 'Book Now.'}
                                </h2>
                                <p className="text-lg text-gray-500 mb-12 max-w-md font-sans leading-relaxed">
                                    {lang === 'ID' 
                                        ? 'Anda bisa mendapatkan layanan Kami dengan melakukan pembelian voucher melalui Traveloka, Tiket.com dan Klook' 
                                        : 'You can secure services by purchasing vouchers through our authorized partners: Traveloka, Tiket.com, and Klook'}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    {platforms.map(platform => (
                                        <a 
                                            key={platform.id}
                                            href={platform.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => logAnalytic('Platform', `Klik ${platform.title}`)}
                                            className="flex items-center gap-x-3 bg-white border border-gray-100 text-gray-800 px-6 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-gray-200/50 hover:-translate-y-1 hover:border-zenith-orange/30 transition-all"
                                        >
                                            {platform.logo ? (
                                                <img src={`/storage/${platform.logo}`} alt={platform.title} className="w-5 h-5 object-contain" />
                                            ) : (
                                                <span className="material-symbols-outlined text-sm text-zenith-orange">link</span>
                                            )}
                                            {platform.title}
                                        </a>
                                    ))}
                                    {platforms.length === 0 && (
                                        <p className="text-sm text-gray-400 italic font-sans">Pemesanan online segera hadir...</p>
                                    )}
                                </div>
                            </div>

                            <div className="relative flex justify-center">
                                <div className="bg-zenith-orange/10 absolute inset-0 blur-[120px] rounded-full scale-150"></div>

                                {/* Refined Mobile Mockup */}
                                <div className="relative w-[320px] h-[650px] bg-zenith-charcoal rounded-[3.5rem] border-[10px] border-zenith-charcoal shadow-2xl overflow-hidden ring-4 ring-zenith-orange/10">
                                    {/* Notch */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-7 bg-zenith-charcoal rounded-b-2xl z-20"></div>

                                    {/* Phone Screen Content */}
                                    <div className="absolute inset-0 bg-zenith-surface z-10 p-6 flex flex-col">
                                        <div className="flex justify-between items-center mb-8 mt-4">
                                            <span className="material-symbols-outlined text-zenith-orange">menu</span>
                                            <span className="font-bold text-zenith-orange tracking-[0.2em] text-[10px]">JEMARI SPA</span>
                                            <span className="material-symbols-outlined text-zenith-orange">account_circle</span>
                                        </div>

                                        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 border border-zenith-orange/10">
                                            <p className="text-[9px] text-gray-400 mb-1 uppercase tracking-wider font-bold">Selamat Datang,</p>
                                            <p className="font-bold text-zenith-charcoal text-sm">Mau Booking Paket Apa Hari Ini?</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-white rounded-2xl p-4 flex gap-4 border border-zenith-orange/5 shadow-sm">
                                                <div className="w-10 h-10 bg-zenith-orange/5 rounded-xl flex items-center justify-center text-zenith-orange">
                                                    <span className="material-symbols-outlined text-lg">medical_services</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-xs text-zenith-charcoal">Bekam Profesional</p>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Home Service</p>
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-2xl p-4 flex gap-4 border border-zenith-orange/5 shadow-sm">
                                                <div className="w-10 h-10 bg-zenith-orange/5 rounded-xl flex items-center justify-center text-zenith-orange">
                                                    <span className="material-symbols-outlined text-lg">spa</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-xs text-zenith-charcoal">Pijat Tradisional</p>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">90 Minutes</p>
                                                </div>
                                            </div>

                                            <div className="relative h-36 rounded-2xl overflow-hidden mt-4 group">
                                                <img
                                                    alt="App Preview"
                                                    className="w-full h-full object-cover"
                                                    src="/images/services.jpg"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                                    <p className="text-[10px] text-white font-bold bg-zenith-orange px-3 py-1 rounded-full uppercase tracking-widest">Promo Bandung</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto pb-4">
                                            <Link 
                                                href="/cart" 
                                                onClick={() => logAnalytic('CTA', 'Klik Pesan Sekarang (Mobile Mockup)')}
                                                className="w-full bg-zenith-orange text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-zenith-orange/30 block text-center"
                                            >
                                                Pesan Sekarang
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Contact />
                <FAQ lang={lang} />
            </main>

            <FloatingWhatsApp />
            <MobileNav setActiveService={setActiveService} />
            <Footer />
        </div>
    );
}
