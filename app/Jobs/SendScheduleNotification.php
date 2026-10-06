<?php

namespace App\Jobs;

use App\Exceptions\FcmException;
use App\Models\PushDelivery;
use App\Models\PushDevice;
use App\Models\ScheduleNotification;
use App\Services\FcmService;
use App\Services\PushLogService;
use App\Services\ScheduleReminderService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;

class SendScheduleNotification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 60;

    public function __construct(public int $notificationId, public int $revision)
    {
        $this->onConnection('database')->onQueue('push');
    }

    public function backoff(): array
    {
        return [30, 120];
    }

    public function middleware(): array
    {
        return [(new WithoutOverlapping('push:'.$this->notificationId))->releaseAfter(15)->expireAfter(120)];
    }

    public function handle(FcmService $fcm, ScheduleReminderService $reminders): void
    {
        $notification = ScheduleNotification::with(['user', 'schedule'])->find($this->notificationId);
        if (! $notification || $notification->revision !== $this->revision || $notification->status !== 'queued') {
            return;
        }
        if (! $notification->user?->is_active || ! in_array($notification->user->role, ['admin', 'cs', 'terapis'], true)
            || (! $notification->is_test && (! $notification->schedule
                || in_array($notification->schedule->status, ['success', 'failed'], true)
                || $reminders->scheduleAt($notification->schedule)->isPast()
                || ! $reminders->isRecipient($notification->schedule, $notification->user)))) {
            $notification->update(['status' => 'cancelled']);

            return;
        }
        $schedule = $notification->schedule;
        $data = [
            'url' => route('admin.scheduler.index', [], false),
            ...($notification->is_test ? [
                'title' => 'Test Scheduler',
                'body' => 'Pipeline scheduler → queue → FCM berhasil.',
            ] : $reminders->message($schedule)),
            'notification_id' => (string) $notification->id,
            'tag' => 'schedule-'.$notification->id.'-'.$this->revision,
        ];
        if ($notification->user->role === 'terapis' && $notification->is_test) {
            $data['url'] = route('admin.therapist_user.notifications', [], false);
        }
        $retry = null;
        foreach (PushDevice::where('user_id', $notification->user_id)->get() as $device) {
            DB::transaction(function () use ($device, $fcm, $data, $schedule, $reminders, &$retry) {
                // Edits/deletion cannot race an individual FCM send. Successful devices are persisted before retry.
                $current = ScheduleNotification::whereKey($this->notificationId)->lockForUpdate()->first();
                if (! $current || $current->revision !== $this->revision || $current->status !== 'queued') {
                    return;
                }
                if (! $current->user?->is_active || (! $current->is_test && (! $current->schedule
                    || ! $reminders->isRecipient($current->schedule, $current->user)))) {
                    $current->update(['status' => 'cancelled']);
                    return;
                }
                $device = PushDevice::whereKey($device->id)->where('user_id', $current->user_id)->lockForUpdate()->first();
                if (! $device) {
                    return;
                }
                $delivery = PushDelivery::firstOrCreate([
                    'schedule_notification_id' => $current->id,
                    'push_device_id' => $device->id,
                    'revision' => $this->revision,
                ]);
                if (in_array($delivery->status, ['sent', 'failed'], true)) {
                    return;
                }
                $logs = app(PushLogService::class);
                $log = $logs->start($current->user_id, $current->is_test ? 'test' : 'scheduler', $data, $device, $schedule, $current);
                try {
                    $id = $logs->send($fcm, $log, $device, $data);
                    $delivery->update(['status' => 'sent', 'fcm_message_id' => $id, 'sent_at' => now('UTC'), 'error_message' => null]);
                } catch (FcmException $e) {
                    if ($e->fcmCode === 'UNREGISTERED') {
                        $device->delete();
                    } else {
                        $delivery->update(['status' => $e->retryable ? 'pending' : 'failed', 'error_message' => $e->getMessage()]);
                    }
                    if ($e->retryable) {
                        $retry = $e;
                    }
                } catch (Throwable $e) {
                    $delivery->update(['error_message' => 'FCM tidak dapat dihubungi atau konfigurasi tidak valid.']);
                    $retry = new RuntimeException('FCM tidak dapat dihubungi atau konfigurasi tidak valid.');
                }
            });
        }
        if ($retry) {
            ScheduleNotification::whereKey($this->notificationId)->where('revision', $this->revision)
                ->where('status', 'queued')->update(['error_message' => $retry->getMessage()]);
            throw $retry;
        }
        DB::transaction(function () use ($data, $schedule) {
            $current = ScheduleNotification::whereKey($this->notificationId)->lockForUpdate()->first();
            if (! $current || $current->revision !== $this->revision || $current->status !== 'queued') {
                return;
            }
            $deliveries = PushDelivery::where('schedule_notification_id', $current->id)->where('revision', $this->revision)->get();
            $sent = $deliveries->where('status', 'sent');
            $failed = $deliveries->where('status', 'failed');
            if ($deliveries->isEmpty() && ! \App\Models\PushLog::where('schedule_notification_id', $current->id)->where('revision', $this->revision)->exists()) {
                $logs = app(PushLogService::class);
                $log = $logs->start($current->user_id, $current->is_test ? 'test' : 'scheduler', $data, null, $schedule, $current);
                $logs->fail($log, 'NO_DEVICE', 'Tidak ada device aktif untuk menerima notifikasi.');
            }
            $current->update([
                'status' => $sent->isEmpty() ? 'failed' : ($failed->isEmpty() ? 'sent' : 'partial'),
                'sent_at' => $sent->isEmpty() ? null : now('UTC'),
                'fcm_message_id' => $sent->isEmpty() ? null : $sent->pluck('fcm_message_id')->implode(','),
                'error_message' => $sent->isEmpty() ? 'Tidak ada device aktif atau semua pengiriman gagal.'
                    : ($failed->isEmpty() ? null : 'Sebagian device gagal menerima push.'),
            ]);
        });
    }

    public function failed(?Throwable $exception): void
    {
        DB::transaction(function () use ($exception) {
            $current = ScheduleNotification::whereKey($this->notificationId)->where('revision', $this->revision)
                ->where('status', 'queued')->lockForUpdate()->first();
            if (! $current) {
                return;
            }
            $logs = app(PushLogService::class);
            $detail = $exception ? $logs->error($exception)[1] : 'Worker berhenti sebelum pengiriman selesai.';
            $message = 'Pengiriman gagal setelah retry. '.($current->error_message ?: $detail);
            $current->update(['status' => 'failed', 'error_message' => $message]);
            $log = $logs->start($current->user_id, $current->is_test ? 'test' : 'scheduler', [
                'title' => 'Pengiriman berhenti',
                'body' => $current->schedule ? $current->schedule->order_number.' - '.$current->schedule->customer_name : 'Tes Scheduler',
            ], null, $current->schedule, $current);
            $logs->fail($log, 'QUEUE_FAILED', $message);
        });
    }
}
