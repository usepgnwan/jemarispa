<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $isTerapis = $user && $user->isTerapis();
        $employeeId = $isTerapis ? $user->employee_id : null;

        $query = Transaction::with(['items.employee', 'voucher'])
            ->whereNotNull('schedule_date');

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

                return [
                    'id' => $t->id,
                    'title' => $t->customer_name . ' - ' . ($items->first()->package_name ?? 'Package'),
                    'start' => $t->schedule_date . ($t->schedule_time ? 'T' . $t->schedule_time : ''),
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
                        'schedule_time'    => $t->schedule_time,
                        'payment_method'   => $t->payment_method,
                    ]
                ];
            });

        // Summary totals based on status
        $summaryQuery = Transaction::selectRaw('status, COUNT(*) as count');
        
        if ($isTerapis && $employeeId) {
            $summaryQuery->whereHas('items', function ($q) use ($employeeId) {
                $q->where('employee_id', $employeeId);
            });
        }

        $statusCounts = $summaryQuery->groupBy('status')->pluck('count', 'status');

        $summary = [
            'pending' => $statusCounts['pending'] ?? 0,
            'send_terapis' => $statusCounts['send_terapis'] ?? 0,
            'invoice' => $statusCounts['invoice'] ?? 0,
            'success' => $statusCounts['success'] ?? 0,
            'failed' => $statusCounts['failed'] ?? 0,
            'total' => $statusCounts->sum()
        ];

        $employees = \App\Models\Employee::all();

        return Inertia::render('Admin/Calendar', [
            'events' => $transactions,
            'summary' => $summary,
            'employees' => $employees,
            'packages' => Package::with('durations')->where('is_signature', false)->orderByRaw('priority ASC NULLS LAST')->orderBy('id', 'desc')->get(),
            'app_settings' => \App\Models\Setting::first()
        ]);
    }
}
