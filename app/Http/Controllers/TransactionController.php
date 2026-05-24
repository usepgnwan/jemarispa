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
            'voucher',
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

        // Therapist Filtering
        $therapistId = $request->input('therapist_id');
        if ($therapistId) {
            $query->whereHas('items', function($q) use ($therapistId) {
                $q->where('employee_id', $therapistId);
            });
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

        $transactions = $query->orderBy('schedule_date', 'desc')
            ->orderBy('schedule_time', 'desc')
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

        $packages = \App\Models\Package::with('durations')->where('is_signature', false)->orderByRaw('priority ASC NULLS LAST')->orderBy('id', 'desc')->get();

        return Inertia::render('Admin/Transaction/Index', [
            'transactions' => $transactions,
            'employees' => $employees,
            'packages' => $packages,
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
        $packages = \App\Models\Package::with('durations')->where('is_signature', false)->orderByRaw('priority ASC NULLS LAST')->orderBy('id', 'desc')->get();
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
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'schedule_date' => 'required|date',
            'schedule_time' => 'required|string',
            'payment_method' => 'required|string',
            'source' => 'required|string',
            'notes' => 'nullable|string',
            'total_price' => 'required|numeric',
            'transport_fee' => 'nullable|numeric',
            'discount_percent' => 'nullable|numeric',
            'discount_amount' => 'nullable|numeric',
            'voucher_id' => 'nullable|exists:vouchers,id',
            'guests' => 'required|array',
        ]);

        try {
            return DB::transaction(function() use ($validated) {
                $transaction = Transaction::create([
                    'order_number' => 'INV/' . now()->format('Ymd') . '/' . strtoupper(substr(uniqid(), -5)),
                    'customer_name' => $validated['customer_name'],
                    'phone' => $validated['phone'] ?? null,
                    'address' => $validated['address'] ?? null,
                    'schedule_date' => $validated['schedule_date'],
                    'schedule_time' => $validated['schedule_time'],
                    'payment_method' => $validated['payment_method'],
                    'source' => $validated['source'],
                    'notes' => $validated['notes'] ?? null,
                    'total_price' => $validated['total_price'],
                    'transport_fee' => $validated['transport_fee'] ?? 0,
                    'discount_percent' => $validated['discount_percent'] ?? 0,
                    'discount_amount' => $validated['discount_amount'] ?? 0,
                    'voucher_id' => $validated['voucher_id'] ?? null,
                    'status' => 'send_terapis', // Default status for POS as requested
                ]);

                if (!empty($validated['voucher_id'])) {
                    \App\Models\Voucher::where('id', $validated['voucher_id'])->increment('used_count');
                }

                foreach ($validated['guests'] as $index => $guest) {
                    $guestCommission = 0;
                    // Calculate total commission for this guest from DB
                    foreach ($guest['packages'] as $package) {
                        // Use groupName (base title) for accurate lookup
                        $pName = $package['groupName'] ?? $package['name'];
                        // Ensure duration string matches DB format ("90 Menit")
                        $pDuration = $package['duration'];
                        if (is_numeric($pDuration)) {
                            $pDuration .= ' Menit';
                        }

                        $commission = DB::table('package_durations')
                            ->join('packages', 'packages.id', '=', 'package_durations.package_id')
                            ->where('packages.title_id', $pName)
                            ->where('package_durations.duration', $pDuration)
                            ->value('commission') ?? 0;
                        $guestCommission += $commission;
                    }

                    // If frontend didn't send commission, or it's 0, use calculated
                    $finalCommission = (!empty($guest['therapist_commission']) && $guest['therapist_commission'] > 0) ? $guest['therapist_commission'] : $guestCommission;

                    foreach ($guest['packages'] as $package) {
                        TransactionItem::create([
                            'transaction_id' => $transaction->id,
                            'guest_index' => $index + 1,
                            'guest_gender' => $guest['guestGender'] ?? 'wanita',
                            'therapist_gender_preference' => $guest['therapistGender'] ?? 'wanita',
                            'package_name' => $package['name'],
                            'package_duration' => $pDuration,
                            'price' => $package['price'],
                            'employee_id' => !empty($guest['employee_id']) ? $guest['employee_id'] : null,
                            'therapist_commission' => $finalCommission,
                        ]);
                    }
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Transaction created successfully',
                    'transaction' => $transaction->load('items'),
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
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
            'voucher_id' => 'nullable|exists:vouchers,id',
            'guests' => 'required|array|min:1',
        ]);

        return DB::transaction(function () use ($validated) {
            $orderNumber = 'INV/' . date('y/m/') . sprintf('%04d', Transaction::count() + 1);

            $transaction = Transaction::create([
                'order_number' => $orderNumber,
                'customer_name' => $validated['customer_name'],
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'],
                'schedule_date' => $validated['schedule_date'],
                'schedule_time' => $validated['schedule_time'],
                'payment_method' => $validated['payment_method'],
                'source' => $validated['source'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'total_price' => $validated['total_price'],
                'voucher_id' => $validated['voucher_id'] ?? null,
                'discount_amount' => !empty($validated['voucher_id']) ? (\App\Models\Voucher::find($validated['voucher_id'])->discount_amount ?? 0) : 0,
                'status' => 'pending',
            ]);

            if (!empty($validated['voucher_id'])) {
                \App\Models\Voucher::where('id', $validated['voucher_id'])->increment('used_count');
            }

            foreach ($validated['guests'] as $i => $guest) {
                $guestCommission = 0;
                foreach ($guest['packages'] as $package) {
                    $pName = $package['groupName'] ?? $package['name'];
                    $pDuration = $package['duration'];
                    // Strip extra "Menit" if it's already there before appending or normalizing
                    if (str_contains($pDuration, ' Menit')) {
                        $pDuration = str_replace(' Menit', '', $pDuration);
                    }
                    $pDuration .= ' Menit';

                    $commission = DB::table('package_durations')
                        ->join('packages', 'packages.id', '=', 'package_durations.package_id')
                        ->where('packages.title_id', $pName)
                        ->where('package_durations.duration', $pDuration)
                        ->value('commission') ?? 0;
                    $guestCommission += $commission;
                }

                foreach ($guest['packages'] as $package) {
                    TransactionItem::create([
                        'transaction_id' => $transaction->id,
                        'guest_index' => $i + 1,
                        'guest_gender' => $guest['guestGender'] ?? 'wanita',
                        'therapist_gender_preference' => $guest['therapistGender'] ?? 'wanita',
                        'package_name' => $package['name'],
                        'package_duration' => (str_contains($package['duration'], ' Menit') ? $package['duration'] : $package['duration'] . ' Menit'),
                        'price' => $package['price'],
                        'therapist_commission' => $guestCommission,
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
            'penalty_percent' => 'nullable|numeric',
            'penalty_amount' => 'nullable|numeric',
            'total_price' => 'nullable|numeric',
            'status' => 'nullable|in:pending,send_terapis,invoice,success,failed',
            'new_items' => 'nullable|array',
            'items' => 'nullable|array',
            'deleted_items' => 'nullable|array',
        ]);

        return DB::transaction(function() use ($validated, $transaction) {
            $transaction->update(collect($validated)->except(['new_items', 'items', 'deleted_items'])->toArray());

            // Handle deletions
            if (!empty($validated['deleted_items'])) {
                TransactionItem::whereIn('id', $validated['deleted_items'])->where('transaction_id', $transaction->id)->delete();
            }

            // Handle existing item updates
            if (!empty($validated['items'])) {
                foreach ($validated['items'] as $itemData) {
                    if (isset($itemData['id'])) {
                        TransactionItem::where('id', $itemData['id'])
                            ->where('transaction_id', $transaction->id)
                            ->update([
                                'employee_id' => $itemData['employee_id'] ?? null,
                                'therapist_commission' => $itemData['therapist_commission'] ?? 0,
                                'guest_gender' => $itemData['guest_gender'] ?? 'wanita',
                            ]);
                    }
                }
            }

            // Handle new items
            if (!empty($validated['new_items'])) {
                foreach ($validated['new_items'] as $item) {
                    TransactionItem::create([
                        'transaction_id' => $transaction->id,
                        'guest_index' => $item['guest_index'],
                        'guest_gender' => $item['guest_gender'] ?? 'wanita',
                        'therapist_gender_preference' => $item['therapist_gender_preference'] ?? 'wanita',
                        'package_name' => $item['package_name'],
                        'package_duration' => $item['package_duration'],
                        'price' => $item['price'],
                        'therapist_commission' => $item['therapist_commission'] ?? 0,
                        'employee_id' => $item['employee_id'] ?? null,
                    ]);
                }
            }

            return back()->with('message', 'Transaksi berhasil diperbarui');
        });
    }

    public function downloadPdf(Transaction $transaction)
    {
        $transaction->load(['items.employee', 'voucher']);
        $settings = Setting::first();
        $pdf = Pdf::loadView('pdf.invoice', compact('transaction', 'settings'));
        $filename = "Invoice-" . str_replace(['/', '\\'], '-', $transaction->order_number) . ".pdf";
        return $pdf->stream($filename);
    }

    public function publicPdf($orderNumber)
    {
        // Decode order number if it has slashes encoded
        $orderNumber = str_replace('-', '/', $orderNumber);
        
        $transaction = Transaction::with(['items.employee', 'voucher'])->where('order_number', $orderNumber)->firstOrFail();
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
    public function therapistReport(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        if (!$startDate || !$endDate) {
            $startDate = now()->startOfMonth()->format('Y-m-d');
            $endDate = now()->endOfMonth()->format('Y-m-d');
        }

        $dateFilter = "AND t.schedule_date >= '" . addslashes($startDate) . "' AND t.schedule_date <= '" . addslashes($endDate) . "'";

        $rows = DB::select("
            WITH revenue AS (
                SELECT
                    ti.employee_id,
                    SUM(ti.price)  AS total_revenue,
                    COUNT(*)       AS job_count
                FROM transaction_items ti
                JOIN transactions t ON t.id = ti.transaction_id
                WHERE ti.employee_id IS NOT NULL
                  AND t.status = 'success'
                  {$dateFilter}
                GROUP BY ti.employee_id
            ),
            deduped_commission AS (
                SELECT
                    ti.employee_id,
                    ti.transaction_id,
                    ti.guest_index,
                    MAX(COALESCE(ti.therapist_commission, 0)) AS commission
                FROM transaction_items ti
                JOIN transactions t ON t.id = ti.transaction_id
                WHERE ti.employee_id IS NOT NULL
                  AND t.status = 'success'
                  {$dateFilter}
                GROUP BY ti.employee_id, ti.transaction_id, ti.guest_index
            ),
            commission_per_employee AS (
                SELECT employee_id, SUM(commission) AS total_commission
                FROM deduped_commission
                GROUP BY employee_id
            )
            SELECT
                e.id AS employee_id,
                e.name,
                COALESCE(r.total_revenue, 0) AS total_revenue,
                COALESCE(c.total_commission, 0) AS total_commission,
                COALESCE(r.job_count, 0) AS job_count
            FROM employees e
            LEFT JOIN revenue r ON r.employee_id = e.id
            LEFT JOIN commission_per_employee c ON c.employee_id = e.id
            ORDER BY total_revenue DESC, e.name ASC
        ");

        $therapistRevenue = collect($rows)->map(fn($row) => [
            'name'       => $row->name,
            'revenue'    => (float) $row->total_revenue,
            'commission' => (float) $row->total_commission,
            'net'        => (float) max(0, $row->total_revenue - $row->total_commission),
            'jobs'       => (int) $row->job_count,
        ]);

        return Inertia::render('Admin/Therapist/Report', [
            'therapistRevenue' => $therapistRevenue,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate
            ]
        ]);
    }
}

