const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const worker = readFileSync('public/firebase-messaging-sw.js', 'utf8');

function setup(windows = []) {
    const listeners = {};
    const shown = [];
    const opened = [];
    let receive;
    const context = {
        URL, console, importScripts() {},
        self: {
            location: { origin: 'https://jemarihomespa.com' },
            JEMARI_FIREBASE_CONFIG: { apiKey: 'test', projectId: 'test', messagingSenderId: 'test', appId: 'test' },
            addEventListener: (name, callback) => { listeners[name] = callback; },
            registration: { showNotification: async (title, options) => { shown.push({ title, ...options }); } },
            clients: { matchAll: async () => windows, openWindow: async (url) => { opened.push(url); } },
        },
        firebase: { initializeApp() {}, messaging: () => ({ onBackgroundMessage: (callback) => { receive = callback; } }) },
    };
    vm.runInNewContext(worker, context);
    return {
        receive: (data) => receive({ data }), shown, opened,
        click: (notification) => {
            let pending;
            listeners.notificationclick({ notification: { ...notification, close() {} }, stopImmediatePropagation() {}, waitUntil: (promise) => { pending = promise; } });
            return pending;
        },
    };
}

test('clicking a background push opens its schedule detail in an existing window', async () => {
    let navigated;
    let focused = false;
    const app = setup([{ url: 'https://jemarihomespa.com/admin/scheduler', navigate: async (url) => { navigated = url; }, focus: async () => { focused = true; } }]);
    await app.receive({ title: 'Jadwal', body: 'INV-123', url: '/admin/scheduler/123' });
    await app.click(app.shown[0]);
    assert.equal(navigated, 'https://jemarihomespa.com/admin/scheduler/123');
    assert.equal(focused, true);
    assert.equal(app.opened.length, 0);
});

test('clicking a push opens a new window when the PWA is closed', async () => {
    const app = setup();
    await app.receive({ url: '/admin/scheduler/456' });
    await app.click(app.shown[0]);
    assert.deepEqual(app.opened, ['https://jemarihomespa.com/admin/scheduler/456']);
});

test('legacy, generic, and external destinations fall back to Scheduler', async () => {
    for (const url of [undefined, '/admin/transaction', 'https://other.test/admin/scheduler/123', '//other.test']) {
        const app = setup();
        await app.receive({ url });
        await app.click(app.shown[0]);
        assert.deepEqual(app.opened, ['https://jemarihomespa.com/admin/scheduler']);
    }
});
