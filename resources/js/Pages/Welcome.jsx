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

export default function Welcome({ auth, packages = [], testimonials = [] }) {
    const [activeService, setActiveService] = useState('Default');
    const [lang, setLang] = useState(() => {
        return localStorage.getItem('app_lang') || 'ID';
    });

    useEffect(() => {
        localStorage.setItem('app_lang', lang);
    }, [lang]);

    // Handle pending service from navbar redirection
    useEffect(() => {
        const pending = localStorage.getItem('pending_service');
        if (pending) {
            setActiveService(pending);
            localStorage.removeItem('pending_service');
        }
    }, []);

    return (
        <div className="font-sans text-zenith-charcoal antialiased selection:bg-zenith-orange/20 selection:text-zenith-orange bg-zenith-surface">
            <Head title="Jemari Spa - Luxury Wellness Sanctuary" />

            <Navbar
                auth={auth}
                activeService={activeService}
                setActiveService={setActiveService}
                lang={lang}
                setLang={setLang}
            />

            <main>
                <Hero activeService={activeService} lang={lang} />
                <Highlights />
                <SignatureRituals lang={lang} />
                <Pricing packages={packages} lang={lang} />
                <Testimonials testimonials={testimonials} lang={lang} />

                {/* Multi-Platform Booking Section */}
                <section className="py-section bg-white overflow-hidden">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <span className="text-zenith-orange font-bold tracking-[0.3em] uppercase text-[10px] mb-6 block">Seamless Booking</span>
                                <h2 className="text-4xl md:text-6xl font-serif text-zenith-charcoal italic mb-8 leading-tight">Book Your Escape <br />From Any Platform.</h2>
                                <p className="text-lg text-gray-500 mb-12 max-w-md font-sans leading-relaxed">
                                    Jemari Spa kini tersedia di platform perjalanan favorit Anda. Nikmati kemudahan pemesanan dan konfirmasi instan di mana pun Anda berada.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button className="flex items-center gap-x-3 bg-[#00BAF2] text-white px-8 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:-translate-y-1 transition-all">
                                        Traveloka
                                    </button>
                                    <button className="flex items-center gap-x-3 bg-[#003580] text-white px-8 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:-translate-y-1 transition-all">
                                        Tiket.com
                                    </button>
                                    <button className="flex items-center gap-x-3 bg-[#E12D2D] text-white px-8 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20 hover:-translate-y-1 transition-all">
                                        Agoda
                                    </button>
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
                                            <Link href="/cart" className="w-full bg-zenith-orange text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-zenith-orange/30 block text-center">
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
            <MobileNav />
            <Footer />
        </div>
    );
}
