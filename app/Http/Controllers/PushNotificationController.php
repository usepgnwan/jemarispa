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
            'platform' => ['required', Rule::in(['web', 'android', 'ios'])],
        ]);
        $device = PushDevice::updateOrCreate(['token_hash' => hash('sha256', $data['fcm_token'])], [
            ...$data, 'user_id' => $request->user()->id, 'last_used_at' => now('UTC'),
        ]);
        // A shared browser belongs only to the currently logged-in account.
        $request->session()->put('push_device_id', $device->id);
        $reminders->backfill($request->user());

        return response()->json(['device' => $device], 201);
    }

    public function destroyDevice(Request $request, PushDevice $device)
    {
        abort_unless($device->user_id === $request->user()->id, 404);
        $device->delete();
        if ((int) $request->session()->get('push_device_id') === $device->id) {
            $request->session()->forget('push_device_id');
        }

        return response()->noContent();
    }

    public function today(Request $request, ScheduleReminderService $reminders)
    {
        $data = $request->validate(['date' => ['nullable', 'date_format:Y-m-d']]);
        $date = $data['date'] ?? now(config('push.timezone'))->toDateString();
        $schedules = Transaction::with('items.employee')->whereDate('schedule_date', $date)->orderBy('schedule_time')->get();
        $notifications = ScheduleNotification::where('user_id', $request->user()->id)
            ->whereIn('schedule_id', $schedules->modelKeys())->get()->keyBy('schedule_id');

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
            'devices' => PushDevice::where('user_id', $request->user()->id)->orderByDesc('last_used_at')->get(),
            'tests' => ScheduleNotification::where('user_id', $request->user()->id)->where('is_test', true)->latest()->limit(10)->get(),
        ]);
    }

    public function updateNotification(Request $request, Transaction $schedule, ScheduleReminderService $reminders)
    {
        $data = $request->validate(['notify_before_minutes' => ['required', 'integer', 'min:1', 'max:10080']]);
        if (in_array($schedule->status, ['success', 'failed'], true) || $reminders->scheduleAt($schedule)->isPast()) {
            throw ValidationException::withMessages(['notify_before_minutes' => 'Reminder hanya dapat diubah untuk jadwal aktif mendatang.']);
        }

        return response()->json(['notification' => $reminders->forUser($schedule, $request->user(), $data['notify_before_minutes'])]);
    }

    public function logs(Request $request)
    {
        $filters = $request->validate([
            'type' => ['nullable', Rule::in(['test', 'scheduler'])],
            'status' => ['nullable', Rule::in(['pending', 'success', 'failed'])],
            'date' => ['nullable', 'date_format:Y-m-d'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);
        $query = PushLog::where('user_id', $request->user()->id);
        foreach (['type', 'status'] as $field) {
            if (! empty($filters[$field])) {
                $query->where($field, $filters[$field]);
            }
        }
        if (! empty($filters['date'])) {
            $start = \Carbon\CarbonImmutable::parse($filters['date'], config('push.timezone'))->startOfDay();
            $query->where('created_at', '>=', $start->utc())->where('created_at', '<', $start->addDay()->utc());
        }

        return response()->json($query->orderByDesc('id')->paginate(20));
    }

    public function testNow(Request $request, FcmService $fcm, ScheduleReminderService $reminders, PushLogService $logs)
    {
        $data = $request->validate([
            'device_id' => ['required', 'integer'],
            'schedule_id' => ['nullable', 'integer', 'exists:transactions,id'],
        ]);
        $device = PushDevice::where('user_id', $request->user()->id)->findOrFail($data['device_id']);
        $schedule = isset($data['schedule_id']) ? Transaction::findOrFail($data['schedule_id']) : null;
        $message = $schedule ? $reminders->message($schedule) : [
            'title' => 'Send Push Now', 'body' => 'Koneksi FCM ke PWA berhasil.',
        ];
        $notification = $schedule ? ScheduleNotification::where('schedule_id', $schedule->id)->where('user_id', $request->user()->id)->first() : null;
        $log = $logs->start($request->user()->id, 'test', $message, $device, $schedule, $notification);
        try {
            $id = $logs->send($fcm, $log, $device, [
                'url' => route('admin.scheduler.index', [], false),
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
