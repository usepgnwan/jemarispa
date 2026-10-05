import { Head } from '@inertiajs/react';
import { ClockIcon } from '@heroicons/react/24/outline';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DailyScheduleNotifications from '@/Components/DailyScheduleNotifications';

export default function Index() {
    return (
        <AuthenticatedLayout>
            <Head title="Scheduler" />

            <div className="py-8">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                            UTAMA <span className="mx-1">/</span> SCHEDULER
                        </div>
                        <h2 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
                            <ClockIcon className="w-6 h-6 text-zenith-orange" />
                            Scheduler
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Kelola jadwal harian dan pengingat notifikasi pesanan.
                        </p>
                    </div>

                    <DailyScheduleNotifications />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
