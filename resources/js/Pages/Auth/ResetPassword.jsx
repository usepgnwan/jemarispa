import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function ResetPassword({ token, email }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <div className="relative mt-1">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full pr-10"
                            autoComplete="new-password"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                        />

                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-zenith-charcoal/40 hover:text-zenith-orange transition-colors focus:outline-none"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                        >
                            {showPassword ? (
                                <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                            ) : (
                                <EyeIcon className="h-5 w-5" aria-hidden="true" />
                            )}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <div className="relative mt-1">
                        <TextInput
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="password_confirmation"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full pr-10"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                        />

                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-zenith-charcoal/40 hover:text-zenith-orange transition-colors focus:outline-none"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'}
                        >
                            {showConfirmPassword ? (
                                <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                            ) : (
                                <EyeIcon className="h-5 w-5" aria-hidden="true" />
                            )}
                        </button>
                    </div>

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing}>
                        Reset Password
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
