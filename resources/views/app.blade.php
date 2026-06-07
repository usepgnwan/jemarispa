<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <!-- Google Tag Manager -->
        @if(config('services.gtm.code') && !request()->is('admin*', 'dashboard', 'login', 'register', 'profile', 'api/*', 'testimoni', 'faq', 'platform'))
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','{{ config('services.gtm.code') }}');</script>
        @endif
        <!-- End Google Tag Manager -->

        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Jemari Home Spa - Pijat Panggilan Bandung') }}</title>
        <meta name="description" inertia content="Layanan pijat panggilan profesional 24 jam di Bandung dan Cimahi. Tersedia pijat tradisional, bekam, totok wajah, refleksi, lulur, dan kerokan. Langsung ke rumah, hotel, atau apartemen Anda.">
        <meta name="keywords" inertia content="pijat panggilan bandung, pijat panggilan cimahi, spa panggilan bandung, pijat tradisional, bekam, totok wajah, refleksi, lulur">
        <meta name="author" content="Jemari Home Spa">
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
        <link rel="canonical" href="{{ url()->current() }}">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" inertia content="Jemari Home Spa - Pijat Panggilan Bandung">
        <meta property="og:description" inertia content="Layanan pijat panggilan profesional 24 jam di Bandung dan Cimahi. Tersedia pijat tradisional, bekam, totok wajah, refleksi, lulur, dan kerokan.">
        <meta property="og:image" inertia content="{{ asset('images/logo-pwa-192.png') }}">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="{{ url()->current() }}">
        <meta property="twitter:title" inertia content="Jemari Home Spa - Pijat Panggilan Bandung">
        <meta property="twitter:description" inertia content="Layanan pijat panggilan profesional 24 jam di Bandung dan Cimahi. Tersedia pijat tradisional, bekam, totok wajah, refleksi, lulur, dan kerokan.">
        <meta property="twitter:image" inertia content="{{ asset('images/logo-pwa-192.png') }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />

        <!-- PWA Meta & Manifest -->
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#dc6432">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="Jemari Spa">
        <link rel="apple-touch-icon" href="/images/logo-pwa-192.png">

        <!-- PWA Toast Styling -->
        <style>
            .pwa-toast {
                position: fixed;
                top: 24px;
                right: 24px;
                z-index: 999999;
                max-width: 380px;
                width: calc(100% - 48px);
                background: rgba(255, 255, 255, 0.88);
                backdrop-filter: blur(20px) saturate(180%);
                -webkit-backdrop-filter: blur(20px) saturate(180%);
                border: 1px solid rgba(220, 100, 50, 0.2);
                border-radius: 24px;
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
                opacity: 0;
                transform: translateY(-20px) scale(0.95);
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                pointer-events: none;
            }

            .pwa-toast.show {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: auto;
            }

            .pwa-toast-content {
                position: relative;
                padding: 20px;
            }

            .pwa-toast-close {
                position: absolute;
                top: 14px;
                right: 16px;
                background: none;
                border: none;
                font-size: 22px;
                line-height: 1;
                color: #9ca3af;
                cursor: pointer;
                transition: color 0.2s;
            }
            .pwa-toast-close:hover {
                color: #374151;
            }

            .pwa-toast-body {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 16px;
            }

            .pwa-toast-logo {
                width: 48px;
                height: 48px;
                border-radius: 14px;
                object-fit: cover;
                box-shadow: 0 4px 16px rgba(220, 100, 50, 0.18);
            }

            .pwa-toast-text {
                flex: 1;
                padding-right: 12px;
            }

            .pwa-toast-title {
                margin: 0 0 4px 0;
                font-family: 'Poppins', sans-serif;
                font-size: 15px;
                font-weight: 600;
                color: #1f2937;
            }

            .pwa-toast-desc {
                margin: 0;
                font-family: 'Poppins', sans-serif;
                font-size: 12px;
                color: #6b7280;
                line-height: 1.45;
            }

            .pwa-toast-actions {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }

            .pwa-toast-btn {
                padding: 8px 18px;
                border-radius: 12px;
                font-family: 'Poppins', sans-serif;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
            }

            .pwa-toast-btn-secondary {
                background: transparent;
                color: #6b7280;
            }
            .pwa-toast-btn-secondary:hover {
                background: rgba(0, 0, 0, 0.05);
                color: #1f2937;
            }

            .pwa-toast-btn-primary {
                background: #dc6432;
                color: white;
                box-shadow: 0 4px 12px rgba(220, 100, 50, 0.25);
            }
            .pwa-toast-btn-primary:hover {
                background: #c75323;
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(220, 100, 50, 0.35);
            }

            @media (max-width: 640px) {
                .pwa-toast {
                    top: auto;
                    bottom: 24px;
                    right: 16px;
                    left: 16px;
                    width: calc(100% - 32px);
                    max-width: none;
                    transform: translateY(20px) scale(0.95);
                }
                .pwa-toast.show {
                    transform: translateY(0) scale(1);
                }
            }

            /* Custom PWA Step-by-Step Instructions Styling */
            .pwa-instructions-header {
                border-bottom: 1px solid rgba(220, 100, 50, 0.1);
                padding-bottom: 8px;
                margin-bottom: 12px;
            }

            .pwa-step-item {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                margin-bottom: 10px;
                font-family: 'Poppins', sans-serif;
                font-size: 12px;
                color: #4b5563;
                line-height: 1.45;
            }

            .pwa-step-number {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 18px;
                height: 18px;
                background: #dc6432;
                color: white;
                font-size: 10px;
                font-weight: 600;
                border-radius: 50%;
                flex-shrink: 0;
                margin-top: 1px;
            }

            .pwa-step-text {
                flex: 1;
            }

            .pwa-step-highlight {
                font-weight: 600;
                color: #dc6432;
            }
            
            .pwa-warning-box {
                background: rgba(239, 68, 68, 0.06);
                border: 1px dashed rgba(239, 68, 68, 0.25);
                border-radius: 12px;
                padding: 10px 12px;
                margin-bottom: 12px;
                font-family: 'Poppins', sans-serif;
                font-size: 11px;
                color: #b91c1c;
                line-height: 1.5;
            }
        </style>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        <!-- Google Tag Manager (noscript) -->
        @if(config('services.gtm.code') && !request()->is('admin*', 'dashboard', 'login', 'register', 'profile', 'api/*', 'testimoni', 'faq', 'platform'))
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={{ config('services.gtm.code') }}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        @endif
        <!-- End Google Tag Manager (noscript) -->

        @inertia

        <!-- Static SEO Content for bots that do not execute JavaScript -->
        <div id="seo-content" style="display: none; visibility: hidden;">
            <h1>Jemari Home Spa - Layanan Pijat Panggilan Bandung &amp; Cimahi</h1>
            <p>Jemari Home Spa adalah layanan pijat panggilan profesional untuk area Bandung dan Cimahi. Kami melayani panggilan ke rumah, hotel, dan apartemen dengan terapis pria dan wanita bersertifikat.</p>
            <h2>Layanan Utama Kami:</h2>
            <ul>
                <li>Pijat Tradisional (Traditional Massage)</li>
                <li>Bekam / Kop (Cupping Therapy)</li>
                <li>Totok Wajah (Face Acupressure)</li>
                <li>Refleksi (Reflexology)</li>
                <li>Body Scrub / Lulur</li>
                <li>Pijat Keseleo / Terkilir (Sprain Massage)</li>
                <li>Kerokan</li>
            </ul>
        </div>

        <!-- PWA Install Prompt Toast HTML -->
        <div id="pwa-install-toast" class="pwa-toast">
            <div class="pwa-toast-content">
                <button id="pwa-toast-close" class="pwa-toast-close">&times;</button>
                
                <!-- Main PWA Prompt View -->
                <div id="pwa-main-view">
                    <div class="pwa-toast-body">
                        <img src="/images/logo-pwa-192.png" alt="Jemari Spa" class="pwa-toast-logo">
                        <div class="pwa-toast-text">
                            <h4 class="pwa-toast-title">Instal Aplikasi Jemari</h4>
                            <p class="pwa-toast-desc">Instal aplikasi untuk akses dashboard & kasir yang lebih cepat, responsif, dan stabil.</p>
                        </div>
                    </div>
                    <div class="pwa-toast-actions">
                        <button id="pwa-toast-btn-dismiss" class="pwa-toast-btn pwa-toast-btn-secondary">Nanti saja</button>
                        <button id="pwa-toast-btn-action" class="pwa-toast-btn pwa-toast-btn-primary">Instal</button>
                    </div>
                </div>

                <!-- Custom Step-by-Step Instructions View (Dynamic) -->
                <div id="pwa-instructions-view" style="display: none;">
                    <div class="pwa-instructions-header">
                        <h4 class="pwa-toast-title">Panduan Pemasangan</h4>
                        <p class="pwa-toast-desc" style="margin-bottom: 0;">Langkah mudah menginstal Aplikasi Jemari Spa:</p>
                    </div>
                    <div class="pwa-instructions-steps" id="pwa-instructions-steps-content">
                        <!-- Instantly injected by javascript -->
                    </div>
                    <div class="pwa-toast-actions" style="margin-top: 14px; gap: 8px;">
                        <button id="pwa-toast-btn-back" class="pwa-toast-btn pwa-toast-btn-secondary" style="padding: 6px 14px; font-size: 12px;">&larr; Kembali</button>
                        <button id="pwa-toast-btn-gotit" class="pwa-toast-btn pwa-toast-btn-primary" style="padding: 6px 14px; font-size: 12px; background: #dc6432;">Saya Mengerti</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Register PWA Service Worker & Install Logic -->
        <script>
            // Register Service Worker
            if ('serviceWorker' in navigator) {
                const registerSW = () => {
                    navigator.serviceWorker.register('/sw.js')
                        .then(reg => console.log('Jemari PWA Service Worker registered successfully!', reg))
                        .catch(err => console.error('Jemari PWA Service Worker registration failed:', err));
                };

                if (document.readyState === 'complete' || document.readyState === 'interactive') {
                    registerSW();
                } else {
                    window.addEventListener('load', registerSW);
                }
            }

            // PWA Custom Install Toast Logic
            let deferredPrompt;
            const toast = document.getElementById('pwa-install-toast');
            const closeBtn = document.getElementById('pwa-toast-close');
            const dismissBtn = document.getElementById('pwa-toast-btn-dismiss');
            const actionBtn = document.getElementById('pwa-toast-btn-action');
            
            // Interactive instruction elements
            const mainView = document.getElementById('pwa-main-view');
            const instructionsView = document.getElementById('pwa-instructions-view');
            const instructionsStepsContent = document.getElementById('pwa-instructions-steps-content');
            const backBtn = document.getElementById('pwa-toast-btn-back');
            const gotitBtn = document.getElementById('pwa-toast-btn-gotit');

            function showToast() {
                // Bypass the 24-hour dismissal limit on localhost/127.0.0.1 for frictionless testing!
                const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                if (!isLocalhost) {
                    const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
                    const now = Date.now();
                    if (dismissedTime && (now - dismissedTime < 24 * 60 * 60 * 1000)) {
                        return; // Don't show if dismissed within 24 hours on production
                    }
                }

                // Never show if already running inside the standalone app
                if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
                    return;
                }

                toast.classList.add('show');
            }

            function resetToastViews() {
                instructionsView.style.display = 'none';
                mainView.style.display = 'block';
            }

            function hideToast(userDismissed = false) {
                toast.classList.remove('show');
                if (userDismissed) {
                    localStorage.setItem('pwa-prompt-dismissed', Date.now());
                }
                // Reset views after transition animation finishes (400ms)
                setTimeout(resetToastViews, 400);
            }

            function checkRouteAndPrompt() {
                const currentPath = window.location.pathname;
                if (currentPath === '/login' || currentPath.startsWith('/dashboard') || currentPath.startsWith('/admin')) {
                    // Slight delay for premium feel
                    setTimeout(showToast, 1500);
                } else {
                    hideToast();
                }
            }

            // Intercept standard browser install prompt
            window.addEventListener('beforeinstallprompt', (e) => {
                // Prevent the default browser mini-infobar on mobile
                e.preventDefault();
                // Store the event so we can trigger it later
                deferredPrompt = e;
                // Check route on load
                checkRouteAndPrompt();
            });

            // Trigger route check immediately on page load/ready
            window.addEventListener('DOMContentLoaded', checkRouteAndPrompt);

            // Listen to Inertia SPA transitions to re-check and display on client-side routing!
            document.addEventListener('inertia:finish', () => {
                checkRouteAndPrompt();
            });

            // Render Dynamic step-by-step instructions inside the toast
            function showInstallInstructions() {
                const userAgent = navigator.userAgent || navigator.vendor || window.opera;
                const isIOS = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
                const isAndroid = /Android/i.test(userAgent);
                const isSecureOrigin = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

                let html = '';

                if (!isSecureOrigin) {
                    html = `
                        <div class="pwa-warning-box">
                            <strong>⚠️ Koneksi Tidak Aman (HTTP)</strong><br>
                            PWA memerlukan koneksi aman (<strong>HTTPS</strong>) atau <strong>localhost</strong>. Karena Anda mengakses melalui <span class="pwa-step-highlight">${window.location.hostname}</span> via HTTP biasa, browser Anda memblokir fitur instalasi.
                        </div>
                        <div class="pwa-step-item">
                            <div class="pwa-step-number">1</div>
                            <div class="pwa-step-text">Gunakan protokol <span class="pwa-step-highlight">https://</span> di server produksi.</div>
                        </div>
                        <div class="pwa-step-item">
                            <div class="pwa-step-number">2</div>
                            <div class="pwa-step-text">Jika Anda testing di HP menggunakan IP lokal (misalnya <span class="pwa-step-highlight">192.168.x.x</span>), browser otomatis memblokir instalasi PWA karena bukan koneksi HTTPS. Gunakan <span class="pwa-step-highlight">localhost</span> di komputer Anda.</div>
                        </div>
                    `;
                } else if (isIOS) {
                    html = `
                        <div class="pwa-step-item" style="margin-top: 8px;">
                            <div class="pwa-step-number">1</div>
                            <div class="pwa-step-text">Ketuk tombol <strong>Bagikan / Share</strong> <i class="fa-solid fa-arrow-up-from-bracket pwa-step-highlight"></i> di bagian bawah layar Safari Anda.</div>
                        </div>
                        <div class="pwa-step-item">
                            <div class="pwa-step-number">2</div>
                            <div class="pwa-step-text">Gulir ke bawah dan ketuk opsi <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong> <i class="fa-regular fa-square-plus pwa-step-highlight"></i>.</div>
                        </div>
                        <div class="pwa-step-item">
                            <div class="pwa-step-number">3</div>
                            <div class="pwa-step-text">Ketuk tombol <strong>"Tambah" (Add)</strong> di pojok kanan atas untuk memasang aplikasi Jemari Spa di layar HP Anda.</div>
                        </div>
                    `;
                } else if (isAndroid) {
                    html = `
                        <div class="pwa-step-item" style="margin-top: 8px;">
                            <div class="pwa-step-number">1</div>
                            <div class="pwa-step-text">Ketuk tombol menu <strong>Tiga Titik</strong> <i class="fa-solid fa-ellipsis-vertical pwa-step-highlight"></i> di pojok kanan atas Google Chrome.</div>
                        </div>
                        <div class="pwa-step-item">
                            <div class="pwa-step-number">2</div>
                            <div class="pwa-step-text">Pilih opsi <strong>"Instal aplikasi" (Install app)</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</div>
                        </div>
                        <div class="pwa-step-item">
                            <div class="pwa-step-number">3</div>
                            <div class="pwa-step-text">Konfirmasi dengan mengeklik tombol <strong>"Instal" (Install)</strong> pada dialog konfirmasi yang muncul.</div>
                        </div>
                    `;
                } else {
                    // Desktop Chrome / Edge / Safari / Firefox
                    html = `
                        <div class="pwa-step-item" style="margin-top: 8px;">
                            <div class="pwa-step-number">1</div>
                            <div class="pwa-step-text">Klik ikon <strong>Pasang / Install</strong> <i class="fa-solid fa-download pwa-step-highlight"></i> atau tombol tambah <i class="fa-solid fa-plus pwa-step-highlight"></i> yang berada di pojok kanan atas kolom alamat (URL bar) browser Anda.</div>
                        </div>
                        <div class="pwa-step-item">
                            <div class="pwa-step-number">2</div>
                            <div class="pwa-step-text">Klik ikon tersebut, lalu klik tombol konfirmasi <strong>"Instal"</strong>.</div>
                        </div>
                        <div class="pwa-step-item">
                            <div class="pwa-step-number">3</div>
                            <div class="pwa-step-text">Aplikasi Jemari Spa akan langsung terpasang di komputer Anda dan siap dibuka kapan saja.</div>
                        </div>
                    `;
                }

                instructionsStepsContent.innerHTML = html;
                mainView.style.display = 'none';
                instructionsView.style.display = 'block';
            }

            // Action: Install App
            actionBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    hideToast();
                    // Show browser installation dialog
                    deferredPrompt.prompt();
                    // Wait for the user response
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`User installation choice: ${outcome}`);
                    deferredPrompt = null;
                } else {
                    // Native prompt unavailable: Show beautiful, context-aware steps!
                    showInstallInstructions();
                }
            });

            // Interactive Navigation: Back & Got It
            backBtn.addEventListener('click', () => {
                instructionsView.style.display = 'none';
                mainView.style.display = 'block';
            });

            gotitBtn.addEventListener('click', () => {
                hideToast(true);
            });

            // Actions: Dismiss/Close
            closeBtn.addEventListener('click', () => hideToast(true));
            dismissBtn.addEventListener('click', () => hideToast(true));

            // Optional: Listen for successful install to hide toast forever
            window.addEventListener('appinstalled', (e) => {
                console.log('Jemari Home Spa app was successfully installed!');
                hideToast();
                deferredPrompt = null;
            });
        </script>
    </body>
</html>
