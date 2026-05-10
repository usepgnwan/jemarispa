import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function Index({ auth, settings, serviceAreas }) {
    const { data, setData, post, processing, errors } = useForm({
        phone: settings?.phone || '',
        email: settings?.email || '',
        description_id: settings?.description_id || '',
        description_en: settings?.description_en || '',
        template_order: settings?.template_order || '',
        template_question: settings?.template_question || '',
        template_invoice: settings?.template_invoice || '',
        default_commission: settings?.default_commission || 0,
    });

    const [newArea, setNewArea] = useState('');
    const [toast, setToast] = useState({ show: false, message: '' });

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const submitSettings = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            onSuccess: () => showToast('Settings saved successfully!'),
        });
    };

    const addArea = (e) => {
        e.preventDefault();
        if (!newArea) return;
        router.post(route('admin.settings.areas.store'), { name: newArea }, {
            onSuccess: () => {
                setNewArea('');
                showToast('Service area added!');
            },
        });
    };

    const deleteArea = (id) => {
        if (confirm('Are you sure you want to delete this area?')) {
            router.delete(route('admin.settings.areas.destroy', id), {
                onSuccess: () => showToast('Area deleted successfully!'),
            });
        }
    };

    const updateArea = (id, currentName) => {
        const name = prompt('Update area name:', currentName);
        if (name && name !== currentName) {
            router.put(route('admin.settings.areas.update', id), { name }, {
                onSuccess: () => showToast('Area updated!'),
            });
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
        ],
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Settings</h2>}
        >
            <Head title="Admin Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* General Settings */}
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <section>
                            <header>
                                <h2 className="text-lg font-medium text-gray-900">General Information</h2>
                                <p className="mt-1 text-sm text-gray-600">Update your contact info and descriptions.</p>
                            </header>

                            <form onSubmit={submitSettings} className="mt-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block font-medium text-sm text-gray-700">WhatsApp Phone Number</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            placeholder="e.g. 62895..."
                                        />
                                        {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
                                    </div>
                                    <div>
                                        <label className="block font-medium text-sm text-gray-700">Business Email</label>
                                        <input
                                            type="email"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            placeholder="e.g. jemari@example.com"
                                        />
                                        {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block font-medium text-sm text-gray-700">Default Therapist Commission (IDR)</label>
                                        <input
                                            type="number"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.default_commission}
                                            onChange={e => setData('default_commission', e.target.value)}
                                            placeholder="e.g. 30000"
                                        />
                                        {errors.default_commission && <div className="text-red-500 text-xs mt-1">{errors.default_commission}</div>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block font-medium text-sm text-gray-700">Description (ID)</label>
                                        <textarea
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm h-32"
                                            value={data.description_id}
                                            onChange={e => setData('description_id', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-medium text-sm text-gray-700">Description (EN)</label>
                                        <textarea
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm h-32"
                                            value={data.description_en}
                                            onChange={e => setData('description_en', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        Save Settings
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>

                    {/* Service Areas */}
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <section>
                            <header>
                                <h2 className="text-lg font-medium text-gray-900">Service Areas</h2>
                                <p className="mt-1 text-sm text-gray-600">Manage the locations where you provide services.</p>
                            </header>

                            <div className="mt-6">
                                <form onSubmit={addArea} className="flex gap-2 mb-6">
                                    <input
                                        type="text"
                                        className="flex-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        value={newArea}
                                        onChange={e => setNewArea(e.target.value)}
                                        placeholder="Add new area..."
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 text-white rounded-md font-bold text-xs uppercase tracking-widest hover:bg-green-700"
                                    >
                                        Add
                                    </button>
                                </form>

                                <div className="space-y-2">
                                    {serviceAreas.map((area) => (
                                        <div key={area.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <span className="font-medium text-gray-700">{area.name}</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateArea(area.id, area.name)}
                                                    className="p-1 text-blue-600 hover:text-blue-800"
                                                >
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => deleteArea(area.id)}
                                                    className="p-1 text-red-600 hover:text-red-800"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {serviceAreas.length === 0 && (
                                        <p className="text-gray-500 text-center py-4 italic">No service areas added yet.</p>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* WhatsApp Templates */}
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <section>
                            <header>
                                <h2 className="text-lg font-medium text-gray-900">WhatsApp Message Templates</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Customize the messages sent to customers. Use placeholders in square brackets, e.g., <code className="bg-gray-100 px-1 rounded">[name]</code>, <code className="bg-gray-100 px-1 rounded">[package]</code>.
                                </p>
                            </header>

                            <form onSubmit={submitSettings} className="mt-6 space-y-12">
                                <div>
                                    <label className="block font-medium text-sm text-gray-700 mb-2">Order Template (Reservation)</label>
                                    <div className="bg-white">
                                        <ReactQuill 
                                            theme="snow" 
                                            value={data.template_order} 
                                            onChange={val => setData('template_order', val)}
                                            modules={modules}
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-400">Placeholders: [name], [pax], [gender], [address], [package], [schedule], [payment], [therapist_pax], [therapist_gender], [source]</p>
                                </div>

                                <div>
                                    <label className="block font-medium text-sm text-gray-700 mb-2">Inquiry Template (Question)</label>
                                    <div className="bg-white">
                                        <ReactQuill 
                                            theme="snow" 
                                            value={data.template_question} 
                                            onChange={val => setData('template_question', val)}
                                            modules={modules}
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-400">Placeholders: [name], [question]</p>
                                </div>

                                <div>
                                    <label className="block font-medium text-sm text-gray-700 mb-2">Invoice Billing Template</label>
                                    <div className="bg-white">
                                        <ReactQuill 
                                            theme="snow" 
                                            value={data.template_invoice} 
                                            onChange={val => setData('template_invoice', val)}
                                            modules={modules}
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-400">Placeholders: [name], [invoice_no], [details], [transport], [total], [link]</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        Save All Templates
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>

                </div>
            </div>

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-10 right-10 z-[110] animate-slide-up">
                    <div className="bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-x-4 border border-white/10">
                        <span className="material-symbols-outlined text-green-400">check_circle</span>
                        <p className="text-sm font-medium">{toast.message}</p>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
