<?php

namespace Tests\Feature;

use App\Exceptions\FcmException;
use App\Jobs\SendScheduleNotification;
use App\Models\Employee;
use App\Models\PushDevice;
use App\Models\PushLog;
use App\Models\ScheduleNotification;
use App\Models\Transaction;
use App\Models\User;
use App\Services\FcmService;
use App\Services\ScheduleReminderService;
use Carbon\Carbon;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PushNotificationsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->travelTo(Carbon::parse('2026-10-04 00:00:00', 'UTC'));
        config(['push.project_id' => 'test-project', 'push.timezone' => 'Asia/Jakarta']);
        Http::preventStrayRequests();
        $this->app->instance(FcmService::class, new class extends FcmService
        {
            protected function accessToken(): string
            {
                return 'fake-oauth-token';
            }
        });
    }

    private function user(string $role = 'admin'): User
    {
        return User::factory()->create(['role' => $role, 'is_active' => true]);
    }

    private function schedule(array $attributes = []): Transaction
    {
        return Transaction::create(array_merge([
            'order_number' => 'TEST-'.uniqid(), 'customer_name' => 'Test Customer',
            'address' => 'Bandung', 'schedule_date' => '2026-10-04', 'schedule_time' => '22:00',
            'payment_method' => 'cash', 'total_price' => 100000, 'status' => 'pending',
        ], $attributes));
    }

    private function device(User $user, string $token = 'test-device-token'): PushDevice
    {
        return PushDevice::create(['user_id' => $user->id, 'fcm_token' => $token,
            'token_hash' => hash('sha256', $token), 'platform' => 'web']);
    }

    public function test_default_and_custom_reminders_use_utc_and_reschedule_invalidates_old_jobs(): void
    {
        $user = $this->user();
        $other = $this->user('cs');
        $schedule = $this->schedule(['schedule_time' => '22.00']);
        $notification = ScheduleNotification::where('user_id', $user->id)->firstOrFail();
        $this->assertSame(360, $notification->notify_before_minutes);
        $this->assertSame('2026-10-04 09:00:00', $notification->notify_at->format('Y-m-d H:i:s'));
        $this->actingAs($user)->patchJson('/api/schedules/'.$schedule->id.'/notification', ['notify_before_minutes' => 120])->assertOk();
        $this->assertSame('2026-10-04 13:00:00', $notification->fresh()->notify_at->format('Y-m-d H:i:s'));
        $this->assertDatabaseHas('schedule_notifications', ['user_id' => $other->id, 'notify_before_minutes' => 360]);
        $oldRevision = $notification->fresh()->revision;
        $schedule->update(['schedule_time' => '23:00']);
        $notification->refresh();
        $this->assertGreaterThan($oldRevision, $notification->revision);
        $this->assertSame('2026-10-04 14:00:00', $notification->notify_at->format('Y-m-d H:i:s'));
        (new SendScheduleNotification($notification->id, $oldRevision))->handle(app(FcmService::class), app(ScheduleReminderService::class));
        Http::assertNothingSent();
        $second = $this->schedule();
        $this->actingAs($user)->patchJson('/api/schedules/'.$schedule->id.'/notification', ['notify_before_minutes' => 30])->assertOk()
            ->assertJsonPath('notification.notify_before_minutes', 30);
        $this->assertDatabaseHas('schedule_notifications', ['user_id' => $user->id, 'schedule_id' => $second->id, 'notify_before_minutes' => 360]);
        $this->assertDatabaseHas('schedule_notifications', ['user_id' => $other->id, 'schedule_id' => $schedule->id, 'notify_before_minutes' => 360]);
        foreach ([0, -1, 10081, 1.5] as $invalid) {
            $this->patchJson('/api/schedules/'.$schedule->id.'/notification', ['notify_before_minutes' => $invalid])->assertUnprocessable();
        }
    }

    public function test_daily_list_supports_previous_and_next_dates_and_does_not_share_reminders(): void
    {
        $user = $this->user();
        $this->schedule(['schedule_date' => '2026-10-03']);
        $today = $this->schedule();
        $tomorrow = $this->schedule(['schedule_date' => '2026-10-05']);
        $this->actingAs($user)->getJson('/api/schedules/today')->assertOk()->assertJsonCount(1, 'schedules')
            ->assertJsonPath('schedules.0.id', $today->id)->assertJsonPath('schedules.0.notification.user_id', $user->id);
        $this->getJson('/api/schedules/today?date=2026-10-03')->assertOk()->assertJsonCount(1, 'schedules');
        $this->getJson('/api/schedules/today?date=2026-10-05')->assertOk()->assertJsonPath('schedules.0.id', $tomorrow->id);
        $this->getJson('/api/schedules/today?date=bad')->assertUnprocessable();
        $this->actingAs($this->user('marketing'))->getJson('/api/schedules/today')->assertForbidden();
        $user->update(['is_active' => false]);
        $this->actingAs($user)->getJson('/api/schedules/today')->assertForbidden();
    }

    public function test_device_registration_is_per_device_and_owned_by_current_account(): void
    {
        $user = $this->user();
        $other = $this->user('cs');
        $payload = ['fcm_token' => 'browser-token', 'platform' => 'web', 'device_name' => 'Chrome'];
        $response = $this->actingAs($user)->postJson('/api/push/devices', $payload)->assertCreated()->assertJsonMissing(['fcm_token' => 'browser-token']);
        $id = $response->json('device.id');
        $this->postJson('/api/push/devices', $payload)->assertCreated();
        $this->assertDatabaseCount('push_devices', 1);
        $this->postJson('/api/push/devices', [...$payload, 'fcm_token' => 'second-device'])->assertCreated();
        $this->assertDatabaseCount('push_devices', 2);
        $this->actingAs($other)->deleteJson('/api/push/devices/'.$id)->assertNotFound();
        $this->postJson('/api/push/devices', $payload)->assertCreated();
        $this->assertDatabaseHas('push_devices', ['id' => $id, 'user_id' => $other->id]);
        $this->post('/logout')->assertRedirect();
        $this->assertDatabaseMissing('push_devices', ['id' => $id]);
    }

    public function test_scheduled_test_stays_pending_until_due_then_database_worker_sends_fcm(): void
    {
        $user = $this->user();
        $this->device($user);
        Http::fake(['fcm.googleapis.com/*' => Http::response(['name' => 'projects/test-project/messages/pipeline'])]);
        $response = $this->actingAs($user)->postJson('/api/notifications/test-schedule', ['delay_minutes' => 2])->assertCreated()
            ->assertJsonPath('notification.status', 'pending');
        $id = $response->json('notification.id');
        $this->assertDatabaseCount('jobs', 0);
        $this->artisan('push:dispatch-due')->assertSuccessful();
        $this->assertDatabaseCount('jobs', 0);
        $this->travel(2)->minutes();
        $this->artisan('push:dispatch-due')->assertSuccessful();
        $this->assertDatabaseHas('schedule_notifications', ['id' => $id, 'status' => 'queued']);
        $this->assertDatabaseCount('jobs', 1);
        $this->artisan('push:dispatch-due')->assertSuccessful();
        $this->assertDatabaseCount('jobs', 1);
        $this->artisan('queue:work', ['connection' => 'database', '--queue' => 'push', '--once' => true, '--sleep' => 0])->assertSuccessful();
        $this->assertDatabaseHas('schedule_notifications', ['id' => $id, 'status' => 'sent', 'fcm_message_id' => 'projects/test-project/messages/pipeline']);
        $this->assertDatabaseCount('jobs', 0);
        Http::assertSentCount(1);
        Http::assertSent(fn ($request) => $request['message']['token'] === 'test-device-token' && $request['message']['data']['title'] === 'Test Scheduler');
        $this->assertDatabaseHas('push_logs', ['type' => 'test', 'status' => 'success', 'schedule_notification_id' => $id]);
        $event = collect(app(Schedule::class)->events())->first(fn ($event) => str_contains($event->command ?? '', 'push:dispatch-due'));
        $this->assertSame('* * * * *', $event->expression);
    }

    public function test_send_now_uses_only_selected_owned_device_without_creating_queue_jobs(): void
    {
        $user = $this->user();
        $device = $this->device($user);
        $otherDevice = $this->device($this->user('cs'), 'other-token');
        Http::fake(['fcm.googleapis.com/*' => Http::response(['name' => 'projects/test-project/messages/direct'])]);
        $this->actingAs($user)->postJson('/api/notifications/test-now', ['device_id' => $otherDevice->id])->assertNotFound();
        $this->postJson('/api/notifications/test-now', ['device_id' => $device->id])->assertOk()->assertJsonPath('fcm_message_id', 'projects/test-project/messages/direct');
        $this->assertDatabaseCount('jobs', 0);
        Http::assertSentCount(1);
        $this->postJson('/api/notifications/test-schedule', ['delay_minutes' => 0])->assertUnprocessable();
    }

    public function test_transaction_push_matches_preview_and_preserves_the_reminder(): void
    {
        $user = $this->user();
        $device = $this->device($user);
        $otherDevice = $this->device($this->user('cs'), 'other-token');
        $schedule = $this->schedule(['order_number' => 'INV-123', 'customer_name' => 'Budi', 'schedule_time' => '22.30']);
        foreach (['Sari', 'Dewi'] as $name) {
            $employee = Employee::create(['name' => $name, 'nohp' => '0800000000', 'title' => 'Terapis']);
            foreach ([1, 2] as $guest) {
                $schedule->items()->create([
                    'guest_index' => $guest, 'employee_id' => $employee->id,
                    'package_name' => 'Pijat', 'package_duration' => '60', 'price' => 100000,
                ]);
            }
        }
        $before = ScheduleNotification::where('user_id', $user->id)->firstOrFail()->getAttributes();
        $expected = "INV-123 - Budi\nTerapis: Sari, Dewi - 22:30";
        Http::fake(['fcm.googleapis.com/*' => Http::response(['name' => 'messages/transaction-test'])]);
        $this->actingAs($user)->getJson('/api/schedules/today?date=2026-10-04')->assertOk()
            ->assertJsonPath('schedules.0.push_message', $expected);
        $this->postJson('/api/notifications/test-now', ['device_id' => $otherDevice->id, 'schedule_id' => $schedule->id])->assertNotFound();
        $this->postJson('/api/notifications/test-now', ['device_id' => $device->id, 'schedule_id' => 999999])->assertUnprocessable();
        Http::assertNothingSent();
        $this->postJson('/api/notifications/test-now', ['device_id' => $device->id, 'schedule_id' => $schedule->id])->assertOk();
        Http::assertSentCount(1);
        Http::assertSent(fn ($request) => $request['message']['token'] === 'test-device-token'
            && $request['message']['data']['body'] === $expected
            && $request['message']['data']['url'] === '/admin/scheduler/'.$schedule->id);
        $this->assertSame($before, ScheduleNotification::findOrFail($before['id'])->getAttributes());
        $this->assertDatabaseCount('jobs', 0);

        $this->travelTo(ScheduleNotification::findOrFail($before['id'])->notify_at);
        $notification = ScheduleNotification::findOrFail($before['id']);
        $notification->update(['status' => 'queued']);
        (new SendScheduleNotification($notification->id, $notification->revision))
            ->handle(app(FcmService::class), app(ScheduleReminderService::class));
        Http::assertSentCount(2);
        Http::assertSent(fn ($request) => $request['message']['data']['tag'] === 'schedule-'.$notification->id.'-'.$notification->revision
            && $request['message']['data']['body'] === $expected
            && $request['message']['data']['url'] === '/admin/scheduler/'.$schedule->id);
        $this->assertDatabaseHas('push_logs', ['type' => 'test', 'status' => 'success', 'body' => $expected, 'notify_before_minutes' => 360]);
        $this->assertDatabaseHas('push_logs', ['type' => 'scheduler', 'status' => 'success', 'body' => $expected]);
    }

    public function test_schedule_detail_shows_the_selected_booking_and_only_the_current_users_reminder(): void
    {
        $admin = $this->user();
        $cs = $this->user('cs');
        $schedule = $this->schedule(['order_number' => 'INV-DETAIL', 'customer_name' => 'Budi', 'phone' => '08123456789', 'notes' => 'Lantai 2']);
        $employee = Employee::create(['name' => 'Sari', 'nohp' => '0800000000', 'title' => 'Terapis']);
        $schedule->items()->create(['employee_id' => $employee->id, 'package_name' => 'Pijat', 'package_duration' => '60', 'price' => 100000]);
        $this->schedule(['customer_name' => 'Other customer']);
        app(ScheduleReminderService::class)->forUser($schedule, $admin, 30);
        $this->actingAs($admin)->get('/admin/scheduler/'.$schedule->id)->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Scheduler/Show')->where('schedule.id', $schedule->id)
            ->where('schedule.customer_name', 'Budi')->where('schedule.address', 'Bandung')
            ->where('schedule.notes', 'Lantai 2')->where('schedule.schedule_at', '2026-10-04T15:00:00+00:00')
            ->has('schedule.items', 1)->where('schedule.items.0.therapist_name', 'Sari')
            ->where('schedule.items.0.package_name', 'Pijat')->where('reminder.notify_before_minutes', 30)
            ->missing('schedule.review_token')->where('timezone', 'Asia/Jakarta'));
        $this->actingAs($cs)->get('/admin/scheduler/'.$schedule->id)->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Scheduler/Show')->where('reminder.notify_before_minutes', 360));
        $this->getJson('/admin/scheduler/999999')->assertNotFound();
        $schedule->delete();
        $this->getJson('/admin/scheduler/'.$schedule->id)->assertNotFound();
    }

    public function test_schedule_detail_requires_login_and_an_allowed_role(): void
    {
        $schedule = $this->schedule();
        $this->get('/admin/scheduler/'.$schedule->id)->assertRedirect('/login');
        foreach (['marketing', 'terapis'] as $role) {
            $this->actingAs($this->user($role))->get('/admin/scheduler/'.$schedule->id)->assertForbidden();
        }
    }

    public function test_push_logs_keep_failures_after_device_deletion_and_filter_by_account_type_status_and_date(): void
    {
        $user = $this->user();
        $device = $this->device($user);
        $device->update(['device_name' => 'Chrome Test']);
        $other = $this->user('cs');
        $otherDevice = $this->device($other, 'other-token');
        Http::fake(['fcm.googleapis.com/*' => Http::sequence()
            ->push(['name' => 'messages/test'])
            ->push(['name' => 'messages/other-test'])
            ->push(['error' => ['status' => 'UNREGISTERED']], 404)]);
        $this->actingAs($user)->postJson('/api/notifications/test-now', ['device_id' => $device->id])->assertOk();
        $this->actingAs($other)->postJson('/api/notifications/test-now', ['device_id' => $otherDevice->id])->assertOk();
        $this->actingAs($user)->postJson('/api/notifications/test-now', ['device_id' => $device->id])->assertStatus(502);
        $this->assertDatabaseMissing('push_devices', ['id' => $device->id]);
        $this->assertDatabaseHas('push_logs', ['user_id' => $user->id, 'type' => 'test', 'status' => 'failed',
            'error_code' => 'UNREGISTERED', 'push_device_id' => null, 'device_name' => 'Chrome Test']);
        $this->getJson('/api/notifications/logs')->assertOk()->assertJsonPath('total', 2)
            ->assertJsonPath('data.0.status', 'failed')->assertJsonMissing(['fcm_token' => 'test-device-token']);
        $this->getJson('/api/notifications/logs?type=test&status=failed&date=2026-10-04')->assertOk()->assertJsonPath('total', 1);
        $this->getJson('/api/notifications/logs?type=scheduler')->assertOk()->assertJsonPath('total', 0);
        $this->getJson('/api/notifications/logs?status=success')->assertOk()->assertJsonPath('total', 1);
        $this->getJson('/api/notifications/logs?date=2026-10-03')->assertOk()->assertJsonPath('total', 0);
        $this->getJson('/api/notifications/logs?type=invalid')->assertUnprocessable();
        $this->actingAs($this->user('marketing'))->getJson('/api/notifications/logs')->assertForbidden();
    }

    public function test_scheduler_failures_and_retries_are_logged_separately_and_missing_devices_are_recorded(): void
    {
        $user = $this->user();
        $device = $this->device($user);
        $schedule = $this->schedule();
        $notification = ScheduleNotification::firstOrFail();
        $notification->update(['status' => 'queued']);
        Http::fake(['fcm.googleapis.com/*' => Http::sequence()
            ->push(['error' => ['status' => 'UNAVAILABLE']], 503)
            ->push(['name' => 'messages/retry-success'])]);
        $job = new SendScheduleNotification($notification->id, $notification->revision);
        try {
            $job->handle(app(FcmService::class), app(ScheduleReminderService::class));
            $this->fail('Transient failure must be retried.');
        } catch (FcmException $exception) {
            $this->assertSame('UNAVAILABLE', $exception->fcmCode);
        }
        $this->assertDatabaseHas('push_logs', ['type' => 'scheduler', 'status' => 'failed', 'error_code' => 'UNAVAILABLE']);
        $job->handle(app(FcmService::class), app(ScheduleReminderService::class));
        $this->assertDatabaseCount('push_logs', 2);
        $this->assertDatabaseHas('push_logs', ['type' => 'scheduler', 'status' => 'success', 'fcm_message_id' => 'messages/retry-success']);
        $device->delete();
        $schedule->delete();
        $this->assertDatabaseCount('push_logs', 2);
        $this->assertNotNull(PushLog::where('status', 'failed')->first()->error_message);
        $this->schedule();
        $notification = ScheduleNotification::firstOrFail();
        $notification->update(['status' => 'queued']);
        (new SendScheduleNotification($notification->id, $notification->revision))->handle(app(FcmService::class), app(ScheduleReminderService::class));
        $this->assertDatabaseHas('push_logs', ['type' => 'scheduler', 'status' => 'failed', 'error_code' => 'NO_DEVICE']);
    }

    public function test_unexpected_send_errors_are_recorded_without_secrets(): void
    {
        $user = $this->user();
        $device = $this->device($user);
        $this->mock(FcmService::class)->shouldReceive('send')->once()->andThrow(new \RuntimeException('private-key-and-device-token'));
        $this->actingAs($user)->postJson('/api/notifications/test-now', ['device_id' => $device->id])->assertStatus(502);
        $log = PushLog::firstOrFail();
        $this->assertSame('failed', $log->status);
        $this->assertSame('SEND_ERROR', $log->error_code);
        $this->assertStringNotContainsString('private-key-and-device-token', $log->error_message);
        $this->assertStringContainsString('RuntimeException', $log->error_message);
    }

    public function test_retry_skips_successful_devices_and_removes_unregistered_tokens(): void
    {
        $user = $this->user();
        $this->device($user, 'good-token');
        $this->device($user, 'retry-token');
        $invalid = $this->device($user, 'invalid-token');
        $notification = ScheduleNotification::create(['user_id' => $user->id, 'is_test' => true, 'notify_at' => now(), 'status' => 'queued']);
        $recovered = false;
        Http::fake(function ($request) use (&$recovered) {
            if ($recovered) {
                return Http::response(['name' => 'messages/retried']);
            }

            return match ($request['message']['token']) {
                'good-token' => Http::response(['name' => 'messages/good']),
                'retry-token' => Http::response(['error' => ['status' => 'UNAVAILABLE']], 503),
                default => Http::response(['error' => ['details' => [['@type' => 'type.googleapis.com/google.firebase.fcm.v1.FcmError', 'errorCode' => 'UNREGISTERED']]]], 404),
            };
        });
        $job = new SendScheduleNotification($notification->id, $notification->revision);
        try {
            $job->handle(app(FcmService::class), app(ScheduleReminderService::class));
            $this->fail('Transient error should retry.');
        } catch (FcmException $e) {
            $this->assertTrue($e->retryable);
        }
        $this->assertDatabaseMissing('push_devices', ['id' => $invalid->id]);
        $recovered = true;
        $job->handle(app(FcmService::class), app(ScheduleReminderService::class));
        Http::assertSentCount(4);
        $this->assertCount(1, Http::recorded(fn ($request) => $request['message']['token'] === 'good-token'));
        $this->assertCount(2, Http::recorded(fn ($request) => $request['message']['token'] === 'retry-token'));
        $this->assertSame('sent', $notification->fresh()->status);
    }

    public function test_cancelled_transactions_and_obsolete_queued_jobs_never_send(): void
    {
        $user = $this->user();
        $this->device($user);
        $schedule = $this->schedule();
        $notification = ScheduleNotification::firstOrFail();
        $notification->update(['status' => 'queued']);
        $schedule->update(['status' => 'failed']);
        (new SendScheduleNotification($notification->id, $notification->revision))->handle(app(FcmService::class), app(ScheduleReminderService::class));
        Http::assertNothingSent();
        $this->assertSame('cancelled', $notification->fresh()->status);
        $schedule->delete();
        $this->assertDatabaseMissing('schedule_notifications', ['id' => $notification->id]);
    }

    public function test_failed_queue_job_updates_notification_without_overwriting_a_new_revision(): void
    {
        $user = $this->user();
        $notification = ScheduleNotification::create(['user_id' => $user->id, 'is_test' => true, 'notify_at' => now(), 'status' => 'queued']);
        $job = new SendScheduleNotification($notification->id, $notification->revision);
        $job->failed(new \RuntimeException('failed'));
        $this->assertSame('failed', $notification->fresh()->status);
        $notification->update(['revision' => 2, 'status' => 'pending']);
        $job->failed(new \RuntimeException('old job'));
        $this->assertSame('pending', $notification->fresh()->status);
    }

    public function test_midnight_reminder_crosses_dates_in_utc_and_today_uses_local_timezone(): void
    {
        $user = $this->user();
        $schedule = $this->schedule(['schedule_date' => '2026-10-05', 'schedule_time' => '01:00']);
        $notification = ScheduleNotification::firstOrFail();
        $this->assertSame('2026-10-04 12:00:00', $notification->notify_at->format('Y-m-d H:i:s'));
        $this->travelTo(Carbon::parse('2026-10-04 18:00:00', 'UTC'));
        $this->actingAs($user)->getJson('/api/schedules/today')->assertOk()
            ->assertJsonPath('date', '2026-10-05')->assertJsonPath('schedules.0.id', $schedule->id);
    }

    public function test_regular_reminder_is_sent_at_due_time_and_repeated_jobs_do_not_send_twice(): void
    {
        $user = $this->user();
        $this->device($user);
        $schedule = $this->schedule();
        $notification = ScheduleNotification::firstOrFail();
        Http::fake(['fcm.googleapis.com/*' => Http::response(['name' => 'messages/reminder'])]);
        $this->travelTo($notification->notify_at);
        $this->artisan('push:dispatch-due')->assertSuccessful();
        $this->artisan('queue:work', ['connection' => 'database', '--queue' => 'push', '--once' => true, '--sleep' => 0])->assertSuccessful();
        $notification->refresh();
        $this->assertSame('sent', $notification->status);
        Http::assertSent(fn ($request) => $request['message']['data']['title'] === 'Pengingat jadwal Jemari'
            && $request['message']['data']['body'] === $schedule->order_number." - Test Customer\nTerapis: Belum ditentukan - 22:00");
        (new SendScheduleNotification($notification->id, $notification->revision))->handle(app(FcmService::class), app(ScheduleReminderService::class));
        Http::assertSentCount(1);
    }

    public function test_device_less_user_cannot_schedule_test_and_expired_queued_reminders_are_cancelled(): void
    {
        $user = $this->user();
        $this->actingAs($user)->postJson('/api/notifications/test-schedule', ['delay_minutes' => 1])->assertUnprocessable();
        $this->device($user);
        $schedule = $this->schedule(['schedule_time' => '08:00']);
        $notification = ScheduleNotification::firstOrFail();
        $this->artisan('push:dispatch-due')->assertSuccessful();
        $this->travel(2)->hours();
        $this->artisan('queue:work', ['connection' => 'database', '--queue' => 'push', '--once' => true, '--sleep' => 0])->assertSuccessful();
        $this->assertSame('cancelled', $notification->fresh()->status);
        Http::assertNothingSent();
        $this->actingAs($user)->patchJson('/api/schedules/'.$schedule->id.'/notification', ['notify_before_minutes' => 60])->assertUnprocessable();
    }

    public function test_backfill_is_idempotent_and_recovers_stranded_queued_notifications(): void
    {
        $user = $this->user();
        Transaction::withoutEvents(fn () => $this->schedule());
        $this->artisan('push:backfill')->assertSuccessful();
        $this->artisan('push:backfill')->assertSuccessful();
        $this->assertDatabaseCount('schedule_notifications', 1);
        $notification = ScheduleNotification::firstOrFail();
        $notification->update(['status' => 'queued']);
        $this->travelTo($notification->notify_at->addMinutes(20));
        $this->artisan('push:dispatch-due')->assertSuccessful();
        $this->assertDatabaseHas('schedule_notifications', ['id' => $notification->id, 'status' => 'queued']);
        $this->assertDatabaseCount('jobs', 1);
    }
}
