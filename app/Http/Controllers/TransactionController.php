<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input('limit', 10);
        $search = $request->input('search');
        $tab = $request->input('tab', 'recent');

        $query = Transaction::with([
            'items' => function($query) {
                $query->with('employee')->orderBy('guest_index', 'asc');
            },
            'testimoni',
        ]);

        // Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Tab Filtering
        if ($tab === 'recent') {
            $query->where('created_at', '>=', now()->subDays(3));
        } else if ($tab === 'all') {
            // No extra filtering
        } else if (in_array($tab, ['pending', 'send_terapis', 'invoice', 'success', 'failed'])) {
            $query->where('status', $tab);
        }

        // Date Range Filtering (overrides tab's 'recent' window when set)
        $dateFrom = $request->input('date_from');
        $dateTo   = $request->input('date_to');
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $transactions = $query->latest()
            ->paginate($limit)
            ->withQueryString();

        $employees = \App\Models\Employee::all();

        // Get counts for tabs
        $counts = [
            'all' => Transaction::count(),
            'recent' => Transaction::where('created_at', '>=', now()->subDays(3))->count(),
            'pending' => Transaction::where('status', 'pending')->count(),
            'send_terapis' => Transaction::where('status', 'send_terapis')->count(),
            'invoice' => Transaction::where('status', 'invoice')->count(),
            'success' => Transaction::where('status', 'success')->count(),
            'failed' => Transaction::where('status', 'failed')->count(),
        ];

        return Inertia::render('Admin/Transaction/Index', [
            'transactions' => $transactions,
            'employees' => $employees,
            'filters' => [
                'search' => $search,
                'limit' => $limit,
                'tab' => $tab,
            ],
            'counts' => $counts
        ]);
    }

    public function pos()
    {
        $packages = \App\Models\Package::with('durations')->latest()->get();
        $employees = \App\Models\Employee::all();
        $todayTransactions = Transaction::with('items')
            ->whereDate('created_at', now()->toDateString())
            ->latest()
            ->get();
        $settings = Setting::first();
        $platforms = \App\Models\Platform::all();

        return Inertia::render('Admin/Pos/Index', [
            'packages' => $packages,
            'employees' => $employees,
            'todayTransactions' => $todayTransactions,
            'app_settings' => $settings,
            'platforms' => $platforms
        ]);
    }

    public function storePos(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'schedule_date' => 'required|date',
            'schedule_time' => 'required|string',
            'payment_method' => 'required|string',
            'source' => 'required|string',
            'notes' => 'nullable|string',
            'total_price' => 'required|numeric',
            'transport_fee' => 'nullable|numeric',
            'guests' => 'required|array',
        ]);

        return DB::transaction(function() use ($validated) {
            $transaction = Transaction::create([
                'order_number' => 'INV/' . now()->format('Ymd') . '/' . strtoupper(substr(uniqid(), -5)),
                'customer_name' => $validated['customer_name'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
                'schedule_date' => $validated['schedule_date'],
                'schedule_time' => $validated['schedule_time'],
                'payment_method' => $validated['payment_method'],
                'source' => $validated['source'],
                'notes' => $validated['notes'],
                'total_price' => $validated['total_price'],
                'transport_fee' => $validated['transport_fee'] ?? 0,
                'status' => 'send_terapis', // Default status for POS as requested
            ]);

            foreach ($validated['guests'] as $index => $guest) {
                foreach ($guest['packages'] as $package) {
                    TransactionItem::create([
                        'transaction_id' => $transaction->id,
                        'guest_index' => $index + 1,
                        'guest_gender' => $guest['guestGender'] ?? 'wanita',
                        'therapist_gender_preference' => $guest['therapistGender'] ?? 'wanita',
                        'package_name' => $package['name'],
                        'package_duration' => $package['duration'],
                        'price' => $package['price'],
                        'employee_id' => !empty($guest['employee_id']) ? $guest['employee_id'] : null,
                        'therapist_commission' => $guest['therapist_commission'] ?? 0,
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Transaction created successfully',
                'transaction' => $transaction,
            ]);
        });
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'required|string',
            'schedule_date' => 'required|date',
            'schedule_time' => 'required|string',
            'payment_method' => 'required|string',
            'source' => 'nullable|string',
            'notes' => 'nullable|string',
            'total_price' => 'required|numeric',
            'guests' => 'required|array|min:1',
        ]);

        return DB::transaction(function () use ($validated) {
            $orderNumber = 'INV/' . date('y/m/') . sprintf('%04d', Transaction::count() + 1);

            $transaction = Transaction::create([
                'order_number' => $orderNumber,
                'customer_name' => $validated['customer_name'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
                'schedule_date' => $validated['schedule_date'],
                'schedule_time' => $validated['schedule_time'],
                'payment_method' => $validated['payment_method'],
                'source' => $validated['source'],
                'notes' => $validated['notes'],
                'total_price' => $validated['total_price'],
                'status' => 'pending',
            ]);

            foreach ($validated['guests'] as $i => $guest) {
                foreach ($guest['packages'] as $package) {
                    TransactionItem::create([
                        'transaction_id' => $transaction->id,
                        'guest_index' => $i + 1,
                        'guest_gender' => $guest['guestGender'],
                        'therapist_gender_preference' => $guest['therapistGender'],
                        'package_name' => $package['name'],
                        'package_duration' => $package['duration'] . ' Menit',
                        'price' => $package['price'],
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Transaction created successfully',
                'transaction' => $transaction,
            ]);
        });
    }

    public function update(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'schedule_date' => 'nullable|date',
            'schedule_time' => 'nullable|string',
            'notes' => 'nullable|string',
            'transport_fee' => 'nullable|numeric',
            'status' => 'nullable|in:pending,send_terapis,invoice,success,failed',
        ]);

        $transaction->update($validated);

        return back()->with('message', 'Transaksi berhasil diperbarui');
    }

    public function downloadPdf(Transaction $transaction)
    {
        $transaction->load('items');
        $settings = Setting::first();
        $pdf = Pdf::loadView('pdf.invoice', compact('transaction', 'settings'));
        $filename = "Invoice-" . str_replace(['/', '\\'], '-', $transaction->order_number) . ".pdf";
        return $pdf->stream($filename);
    }

    public function publicPdf($orderNumber)
    {
        // Decode order number if it has slashes encoded
        $orderNumber = str_replace('-', '/', $orderNumber);
        
        $transaction = Transaction::with('items')->where('order_number', $orderNumber)->firstOrFail();
        $settings = Setting::first();
        $pdf = Pdf::loadView('pdf.invoice', compact('transaction', 'settings'));
        $filename = "Invoice-" . str_replace(['/', '\\'], '-', $transaction->order_number) . ".pdf";
        return $pdf->stream($filename);
    }

    public function updateItem(Request $request, TransactionItem $item)
    {
        $validated = $request->validate([
            'employee_id' => 'nullable|exists:employees,id',
            'therapist_commission' => 'nullable|numeric',
        ]);

        $item->update($validated);

        return back()->with('message', 'Data terapis berhasil diperbarui');
    }

    public function destroy(Transaction $transaction)
    {
        $transaction->delete();
        return back()->with('message', 'Transaksi berhasil dihapus');
    }

    /**
     * Generate (or regenerate) a 24-hour review token for the transaction and return the link.
     */
    public function generateReviewLink(Transaction $transaction)
    {
        $token = $transaction->generateReviewToken();
        $link = url('/review/' . $token);

        return response()->json([
            'success' => true,
            'link' => $link,
            'expires_at' => $transaction->review_expires_at,
        ]);
    }
}

