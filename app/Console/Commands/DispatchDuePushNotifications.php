<?php

namespace App\Console\Commands;

use App\Jobs\SendScheduleNotification;
use App\Models\ScheduleNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DispatchDuePushNotifications extends Command
{
    protected $signature = 'push:dispatch-due';

    protected $description = 'Queue pending push reminders due in UTC';

    public function handle(): int
    {
        // Restore jobs stranded by worker crashes; delivery records protect successful devices.
        ScheduleNotification::where('status', 'queued')->where('updated_at', '<', now('UTC')->subMinutes(15))
            ->update(['status' => 'pending', 'updated_at' => now('UTC')]);
        $count = 0;
        ScheduleNotification::where('status', 'pending')->where('notify_at', '<=', now('UTC'))
            ->chunkById(100, function ($notifications) use (&$count) {
                foreach ($notifications as $notification) {
                    DB::transaction(function () use ($notification, &$count) {
                        $current = ScheduleNotification::whereKey($notification->id)->lockForUpdate()->first();
                        if (! $current || $current->status !== 'pending' || $current->notify_at->isFuture()) {
                            return;
                        }
                        $current->update(['status' => 'queued']);
                        // Database queue insert and status claim commit together (same DB connection).
                        SendScheduleNotification::dispatch($current->id, $current->revision)->beforeCommit();
                        $count++;
                    });
                }
            });
        $this->info("Queued {$count} push notifications.");

        return self::SUCCESS;
    }
}
