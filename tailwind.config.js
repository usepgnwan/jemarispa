import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Open Sans', ...defaultTheme.fontFamily.sans],
                serif: ['Playfair Display', ...defaultTheme.fontFamily.serif],
            },
            colors: {
                zenith: {
                    surface: '#fef8f7',
                    dim: '#ded9d8',
                    charcoal: '#1d1b1b',
                    primary: '#984800',
                    orange: '#ff7d00',
                }
            },
            spacing: {
                'section': '80px',
            }
        },
    },

    plugins: [forms],
};
