import { usePage } from '@inertiajs/react';

export default function Footer({ lang = 'ID', setLang }) {
    const { app_settings, service_areas, locale } = usePage().props;
    const isEn = lang === 'EN';

    const defaultDescId = "Sebuah tempat perlindungan yang didedikasikan untuk pemulihan tubuh, pikiran, dan jiwa. Rasakan seni hidup sehat melalui ritual kami yang dikurasi, dikirim langsung ke kenyamanan rumah Anda.";
    const defaultDescEn = "A sanctuary dedicated to the restoration of body, mind, and soul. Experience the art of wellness through our curated rituals, delivered directly to the comfort of your home.";

    return (
        <footer className="bg-[#2D140A] text-white pt-20 pb-40 md:pb-20 border-t border-white/5">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                    <div className="md:col-span-2">
                        <div className="flex gap-x-8">
                            <div className="flex-shrink-0">
                                <img src="/images/logo-jemari.jpg" alt="Jemari Spa Logo" className="h-28 w-auto rounded-2xl shadow-2xl border border-white/10" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold tracking-[0.2em] uppercase text-white mb-2">{app_settings?.title || 'Jemari Home Spa'}</h3>
                                <p className="text-zenith-orange text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Home Spa Sanctuary</p>
                                <p className="text-white/60 max-w-sm text-sm leading-relaxed mb-6 font-sans">
                                    {isEn
                                        ? (app_settings?.description_en || defaultDescEn)
                                        : (app_settings?.description_id || defaultDescId)}
                                </p>
                                <div className="flex items-center gap-x-6">
                                    <div className="flex gap-x-4">
                                        {app_settings?.url_instagram && (
                                            <a href={app_settings.url_instagram} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-zenith-orange hover:border-zenith-orange transition-all cursor-pointer">
                                                <i className="fa-brands fa-instagram text-lg"></i>
                                            </a>
                                        )}
                                        {app_settings?.url_fb && (
                                            <a href={app_settings.url_fb} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-zenith-orange hover:border-zenith-orange transition-all cursor-pointer">
                                                <i className="fa-brands fa-facebook text-lg"></i>
                                            </a>
                                        )}
                                        {app_settings?.url_tiktok && (
                                            <a href={app_settings.url_tiktok} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-zenith-orange hover:border-zenith-orange transition-all cursor-pointer">
                                                <i className="fa-brands fa-tiktok text-lg"></i>
                                            </a>
                                        )}
                                        {app_settings?.url_x && (
                                            <a href={app_settings.url_x} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-zenith-orange hover:border-zenith-orange transition-all cursor-pointer">
                                                <i className="fa-brands fa-x-twitter text-lg"></i>
                                            </a>
                                        )}
                                    </div>


                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-8 text-white font-serif">Area Layanan</h4>
                        <ul className="space-y-4 text-sm text-white/80 font-medium">
                            {service_areas?.map((area) => (
                                <li key={area.id} className="flex items-center gap-x-3">
                                    <span className="material-symbols-outlined text-white text-base font-bold">check</span>
                                    <span>{area.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className='hidden'>
                        <h4 className="text-lg font-bold mb-8 text-white font-serif">Price List & Reservasi</h4>
                        <ul className="space-y-4 text-sm text-white/80 font-medium">
                            <li className="flex items-center gap-x-3">
                                <span className="material-symbols-outlined text-white text-base font-bold">check</span>
                                <a href="#pricing" className="hover:text-zenith-orange transition-colors">Reservasi</a>
                            </li>
                            <li className="flex items-center gap-x-3">
                                <span className="material-symbols-outlined text-white text-base font-bold">check</span>
                                <a href="/pricing" className="hover:text-zenith-orange transition-colors">Price List</a>
                            </li>
                            <li className="flex items-center gap-x-3">
                                <span className="material-symbols-outlined text-white text-base font-bold">check</span>
                                <span>Phone: {app_settings?.phone}</span>
                            </li>
                            <li className="flex items-center gap-x-3">
                                <span className="material-symbols-outlined text-white text-base font-bold">check</span>
                                <a href="#" className="hover:text-zenith-orange transition-colors">Privacy Policy</a>
                            </li>
                            <li className="flex items-center gap-x-3">
                                <span className="material-symbols-outlined text-white text-base font-bold">check</span>
                                <a href="#" className="hover:text-zenith-orange transition-colors">Term & Condition</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
                    <p>© 2021 Jemari Home Spa. All rights reserved.</p>
                    <div className="flex gap-x-8">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
