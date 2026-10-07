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

    public function test_scheduler_timeline_groups_reminder_times_across_dates_and_only_includes_the_current_account(): void
    {
        $user = $this->user();
        $other = $this->user('cs');
        $past = $this->schedule(['schedule_date' => '2026-10-03']);
        $due = $this->schedule(['schedule_time' => '07:00']);
        $future = $this->schedule(['schedule_date' => '2026-10-05']);
        $cancelled = $this->schedule(['schedule_date' => '2026-10-06']);
        ScheduleNotification::where('user_id', $user->id)->where('schedule_id', $past->id)
            ->update(['notify_at' => now()->subMinutes(5), 'status' => 'sent']);
        ScheduleNotification::where('user_id', $user->id)->where('schedule_id', $due->id)
            ->update(['notify_at' => now(), 'status' => 'queued']);
        ScheduleNotification::where('user_id', $user->id)->where('schedule_id', $future->id)
            ->update(['notify_at' => now()->addMinutes(5), 'status' => 'pending']);
        ScheduleNotification::where('user_id', $user->id)->where('schedule_id', $cancelled->id)
            ->update(['notify_at' => now()->addMinutes(2), 'status' => 'cancelled']);
        ScheduleNotification::where('user_id', $other->id)->update(['notify_at' => now()->addMinutes(1)]);
        ScheduleNotification::create(['user_id' => $user->id, 'is_test' => true, 'notify_at' => now()->addMinute()]);

        $this->actingAs($user)->getJson('/api/schedules/today')->assertOk()
            ->assertJsonPath('date', '2026-10-04')->assertJsonCount(1, 'schedules')
            ->assertJsonPath('scheduler_timeline.past_count', 2)
            ->assertJsonPath('scheduler_timeline.upcoming_count', 1)
            ->assertJsonPath('scheduler_timeline.past.0.schedule_id', $due->id)
            ->assertJsonPath('scheduler_timeline.past.0.status', 'queued')
            ->assertJsonPath('scheduler_timeline.past.1.schedule_id', $past->id)
            ->assertJsonPath('scheduler_timeline.upcoming.0.schedule_id', $future->id);
        $this->getJson('/api/schedules/today?date=2026-10-05')->assertOk()->assertJsonCount(1, 'schedules')
            ->assertJsonPath('scheduler_timeline.past_count', 2)->assertJsonPath('scheduler_timeline.upcoming_count', 1);
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

    public function test_device_labels_can_be_edited_by_owner_and_survive_automatic_registration(): void
    {
        $user = $this->user();
        $device = $this->device($user);
        $device->update(['device_name' => 'web • Chrome Test']);
        $url = '/api/push/devices/'.$device->id;

        $this->actingAs($user)->patchJson($url, ['device_label' => 'HP Admin'])->assertOk()
            ->assertJsonPath('device.device_label', 'HP Admin')
            ->assertJsonPath('device.device_name', 'web • Chrome Test')
            ->assertJsonMissing(['fcm_token' => 'test-device-token']);
        $this->postJson('/api/push/devices', ['fcm_token' => 'test-device-token', 'platform' => 'web', 'device_name' => 'web • Chrome Test'])
            ->assertCreated()->assertJsonPath('device.device_label', 'HP Admin');
        $this->assertDatabaseCount('push_devices', 1);
        $this->getJson('/api/schedules/today')->assertOk()->assertJsonPath('devices.0.device_label', 'HP Admin');
        foreach (['', '   ', str_repeat('x', 256)] as $invalid) {
            $this->patchJson($url, ['device_label' => $invalid])->assertUnprocessable();
        }
        $this->actingAs($this->user('cs'))->patchJson($url, ['device_label' => 'Other'])->assertNotFound();
        $this->assertSame('HP Admin', $device->fresh()->device_label);
        $this->assertSame('web • Chrome Test', $device->fresh()->device_name);
        $this->postJson('/api/push/devices', ['fcm_token' => 'test-device-token', 'platform' => 'web'])
            ->assertCreated()->assertJsonPath('device.user_id', auth()->id());
        $this->assertNull($device->fresh()->device_label);
    }

    public function test_admin_can_edit_and_disable_devices_owned_by_other_accounts(): void
    {
        $admin = $this->user();
        $ownDevice = $this->device($admin, 'admin-management-token');
        foreach (['admin', 'cs', 'terapis'] as $role) {
            $owner = $this->user($role);
            $device = $this->device($owner, 'managed-'.$role);
            $url = '/api/push/devices/'.$device->id;

            $this->actingAs($admin)->withSession(['push_device_id' => $ownDevice->id])
                ->patchJson($url, ['device_label' => 'HP '.$role])->assertOk()
                ->assertJsonPath('device.device_label', 'HP '.$role)
                ->assertJsonPath('device.user_id', $owner->id)
                ->assertJsonMissing(['fcm_token' => 'managed-'.$role]);
            $this->patchJson($url, ['device_label' => ''])->assertUnprocessable();
            $this->deleteJson($url)->assertNoContent()->assertSessionHas('push_device_id', $ownDevice->id);
            $this->assertDatabaseMissing('push_devices', ['id' => $device->id]);
        }
        $this->assertDatabaseHas('push_devices', ['id' => $ownDevice->id, 'user_id' => $admin->id]);
    }

    public function test_non_admin_cannot_edit_or_disable_another_accounts_device(): void
    {
        $device = $this->device($this->user(), 'protected-device');
        $url = '/api/push/devices/'.$device->id;
        foreach (['cs', 'terapis'] as $role) {
            $this->actingAs($this->user($role))->patchJson($url, ['device_label' => 'Unauthorized'])->assertNotFound();
            $this->deleteJson($url)->assertNotFound();
        }
        $this->assertNull($device->fresh()->device_label);
        $this->assertDatabaseHas('push_devices', ['id' => $device->id]);
    }

    public function test_push_history_keeps_device_name_and_label_after_edit_and_deletion(): void
    {
        $user = $this->user();
        $receiverName = $user->name;
        $device = $this->device($user);
        $device->update(['device_name' => 'web • Chrome Test', 'device_label' => 'Laptop CS']);
        Http::fake(['fcm.googleapis.com/*' => Http::response(['name' => 'projects/test-project/messages/labels'])]);
        $this->actingAs($user)->postJson('/api/notifications/test-now', ['device_id' => $device->id])->assertOk();
        $this->patchJson('/api/push/devices/'.$device->id, ['device_label' => 'Laptop Admin'])->assertOk();
        $this->postJson('/api/notifications/test-now', ['device_id' => $device->id])->assertOk();
        $this->deleteJson('/api/push/devices/'.$device->id)->assertNoContent();
        $user->update(['name' => 'Nama baru']);

        foreach (['Laptop CS', 'Laptop Admin'] as $label) {
            $this->assertDatabaseHas('push_logs', [
                'user_id' => $user->id, 'device_name' => 'web • Chrome Test',
                'device_label' => $label, 'push_device_id' => null, 'status' => 'success',
                'receiver_user_id' => $user->id, 'receiver_user_name' => $receiverName,
            ]);
        }
        $labels = $this->getJson('/api/notifications/logs')->assertOk()->json('data');
        $this->assertEqualsCanonicalizing(['Laptop CS', 'Laptop Admin'], array_column($labels, 'device_label'));
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

    private function therapist(string $name): User
    {
        $employee = Employee::create(['name' => $name, 'nohp' => '0800000000', 'title' => 'Terapis']);
        $user = $this->user('terapis');
        $user->update(['employee_id' => $employee->id]);

        return $user;
    }

    public function test_selected_therapist_device_filters_daily_schedules_and_timeline_while_admin_sees_all(): void
    {
        $admin = $this->user();
        $adminDevice = $this->device($admin, 'admin-filter-token');
        $csDevice = $this->device($this->user('cs'), 'cs-filter-token');
        $therapist = $this->therapist('Yuni');
        $therapistDevice = $this->device($therapist, 'therapist-filter-token');
        $unlinkedDevice = $this->device($this->user('terapis'), 'unlinked-filter-token');
        $tagged = $this->schedule();
        $other = $this->schedule();
        $tomorrow = $this->schedule(['schedule_date' => '2026-10-05']);
        foreach ([$tagged, $tomorrow] as $schedule) {
            foreach ([1, 2] as $guest) {
                $schedule->items()->create(['employee_id' => $therapist->employee_id, 'guest_index' => $guest,
                    'package_name' => 'Pijat', 'package_duration' => '60', 'price' => 100000]);
            }
        }
        $this->actingAs($admin)->getJson('/api/schedules/today?device_id='.$therapistDevice->id)->assertOk()
            ->assertJsonCount(1, 'schedules')->assertJsonPath('schedules.0.id', $tagged->id)
            ->assertJsonPath('scheduler_timeline.upcoming_count', 2)->assertJsonCount(4, 'devices');
        $this->getJson('/api/schedules/today?device_id='.$therapistDevice->id.'&date=2026-10-05')->assertOk()
            ->assertJsonCount(1, 'schedules')->assertJsonPath('schedules.0.id', $tomorrow->id);
        foreach ([$adminDevice, $csDevice] as $device) {
            $this->getJson('/api/schedules/today?device_id='.$device->id)->assertOk()
                ->assertJsonCount(2, 'schedules')->assertJsonPath('scheduler_timeline.upcoming_count', 3);
        }
        $this->getJson('/api/schedules/today?device_id='.$unlinkedDevice->id)->assertOk()
            ->assertJsonCount(0, 'schedules')->assertJsonPath('scheduler_timeline.upcoming_count', 0);
        $therapistDevice->delete();
        $this->getJson('/api/schedules/today?device_id='.$therapistDevice->id)->assertOk()
            ->assertJsonCount(0, 'schedules')->assertJsonCount(3, 'devices');
        $this->getJson('/api/schedules/today?device_id=invalid')->assertUnprocessable();
    }

    public function test_scheduled_reminder_reaches_admin_cs_and_only_tagged_therapists(): void
    {
        $admin = $this->user();
        $cs = $this->user('cs');
        $sari = $this->therapist('Sari');
        $dewi = $this->therapist('Dewi');
        $untagged = $this->therapist('Other');
        foreach ([$admin, $cs, $sari, $dewi, $untagged] as $user) {
            $this->device($user, 'recipient-'.$user->id);
        }
        $schedule = $this->schedule();
        foreach ([$sari, $sari, $dewi] as $user) {
            $schedule->items()->create(['employee_id' => $user->employee_id, 'guest_index' => 1,
                'package_name' => 'Pijat', 'package_duration' => '60', 'price' => 100000]);
        }
        $notifications = ScheduleNotification::where('schedule_id', $schedule->id)->get();
        $this->assertEqualsCanonicalizing([$admin->id, $cs->id, $sari->id, $dewi->id], $notifications->pluck('user_id')->all());
        $this->travelTo($notifications->first()->notify_at);
        Http::fake(['fcm.googleapis.com/*' => Http::response(['name' => 'messages/tagged-reminder'])]);
        $this->artisan('push:dispatch-due')->assertSuccessful();
        $this->artisan('queue:work', ['connection' => 'database', '--queue' => 'push', '--stop-when-empty' => true, '--sleep' => 0])->assertSuccessful();
        Http::assertSentCount(4);
        Http::assertNotSent(fn ($request) => $request['message']['token'] === 'recipient-'.$untagged->id);
        Http::assertSent(fn ($request) => $request['message']['token'] === 'recipient-'.$admin->id
            && $request['message']['data']['url'] === '/admin/scheduler/'.$schedule->id);
        Http::assertSent(fn ($request) => $request['message']['token'] === 'recipient-'.$sari->id
            && $request['message']['data']['url'] === '/admin/scheduler/'.$schedule->id);
        $this->actingAs($sari)->getJson('/api/notifications/received')->assertOk()->assertJsonPath('total', 1);
        $this->actingAs($untagged)->getJson('/api/notifications/received')->assertOk()->assertJsonPath('total', 0);
    }

    public function test_changing_and_removing_therapist_tags_cancels_old_jobs_and_preserves_admin_reminders(): void
    {
        $admin = $this->user();
        $old = $this->therapist('Old');
        $new = $this->therapist('New');
        $this->device($old, 'old-assignment-token');
        $this->device($new, 'new-assignment-token');
        $schedule = $this->schedule();
        $item = $schedule->items()->create(['employee_id' => $old->employee_id, 'guest_index' => 1,
            'package_name' => 'Pijat', 'package_duration' => '60', 'price' => 100000]);
        $adminNotification = ScheduleNotification::where('user_id', $admin->id)->firstOrFail();
        $this->actingAs($admin)->patchJson('/api/schedules/'.$schedule->id.'/notification', ['notify_before_minutes' => 120])->assertOk();
        $oldNotification = ScheduleNotification::where('user_id', $old->id)->firstOrFail();
        $oldNotification->update(['status' => 'queued']);
        $oldRevision = $oldNotification->revision;
        $this->patch('/admin/transaction/'.$schedule->id, ['items' => [
            ['id' => $item->id, 'employee_id' => $new->employee_id, 'package_name' => 'Pijat', 'package_duration' => '60', 'price' => 100000],
        ]])->assertRedirect();
        $this->assertSame('cancelled', $oldNotification->fresh()->status);
        $this->assertSame(120, $adminNotification->fresh()->notify_before_minutes);
        $newNotification = ScheduleNotification::where('user_id', $new->id)->firstOrFail();
        $this->assertSame('pending', $newNotification->status);
        (new SendScheduleNotification($oldNotification->id, $oldRevision))->handle(app(FcmService::class), app(ScheduleReminderService::class));
        Http::assertNothingSent();
        $this->patch('/admin/transaction-items/'.$item->id, ['employee_id' => $old->employee_id])->assertRedirect();
        $this->assertGreaterThan($oldRevision, $oldNotification->fresh()->revision);
        $this->assertSame('pending', $oldNotification->fresh()->status);
        $this->assertSame('cancelled', $newNotification->fresh()->status);
        $item->refresh()->delete();
        $this->assertSame('cancelled', $oldNotification->fresh()->status);
        $this->assertSame('pending', $adminNotification->fresh()->status);
    }

    public function test_worker_rechecks_therapist_tag_and_activation_backfills_only_assigned_schedules(): void
    {
        $admin = $this->user();
        $therapist = $this->therapist('Sari');
        $device = $this->device($therapist, 'backfill-therapist-token');
        $assigned = $this->schedule();
        $unassigned = $this->schedule();
        $item = $assigned->items()->create(['employee_id' => $therapist->employee_id, 'guest_index' => 1,
            'package_name' => 'Pijat', 'package_duration' => '60', 'price' => 100000]);
        ScheduleNotification::where('user_id', $therapist->id)->delete();
        $this->actingAs($therapist)->postJson('/api/push/devices', ['fcm_token' => 'backfill-therapist-token', 'platform' => 'web'])->assertCreated();
        $notification = ScheduleNotification::where('user_id', $therapist->id)->firstOrFail();
        $this->assertSame($assigned->id, $notification->schedule_id);
        $this->assertDatabaseMissing('schedule_notifications', ['user_id' => $therapist->id, 'schedule_id' => $unassigned->id]);
        $notification->update(['status' => 'queued']);
        // Simulate assignment updates that bypass model events while a job is already queued.
        \App\Models\TransactionItem::whereKey($item->id)->update(['employee_id' => null]);
        (new SendScheduleNotification($notification->id, $notification->revision))->handle(app(FcmService::class), app(ScheduleReminderService::class));
        Http::assertNothingSent();
        $this->assertSame('cancelled', $notification->fresh()->status);
        $this->actingAs($admin)->postJson('/api/notifications/test-now', ['device_id' => $device->id, 'schedule_id' => $assigned->id])->assertNotFound();
    }

    public function test_therapist_can_activate_and_manage_only_their_devices_without_admin_reminders(): void
    {
        $admin = $this->user();
        $adminDevice = $this->device($admin, 'admin-activation-token');
        $therapist = $this->user('terapis');
        $this->schedule();
        $response = $this->actingAs($therapist)->postJson('/api/push/devices', [
            'fcm_token' => 'therapist-token', 'platform' => 'android', 'device_label' => 'HP Sari',
        ])->assertCreated()->assertJsonPath('device.device_label', 'HP Sari');
        $id = $response->json('device.id');
        $this->assertDatabaseMissing('schedule_notifications', ['user_id' => $therapist->id]);
        $this->getJson('/api/push/devices')->assertOk()->assertJsonPath('total', 1)->assertJsonPath('data.0.id', $id);
        $this->patchJson('/api/push/devices/'.$id, ['device_label' => 'HP Baru'])->assertOk();
        $this->deleteJson('/api/push/devices/'.$adminDevice->id)->assertNotFound();
        $this->patchJson('/api/push/devices/'.$adminDevice->id, ['device_label' => 'Other'])->assertNotFound();
        $this->getJson('/api/schedules/today')->assertForbidden();
        $this->postJson('/api/notifications/test-now', ['device_id' => $id])->assertForbidden();
        $this->deleteJson('/api/push/devices/'.$id)->assertNoContent();
        $this->getJson('/api/push/devices')->assertOk()->assertJsonPath('total', 0);
    }

    public function test_therapist_history_is_scoped_to_receiver_and_survives_device_deactivation(): void
    {
        $admin = $this->user();
        $therapist = $this->user('terapis');
        $other = $this->user('terapis');
        $device = $this->device($therapist, 'therapist-history-token');
        $device->update(['device_label' => 'HP Sari']);
        $otherDevice = $this->device($other, 'other-therapist-token');
        Http::fake(['fcm.googleapis.com/*' => Http::response(['name' => 'messages/therapist-test'])]);
        $this->actingAs($admin)->postJson('/api/notifications/test-now', ['device_id' => $device->id])->assertOk();
        Http::assertSent(fn ($request) => $request['message']['data']['url'] === '/terapis/notifikasi');
        $this->postJson('/api/notifications/test-now', ['device_id' => $otherDevice->id])->assertOk();
        $logService = app(\App\Services\PushLogService::class);
        for ($i = 0; $i < 10; $i++) {
            $log = $logService->start($admin->id, 'test', ['title' => 'Notification '.$i, 'body' => 'Pesan'], $device);
            $log->update(['status' => 'success']);
        }
        $logService->start($admin->id, 'test', ['title' => 'Pending', 'body' => 'Hidden'], $device);
        $failed = $logService->start($admin->id, 'test', ['title' => 'Failed', 'body' => 'Hidden'], $device);
        $logService->fail($failed, 'SEND_ERROR', 'Gagal');
        $this->actingAs($therapist)->deleteJson('/api/push/devices/'.$device->id)->assertNoContent();
        $this->getJson('/api/notifications/received')->assertOk()->assertJsonPath('total', 11)
            ->assertJsonCount(10, 'data')->assertJsonPath('data.0.device_label', 'HP Sari')
            ->assertJsonMissing(['body' => 'Hidden'])->assertJsonMissing(['fcm_token' => 'therapist-history-token']);
        $this->getJson('/api/notifications/received?page=2')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/notifications/received?page=0')->assertUnprocessable();
        $this->actingAs($other)->getJson('/api/notifications/received')->assertOk()->assertJsonPath('total', 1);
    }

    public function test_therapist_notification_page_and_apis_require_active_therapist(): void
    {
        $this->get('/terapis/notifikasi')->assertRedirect('/login');
        $therapist = $this->user('terapis');
        $this->actingAs($therapist)->get('/terapis/notifikasi')->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Therapist/Notifications'));
        $therapist->update(['is_active' => false]);
        $this->get('/terapis/notifikasi')->assertForbidden();
        $this->getJson('/api/notifications/received')->assertForbidden();
        $this->getJson('/api/push/devices')->assertForbidden();
        foreach (['admin', 'cs', 'marketing'] as $role) {
            $this->actingAs($this->user($role))->get('/terapis/notifikasi')->assertForbidden();
            $this->getJson('/api/notifications/received')->assertForbidden();
        }
    }

    public function test_active_device_list_is_paginated_and_keeps_all_test_options(): void
    {
        $user = $this->user();
        $devices = [];
        for ($i = 0; $i < 12; $i++) {
            $devices[] = $this->device($user, 'pagination-token-'.$i);
        }
        $inactive = $this->user('cs');
        $inactive->update(['is_active' => false]);
        $this->device($inactive, 'inactive-pagination-token');

        $first = $this->actingAs($user)->getJson('/api/schedules/today')->assertOk()
            ->assertJsonCount(12, 'devices')->assertJsonCount(10, 'active_devices.data')
            ->assertJsonPath('active_devices.total', 12)->assertJsonPath('active_devices.last_page', 2);
        $second = $this->getJson('/api/schedules/today?device_page=2')->assertOk()
            ->assertJsonCount(12, 'devices')->assertJsonCount(2, 'active_devices.data')
            ->assertJsonPath('active_devices.current_page', 2);
        $this->assertEqualsCanonicalizing(array_map(fn ($device) => $device->id, $devices),
            array_merge(array_column($first->json('active_devices.data'), 'id'), array_column($second->json('active_devices.data'), 'id')));
        foreach ($second->json('active_devices.data') as $device) {
            $this->deleteJson('/api/push/devices/'.$device['id'])->assertNoContent();
        }
        $this->getJson('/api/schedules/today?device_page=2')->assertOk()
            ->assertJsonPath('active_devices.current_page', 1)->assertJsonPath('active_devices.total', 10);
        $this->getJson('/api/schedules/today?device_page=0')->assertUnprocessable();
    }

    public function test_daily_devices_include_all_active_accounts_and_hide_disabled_devices(): void
    {
        $user = $this->user();
        $own = $this->device($user);
        $other = $this->device($this->user('cs'), 'active-cs-token');
        $inactiveUser = $this->user('cs');
        $inactiveUser->update(['is_active' => false]);
        $inactive = $this->device($inactiveUser, 'inactive-token');
        $ineligible = $this->device($this->user('marketing'), 'marketing-token');
        $disabled = $this->device($user, 'disabled-token');
        $this->actingAs($user)->deleteJson('/api/push/devices/'.$disabled->id)->assertNoContent();

        $response = $this->getJson('/api/schedules/today')->assertOk()->assertJsonCount(2, 'devices');
        $this->assertEqualsCanonicalizing([$own->id, $other->id], array_column($response->json('devices'), 'id'));
        $response->assertJsonMissing(['fcm_token' => 'active-cs-token'])
            ->assertJsonMissing(['token_hash' => $other->token_hash]);
        foreach ([$inactive, $ineligible, $disabled] as $device) {
            $this->postJson('/api/notifications/test-now', ['device_id' => $device->id])->assertNotFound();
        }
        Http::assertNothingSent();
    }

    public function test_send_now_uses_only_selected_active_device_without_creating_queue_jobs(): void
    {
        $user = $this->user();
        $device = $this->device($user);
        $otherDevice = $this->device($this->user('cs'), 'other-token');
        Http::fake(['fcm.googleapis.com/*' => Http::response(['name' => 'projects/test-project/messages/direct'])]);
        $this->actingAs($user)->postJson('/api/notifications/test-now', ['device_id' => $otherDevice->id])->assertOk()->assertJsonPath('fcm_message_id', 'projects/test-project/messages/direct');
        $this->assertDatabaseCount('jobs', 0);
        Http::assertSentCount(1);
        Http::assertSent(fn ($request) => $request['message']['token'] === 'other-token');
        $this->getJson('/api/notifications/logs')->assertOk()
            ->assertJsonPath('data.0.receiver_user_id', $otherDevice->user_id)
            ->assertJsonPath('data.0.receiver_user_name', $otherDevice->user->name);
        $this->postJson('/api/notifications/test-schedule', ['delay_minutes' => 0])->assertUnprocessable();
    }

    public function test_transaction_push_matches_preview_and_preserves_the_reminder(): void
    {
        $user = $this->user();
        $device = $this->device($user);
        $otherDevice = $this->device($this->user('cs'), 'other-token');
        $schedule = $this->schedule(['order_number' => 'INV-123', 'customer_name' => 'Budi', 'schedule_time' => '22.30']);
        $otherDevice->user->update(['is_active' => false]);
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
        $expected = "Nama Customer: Budi\nJadwal: 4 Oktober 2026, 22.30\nTerapis: Sari, Dewi";
        Http::fake(['fcm.googleapis.com/*' => Http::response(['name' => 'messages/transaction-test'])]);
        $this->actingAs($user)->getJson('/api/schedules/today?date=2026-10-04')->assertOk()
            ->assertJsonPath('schedules.0.push_message', $expected);
        $this->postJson('/api/notifications/test-now', ['device_id' => $otherDevice->id, 'schedule_id' => $schedule->id])->assertNotFound();
        $this->postJson('/api/notifications/test-now', ['device_id' => $device->id, 'schedule_id' => 999999])->assertUnprocessable();
        Http::assertNothingSent();
        $this->postJson('/api/notifications/test-now', ['device_id' => $device->id, 'schedule_id' => $schedule->id])->assertOk();
        Http::assertSentCount(1);
        Http::assertSent(fn ($request) => $request['message']['token'] === 'test-device-token'
            && $request['message']['data']['title'] === 'REMINDER! (Hari ini 22.30)'
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

    public function test_reminder_day_label_uses_the_schedule_date_and_local_day_at_send_time(): void
    {
        $reminders = app(ScheduleReminderService::class);
        $schedule = $this->schedule(['schedule_date' => '2026-10-05', 'schedule_time' => '13:00']);
        $this->assertSame('REMINDER! (Besok 13.00)', $reminders->message($schedule)['title']);
        $this->assertSame("Nama Customer: Test Customer\nJadwal: 5 Oktober 2026, 13.00\nTerapis: Belum ditentukan", $reminders->message($schedule)['body']);

        // UTC is still October 4, but Jakarta has crossed midnight into October 5.
        $this->travelTo(Carbon::parse('2026-10-04 17:01:00', 'UTC'));
        $this->assertSame('REMINDER! (Hari ini 13.00)', $reminders->message($schedule)['title']);
        $schedule->schedule_date = '2026-10-06';
        $this->assertSame('REMINDER! (Besok 13.00)', $reminders->message($schedule)['title']);
        $schedule->schedule_date = '2026-10-07';
        $this->assertSame('REMINDER! (7 Okt 2026 13.00)', $reminders->message($schedule)['title']);
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

    public function test_tagged_therapist_can_access_schedule_detail_with_own_reminder_only(): void
    {
        $admin = $this->user();
        $therapist = $this->therapist('Yuni');
        $other = $this->therapist('Other');
        $schedule = $this->schedule();
        $item = $schedule->items()->create(['employee_id' => $therapist->employee_id,
            'package_name' => 'Pijat', 'package_duration' => '60', 'price' => 100000]);
        app(ScheduleReminderService::class)->forUser($schedule, $admin, 30);
        $this->actingAs($therapist)->get('/admin/scheduler/'.$schedule->id)->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Scheduler/Show')
                ->where('schedule.id', $schedule->id)->where('reminder.notify_before_minutes', 360));
        $this->actingAs($other)->get('/admin/scheduler/'.$schedule->id)->assertForbidden();
        $therapist->update(['is_active' => false]);
        $this->actingAs($therapist)->get('/admin/scheduler/'.$schedule->id)->assertForbidden();
        $therapist->update(['is_active' => true]);
        $item->update(['employee_id' => $other->employee_id]);
        $this->get('/admin/scheduler/'.$schedule->id)->assertForbidden();
        $this->actingAs($other)->get('/admin/scheduler/'.$schedule->id)->assertOk();
        $this->actingAs($admin)->get('/admin/scheduler/'.$schedule->id)->assertOk();
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

    public function test_scheduler_failures_and_retries_are_logged_separately_and_missing_devices_are_skipped(): void
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
        $this->assertDatabaseCount('push_logs', 2);
        $this->assertSame('cancelled', $notification->fresh()->status);
        Http::assertSentCount(2);
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
        Http::assertSent(fn ($request) => $request['message']['data']['title'] === 'REMINDER! (Hari ini 22.00)'
            && $request['message']['data']['body'] === "Nama Customer: Test Customer\nJadwal: 4 Oktober 2026, 22.00\nTerapis: Belum ditentukan");
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
