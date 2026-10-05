# Scheduled FCM push notifications

## Existing application and recipient rules

Laravel 13.8, React 18.3, Inertia 2, session login, PostgreSQL, and `/sw.js` PWA are retained. `transactions` is the schedule source used by `/admin/transaction`. `schedule_date` and `schedule_time` are interpreted in `SCHEDULE_TIMEZONE` (default `Asia/Jakarta`). No existing date/time fields are rewritten. New `notify_at`, `sent_at`, and device timestamps use UTC; leave Laravel and database connections in UTC.

The transaction list is shared by admin/CS and has no owner column. Every active admin/CS account gets its own reminder for each active transaction. A user's reminder selection never changes another user's selection. Other roles cannot use these APIs. This follows the existing transaction access rules; therapists are not implicitly subscribed.

Default reminders are 360 minutes, with 240/180/120/60 as alternatives. Saving a transaction updates reminders; cancelling/completing cancels pending/queued reminders. Changes to date/time or reminder increment a revision so obsolete queue jobs do not send. Past appointments do not produce late reminders. A future appointment with a reminder time already passed sends at the next scheduler tick.

## Firebase setup

1. Use the intended Firebase project, enable **Firebase Cloud Messaging API (HTTP v1)** and the web **FCM Registration API**.
2. Create/register a Web app in Firebase project settings and copy its web configuration. These identifiers are public and are safe for the frontend.
3. Under Cloud Messaging → Web Push certificates, generate/import a VAPID key pair; use the **public** key below.
4. Give the backend service account permission to send FCM messages (Firebase Cloud Messaging API Admin, or a custom role allowing `cloudmessaging.messages.create`). Store its JSON at `storage/app/private/firebase/service-account.json`, outside the Nginx document root. The local key supplied in `public/lkayfbr/` was moved here without committing it. Rotate any key previously exposed publicly. Never put this JSON in Git, `public/storage`, React, or a `VITE_*` variable.
5. Configure `.env`:

```dotenv
APP_URL=https://jemarihomespa.com
QUEUE_CONNECTION=database
CACHE_STORE=database
DB_QUEUE_RETRY_AFTER=90
SCHEDULE_TIMEZONE=Asia/Jakarta
FIREBASE_CREDENTIALS=
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_WEB_API_KEY=your-web-api-key
FIREBASE_AUTH_DOMAIN=your-firebase-project-id.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-numeric-sender-id
FIREBASE_APP_ID=your-web-app-id
FIREBASE_VAPID_KEY=your-public-vapid-key
```

Keep `DB_QUEUE_CONNECTION` unset so the jobs and reminder tables share the same database connection: queue insertion and the `pending` → `queued` claim commit atomically. Do not switch the push queue to Redis/sync. PHP needs OpenSSL, cURL, and the database extension. Install the SQLite PDO extension for the default automated test suite.

The public Firebase configuration is served at `/firebase-config.js` from Laravel environment config and also shared with Inertia. Firebase Messaging SDK 12.19.0 compat files are imported from `www.gstatic.com` by the worker; keep their version aligned with the installed Firebase SDK when upgrading. Any CSP must allow these worker imports and required Firebase/Google connections.

## Ubuntu deployment

Use a deployment checkout at `/var/www/jemarispa`; replace paths and PHP binary for your host. Nginx `root` must be `/var/www/jemarispa/public` with HTTPS. Service workers and Push API require HTTPS (localhost is allowed for development).

```bash
composer install --no-dev --optimize-autoloader
npm ci --legacy-peer-deps
npm run build
php artisan migrate --force
php artisan config:cache
php artisan push:backfill
php artisan queue:restart
```

`push:backfill` is idempotent and creates reminders for existing future transactions. Registration of a device also backfills that account. Run it when activating/adding admin/CS accounts or after bulk SQL imports (model observers do not run for raw/query-builder updates).

Ensure `www-data` can read the credential file and write `storage` and `bootstrap/cache`:

```bash
sudo chown www-data:www-data storage/app/private/firebase/service-account.json
sudo chmod 600 storage/app/private/firebase/service-account.json
```

Install one cron entry for the application user (`sudo crontab -u www-data -e`):

```cron
* * * * * cd /var/www/jemarispa && /usr/bin/php artisan schedule:run >> /var/www/jemarispa/storage/logs/scheduler.log 2>&1
```

This is the requested single `* * * * * php artisan schedule:run`, with the working directory and PHP binary made explicit. Do not separately cron `push:dispatch-due`.

Create `/etc/supervisor/conf.d/jemarispa-push.conf`:

```ini
[program:jemarispa-push]
process_name=%(program_name)s_%(process_num)02d
command=/usr/bin/php /var/www/jemarispa/artisan queue:work database --queue=push --sleep=1 --tries=3 --timeout=60 --max-time=3600
directory=/var/www/jemarispa
user=www-data
numprocs=1
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stopwaitsecs=120
redirect_stderr=true
stdout_logfile=/var/www/jemarispa/storage/logs/push-worker.log
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=5
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl status jemarispa-push:*
php artisan schedule:list
```

Keep workers for any existing `default` queue as needed. Push jobs explicitly use `database` and `push`.

If Nginx has a static `.js` location, it must route `/firebase-config.js` to Laravel rather than returning a static 404. Add these exact locations inside the existing server block:

```nginx
location = /firebase-config.js {
    rewrite ^ /index.php last;
}
location = /sw.js {
    add_header Cache-Control "no-cache";
    try_files $uri =404;
}
location = /firebase-messaging-sw.js {
    add_header Cache-Control "no-cache";
    try_files $uri =404;
}
location ^~ /lkayfbr/ { deny all; }
location ^~ /key/ { deny all; }
```

Keep your existing PHP-FPM `/index.php` handler and `location / { try_files $uri $uri/ /index.php?$query_string; }`. Configure log rotation for scheduler logs.

## Browser flow and testing

Visit `/admin/transaction` as admin/CS. The daily panel uses existing transactions and supports previous day, next day, a date picker, and **Hari ini**. Reminder choices and calculated notify times are shown in the configured schedule timezone. The panel refreshes every 15 seconds.

1. Click **Aktifkan Push di Device Ini**, grant browser permission, and confirm a registered device appears.
2. Select a device and click **Send Push Now**. This sends to FCM synchronously, bypassing scheduler/queue; the response includes its FCM message ID.
3. Click **Test Scheduler** with 1, 2, or 5 minutes. The API creates a `schedule_notifications` row with `schedule_id=NULL`, `is_test=true`, `status=pending`, and future UTC `notify_at`. No job is dispatched by this endpoint.
4. Leave cron and Supervisor running. Once due, the scheduler finds `pending AND notify_at <= now(UTC)`, claims it as `queued`, and inserts a database queue job. The worker sends FCM and records `sent_at`, message IDs, and per-device results. Check the test history and browser notification. Scheduling runs once per minute, so allow up to roughly an extra minute plus queue/network latency.
5. Repeat while the page is open (foreground toast) and while hidden/closed (background system notification). Clicking a background push opens `/admin/transaction`.

On iPhone/iPad, install the PWA to the Home Screen and launch it there before requesting notification permission; use a compatible iOS/browser version. If permission is denied, the user must restore it in browser/OS settings. FCM acceptance does not guarantee display: device connectivity, OS settings, and platform restrictions still apply.

The existing `/sw.js` imports `/firebase-messaging-sw.js`. Only one root worker is registered; no conflicting worker scope is introduced. Messages are data-only, avoiding duplicate notifications from Firebase auto-display and our handler. Foreground handling is mounted in the authenticated layout. Returning users with permission already granted refresh their token on authenticated page mount. Device records are removed for explicit disable, logout of that browser, or FCM `UNREGISTERED`; a shared browser's token is reassigned to its current logged-in account.

## APIs

All six APIs use the existing session cookie, CSRF/XSRF token, and active admin/CS authorization; they are intentionally web-middleware routes with `/api` paths rather than introducing a second token-auth system. React's existing Axios setup supplies the same-origin CSRF handling.

| API | Payload / behavior |
| --- | --- |
| `POST /api/push/devices` | `fcm_token`, `device_name`, `platform` (`web`, `android`, `ios`) |
| `DELETE /api/push/devices/{id}` | Only devices belonging to current user |
| `GET /api/schedules/today?date=YYYY-MM-DD` | Optional date; defaults to today in schedule timezone; schedules, own reminders, own devices, own latest tests |
| `PATCH /api/schedules/{id}/notification` | `notify_before_minutes`: 360, 240, 180, 120, 60 |
| `POST /api/notifications/test-now` | `device_id`: selected owned device |
| `POST /api/notifications/test-schedule` | `delay_minutes`: integer 1–60; UI offers 1/2/5; sends to all current user's registered devices |

## Operations and delivery semantics

Statuses: `pending`, `queued`, `sent`, `partial`, `failed`, `cancelled`. `sent` means accepted by FCM, not delivery/read confirmation. Three attempts with 30/120 second backoff handle transient failures. Success is recorded per device in `push_deliveries`; a retry skips successful/permanently failed deliveries. Queued records stranded for 15 minutes return to pending. Devices with expired registration tokens are removed.

Queue delivery is at least once. A process crash after FCM accepts a message but before the database records it can cause a resend; stable notification tags reduce duplicate display. Exactly-once delivery cannot be guaranteed by FCM/queue. Reminder revisions and row locks prevent routine concurrent dispatcher/worker sends and obsolete-job sends.

Inspect `storage/logs/push-worker.log`, `scheduler.log`, `laravel.log`, `php artisan queue:failed`, and database notification/delivery status. `php artisan queue:retry` alone cannot resend a terminal `failed` notification because workers honor its state; use a new test or update the future schedule's reminder. Avoid manually resetting sent rows. Configure retention for test and delivery history as traffic grows.

## Validation

```bash
php artisan test --filter=PushNotificationsTest
npm run build
```

Automated tests cover UTC conversion, default/custom reminder isolation, date navigation API, account/device authorization and logout, actual database queue insertion/consumption, FCM HTTP v1 request shape with HTTP fakes, retry behavior, invalid tokens, cancellation, and obsolete revisions. They assert the scheduler's minute expression and invoke its command in-process, because SQLite in-memory databases are not shared with the scheduler's child process. Real browser permission and live FCM delivery must additionally be checked with the two UI test buttons after supplying Firebase configuration.

If Windows PHP has its SQLite extension installed but disabled, run `php -d extension=pdo_sqlite vendor/phpunit/phpunit/phpunit --filter=PushNotificationsTest` to enable it for that invocation only.

Official references: [Firebase web message handling](https://firebase.google.com/docs/cloud-messaging/web/receive-messages), [FCM HTTP v1](https://firebase.google.com/docs/cloud-messaging/send/v1-api), [Laravel queues](https://laravel.com/framework/docs/13.x/queues).

Local verification: the new migration is applied to PostgreSQL; all 12 push tests pass (85 assertions) with SQLite enabled for the test command; production Vite build passes. Broader existing auth/profile/calendar/example checks passed 26 of 28 tests. The two unrelated failures are the existing logout test expecting `/` while the existing controller redirects to `/login`, and the homepage example test using an empty SQLite database without migrating `settings`.

## Files added or updated

| File | Change |
| --- | --- |
| `database/migrations/2026_10_04_000001_create_push_notification_tables.php` | Devices, scheduled reminders, per-device delivery history |
| `app/Models/PushDevice.php` | Device tokens, hidden in JSON responses |
| `app/Models/ScheduleNotification.php` | Reminder choices, UTC datetime casts, revisions |
| `app/Models/PushDelivery.php` | Per-device outcomes |
| `app/Services/ScheduleReminderService.php` | Existing transaction schedule conversion and synchronization |
| `app/Services/FcmService.php` | OAuth and FCM HTTP v1 |
| `app/Exceptions/FcmException.php` | Safe FCM error codes and retry flags |
| `app/Observers/TransactionObserver.php` | Create/reschedule/cancel reminders on transaction saves |
| `app/Jobs/SendScheduleNotification.php` | Queue worker delivery, retries, token cleanup |
| `app/Console/Commands/DispatchDuePushNotifications.php` | Due-reminder dispatcher and stranded-queue recovery |
| `app/Http/Controllers/PushNotificationController.php` | Six requested endpoints |
| `app/Http/Middleware/ActivePushUser.php` | Active-account authorization |
| `routes/push.php` | Session/CSRF API routes and public web configuration script |
| `routes/web.php` | Include push routes |
| `routes/console.php` | Minute scheduler and backfill command |
| `config/push.php` | Firebase and schedule timezone settings |
| `app/Providers/AppServiceProvider.php` | Register transaction observer |
| `bootstrap/app.php` | Register account middleware and preserve JSON API errors |
| `app/Http/Middleware/HandleInertiaRequests.php` | Public Firebase web settings shared with React |
| `app/Http/Controllers/Auth/AuthenticatedSessionController.php` | Remove current browser's push device on logout |
| `resources/js/lib/pushMessaging.js` | Permission, token registration, device removal, foreground SDK |
| `resources/js/Components/PushNotifications.jsx` | Foreground toast and granted-token refresh |
| `resources/js/Components/DailyScheduleNotifications.jsx` | Daily list/date navigation/reminders/devices/two test buttons |
| `resources/js/Layouts/AuthenticatedLayout.jsx` | Mount foreground handler |
| `resources/js/Pages/Admin/Transaction/Index.jsx` | Mount daily transaction schedule panel |
| `public/firebase-messaging-sw.js` | Background push and click handling |
| `public/sw.js` | Import messaging handler into existing PWA worker |
| `.env.example` | Firebase configuration template |
| `.gitignore` | Exclude private credentials and original public credential directories |
| `composer.json`, `composer.lock` | Add Google Auth |
| `package.json`, `package-lock.json` | Add Firebase SDK; preserve existing dependencies |
| `tests/Feature/PushNotificationsTest.php` | 12 pipeline/security/timezone tests |
| `docs/scheduled-push-notifications.md` | Implementation details, setup, cron, Supervisor, Nginx, validation |

Credential relocation (ignored by Git): `public/lkayfbr/*.json` → `storage/app/private/firebase/service-account.json`. `public/build` was regenerated by Vite and remains ignored by Git. No live FCM/browser delivery test was possible without Firebase web/VAPID configuration and an authorized browser token.
