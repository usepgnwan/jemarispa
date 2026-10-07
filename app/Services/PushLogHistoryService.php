<?php

namespace App\Services;

use App\Models\PushLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PushLogHistoryService
{
    public function paginate(Builder $query, ?string $status = null)
    {
        $query = (clone $query)->where(fn ($logs) => $logs->whereNull('error_code')->orWhere('error_code', '!=', 'NO_DEVICE'))
            ->where(fn ($logs) => $logs->whereNotNull('push_device_id')->orWhereNotNull('device_name')
                ->orWhereNotNull('device_label')->orWhereNotNull('fcm_message_id'));
        // Scheduler jobs are per account; combine their device attempts for the same reminder.
        $key = "CASE WHEN type = 'scheduler' AND schedule_id IS NOT NULL THEN 'schedule:' || CAST(schedule_id AS VARCHAR) || ':' || COALESCE(CAST(revision AS VARCHAR), '') || ':' || COALESCE(CAST(notify_before_minutes AS VARCHAR), '') WHEN type = 'test' AND schedule_notification_id IS NOT NULL THEN 'test:' || CAST(schedule_notification_id AS VARCHAR) || ':' || COALESCE(CAST(revision AS VARCHAR), '') ELSE 'log:' || CAST(id AS VARCHAR) END";
        $attempts = (clone $query)->select('push_logs.*')->selectRaw("$key AS group_key");
        $ranked = DB::query()->fromSub($attempts, 'attempts')->select('attempts.*')->selectRaw(
            'ROW_NUMBER() OVER (PARTITION BY group_key, COALESCE(receiver_user_id, user_id), push_device_id, device_name, device_label ORDER BY id DESC) AS attempt_rank'
        );
        $outcome = "CASE WHEN SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) > 0 THEN CASE WHEN SUM(CASE WHEN status = 'failed' AND COALESCE(error_code, '') != 'NO_DEVICE' THEN 1 ELSE 0 END) > 0 THEN 'partial' WHEN SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) > 0 THEN 'pending' ELSE 'success' END WHEN SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) > 0 THEN 'pending' ELSE 'failed' END";
        $groups = DB::query()->fromSub($ranked, 'latest')->where('attempt_rank', 1)
            ->select('group_key')->selectRaw('MAX(id) AS latest_id')->selectRaw("$outcome AS status")
            ->groupBy('group_key');
        if ($status) {
            $groups->havingRaw("($outcome) = ?", [$status]);
        }
        $page = $groups->orderByDesc('latest_id')->paginate(20);
        $keys = $page->getCollection()->pluck('group_key');
        if ($keys->isEmpty()) {
            return $page;
        }
        $logs = (clone $query)->whereRaw("($key) IN (".implode(',', array_fill(0, $keys->count(), '?')).")", $keys->all())
            ->select('push_logs.*')->selectRaw("$key AS group_key")->orderByDesc('id')->get();
        $names = User::whereIn('id', $logs->map(fn ($log) => $log->receiver_user_id ?? $log->user_id)->unique())->pluck('name', 'id');
        $logs->each(function ($log) use ($names) {
            if (! $log->receiver_user_name) {
                $log->receiver_user_name = $names->get($log->receiver_user_id ?? $log->user_id);
            }
        });
        $logs = $logs->groupBy('group_key');
        return $page->through(fn ($group) => $this->summarize($logs->get($group->group_key)));
    }

    public function summarize(Collection $attempts): array
    {
        $attempts = $attempts->filter(fn ($log) => $log->error_code !== 'NO_DEVICE'
            && ($log->push_device_id !== null || $log->device_name !== null || $log->device_label !== null || $log->fcm_message_id !== null))
            ->sortByDesc('id')->values();
        if ($attempts->isEmpty()) {
            return [];
        }
        $latest = $attempts->first();
        $message = $attempts->first(fn ($log) => $log->error_code !== 'QUEUE_FAILED') ?? $latest;
        $recipients = $attempts->groupBy(fn ($log) => json_encode([
            $log->receiver_user_id ?? $log->user_id, $log->push_device_id, $log->device_name, $log->device_label,
        ]))->map(function ($history) {
            $log = $history->first();
            return [
                'user_id' => $log->receiver_user_id ?? $log->user_id,
                'user_name' => $log->receiver_user_name,
                'device_name' => $log->device_name, 'device_label' => $log->device_label,
                'push_device_id' => $log->push_device_id,
                'status' => $log->error_code === 'NO_DEVICE' ? 'no_device' : $log->status,
                'error_code' => $log->error_code, 'error_message' => $log->error_message,
                'fcm_message_id' => $log->fcm_message_id, 'finished_at' => $log->finished_at,
                'attempt_count' => $history->count(),
                'attempts' => $history->values()->map(fn ($attempt) => $attempt->only([
                    'id', 'status', 'error_code', 'error_message', 'created_at', 'finished_at',
                ])),
            ];
        })->values();
        $sent = $recipients->where('status', 'success')->count();
        $failed = $recipients->where('status', 'failed')->count();
        $pending = $recipients->where('status', 'pending')->count();
        $status = $sent ? ($failed ? 'partial' : ($pending ? 'pending' : 'success')) : ($pending ? 'pending' : 'failed');

        return [
            ...$latest->only(['id', 'type', 'schedule_id', 'order_number', 'notify_before_minutes']),
            ...$message->only(['title', 'body']),
            'created_at' => $attempts->last()->created_at,
            'status' => $status, 'recipients' => $recipients,
            'success_count' => $sent, 'failed_count' => $failed,
            'attempt_count' => $attempts->count(),
        ];
    }
}
