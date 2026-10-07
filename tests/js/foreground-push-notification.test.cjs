const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const source = readFileSync('resources/js/lib/foregroundPushNotification.js', 'utf8')
    .replace('export async function', 'async function');

function setup({ permission = 'granted', worker = true } = {}) {
    const shown = [];
    const context = {
        window: { Notification: {} }, Notification: { permission },
        navigator: { serviceWorker: { getRegistration: async (scope) => {
            assert.equal(scope, '/');
            return worker ? { showNotification: async (title, options) => shown.push({ title, ...options }) } : undefined;
        } } },
    };
    vm.runInNewContext(source, context);
    return { show: context.showForegroundPushNotification, shown };
}

test('foreground push displays a system notification with schedule click metadata', async () => {
    const app = setup();
    assert.equal(await app.show({ messageId: 'abc', data: {
        title: 'Jadwal', body: 'INV-123', url: '/admin/scheduler/123', notification_id: '42', tag: 'schedule-123',
    } }), true);
    const notification = app.shown[0];
    assert.equal(notification.title, 'Jadwal');
    assert.equal(notification.body, 'INV-123');
    assert.equal(notification.tag, 'schedule-123');
    assert.equal(notification.data.jemariPush, true);
    assert.equal(notification.data.notificationId, '42');
    assert.equal(notification.data.url, '/admin/scheduler/123');
});

test('foreground notification preserves therapist destination and rejects external URLs', async () => {
    for (const [url, expected] of [
        ['/terapis/notifikasi', '/terapis/notifikasi'],
        ['https://other.test/admin/scheduler/123', '/admin/scheduler'],
    ]) {
        const app = setup();
        await app.show({ messageId: 'abc', data: { url } });
        assert.equal(app.shown[0].data.url, expected);
        assert.equal(app.shown[0].tag, 'push-abc');
    }
});

test('foreground push respects notification permissions and missing worker', async () => {
    for (const options of [{ permission: 'denied' }, { permission: 'default' }, { worker: false }]) {
        const app = setup(options);
        assert.equal(await app.show({ data: { title: 'Jadwal' } }), false);
        assert.equal(app.shown.length, 0);
    }
});
