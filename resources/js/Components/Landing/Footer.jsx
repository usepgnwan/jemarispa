export default function Footer() {
    return (
        <footer className="bg-[#121212] text-white pt-20 pb-40 md:pb-20 border-t border-white/5">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="md:col-span-2">
                        <div className="flex gap-x-8">
                            <div className="flex-shrink-0">
                                <img src="/images/logo-jemari.jpg" alt="Jemari Spa Logo" className="h-28 w-auto rounded-2xl shadow-2xl border border-white/10" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold tracking-[0.2em] uppercase text-white mb-2">Jemari Spa</h3>
                                <p className="text-zenith-orange text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Home Spa Sanctuary</p>
                                <p className="text-white/40 max-w-sm text-sm leading-relaxed mb-6 font-sans">
                                    A sanctuary dedicated to the restoration of body, mind, and spirit.
                                    Experience the art of living well through our curated rituals, 
                                    delivered directly to the comfort of your sanctuary.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-x-4">
                            <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-zenith-orange hover:border-zenith-orange transition-all cursor-pointer">
                                <span className="font-bold">IG</span>
                            </div>
                            <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-zenith-orange hover:border-zenith-orange transition-all cursor-pointer">
                                <span className="font-bold">FB</span>
                            </div>
                            <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-zenith-orange hover:border-zenith-orange transition-all cursor-pointer">
                                <span className="font-bold">X</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase mb-8 text-zenith-orange">Explore</h4>
                        <ul className="space-y-4 text-sm text-white/40 font-medium">
                            <li><a href="#" className="hover:text-white transition-colors">Treatments</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Products</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Gift Cards</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase mb-8 text-zenith-orange">Sanctuary</h4>
                        <ul className="space-y-4 text-sm text-white/40 font-medium">
                            <li>123 Serenity Way, <br />Zenith Valley, CA 90210</li>
                            <li>Open Daily: 09:00 - 22:00</li>
                            <li>+1 (555) 012-3456</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold tracking-[0.2em] uppercase text-white/20">
                    <p>© 2024 Jemari Spa Sanctuary. All rights reserved.</p>
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
