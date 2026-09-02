import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import Footer from '@/Components/Landing/Footer';
import MobileNav from '@/Components/Landing/MobileNav';
import FloatingWhatsApp from '@/Components/Landing/FloatingWhatsApp';
import axios from 'axios';

const translations = {
    'ID': {
        metaTitle: 'Hubungi Kami - Pijat Panggilan Bandung & Cimahi | Jemari Home Spa',
        metaDesc: 'Hubungi Jemari Home Spa untuk reservasi dan konsultasi layanan pijat panggilan di Bandung & Cimahi. Respon cepat via WhatsApp & Telepon.',
        badge: 'Hubungi Kami',
        title: 'Konsultasi & Reservasi Mudah',
        subtitle: 'Terapis profesional kami siap datang langsung ke rumah, hotel, apartemen, atau villa Anda di area Bandung & Cimahi.',
        statusOnline: 'Customer Service Online',
        statusDesc: 'Respon cepat rata-rata di bawah 5 menit',
        channelsTitle: 'Saluran Komunikasi Resmi',
        waCardTitle: 'WhatsApp CS & Reservasi',
        waCardDesc: 'Chat langsung dengan tim kami untuk tanya paket, jadwal terapis, dan konsultasi kebutuhan relaksasi.',
        waBtn: 'Chat via WhatsApp',
        phoneCardTitle: 'Hotline / Telepon',
        phoneCardDesc: 'Hubungi langsung customer support kami untuk layanan darurat atau informasi mendalam.',
        phoneBtn: 'Hubungi Sekarang',
        emailCardTitle: 'Email Resmi',
        emailCardDesc: 'Kirimkan pertanyaan kemitraan, kerjasama korporasi, atau penawaran resmi.',
        emailBtn: 'Kirim Email',
        hoursTitle: 'Jam Operasional',
        hoursEveryday: 'Senin - Minggu (Setiap Hari)',
        hoursTime: '08.00 - 22.00 WIB',
        hoursNote: 'Menerima pesanan jadwal di hari yang sama (same-day) & booking di muka.',
        formTitle: 'Kirim Pertanyaan / Rencana Reservasi',
        formSubtitle: 'Isi formulir di bawah ini, tim kami akan langsung merespon via WhatsApp dengan rincian rekomendasi layanan.',
        nameLabel: 'Nama Lengkap',
        namePlaceholder: 'Contoh: Ibu Rina / Bpk. David',
        phoneLabel: 'Nomor WhatsApp / HP',
        phonePlaceholder: '08xxxxxxxxxx',
        locationLabel: 'Area / Lokasi Anda',
        locationPlaceholder: 'Pilih area layanan...',
        serviceLabel: 'Layanan yang Diminati',
        servicePlaceholder: 'Pilih layanan...',
        notesLabel: 'Catatan / Pertanyaan Khusus',
        notesPlaceholder: 'Contoh: Butuh terapis wanita untuk 2 orang di Hotel Grand Preanger jam 19.00...',
        submitBtn: 'Kirim via WhatsApp',
        areasTitle: 'Cakupan Area Layanan',
        areasSubtitle: 'Kami melayani panggilan langsung ke berbagai titik di Bandung Raya & Sekitarnya:',
        stayTypeTitle: 'Dapat Dipanggil Ke Mana Saja:',
        stayTypes: [
            { icon: 'home', title: 'Rumah Pribadi', desc: 'Nikmati spa tanpa repot macet' },
            { icon: 'apartment', title: 'Apartemen & Kondominium', desc: 'Terapis tiba tepat di unit Anda' },
            { icon: 'hotel', title: 'Hotel & Penginapan', desc: 'Relaksasi setelah perjalanan panjang' },
            { icon: 'villa', title: 'Villa & Resort', desc: 'Sempurnakan liburan di Bandung' }
        ],
        faqTitle: 'Pertanyaan Seputar Pemesanan',
        faqs: [
            {
                q: 'Bagaimana cara memesan layanan pijat panggilan?',
                a: 'Anda dapat memesan melalui formulir di halaman ini, langsung chat WhatsApp kami, atau melalui menu Pesan Sekarang di website. Tim kami akan mengonfirmasi lokasi, durasi, dan jadwal terapis.'
            },
            {
                q: 'Berapa lama estimasi terapis tiba di lokasi?',
                a: 'Terapis kami umumnya tiba dalam waktu 45-60 menit setelah pemesanan dikonfirmasi, tergantung jarak dan kondisi lalu lintas. Anda juga bisa menjadwalkan jam kunjungan di muka (pre-order).'
            },
            {
                q: 'Apakah terapis membawa perlengkapan sendiri?',
                a: 'Ya, terapis kami membawa perlengkapan higienis lengkap termasuk minyak aromaterapi premium, kain/alas bersih, perlengkapan totok/bekam/scrub steril, dan peralatan pendukung lainnya.'
            },
            {
                q: 'Apakah saya bisa memilih terapis pria atau wanita?',
                a: 'Bisa. Anda bebas memilih preferensi terapis pria atau terapis wanita demi kenyamanan dan keamanan Anda selama perawatan.'
            }
        ],
        socialTitle: 'Ikuti Media Sosial Kami',
        socialSubtitle: 'Dapatkan promo eksklusif, edukasi kesehatan, dan tips gaya hidup sehat setiap hari.'
    },
    'EN': {
        metaTitle: 'Contact Us - Home Service Massage Bandung & Cimahi | Jemari Spa',
        metaDesc: 'Contact Jemari Home Spa for instant reservations and consultation in Bandung & Cimahi. Fast response via WhatsApp & Phone.',
        badge: 'Contact Us',
        title: 'Easy Consultation & Booking',
        subtitle: 'Our professional therapists are ready to visit your home, hotel, apartment, or villa anywhere in Bandung & Cimahi.',
        statusOnline: 'Customer Service Online',
        statusDesc: 'Average response time under 5 minutes',
        channelsTitle: 'Official Communication Channels',
        waCardTitle: 'WhatsApp CS & Booking',
        waCardDesc: 'Chat directly with our team to inquire about packages, therapist schedules, and relaxation advice.',
        waBtn: 'Chat on WhatsApp',
        phoneCardTitle: 'Hotline / Direct Call',
        phoneCardDesc: 'Call our customer support directly for urgent bookings or detailed service information.',
        phoneBtn: 'Call Now',
        emailCardTitle: 'Official Email',
        emailCardDesc: 'Send corporate partnership inquiries, business proposals, or official questions.',
        emailBtn: 'Send Email',
        hoursTitle: 'Operating Hours',
        hoursEveryday: 'Monday - Sunday (Everyday)',
        hoursTime: '08:00 AM - 10:00 PM WIB',
        hoursNote: 'Accepting same-day orders as well as advance schedule reservations.',
        formTitle: 'Send Inquiry / Booking Request',
        formSubtitle: 'Fill in the form below, and our team will immediately respond via WhatsApp with tailored recommendations.',
        nameLabel: 'Full Name',
        namePlaceholder: 'e.g. John Doe / Sarah',
        phoneLabel: 'WhatsApp / Phone Number',
        phonePlaceholder: '+62 / 08xxxxxxxxxx',
        locationLabel: 'Your Area / Location',
        locationPlaceholder: 'Select service area...',
        serviceLabel: 'Desired Treatment',
        servicePlaceholder: 'Select treatment...',
        notesLabel: 'Special Notes / Inquiry',
        notesPlaceholder: 'e.g. Need female therapist for 2 persons at Hotel Grand Preanger at 7 PM...',
        submitBtn: 'Send via WhatsApp',
        areasTitle: 'Service Coverage Areas',
        areasSubtitle: 'We deliver on-call wellness services across Greater Bandung & Surrounding areas:',
        stayTypeTitle: 'We Can Visit:',
        stayTypes: [
            { icon: 'home', title: 'Private Residence', desc: 'Relax without driving through traffic' },
            { icon: 'apartment', title: 'Apartment & Condo', desc: 'Therapist arrives right at your door' },
            { icon: 'hotel', title: 'Hotels & Lodging', desc: 'Unwind after a long travel day' },
            { icon: 'villa', title: 'Villas & Resorts', desc: 'Elevate your vacation in Bandung' }
        ],
        faqTitle: 'Frequently Asked Questions',
        faqs: [
            {
                q: 'How do I book an on-call massage service?',
                a: 'You can book through the form on this page, chat directly via WhatsApp, or through the online catalog. Our team will verify your location, preferred time, and therapist.'
            },
            {
                q: 'How fast can the therapist arrive?',
                a: 'Therapists typically arrive within 45-60 minutes after booking confirmation, depending on traffic and distance. Advance bookings are also welcome.'
            },
            {
                q: 'Do therapists bring their own equipment?',
                a: 'Yes, our therapists bring full hygienic equipment including premium aromatherapy oils, clean linens, sterilized cupping/scrub tools, and disposable supplies.'
            },
            {
                q: 'Can I choose a male or female therapist?',
                a: 'Absolutely. You can specify your preference for male or female certified therapists to ensure complete comfort.'
            }
        ],
        socialTitle: 'Follow Our Social Media',
        socialSubtitle: 'Discover exclusive promotions, wellness tips, and healthy lifestyle insights.'
    }
};

export default function ContactIndex({ auth, faqs = [], meta = null }) {
    const { app_settings, service_areas } = usePage().props;
    const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ID');

    const [form, setForm] = useState({
        name: '',
        phone: '',
        area: '',
        service: '',
        notes: ''
    });

    const [openFaq, setOpenFaq] = useState(0);

    const t = translations[lang] || translations['ID'];
    const isEn = lang === 'EN';

    // Phone parsing
    const rawPhone = app_settings?.phone || '6289516166090';
    const cleanPhone = rawPhone.toString().replace(/[^0-9]/g, '');
    let waPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
        waPhone = '62' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('8')) {
        waPhone = '62' + cleanPhone;
    }

    const email = app_settings?.email || 'jemarihomespa@gmail.com';
    const operationalStart = app_settings?.operational_start || '08:00';
    const operationalEnd = app_settings?.operational_end || '22:00';

    const handleFormSubmit = (e) => {
        e.preventDefault();

        // Track Analytic
        try {
            axios.post(route('api.analytics.store'), {
                category: 'Contact Page',
                title: `Inquiry: ${form.name || 'Anonymous'} - ${form.area || 'General'}`
            }).catch(() => {});
        } catch (err) {}

        const messageLines = [
            `Halo Jemari Home Spa, saya ingin konsultasi / reservasi:`,
            `• Nama: ${form.name || '-'}`,
            `• No. HP/WA: ${form.phone || '-'}`,
            `• Lokasi/Area: ${form.area || '-'}`,
            `• Layanan: ${form.service || 'Konsultasi Umum'}`,
            form.notes ? `• Catatan: ${form.notes}` : ''
        ].filter(Boolean).join('\n');

        const isMobile = typeof navigator !== 'undefined' ? /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) : false;
        const waUrl = isMobile
            ? `https://wa.me/${waPhone}?text=${encodeURIComponent(messageLines)}`
            : `https://web.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(messageLines)}`;

        window.open(waUrl, '_blank');
    };

    const handleDirectWa = () => {
        try {
            axios.post(route('api.analytics.store'), {
                category: 'Contact Page',
                title: 'Klik Tombol WhatsApp Direct'
            }).catch(() => {});
        } catch (e) {}

        const defaultMsg = isEn 
            ? "Hello Jemari Home Spa, I would like to inquire about your home massage treatments."
            : "Halo Jemari Home Spa, saya ingin bertanya mengenai layanan spa panggilan.";
        
        const isMobile = typeof navigator !== 'undefined' ? /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) : false;
        const waUrl = isMobile
            ? `https://wa.me/${waPhone}?text=${encodeURIComponent(defaultMsg)}`
            : `https://web.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(defaultMsg)}`;

        window.open(waUrl, '_blank');
    };

    // Services list for dropdown
    const serviceOptions = isEn ? [
        'Traditional Massage',
        'Reflexology Treatment',
        'Face Acupressure (Totok Wajah)',
        'Cupping Therapy (Bekam)',
        'Body Scrub (Lulur Tradisional)',
        'Pregnancy Massage',
        'Postnatal Massage',
        'Signature Spa Package',
        'Other / General Consultation'
    ] : [
        'Pijat Tradisional',
        'Pijat Refleksi',
        'Totok Wajah',
        'Terapi Bekam',
        'Lulur / Scrub Tradisional',
        'Pijat Ibu Hamil',
        'Pijat Pasca Melahirkan',
        'Paket Signature Spa',
        'Lainnya / Konsultasi Dulu'
    ];

    return (
        <div className="min-h-screen bg-[#FCFBF7] text-zenith-charcoal selection:bg-zenith-orange selection:text-white font-sans antialiased overflow-x-hidden">
            <Head>
                <title>{meta?.title || t.metaTitle}</title>
                <meta name="description" content={meta?.description || t.metaDesc} />
                <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : 'https://jemarihomespa.com/kontak'} />
                <meta property="og:title" content={meta?.title || t.metaTitle} />
                <meta property="og:description" content={meta?.description || t.metaDesc} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://jemarihomespa.com/kontak" />
            </Head>

            <Navbar lang={lang} setLang={setLang} forceSolid={true} />

            {/* Hero Header Section */}
            <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 bg-gradient-to-b from-[#2D140A] via-[#3B1C10] to-[#2D140A] text-white overflow-hidden">
                {/* Subtle Decorative Aura */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-zenith-orange/15 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-10 left-10 w-80 h-80 bg-zenith-gold/15 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-zenith-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-6 animate-fade-in">
                            <span className="h-2 w-2 rounded-full bg-zenith-gold animate-pulse"></span>
                            {t.badge}
                        </div>

                        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-tight mb-6">
                            {t.title}
                        </h1>

                        <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed max-w-2xl mx-auto">
                            {t.subtitle}
                        </p>

                        {/* Live Status indicator */}
                        <div className="mt-8 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span>{t.statusOnline}</span>
                            <span className="text-emerald-400/40">•</span>
                            <span className="text-emerald-200/80 text-[11px]">{t.statusDesc}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content: Channels & Interactive Form */}
            <section className="relative -mt-10 z-20 pb-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    
                    {/* Quick Contact & Operating Hours Channels */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 max-w-5xl mx-auto">
                        
                        {/* WhatsApp Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-zenith-charcoal/5 border border-zenith-orange/10 flex flex-col justify-between group hover:border-zenith-orange/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                            <div>
                                <div className="h-14 w-14 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-zenith-charcoal mb-2 font-serif">{t.waCardTitle}</h3>
                                <p className="text-sm text-zenith-charcoal/60 leading-relaxed mb-4">
                                    {t.waCardDesc}
                                </p>
                                <p className="text-xs font-bold text-zenith-charcoal tracking-wider mb-6">
                                    +{waPhone}
                                </p>
                            </div>
                            <button
                                onClick={handleDirectWa}
                                className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#20bd5a] shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                            >
                                <span>{t.waBtn}</span>
                                <span aria-hidden="true" className="material-symbols-outlined text-[16px]">chat</span>
                            </button>
                        </div>

                        {/* Operating Hours Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-zenith-charcoal/5 border border-zenith-orange/10 flex flex-col justify-between group hover:border-zenith-orange/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                            <div>
                                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <span aria-hidden="true" className="material-symbols-outlined text-3xl">schedule</span>
                                </div>
                                <h3 className="text-xl font-bold text-zenith-charcoal mb-2 font-serif">{t.hoursTitle}</h3>
                                <p className="text-sm text-zenith-charcoal/60 leading-relaxed mb-6">
                                    {t.hoursNote}
                                </p>
                            </div>
                            <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-zenith-orange/10 flex items-center justify-between">
                                <div>
                                    <div className="text-[11px] font-bold text-zenith-charcoal/70 uppercase tracking-wider mb-0.5">{t.hoursEveryday}</div>
                                    <div className="text-lg font-extrabold text-zenith-orange">{operationalStart} - {operationalEnd} WIB</div>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-[11px] font-bold">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    {isEn ? "Open Daily" : "Buka Setiap Hari"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Contact Form + Service Coverage Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        
                        {/* Form Column */}
                        <div className="lg:col-span-7 bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-zenith-charcoal/5 border border-zenith-orange/10">
                            <div className="mb-8">
                                <span className="text-[10px] font-bold text-zenith-orange uppercase tracking-[0.2em] block mb-2">Fast Inquiry</span>
                                <h2 className="text-2xl md:text-3xl font-bold text-zenith-charcoal font-serif mb-3">
                                    {t.formTitle}
                                </h2>
                                <p className="text-sm text-zenith-charcoal/60 leading-relaxed">
                                    {t.formSubtitle}
                                </p>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-zenith-charcoal/70 uppercase tracking-widest block mb-2">
                                            {t.nameLabel} <span className="text-zenith-orange">*</span>
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder={t.namePlaceholder}
                                            className="w-full bg-[#FAF7F2] border-none rounded-2xl p-4 text-xs font-medium text-zenith-charcoal placeholder:text-zenith-charcoal/30 focus:ring-2 focus:ring-zenith-orange transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-zenith-charcoal/70 uppercase tracking-widest block mb-2">
                                            {t.phoneLabel} <span className="text-zenith-orange">*</span>
                                        </label>
                                        <input
                                            required
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            placeholder={t.phonePlaceholder}
                                            className="w-full bg-[#FAF7F2] border-none rounded-2xl p-4 text-xs font-medium text-zenith-charcoal placeholder:text-zenith-charcoal/30 focus:ring-2 focus:ring-zenith-orange transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-zenith-charcoal/70 uppercase tracking-widest block mb-2">
                                            {t.locationLabel} <span className="text-zenith-orange">*</span>
                                        </label>
                                        <select
                                            required
                                            value={form.area}
                                            onChange={(e) => setForm({ ...form, area: e.target.value })}
                                            className="w-full bg-[#FAF7F2] border-none rounded-2xl p-4 text-xs font-medium text-zenith-charcoal focus:ring-2 focus:ring-zenith-orange transition-all"
                                        >
                                            <option value="">{t.locationPlaceholder}</option>
                                            {service_areas?.map((area) => (
                                                <option key={area.id} value={area.name}>
                                                    {area.name}
                                                </option>
                                            ))}
                                            <option value="Hotel/Apartemen Bandung">Hotel / Apartemen di Bandung</option>
                                            <option value="Lainnya">Wilayah Lainnya (Konsultasi Jangkauan)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-zenith-charcoal/70 uppercase tracking-widest block mb-2">
                                            {t.serviceLabel}
                                        </label>
                                        <select
                                            value={form.service}
                                            onChange={(e) => setForm({ ...form, service: e.target.value })}
                                            className="w-full bg-[#FAF7F2] border-none rounded-2xl p-4 text-xs font-medium text-zenith-charcoal focus:ring-2 focus:ring-zenith-orange transition-all"
                                        >
                                            <option value="">{t.servicePlaceholder}</option>
                                            {serviceOptions.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-zenith-charcoal/70 uppercase tracking-widest block mb-2">
                                        {t.notesLabel}
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={form.notes}
                                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                        placeholder={t.notesPlaceholder}
                                        className="w-full bg-[#FAF7F2] border-none rounded-2xl p-4 text-xs font-medium text-zenith-charcoal placeholder:text-zenith-charcoal/30 focus:ring-2 focus:ring-zenith-orange resize-none transition-all"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full inline-flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 px-8 rounded-full text-xs font-bold uppercase tracking-[0.15em] shadow-xl shadow-green-500/25 hover:bg-[#20bd5a] active:scale-[0.98] transition-all"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    <span>{t.submitBtn}</span>
                                </button>
                            </form>
                        </div>

                        {/* Info & Service Areas Column */}
                        <div className="lg:col-span-5 space-y-8">
                            
                            {/* Coverage Areas */}
                            <div className="bg-[#2D140A] text-white rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-44 h-44 bg-zenith-orange/20 rounded-full blur-2xl pointer-events-none"></div>

                                <h3 className="text-xl font-bold font-serif mb-2 text-white">{t.areasTitle}</h3>
                                <p className="text-xs text-white/60 leading-relaxed mb-6 font-light">
                                    {t.areasSubtitle}
                                </p>

                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    {service_areas?.map((area) => (
                                        <div key={area.id} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white/90">
                                            <span aria-hidden="true" className="material-symbols-outlined text-zenith-gold text-sm font-bold">location_on</span>
                                            <span className="font-medium truncate">{area.name}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zenith-gold mb-4">
                                        {t.stayTypeTitle}
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {t.stayTypes.map((item, idx) => (
                                            <div key={idx} className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-white font-medium text-xs">
                                                    <span aria-hidden="true" className="material-symbols-outlined text-zenith-orange text-base">{item.icon}</span>
                                                    <span>{item.title}</span>
                                                </div>
                                                <span className="text-[10px] text-white/50">{item.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Social Media Channels */}
                            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-zenith-charcoal/5 border border-zenith-orange/10">
                                <h3 className="text-lg font-bold font-serif text-zenith-charcoal mb-2">{t.socialTitle}</h3>
                                <p className="text-xs text-zenith-charcoal/60 leading-relaxed mb-6">
                                    {t.socialSubtitle}
                                </p>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {app_settings?.url_instagram && (
                                        <a
                                            href={app_settings.url_instagram}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#FAF7F2] hover:bg-gradient-to-tr hover:from-purple-600 hover:to-pink-500 hover:text-white group transition-all text-center"
                                        >
                                            <i className="fa-brands fa-instagram text-2xl text-zenith-charcoal group-hover:text-white mb-2 transition-colors"></i>
                                            <span className="text-[10px] font-bold tracking-wider">Instagram</span>
                                        </a>
                                    )}

                                    {app_settings?.url_tiktok && (
                                        <a
                                            href={app_settings.url_tiktok}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#FAF7F2] hover:bg-black hover:text-white group transition-all text-center"
                                        >
                                            <i className="fa-brands fa-tiktok text-2xl text-zenith-charcoal group-hover:text-white mb-2 transition-colors"></i>
                                            <span className="text-[10px] font-bold tracking-wider">TikTok</span>
                                        </a>
                                    )}

                                    {app_settings?.url_fb && (
                                        <a
                                            href={app_settings.url_fb}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#FAF7F2] hover:bg-blue-600 hover:text-white group transition-all text-center"
                                        >
                                            <i className="fa-brands fa-facebook text-2xl text-zenith-charcoal group-hover:text-white mb-2 transition-colors"></i>
                                            <span className="text-[10px] font-bold tracking-wider">Facebook</span>
                                        </a>
                                    )}

                                    {app_settings?.url_x && (
                                        <a
                                            href={app_settings.url_x}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#FAF7F2] hover:bg-zinc-900 hover:text-white group transition-all text-center"
                                        >
                                            <i className="fa-brands fa-x-twitter text-2xl text-zenith-charcoal group-hover:text-white mb-2 transition-colors"></i>
                                            <span className="text-[10px] font-bold tracking-wider">X (Twitter)</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* FAQ Accordion Section */}
                    <div className="mt-20 max-w-4xl mx-auto">
                        <div className="text-center mb-10">
                            <span className="text-[10px] font-bold text-zenith-orange uppercase tracking-[0.2em] block mb-2">Q&A</span>
                            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-zenith-charcoal">
                                {t.faqTitle}
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {t.faqs.map((faq, index) => {
                                const isOpen = openFaq === index;
                                return (
                                    <div
                                        key={index}
                                        className="bg-white rounded-2xl border border-zenith-orange/10 overflow-hidden shadow-sm transition-all"
                                    >
                                        <button
                                            onClick={() => setOpenFaq(isOpen ? -1 : index)}
                                            className="w-full text-left p-6 flex items-center justify-between gap-4 font-serif font-bold text-base text-zenith-charcoal hover:text-zenith-orange transition-colors"
                                        >
                                            <span>{faq.q}</span>
                                            <span
                                                aria-hidden="true"
                                                className={`material-symbols-outlined text-zenith-orange transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                            >
                                                expand_more
                                            </span>
                                        </button>
                                        {isOpen && (
                                            <div className="px-6 pb-6 text-sm text-zenith-charcoal/70 leading-relaxed font-sans border-t border-zenith-orange/5 pt-4">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </section>

            {/* Bottom CTA Banner */}
            <section className="bg-[#2D140A] text-white py-16 border-t border-white/5 relative overflow-hidden">
                <div className="mx-auto max-w-5xl px-6 text-center relative z-10">
                    <h2 className="text-2xl sm:text-4xl font-serif mb-4">
                        {isEn ? "Ready to Experience Ultimate Relaxation at Home?" : "Siap Menikmati Relaksasi Terbaik di Rumah Anda?"}
                    </h2>
                    <p className="text-sm text-white/60 mb-8 max-w-xl mx-auto">
                        {isEn
                            ? "Book your certified therapist today and bring the authentic sanctuary experience to your doorstep."
                            : "Pesan terapis profesional bersertifikat hari ini dan rasakan kenyamanan perawatan spa tanpa harus keluar rumah."
                        }
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <button
                            onClick={handleDirectWa}
                            className="bg-[#25D366] text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#20bd5a] shadow-xl shadow-green-500/20 active:scale-95 transition-all inline-flex items-center gap-2"
                        >
                            <span>{t.waBtn}</span>
                            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">chat</span>
                        </button>
                        <Link
                            href="/treatment"
                            className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-zenith-charcoal active:scale-95 transition-all"
                        >
                            {isEn ? "View Treatment Menu" : "Lihat Menu Layanan"}
                        </Link>
                    </div>
                </div>
            </section>

            <Footer lang={lang} setLang={setLang} />
            <MobileNav lang={lang} />
            <FloatingWhatsApp />
        </div>
    );
}
