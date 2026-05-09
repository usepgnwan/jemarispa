import { useState, useEffect } from 'react';

export default function FAQ({ lang: propLang }) {
    const [faqs, setFaqs] = useState([]);
    const [openIndex, setOpenIndex] = useState(null);
    const [lang, setLang] = useState(propLang || 'ID');

    // Update local lang state when prop changes
    useEffect(() => {
        if (propLang) {
            setLang(propLang);
        }
    }, [propLang]);

    useEffect(() => {
        // Fallback to localStorage if no prop is provided
        const currentLang = propLang || localStorage.getItem('app_lang') || 'ID';
        setLang(currentLang);

        const fetchFaqs = async () => {
            try {
                const res = await fetch('/api/faqs');
                const data = await res.json();
                setFaqs(data);
            } catch (err) {
                console.error('FAQ Fetch Error:', err);
            }
        };

        fetchFaqs();

        // Listen for storage changes as a fallback
        const handleLangChange = () => {
            const savedLang = localStorage.getItem('app_lang') || 'ID';
            setLang(savedLang);
            fetchFaqs(); // Re-fetch on language change as requested
        };

        window.addEventListener('storage', handleLangChange);
        return () => window.removeEventListener('storage', handleLangChange);
    }, [propLang]); // Re-run when propLang changes

    return (
        <section id="faq" className="py-section bg-zenith-surface">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        {lang === 'EN' ? 'Frequently Asked Questions' : 'Pertanyaan yang Sering Diajukan'}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Left Column: Image */}
                    <div className="rounded-[2.5rem] overflow-hidden h-[600px] shadow-2xl">
                        <img
                            src="/images/pijat tradisional.JPG"
                            alt="Spa Treatment"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Right Column: Accordion */}
                    <div className="space-y-4">
                        {faqs.length > 0 ? (
                            faqs.map((faq, i) => {
                                const question = lang === 'EN' ? (faq.title_en || faq.title_id) : faq.title_id;
                                const answer = lang === 'EN' ? (faq.description_en || faq.description_id) : faq.description_id;

                                return (
                                    <div
                                        key={faq.id}
                                        className={`rounded-3xl bg-white transition-all duration-500 overflow-hidden shadow-sm hover:shadow-md border border-zenith-orange/5 ${openIndex === i ? 'ring-1 ring-zenith-orange/20' : ''
                                            }`}
                                    >
                                        <button
                                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                            className="w-full px-8 py-6 flex items-center justify-between text-left group"
                                        >
                                            <span className="font-bold text-zenith-charcoal tracking-tight text-sm pr-4">
                                                {question}
                                            </span>
                                            <span className={`material-symbols-outlined transition-transform duration-500 text-zenith-orange text-sm ${openIndex === i ? 'rotate-180' : ''}`}>
                                                expand_more
                                            </span>
                                        </button>

                                        <div className={`transition-all duration-500 ease-in-out ${openIndex === i ? 'max-h-[1000px] opacity-100 pb-8 px-8' : 'max-h-0 opacity-0 pointer-events-none'
                                            }`}>
                                            <div 
                                                className="text-sm text-gray-500 leading-relaxed font-sans border-t border-zenith-orange/10 pt-6 prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: answer }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">
                                {lang === 'EN' ? 'Loading FAQs...' : 'Memuat FAQ...'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
