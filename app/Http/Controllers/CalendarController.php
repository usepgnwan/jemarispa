<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Package;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'start' => ['nullable', 'date_format:Y-m-d'],
            'end' => ['nullable', 'date_format:Y-m-d', 'after:start'],
        ]);

        $today = CarbonImmutable::today(config('push.timezone'))->toDateString();
        $start = $request->input('start');
        if (! $start && $request->user()->isTerapis() && $request->user()->employee_id) {
            $start = Transaction::where('schedule_date', '>=', $today)->whereNotIn('status', ['success', 'failed'])
                ->whereHas('items', fn ($items) => $items->where('employee_id', $request->user()->employee_id))
                ->orderBy('schedule_date')->orderBy('schedule_time')->value('schedule_date');
        }
        $start = $start ?: $today;
        // FullCalendar uses an exclusive end date: seven days starting today.
        $end = $request->input('end') ?: CarbonImmutable::parse($start)->addDays(7)->toDateString();

        return Inertia::render('Admin/Calendar', [
            'date_range' => ['start' => $start, 'end' => $end],
            'employees' => fn () => \App\Models\Employee::query()
                ->when($request->user()->isTerapis(), fn ($employees) => $employees->where('id', $request->user()->employee_id))->get(),
            'packages' => fn () => Package::with('durations')->where('is_signature', false)->orderByRaw('priority ASC NULLS LAST')->orderBy('id', 'desc')->get(),
            'app_settings' => fn () => \App\Models\Setting::first(),
        ]);
    }

    public function events(Request $request)
    {
        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
        ]);
        $start = $validated['date'];
        $end = CarbonImmutable::parse($start)->addDay()->toDateString();

        $user = auth()->user();
        $isTerapis = $user && $user->isTerapis();
        $employeeId = $isTerapis ? $user->employee_id : null;

        if ($isTerapis && !$employeeId) {
            return response()->json(['date' => $start, 'events' => []]);
        }

        $query = Transaction::with([
            'items' => function ($q) {
                $q->select('id', 'transaction_id', 'package_id', 'package_duration_id', 'employee_id', 'guest_index', 'package_name', 'package_duration', 'price', 'therapist_commission');
            },
            'items.employee:id,name', 
            'items.package:id,title_id', 
            'items.packageDurationRel:id,duration,commission', 
            'voucher:id,code,discount_type,discount_amount'
        ])
            ->where('schedule_date', '>=', $start)
            ->where('schedule_date', '<', $end);

        if ($isTerapis && $employeeId) {
            $query->whereHas('items', function ($q) use ($employeeId) {
                $q->where('employee_id', $employeeId);
            });
        }

        // Fetch transactions with items for detail view
        $transactions = $query->get()
            ->map(function ($t) use ($isTerapis, $employeeId) {
                // Determine color based on status
                $color = '#94a3b8'; // Default pending (Slate 400)
                if ($t->status === 'send_terapis') $color = '#60a5fa'; // Blue 400
                if ($t->status === 'invoice') $color = '#fbbf24';      // Amber 400
                if ($t->status === 'success') $color = '#34d399';      // Emerald 400
                if ($t->status === 'failed') $color = '#f87171';       // Red 400

                // If terapis, only show items assigned to them
                $items = $isTerapis 
                    ? $t->items->filter(fn($i) => $i->employee_id == $employeeId)->values() 
                    : $t->items;
                $scheduleTime = $t->schedule_time ? str_replace('.', ':', $t->schedule_time) : null;

                return [
                    'id' => $t->id,
                    'title' => $t->customer_name . ' - ' . ($items->first()->package_name ?? 'Package'),
                    'start' => $t->schedule_date . ($scheduleTime ? 'T' . $scheduleTime : ''),
                    'backgroundColor' => $color,
                    'borderColor' => $color,
                    'extendedProps' => [
                        'customer_name'    => $t->customer_name,
                        'phone'            => $t->phone,
                        'address'          => $t->address,
                        'status'           => $t->status,
                        'total_price'      => $t->total_price,
                        'transport_fee'    => $t->transport_fee,
                        'discount_percent' => $t->discount_percent,
                        'discount_amount'  => $t->discount_amount,
                        'penalty_percent'  => $t->penalty_percent,
                        'penalty_amount'   => $t->penalty_amount,
                        'voucher'          => $t->voucher,
                        'items'            => $items,
                        'notes'            => $t->notes,
                        'schedule_date'    => $t->schedule_date,
                        'schedule_time'    => $scheduleTime,
                        'payment_method'   => $t->payment_method,
                    ]
                ];
            });

        return response()->json([
            'date' => $start,
            'events' => $transactions,
        ]);
    }
}
