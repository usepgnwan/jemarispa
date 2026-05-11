import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

export default function FloatingWhatsApp() {
    const { app_settings } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', question: '' });

    const phone = app_settings?.phone || '6289516166090';
    const rawTemplate = app_settings?.template_question || 'Halo Jemari Home Spa, saya [name] ingin bertanya mengenai: [question]';

    const handleSubmit = (e) => {
        e.preventDefault();

        // Track Analytics
        axios.post(route('api.analytics.store'), {
            category: 'Floating WA',
            title: `Pertanyaan: ${formData.name}`
        }).catch(err => console.error('Analytic Error:', err));

        let message = rawTemplate.replace(/<[^>]*>?/gm, ''); // Strip HTML
        message = message.replace('[name]', formData.name || 'tamu');
        message = message.replace('[question]', formData.question || 'layanan');
        
        const encodedMessage = encodeURIComponent(message);

        // Robust Phone Sanitization
        const cleanPhone = phone.toString().replace(/[^0-9]/g, '');
        let waPhone = cleanPhone;
        if (cleanPhone.startsWith('0')) {
            waPhone = '62' + cleanPhone.substring(1);
        } else if (cleanPhone.startsWith('8')) {
            waPhone = '62' + cleanPhone;
        }

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const waUrl = isMobile 
            ? `https://wa.me/${waPhone}?text=${encodedMessage}`
            : `https://web.whatsapp.com/send?phone=${waPhone}&text=${encodedMessage}`;
            
        window.open(waUrl, '_blank');
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-28 md:bottom-8 right-6 md:right-8 z-50 flex flex-col items-end gap-4">
            {/* Form Popover */}
            {isOpen && (
                <div className="bg-white rounded-[2rem] shadow-2xl border border-zenith-orange/10 p-6 w-[280px] md:w-[320px] animate-scale-in origin-bottom-right">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-serif italic text-zenith-charcoal text-lg">Kirim Pertanyaan</h3>
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="h-8 w-8 rounded-full bg-zenith-surface flex items-center justify-center text-gray-400 hover:text-zenith-orange transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Nama</label>
                            <input 
                                required
                                type="text" 
                                className="w-full bg-zenith-surface border-none rounded-xl p-3 text-xs font-medium focus:ring-1 focus:ring-zenith-orange"
                                placeholder="Nama Anda"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Pertanyaan</label>
                            <textarea 
                                required
                                className="w-full bg-zenith-surface border-none rounded-xl p-3 text-xs font-medium focus:ring-1 focus:ring-zenith-orange h-20 resize-none"
                                placeholder="Apa yang ingin Anda tanyakan?"
                                value={formData.question}
                                onChange={(e) => setFormData({...formData, question: e.target.value})}
                            ></textarea>
                        </div>
                        <button 
                            type="submit"
                            className="w-full bg-[#25D366] text-white py-4 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-green-500/20 hover:bg-[#20bd5a] transition-all transform active:scale-95"
                        >
                            Kirim ke WhatsApp
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <div className="flex items-center group">
                {/* Tooltip Label */}
                {!isOpen && (
                    <div className="mr-3 px-4 py-2 bg-white rounded-full shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 pointer-events-none">
                        <p className="text-[10px] font-bold text-zenith-charcoal uppercase tracking-widest whitespace-nowrap">Chat with us</p>
                    </div>
                )}

                {/* WhatsApp Icon Circle */}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative focus:outline-none"
                >
                    {/* Pulse Effect */}
                    {!isOpen && <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-20 scale-150"></div>}
                    
                    <div className={`relative h-16 w-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${isOpen ? 'bg-zenith-charcoal rotate-90 shadow-zenith-charcoal/40' : 'bg-[#25D366] shadow-green-500/40 hover:scale-110'}`}>
                        {isOpen ? (
                            <span className="material-symbols-outlined text-white text-3xl">close</span>
                        ) : (
                            <svg 
                                className="w-8 h-8 text-white" 
                                fill="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
}
