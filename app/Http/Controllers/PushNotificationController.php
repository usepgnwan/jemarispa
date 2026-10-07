<?php

namespace App\Http\Controllers;

use App\Exceptions\FcmException;
use App\Models\PushDevice;
use App\Models\PushLog;
use App\Models\ScheduleNotification;
use App\Models\Transaction;
use App\Services\FcmService;
use App\Services\PushLogService;
use App\Services\ScheduleReminderService;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

class PushNotificationController extends Controller
{
    public function storeDevice(Request $request, ScheduleReminderService $reminders)
    {
        $data = $request->validate([
            'fcm_token' => ['required', 'string', 'max:4096'],
            'device_name' => ['nullable', 'string', 'max:255'],
            'device_label' => ['sometimes', 'required', 'string', 'max:255'],
            'platform' => ['required', Rule::in(['web', 'android', 'ios'])],
        ]);
        $tokenHash = hash('sha256', $data['fcm_token']);
        $existing = PushDevice::where('token_hash', $tokenHash)->first();
        if (!array_key_exists('device_name', $data)) {
            $data['device_name'] = $data['platform'].' • '.Str::limit($request->userAgent() ?? 'Browser', 180, '');
        }
        if (!array_key_exists('device_label', $data)) {
            $data['device_label'] = $existing && $existing->user_id === $request->user()->id
                ? $existing->device_label : null;
        }
        $device = PushDevice::updateOrCreate(['token_hash' => $tokenHash], [
            ...$data, 'user_id' => $request->user()->id, 'last_used_at' => now('UTC'),
        ]);
        // A shared browser belongs only to the currently logged-in account.
        $request->session()->put('push_device_id', $device->id);
        $reminders->backfill($request->user());

        return response()->json(['device' => $device], 201);
    }

    public function updateDevice(Request $request, PushDevice $device)
    {
        abort_unless($request->user()->isAdmin() || $device->user_id === $request->user()->id, 404);
        $data = $request->validate([
            'device_label' => ['required', 'string', 'max:255'],
        ]);
        $device->update($data);

        return response()->json(['device' => $device]);
    }

    public function destroyDevice(Request $request, PushDevice $device)
    {
        abort_unless($request->user()->isAdmin() || $device->user_id === $request->user()->id, 404);
        $device->delete();
        if ((int) $request->session()->get('push_device_id') === $device->id) {
            $request->session()->forget('push_device_id');
        }

        return response()->noContent();
    }

    public function devices(Request $request)
    {
        $request->validate(['page' => ['nullable', 'integer', 'min:1']]);

        return response()->json(PushDevice::active()->where('user_id', $request->user()->id)
            ->orderByDesc('last_used_at')->orderByDesc('id')->paginate(10));
    }

    public function received(Request $request)
    {
        $request->validate(['page' => ['nullable', 'integer', 'min:1']]);

        return response()->json(PushLog::where('receiver_user_id', $request->user()->id)
            ->where('status', 'success')->orderByDesc('id')
            ->paginate(10, ['id', 'schedule_id', 'title', 'body', 'device_label', 'device_name', 'finished_at', 'created_at']));
    }

    public function today(Request $request, ScheduleReminderService $reminders)
    {
        $data = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
            'device_page' => ['nullable', 'integer', 'min:1'],
            'device_id' => ['nullable', 'integer', 'min:1'],
        ]);
        $date = $data['date'] ?? now(config('push.timezone'))->toDateString();
        $selectedDevice = isset($data['device_id']) ? PushDevice::active()->with('user')->find($data['device_id']) : null;
        $filterSchedules = function (Builder $query) use ($data, $selectedDevice): Builder {
            if (isset($data['device_id']) && ! $selectedDevice) {
                return $query->whereRaw('1 = 0');
            }
            if ($selectedDevice?->user->role === 'terapis') {
                $employeeId = $selectedDevice->user->employee_id;
                return $employeeId ? $query->whereHas('items', fn (Builder $items) => $items->where('employee_id', $employeeId))
                    : $query->whereRaw('1 = 0');
            }

            return $query;
        };
        $schedules = $filterSchedules(Transaction::with('items.employee')->whereDate('schedule_date', $date))
            ->orderBy('schedule_time')->get();
        $notifications = ScheduleNotification::where('user_id', $request->user()->id)
            ->whereIn('schedule_id', $schedules->modelKeys())->get()->keyBy('schedule_id');
        $deviceQuery = PushDevice::active()->with('user:id,name,role')->orderByDesc('last_used_at')->orderByDesc('id');
        $activeDevices = (clone $deviceQuery)->paginate(10, ['*'], 'device_page', $data['device_page'] ?? 1);
        if ($activeDevices->currentPage() > $activeDevices->lastPage()) {
            $activeDevices = (clone $deviceQuery)->paginate(10, ['*'], 'device_page', $activeDevices->lastPage());
        }

        return response()->json([
            'date' => $date, 'timezone' => config('push.timezone'),
            'schedules' => $schedules->map(function ($schedule) use ($notifications, $reminders, $request) {
                $notification = $notifications->get($schedule->id) ?? $reminders->forUser($schedule, $request->user());

                return [
                    'id' => $schedule->id, 'order_number' => $schedule->order_number,
                    'customer_name' => $schedule->customer_name, 'status' => $schedule->status,
                    'schedule_at' => $reminders->scheduleAt($schedule)->toIso8601String(),
                    'push_message' => $reminders->message($schedule)['body'],
                    'notification' => $notification,
                ];
            }),
            'devices' => $deviceQuery->get(['id', 'user_id', 'device_label']),
            'active_devices' => $activeDevices,
            'tests' => ScheduleNotification::where('user_id', $request->user()->id)->where('is_test', true)->latest()->limit(10)->get(),
            'scheduler_timeline' => $this->schedulerTimeline($request, $reminders, $filterSchedules),
        ]);
    }

    private function schedulerTimeline(Request $request, ScheduleReminderService $reminders, \Closure $filterSchedules): array
    {
        $now = now('UTC');
        $query = ScheduleNotification::where('user_id', $request->user()->id)->where('is_test', false)
            ->whereHas('schedule', $filterSchedules)->with('schedule:id,order_number,customer_name,schedule_date,schedule_time');
        $past = (clone $query)->where('notify_at', '<=', $now);
        $upcoming = (clone $query)->where('notify_at', '>', $now)->where('status', '!=', 'cancelled');
        $summarize = fn ($notification) => [
            'id' => $notification->id,
            'schedule_id' => $notification->schedule_id,
            'order_number' => $notification->schedule->order_number,
            'customer_name' => $notification->schedule->customer_name,
            'schedule_at' => $reminders->scheduleAt($notification->schedule)->toIso8601String(),
            'notify_at' => $notification->notify_at->toIso8601String(),
            'status' => $notification->status,
            'error_message' => $notification->error_message,
        ];

        return [
            'past_count' => (clone $past)->count(),
            'upcoming_count' => (clone $upcoming)->count(),
            'past' => $past->orderByDesc('notify_at')->orderByDesc('id')->limit(10)->get()->map($summarize),
            'upcoming' => $upcoming->orderBy('notify_at')->orderBy('id')->limit(10)->get()->map($summarize),
        ];
    }

    public function updateNotification(Request $request, Transaction $schedule, ScheduleReminderService $reminders)
    {
        $data = $request->validate(['notify_before_minutes' => ['required', 'integer', 'min:1', 'max:10080']]);
        if (in_array($schedule->status, ['success', 'failed'], true) || $reminders->scheduleAt($schedule)->isPast()) {
            throw ValidationException::withMessages(['notify_before_minutes' => 'Reminder hanya dapat diubah untuk jadwal aktif mendatang.']);
        }

        return response()->json(['notification' => $reminders->forUser($schedule, $request->user(), $data['notify_before_minutes'])]);
    }

    public function logs(Request $request, \App\Services\PushLogHistoryService $history)
    {
        $filters = $request->validate([
            'type' => ['nullable', Rule::in(['test', 'scheduler'])],
            'status' => ['nullable', Rule::in(['pending', 'success', 'failed', 'partial'])],
            'grouped' => ['nullable', 'boolean'],
            'date' => ['nullable', 'date_format:Y-m-d'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);
        $grouped = $request->boolean('grouped');
        $query = PushLog::query()->where(fn ($logs) => $logs->whereNull('error_code')->orWhere('error_code', '!=', 'NO_DEVICE'))
            ->where(fn ($logs) => $logs->whereNotNull('push_device_id')->orWhereNotNull('device_name')
                ->orWhereNotNull('device_label')->orWhereNotNull('fcm_message_id'));
        if (! $grouped || ! $request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }
        foreach (['type', 'status'] as $field) {
            if (! empty($filters[$field]) && (! $grouped || $field !== 'status')) {
                $query->where($field, $filters[$field]);
            }
        }
        if (! empty($filters['date'])) {
            $start = \Carbon\CarbonImmutable::parse($filters['date'], config('push.timezone'))->startOfDay();
            $query->where('created_at', '>=', $start->utc())->where('created_at', '<', $start->addDay()->utc());
        }

        return response()->json($grouped ? $history->paginate($query, $filters['status'] ?? null)
            : $query->orderByDesc('id')->paginate(20));
    }

    public function testNow(Request $request, FcmService $fcm, ScheduleReminderService $reminders, PushLogService $logs)
    {
        $data = $request->validate([
            'device_id' => ['required', 'integer'],
            'schedule_id' => ['nullable', 'integer', 'exists:transactions,id'],
        ]);
        $device = PushDevice::active()->findOrFail($data['device_id']);
        $schedule = isset($data['schedule_id']) ? Transaction::findOrFail($data['schedule_id']) : null;
        if ($schedule && $device->user->role === 'terapis') {
            abort_unless($reminders->isRecipient($schedule, $device->user), 404);
        }
        $message = $schedule ? $reminders->message($schedule) : [
            'title' => 'Send Push Now', 'body' => 'Koneksi FCM ke PWA berhasil.',
        ];
        $notification = $schedule ? ScheduleNotification::where('schedule_id', $schedule->id)->where('user_id', $request->user()->id)->first() : null;
        $log = $logs->start($request->user()->id, 'test', $message, $device, $schedule, $notification);
        try {
            $id = $logs->send($fcm, $log, $device, [
                'url' => route($device->user->role === 'terapis' ? 'admin.therapist_user.notifications' : 'admin.scheduler.index', [], false),
                ...$message,
                'tag' => 'test-now-'.Str::uuid(),
            ]);

            return response()->json([
                'message' => $schedule ? 'FCM menerima push transaksi '.$schedule->order_number.'. Periksa device yang dipilih.'
                    : 'FCM menerima push. Periksa device yang dipilih.',
                'fcm_message_id' => $id,
            ]);
        } catch (FcmException $e) {
            if ($e->fcmCode === 'UNREGISTERED') {
                $device->delete();
            }

            return response()->json(['message' => $e->getMessage()], 502);
        } catch (Throwable $e) {
            return response()->json(['message' => 'FCM gagal. Periksa konfigurasi credentials, project ID, dan koneksi server.'], 502);
        }
    }

    public function testSchedule(Request $request)
    {
        $data = $request->validate(['delay_minutes' => ['required', 'integer', 'min:1', 'max:60']]);
        if (! PushDevice::where('user_id', $request->user()->id)->exists()) {
            throw ValidationException::withMessages(['device' => 'Aktifkan push di minimal satu device terlebih dahulu.']);
        }
        $notification = ScheduleNotification::create([
            'user_id' => $request->user()->id, 'schedule_id' => null,
            'notify_before_minutes' => 360, 'notify_at' => now('UTC')->addMinutes($data['delay_minutes']),
            'is_test' => true, 'status' => 'pending',
        ]);

        return response()->json(['notification' => $notification], 201);
    }
}
