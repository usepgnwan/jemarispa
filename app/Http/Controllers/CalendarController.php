<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function index()
    {
        // Fetch transactions with items for detail view
        $transactions = Transaction::with(['items.employee'])
            ->whereNotNull('schedule_date')
            ->get()
            ->map(function ($t) {
                // Determine color based on status
                $color = '#94a3b8'; // Default pending (Slate 400)
                if ($t->status === 'send_terapis') $color = '#60a5fa'; // Blue 400
                if ($t->status === 'invoice') $color = '#fbbf24';      // Amber 400
                if ($t->status === 'success') $color = '#34d399';      // Emerald 400
                if ($t->status === 'failed') $color = '#f87171';       // Red 400

                return [
                    'id' => $t->id,
                    'title' => $t->customer_name . ' - ' . ($t->items->first()->package_name ?? 'Package'),
                    'start' => $t->schedule_date . ($t->schedule_time ? 'T' . $t->schedule_time : ''),
                    'backgroundColor' => $color,
                    'borderColor' => $color,
                    'extendedProps' => [
                        'customer_name' => $t->customer_name,
                        'phone' => $t->phone,
                        'address' => $t->address,
                        'status' => $t->status,
                        'total_price' => $t->total_price,
                        'items' => $t->items,
                        'notes' => $t->notes,
                        'schedule_time' => $t->schedule_time
                    ]
                ];
            });

        // Summary totals based on status
        $statusCounts = Transaction::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

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
            'employees' => $employees
        ]);
    }
}
