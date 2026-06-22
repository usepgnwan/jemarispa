export default function Contact({ lang = 'ID' }) {
    const content = {
        'ID': {
            title: 'Hubungi Kami',
            desc: 'Jadwalkan dengan terapis kami dengan reservasi sekarang! Nikmati kemudahan perawatan spa premium tanpa harus keluar dari kenyamanan hunian Anda.',
            button: 'Pesan Sekarang'
        },
        'EN': {
            title: 'Contact Us',
            desc: 'Schedule with our therapist by booking now! Enjoy the convenience of premium spa treatments without having to leave the comfort of your home.',
            button: 'Book Now'
        }
    };

    const t = content[lang] || content['ID'];

    return (
        <section id="contact" className="py-section bg-zenith-surface">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-zenith-charcoal/5 flex flex-col md:flex-row items-stretch border border-zenith-orange/10">
                    {/* Left Content */}
                    <div className="flex-1 p-10 md:p-20 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 block">{t.title}</span>
                        <p className="text-sm md:text-base text-gray-500 leading-relaxed mb-10 max-w-md">
                            {t.desc}
                        </p>

                        <div>
                            <button onClick={() => window.location.href = '/cart'} className="inline-flex items-center gap-x-3 bg-zenith-orange text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-zenith-orange/30 hover:bg-zenith-orange/80 transition-all transform hover:-translate-y-1">
                                <span aria-hidden="true" className="material-symbols-outlined text-sm">calendar_month</span>
                                {t.button}
                            </button>
                        </div>
                    </div>

                    {/* Right Image with Fade */}
                    <div className="flex-1 relative min-h-[300px]">
                        <img
                            src="/images/pijat ibu hamil.JPG"
                            alt="Massage Treatment"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
