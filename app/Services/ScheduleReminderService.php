<?php

namespace App\Services;

use App\Models\ScheduleNotification;
use App\Models\Transaction;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class ScheduleReminderService
{
    public function message(Transaction $schedule): array
    {
        $schedule->loadMissing('items.employee');
        $therapists = $schedule->items->map(fn ($item) => $item->employee?->name ?: $item->employee?->fullname)
            ->filter()->unique()->implode(', ');
        $scheduledAt = $this->scheduleAt($schedule)->setTimezone(config('push.timezone'))->locale('id');
        $today = CarbonImmutable::now(config('push.timezone'))->startOfDay();
        $dayLabel = match (true) {
            $scheduledAt->isSameDay($today) => 'Hari ini',
            $scheduledAt->isSameDay($today->addDay()) => 'Besok',
            default => $scheduledAt->translatedFormat('j M Y'),
        };
        $time = $scheduledAt->format('H.i');

        return [
            'url' => route('admin.scheduler.show', $schedule->id, false),
            'title' => 'REMINDER! ('.$dayLabel.' '.$time.')',
            'body' => 'Nama Customer: '.$schedule->customer_name."\n"
                .'Jadwal: '.$scheduledAt->translatedFormat('j F Y').', '.$time."\n"
                .'Terapis: '.($therapists ?: 'Belum ditentukan'),
        ];
    }

    public function scheduleAt(Transaction $schedule): CarbonImmutable
    {
        $time = str_replace('.', ':', $schedule->schedule_time);

        return CarbonImmutable::parse(substr($schedule->schedule_date, 0, 10).' '.$time, config('push.timezone'))->utc();
    }

    public function sync(Transaction $schedule): void
    {
        if (in_array($schedule->status, ['success', 'failed'], true)) {
            ScheduleNotification::where('schedule_id', $schedule->id)
                ->whereIn('status', ['pending', 'queued'])->update(['status' => 'cancelled', 'updated_at' => now()]);

            return;
        }
        User::whereIn('role', ['admin', 'cs'])->where('is_active', true)->each(function ($user) use ($schedule) {
            $this->forUser($schedule, $user);
        });
    }

    public function forUser(Transaction $schedule, User $user, ?int $minutes = null): ScheduleNotification
    {
        return DB::transaction(function () use ($schedule, $user, $minutes) {
            // Serialize creation and edits per transaction, including concurrent API requests.
            $schedule = Transaction::whereKey($schedule->id)->lockForUpdate()->firstOrFail();
            $notification = ScheduleNotification::firstOrNew(['schedule_id' => $schedule->id, 'user_id' => $user->id]);
            $before = $minutes ?? $notification->notify_before_minutes ?? 360;
            $at = $this->scheduleAt($schedule)->subMinutes($before);
            $active = ! in_array($schedule->status, ['success', 'failed'], true);
            if (! $notification->exists || ! $notification->notify_at->equalTo($at)
                || $notification->notify_before_minutes !== $before || ($active && $notification->status === 'cancelled')) {
                $notification->fill([
                    'notify_before_minutes' => $before, 'notify_at' => $at,
                    'status' => $active && $this->scheduleAt($schedule)->isFuture() ? 'pending' : 'cancelled',
                    'sent_at' => null, 'fcm_message_id' => null, 'error_message' => null,
                    'revision' => $notification->exists ? $notification->revision + 1 : 1,
                ])->save();
            }

            return $notification;
        });
    }

    public function backfill(?User $user = null): void
    {
        Transaction::where('schedule_date', '>=', now(config('push.timezone'))->toDateString())
            ->whereNotIn('status', ['success', 'failed'])->each(function ($schedule) use ($user) {
                if ($user) {
                    $this->forUser($schedule, $user);
                } else {
                    $this->sync($schedule);
                }
            });
    }
}
