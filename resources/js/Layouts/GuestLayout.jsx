import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-zenith-surface pt-6 sm:justify-center sm:pt-0">
            <div className="mb-8">
                <Link href="/">
                    <img src="/images/Jemari Logo - 1.png" alt="Jemari Spa Logo" className="h-24 w-auto object-contain drop-shadow-xl" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-8 py-10 shadow-2xl shadow-zenith-orange/10 sm:max-w-md rounded-[2.5rem] border border-zenith-orange/10">
                {children}
            </div>
        </div>
    );
}
