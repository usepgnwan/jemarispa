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
                    dim: '#DCDDDD',
                    charcoal: '#5F5D5D',
                    gold: '#FBBB59',
                    orange: '#F47C51',
                }
            },
            spacing: {
                'section': '80px',
            }
        },
    },

    plugins: [forms],
};
