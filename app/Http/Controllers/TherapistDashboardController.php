<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Transaction;
use App\Models\TherapistInvoice;

class TherapistDashboardController extends Controller
{
    /**
     * Display the therapist dashboard.
     */
    public function index()
    {
        $user = Auth::user();
        if (!$user || !$user->employee_id) {
            abort(403, 'Anda tidak memiliki profil terapis.');
        }

        $employeeId = $user->employee_id;

        // Total Customers (distinct transaction + guest_index)
        $totalCustomers = DB::table('transaction_items')
            ->where('employee_id', $employeeId)
            ->distinct()
            ->count(DB::raw("CONCAT(transaction_id, '-', COALESCE(guest_index, 1))"));

        // Revenue Trend (last 6 months)
        $trendPendapatan = DB::table('transaction_items')
            ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->select(
                DB::raw("TO_CHAR(transactions.schedule_date, 'YYYY-MM') as month"),
                DB::raw('SUM(transaction_items.therapist_commission) as total_commission')
            )
            ->where('transaction_items.employee_id', $employeeId)
            ->whereNotNull('transactions.schedule_date')
            ->where('transactions.status', 'success')
            ->where('transactions.schedule_date', '>=', now()->subMonths(5)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get();

        // Today's schedule
        $todaySchedules = Transaction::with(['items' => function ($q) use ($employeeId) {
                $q->where('employee_id', $employeeId);
            }])
            ->whereHas('items', function ($q) use ($employeeId) {
                $q->where('employee_id', $employeeId);
            })
            ->whereDate('schedule_date', now()->toDateString())
            ->orderBy('schedule_time', 'asc')
            ->get();

        return Inertia::render('Admin/Therapist/Dashboard', [
            'totalCustomers' => $totalCustomers,
            'trendPendapatan' => $trendPendapatan,
            'todaySchedules' => $todaySchedules,
        ]);
    }

    /**
     * Display the therapist calendar.
     */
    public function calendar()
    {
        $user = Auth::user();
        if (!$user || !$user->employee_id) {
            abort(403, 'Anda tidak memiliki profil terapis.');
        }

        $employeeId = $user->employee_id;

        $transactions = Transaction::with(['items.employee', 'voucher'])
            ->whereHas('items', function ($q) use ($employeeId) {
                $q->where('employee_id', $employeeId);
            })
            ->whereNotNull('schedule_date')
            ->get()
            ->map(function ($t) use ($employeeId) {
                // Determine color based on status
                $color = '#94a3b8'; // Default pending
                if ($t->status === 'send_terapis') $color = '#60a5fa'; // Proses
                if ($t->status === 'invoice') $color = '#fbbf24';      // Invoice
                if ($t->status === 'success') $color = '#34d399';      // Selesai
                if ($t->status === 'failed') $color = '#f87171';       // Batal

                // Only include items assigned to this therapist
                $myItems = $t->items->filter(function($i) use ($employeeId) {
                    return $i->employee_id == $employeeId;
                })->values();

                return [
                    'id' => $t->id,
                    'title' => $t->customer_name . ' - ' . ($myItems->first()->package_name ?? 'Package'),
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
                        'items'            => $myItems,
                        'notes'            => $t->notes,
                        'schedule_date'    => $t->schedule_date,
                        'schedule_time'    => $t->schedule_time,
                        'payment_method'   => $t->payment_method,
                    ]
                ];
            });

        return Inertia::render('Admin/Therapist/Calendar', [
            'transactions' => $transactions
        ]);
    }

    /**
     * Display the therapist revenue/invoices.
     */
    public function revenue(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->employee_id) {
            abort(403, 'Anda tidak memiliki profil terapis.');
        }

        $employeeId = $user->employee_id;

        $query = \App\Models\TransactionItem::with(['transaction', 'invoiceItems'])
            ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->select('transaction_items.*', 'transactions.schedule_date', 'transactions.schedule_time', 'transactions.order_number', 'transactions.customer_name', 'transactions.payment_method')
            ->where('transaction_items.employee_id', $employeeId)
            ->where('transactions.status', 'success');

        // Default to current month if no filter is provided
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        if ($startDate) {
            $query->whereDate('transactions.schedule_date', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('transactions.schedule_date', '<=', $endDate);
        }

        $paginator = $query->orderBy('transactions.schedule_date', 'desc')
            ->orderBy('transactions.schedule_time', 'desc')
            ->paginate(15)
            ->withQueryString();

        $paginator->getCollection()->transform(function ($item) {
            $transaction = $item->transaction;
            $isPaid = $item->invoiceItems->isNotEmpty();
            $paymentMethod = $transaction->payment_method ?? 'cash';
            $price = (float) $item->price;
            $commission = (float) $item->therapist_commission;
            
            $transferCommission = $paymentMethod === 'transfer' ? $commission : 0;
            $cashNetProfit = $paymentMethod === 'cash' ? ($price - $commission) : 0;

            return [
                'id' => $item->id,
                'date' => $transaction->schedule_date,
                'order_number' => $transaction->order_number,
                'customer_name' => $transaction->customer_name,
                'package_name' => $item->package_name,
                'package_duration' => $item->package_duration,
                'payment_method' => $paymentMethod,
                'price' => $price,
                'commission' => $commission,
                'transfer_commission' => $transferCommission,
                'cash_net_profit' => $cashNetProfit,
                'is_paid' => $isPaid,
            ];
        });

        // Calculate totals for all filtered data (not just the current page)
        $summaryQuery = \App\Models\TransactionItem::join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->where('transaction_items.employee_id', $employeeId)
            ->where('transactions.status', 'success');

        if ($startDate) {
            $summaryQuery->whereDate('transactions.schedule_date', '>=', $startDate);
        }
        if ($endDate) {
            $summaryQuery->whereDate('transactions.schedule_date', '<=', $endDate);
        }

        $totalTransferKomisi = (clone $summaryQuery)->where(function($q) {
            $q->where('transactions.payment_method', 'transfer');
        })->sum('transaction_items.therapist_commission');

        $totalCashNetProfit = (clone $summaryQuery)->where(function($q) {
            $q->where('transactions.payment_method', 'cash')->orWhereNull('transactions.payment_method');
        })->sum(\Illuminate\Support\Facades\DB::raw('transaction_items.price - transaction_items.therapist_commission'));

        return Inertia::render('Admin/Therapist/Revenue', [
            'transactions' => $paginator,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'totals' => [
                'transfer_commission' => (float) $totalTransferKomisi,
                'cash_net_profit' => (float) $totalCashNetProfit,
            ]
        ]);
    }

    public function exportRevenuePDF(Request $request)
    {
        $employeeId = auth()->user()->employee_id;
        if (!$employeeId) {
            abort(403, 'Anda bukan terapis.');
        }

        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $query = \App\Models\TransactionItem::with(['transaction', 'invoiceItems'])
            ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->where('transaction_items.employee_id', $employeeId)
            ->where('transactions.status', 'success')
            ->select('transaction_items.*');

        if ($startDate) {
            $query->whereDate('transactions.schedule_date', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('transactions.schedule_date', '<=', $endDate);
        }

        $items = $query->orderBy('transactions.schedule_date', 'asc')
            ->orderBy('transactions.schedule_time', 'asc')
            ->get();

        $transactions = $items->map(function ($item) {
            $transaction = $item->transaction;
            
            return (object) [
                'date' => $transaction->schedule_date,
                'order_number' => $transaction->order_number,
                'customer_name' => $transaction->customer_name,
                'package_name' => $item->package_name,
                'package_duration' => $item->package_duration,
                'payment_method' => $transaction->payment_method ?? 'cash',
                'price' => (float) $item->price,
                'commission' => (float) $item->therapist_commission,
                'is_paid' => $item->invoiceItems->isNotEmpty(),
            ];
        });

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.therapist_revenue', [
            'transactions' => $transactions,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'therapistName' => auth()->user()->name
        ]);

        return $pdf->stream('Revenue_Terapis_'.auth()->user()->name.'.pdf');
    }
}
