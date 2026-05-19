<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

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
        <link rel="apple-touch-icon" href="/images/logo-pwa-192.jpg">

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
        </style>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia

        <!-- PWA Install Prompt Toast HTML -->
        <div id="pwa-install-toast" class="pwa-toast">
            <div class="pwa-toast-content">
                <button id="pwa-toast-close" class="pwa-toast-close">&times;</button>
                <div class="pwa-toast-body">
                    <img src="/images/logo-pwa-192.jpg" alt="Jemari Spa" class="pwa-toast-logo">
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

            function hideToast(userDismissed = false) {
                toast.classList.remove('show');
                if (userDismissed) {
                    localStorage.setItem('pwa-prompt-dismissed', Date.now());
                }
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
                    // Fallback helper in case app is already installed or browser is waiting for installation handshake
                    alert("Aplikasi Jemari Home Spa sudah siap terpasang! Jika dialog instalasi tidak muncul secara otomatis, Anda dapat menginstalnya dengan mudah melalui ikon pasang (instal) di pojok kanan atas kolom alamat browser Anda (URL bar).");
                    hideToast(true);
                }
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
