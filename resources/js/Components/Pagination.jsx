import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (links.length <= 3) return null;

    return (
        <div className="min-w-0 w-full">
            <nav aria-label="Pagination" className="flex max-w-full flex-wrap items-center justify-center gap-2 sm:justify-end">
                {links.map((link, index) => (
                    <Link
                        key={index}
                        href={link.url || '#'}
                        className={`inline-flex min-h-10 shrink-0 items-center justify-center whitespace-nowrap px-3 sm:px-4 py-2 text-sm border rounded-xl transition-all shadow-sm font-bold ${
                            link.active
                                ? 'bg-zenith-orange text-white border-zenith-orange shadow-lg shadow-zenith-orange/20'
                                : link.url
                                    ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                    : 'bg-white/50 text-gray-400 border-gray-100 cursor-not-allowed'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        aria-current={link.active ? 'page' : undefined}
                        preserveScroll
                        preserveState
                    />
                ))}
            </nav>
        </div>
    );
}
