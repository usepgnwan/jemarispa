<?php

namespace App\Http\Controllers;

use App\Mail\NewOrderMail;
use App\Models\MailLog;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\QueryException;
use RuntimeException;
use Throwable;

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
                $q->where('order_number', 'ilike', "%{$search}%")
                  ->orWhere('customer_name', 'ilike', "%{$search}%")
                  ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        // Tab Filtering
        if ($tab === 'recent') {
            $query->where('schedule_date', '>=', now()->subDays(3));
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
            $query->whereDate('schedule_date', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('schedule_date', '<=', $dateTo);
        }

        $transactions = $query->orderBy('schedule_date', 'desc')
            ->orderBy('schedule_time', 'desc')
            ->paginate($limit)
            ->withQueryString();

        $employees = \App\Models\Employee::all();

        // Get counts for tabs
        $counts = [
            'all' => Transaction::count(),
            'recent' => Transaction::where('schedule_date', '>=', now()->subDays(3))->count(),
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

        $transaction = $this->createStoreTransaction($validated);

        $this->sendNewOrderEmail($transaction);

        return response()->json([
            'success' => true,
            'message' => 'Transaction created successfully',
            'transaction' => $transaction,
        ]);
    }

    private function createStoreTransaction(array $validated): Transaction
    {
        for ($attempt = 1; $attempt <= 3; $attempt++) {
            try {
                return DB::transaction(function () use ($validated) {
                    $orderNumber = $this->nextOrderNumber();

                    $discountAmount = 0;
                    if (!empty($validated['voucher_id'])) {
                        $voucher = \App\Models\Voucher::find($validated['voucher_id']);
                        if ($voucher) {
                            if ($voucher->discount_type === 'percent') {
                                $subtotal = collect($validated['guests'])->flatMap(fn($g) => $g['packages'])->sum('price');
                                $discountAmount = ($subtotal * $voucher->discount_amount) / 100;
                            } else {
                                $discountAmount = $voucher->discount_amount;
                            }
                        }
                    }

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
                        'discount_amount' => $discountAmount,
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

                    return $transaction->load('items');
                });
            } catch (QueryException $e) {
                if ($attempt === 3 || ! $this->isUniqueConstraintViolation($e)) {
                    throw $e;
                }
            }
        }

        throw new RuntimeException('Unable to create transaction after retrying order number generation.');
    }

    private function nextOrderNumber(): string
    {
        $prefix = 'INV/' . now()->format('y/m') . '/';

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('select pg_advisory_xact_lock(hashtext(?))', ['transactions_order_number_' . $prefix]);
        }

        $lastSequence = Transaction::where('order_number', 'ilike', $prefix . '%')
            ->pluck('order_number')
            ->map(function ($orderNumber) use ($prefix) {
                if (preg_match('/^' . preg_quote($prefix, '/') . '(\d+)$/', $orderNumber, $matches)) {
                    return (int) $matches[1];
                }

                return 0;
            })
            ->max() ?? 0;

        return $prefix . sprintf('%04d', $lastSequence + 1);
    }

    private function isUniqueConstraintViolation(QueryException $e): bool
    {
        return in_array($e->getCode(), ['23000', '23505'], true);
    }

    private function sendNewOrderEmail(Transaction $transaction): void
    {
        $receiver = config('mail.receiver');
        $sender = config('mail.from.address');
        $subject = 'Pesanan Baru ' . $transaction->order_number;
        $payload = $this->buildMailLogPayload($transaction);

        if (empty($receiver)) {
            MailLog::create([
                'transaction_id' => $transaction->id,
                'order_number' => $transaction->order_number,
                'mail_sender' => $sender,
                'mail_receiver' => null,
                'subject' => $subject,
                'status' => 'failed',
                'error_message' => 'MAIL_RECEIVER belum diisi.',
                'payload' => $payload,
            ]);

            return;
        }

        try {
            Mail::to($receiver)->send(new NewOrderMail($transaction->loadMissing(['items.employee', 'voucher'])));

            MailLog::create([
                'transaction_id' => $transaction->id,
                'order_number' => $transaction->order_number,
                'mail_sender' => $sender,
                'mail_receiver' => $receiver,
                'subject' => $subject,
                'status' => 'success',
                'payload' => $payload,
                'sent_at' => now(),
            ]);
        } catch (Throwable $e) {
            MailLog::create([
                'transaction_id' => $transaction->id,
                'order_number' => $transaction->order_number,
                'mail_sender' => $sender,
                'mail_receiver' => $receiver,
                'subject' => $subject,
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'payload' => $payload,
            ]);
        }
    }

    private function buildMailLogPayload(Transaction $transaction): array
    {
        $transaction->loadMissing('items');

        return [
            'customer_name' => $transaction->customer_name,
            'phone' => $transaction->phone,
            'address' => $transaction->address,
            'schedule_date' => $transaction->schedule_date,
            'schedule_time' => $transaction->schedule_time,
            'payment_method' => $transaction->payment_method,
            'source' => $transaction->source,
            'notes' => $transaction->notes,
            'total_price' => $transaction->total_price,
            'discount_amount' => $transaction->discount_amount,
            'items' => $transaction->items->map(fn ($item) => [
                'guest_index' => $item->guest_index,
                'guest_gender' => $item->guest_gender,
                'therapist_gender_preference' => $item->therapist_gender_preference,
                'package_name' => $item->package_name,
                'package_duration' => $item->package_duration,
                'price' => $item->price,
            ])->values()->all(),
        ];
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
                                'therapist_gender_preference' => $itemData['therapist_gender_preference'] ?? 'wanita',
                                'package_name' => $itemData['package_name'] ?? null,
                                'package_duration' => $itemData['package_duration'] ?? null,
                                'price' => $itemData['price'] ?? 0,
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
                    SUM(COALESCE(ti.therapist_commission, 0)) AS total_commission,
                    COUNT(DISTINCT CONCAT(ti.transaction_id, '-', COALESCE(ti.guest_index, 1))) AS job_count
                FROM transaction_items ti
                JOIN transactions t ON t.id = ti.transaction_id
                WHERE ti.employee_id IS NOT NULL
                  AND t.status = 'success'
                  {$dateFilter}
                GROUP BY ti.employee_id
            )
            SELECT
                e.id AS employee_id,
                e.name,
                COALESCE(r.total_revenue, 0) AS total_revenue,
                COALESCE(r.total_commission, 0) AS total_commission,
                COALESCE(r.job_count, 0) AS job_count
            FROM employees e
            LEFT JOIN revenue r ON r.employee_id = e.id
            ORDER BY total_revenue DESC, e.name ASC
        ");

        $formatted = collect($rows)->filter(function ($row) {
            return $row->total_revenue > 0 || $row->total_commission > 0;
        })->map(function($row) {
            return [
                'id'         => $row->employee_id,
                'name'       => $row->name,
                'revenue'    => (float) $row->total_revenue,
                'commission' => (float) $row->total_commission,
                'net'        => (float) max(0, $row->total_revenue - $row->total_commission),
                'jobs'       => (int) $row->job_count,
                'invoices'   => \App\Models\TherapistInvoice::with('items.transactionItem.transaction')->where('employee_id', $row->employee_id)->orderBy('created_at', 'desc')->get()
            ];
        })->values();

        return inertia('Admin/Therapist/Report', [
            'therapistRevenue' => $formatted,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }

    public function therapistDetail(Request $request)
    {
        $employeeId = $request->query('employee_id');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        if (!$startDate || !$endDate) {
            $startDate = now()->startOfMonth()->format('Y-m-d');
            $endDate = now()->endOfMonth()->format('Y-m-d');
        }

        $items = \App\Models\TransactionItem::with('transaction')
            ->where('employee_id', $employeeId)
            ->whereDoesntHave('invoiceItems')
            ->whereHas('transaction', function ($query) use ($startDate, $endDate) {
                $query->where('status', 'success')
                      ->where('schedule_date', '>=', $startDate)
                      ->where('schedule_date', '<=', $endDate);
            })
            ->get()
            ->map(function($item) {
                return [
                    'id' => $item->id,
                    'invoice_no' => $item->transaction->order_number ?? '-',
                    'schedule_date' => \Carbon\Carbon::parse($item->transaction->schedule_date)->format('d/m/Y'),
                    'package_name' => $item->package_name,
                    'package_duration' => $item->package_duration,
                    'price' => (float) $item->price,
                    'commission' => (float) $item->therapist_commission,
                    'payment_method' => $item->transaction->payment_method ?? '-',
                ];
            })
            ->sortBy('schedule_date')
            ->values();

        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    public function storeTherapistInvoice(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'transaction_item_ids' => 'required|array',
            'transaction_item_ids.*' => 'exists:transaction_items,id'
        ]);

        return DB::transaction(function() use ($validated) {
            $items = \App\Models\TransactionItem::with('transaction')
                ->whereIn('id', $validated['transaction_item_ids'])
                ->where('employee_id', $validated['employee_id'])
                ->get();

            $totalTransferCommission = 0;
            $totalCashNetProfit = 0;

            foreach ($items as $item) {
                $method = strtolower($item->transaction->payment_method ?? '');
                if ($method === 'transfer') {
                    $totalTransferCommission += $item->therapist_commission;
                } else if ($method === 'cash') {
                    $totalCashNetProfit += ($item->price - $item->therapist_commission);
                }
            }

            $totalAmount = $totalTransferCommission - $totalCashNetProfit;
            $invoiceNo = 'INV-TRP/' . now()->format('Ymd') . '/' . strtoupper(substr(uniqid(), -4));

            $invoice = \App\Models\TherapistInvoice::create([
                'invoice_no' => $invoiceNo,
                'employee_id' => $validated['employee_id'],
                'total_transfer_commission' => $totalTransferCommission,
                'total_cash_net_profit' => $totalCashNetProfit,
                'total_amount' => $totalAmount,
                'status' => 'paid',
            ]);

            foreach ($items as $item) {
                \App\Models\TherapistInvoiceItem::create([
                    'therapist_invoice_id' => $invoice->id,
                    'transaction_item_id' => $item->id
                ]);
            }

            return back()->with('message', 'Invoice berhasil disimpan');
        });
    }
}
