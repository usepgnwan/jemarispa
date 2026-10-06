<?php

namespace App\Http\Controllers;

use App\Models\ScheduleNotification;
use App\Models\Transaction;
use App\Services\ScheduleReminderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function show(Request $request, Transaction $schedule, ScheduleReminderService $reminders)
    {
        if ($request->user()->role === 'terapis') {
            abort_unless($reminders->isRecipient($schedule, $request->user()), 403);
        }
        $schedule->load('items.employee');
        $notification = ScheduleNotification::where('schedule_id', $schedule->id)
            ->where('user_id', $request->user()->id)->first();

        return Inertia::render('Admin/Scheduler/Show', [
            'schedule' => [
                'id' => $schedule->id,
                'order_number' => $schedule->order_number,
                'customer_name' => $schedule->customer_name,
                'phone' => $schedule->phone,
                'address' => $schedule->address,
                'notes' => $schedule->notes,
                'status' => $schedule->status,
                'schedule_at' => $reminders->scheduleAt($schedule)->toIso8601String(),
                'items' => $schedule->items->map(fn ($item) => [
                    'id' => $item->id,
                    'guest_index' => $item->guest_index,
                    'package_name' => $item->package_name,
                    'package_duration' => $item->package_duration,
                    'therapist_name' => $item->employee?->name ?: $item->employee?->fullname,
                ]),
            ],
            'reminder' => $notification ? [
                'notify_before_minutes' => $notification->notify_before_minutes,
                'notify_at' => $notification->notify_at->toIso8601String(),
                'status' => $notification->status,
                'error_message' => $notification->error_message,
            ] : null,
            'timezone' => config('push.timezone'),
        ]);
    }
}
