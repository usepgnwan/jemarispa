<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'packages' => \App\Models\Package::with('durations')->latest()->get(),
        'testimonials' => \App\Models\Testimoni::where('is_published', true)->latest()->take(6)->get()
    ]);
});

Route::get('/dashboard', function () {
    // ── Monthly Revenue (status = success, last 12 months) — PostgreSQL ──────
    $monthlyRevenue = \App\Models\Transaction::where('status', 'success')
        ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
        ->selectRaw("TO_CHAR(created_at, 'YYYY-MM') as month, SUM(total_price + COALESCE(transport_fee, 0)) as total")
        ->groupByRaw("TO_CHAR(created_at, 'YYYY-MM')")
        ->orderByRaw("TO_CHAR(created_at, 'YYYY-MM') ASC")
        ->get()
        ->map(fn($r) => [
            'month' => \Carbon\Carbon::createFromFormat('Y-m', $r->month)->isoFormat('MMM YY'),
            'total' => (float) $r->total,
        ]);

    // ── Status Counts (all time) ─────────────────────────────────────────────
    $statusCounts = \App\Models\Transaction::selectRaw('status, COUNT(*) as count')
        ->groupBy('status')
        ->pluck('count', 'status');

    $statusBreakdown = collect([
        ['label' => 'Pending',      'key' => 'pending',      'color' => '#94a3b8'],
        ['label' => 'Kirim Terapis','key' => 'send_terapis', 'color' => '#60a5fa'],
        ['label' => 'Invoice',      'key' => 'invoice',      'color' => '#fbbf24'],
        ['label' => 'Selesai',      'key' => 'success',      'color' => '#34d399'],
        ['label' => 'Batal',        'key' => 'failed',       'color' => '#f87171'],
    ])->map(fn($s) => [
        'name'  => $s['label'],
        'value' => (int) ($statusCounts[$s['key']] ?? 0),
        'color' => $s['color'],
    ]);

    // ── Revenue + Commission per Therapist (deduplicated per guest) ───────────
    // Komisi disimpan per item, bukan per tamu. Seorang tamu bisa punya banyak
    // paket (items) yang masing-masing menyimpan nilai komisi yang sama.
    // Solusi: GROUP BY (employee_id, transaction_id, guest_index) dulu untuk
    // mengambil MAX(commission) per tamu, lalu baru SUM.
    $therapistRows = \Illuminate\Support\Facades\DB::select("
        WITH revenue AS (
            SELECT
                ti.employee_id,
                SUM(ti.price)  AS total_revenue,
                COUNT(*)       AS job_count
            FROM transaction_items ti
            JOIN transactions t ON t.id = ti.transaction_id
            WHERE ti.employee_id IS NOT NULL
              AND t.status = 'success'
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
            GROUP BY ti.employee_id, ti.transaction_id, ti.guest_index
        ),
        commission_per_employee AS (
            SELECT employee_id, SUM(commission) AS total_commission
            FROM deduped_commission
            GROUP BY employee_id
        )
        SELECT
            r.employee_id,
            e.name,
            r.total_revenue,
            COALESCE(c.total_commission, 0) AS total_commission,
            r.job_count
        FROM revenue r
        JOIN employees e ON e.id = r.employee_id
        LEFT JOIN commission_per_employee c ON c.employee_id = r.employee_id
        ORDER BY r.total_revenue DESC
    ");

    $therapistRevenue = collect($therapistRows)->map(fn($row) => [
        'name'       => $row->name,
        'revenue'    => (float) $row->total_revenue,
        'commission' => (float) $row->total_commission,
        'jobs'       => (int) $row->job_count,
    ]);

    // ── Summary Stats ────────────────────────────────────────────────────────
    $totalRevenue  = (float) \App\Models\Transaction::where('status', 'success')
        ->selectRaw('SUM(total_price + COALESCE(transport_fee, 0)) as total')
        ->value('total');

    $thisMonth = (float) \App\Models\Transaction::where('status', 'success')
        ->whereRaw('EXTRACT(MONTH FROM created_at) = ?', [now()->month])
        ->whereRaw('EXTRACT(YEAR FROM created_at) = ?', [now()->year])
        ->selectRaw('SUM(total_price + COALESCE(transport_fee, 0)) as total')
        ->value('total');

    // Total komisi — deduplicated: satu nilai per (employee, transaction, guest)
    $totalCommission = (float) \Illuminate\Support\Facades\DB::selectOne("
        SELECT COALESCE(SUM(commission), 0) AS total FROM (
            SELECT MAX(COALESCE(therapist_commission, 0)) AS commission
            FROM transaction_items ti
            JOIN transactions t ON t.id = ti.transaction_id
            WHERE ti.employee_id IS NOT NULL
              AND t.status = 'success'
            GROUP BY ti.employee_id, ti.transaction_id, ti.guest_index
        ) deduped
    ")->total ?? 0;

    $totalOrders   = \App\Models\Transaction::count();
    $successOrders = \App\Models\Transaction::where('status', 'success')->count();

    return Inertia::render('Dashboard', [
        'monthlyRevenue'   => $monthlyRevenue,
        'statusBreakdown'  => $statusBreakdown,
        'therapistRevenue' => $therapistRevenue,
        'stats' => [
            'total_revenue'    => $totalRevenue,
            'this_month'       => $thisMonth,
            'total_commission' => $totalCommission,
            'net_revenue'      => max(0, $totalRevenue - $totalCommission),
            'total_orders'     => $totalOrders,
            'success_orders'   => $successOrders,
        ],
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// ── API: Therapist Revenue Filter per Bulan ──────────────────────────────────
Route::get('/api/dashboard/therapist-revenue', function (Illuminate\Http\Request $request) {
    // month parameter: "YYYY-MM", e.g. "2026-05". Jika kosong = semua waktu.
    $month = $request->query('month'); // e.g. "2026-05"

    $monthFilter = $month
        ? "AND TO_CHAR(t.created_at, 'YYYY-MM') = '" . addslashes($month) . "'"
        : '';

    $rows = \Illuminate\Support\Facades\DB::select("
        WITH revenue AS (
            SELECT
                ti.employee_id,
                SUM(ti.price)  AS total_revenue,
                COUNT(*)       AS job_count
            FROM transaction_items ti
            JOIN transactions t ON t.id = ti.transaction_id
            WHERE ti.employee_id IS NOT NULL
              AND t.status = 'success'
              {$monthFilter}
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
              {$monthFilter}
            GROUP BY ti.employee_id, ti.transaction_id, ti.guest_index
        ),
        commission_per_employee AS (
            SELECT employee_id, SUM(commission) AS total_commission
            FROM deduped_commission
            GROUP BY employee_id
        )
        SELECT
            r.employee_id,
            e.name,
            r.total_revenue,
            COALESCE(c.total_commission, 0) AS total_commission,
            r.job_count
        FROM revenue r
        JOIN employees e ON e.id = r.employee_id
        LEFT JOIN commission_per_employee c ON c.employee_id = r.employee_id
        ORDER BY r.total_revenue DESC
    ");

    return response()->json(collect($rows)->map(fn($row) => [
        'name'       => $row->name,
        'revenue'    => (float) $row->total_revenue,
        'commission' => (float) $row->total_commission,
        'net'        => (float) max(0, $row->total_revenue - $row->total_commission),
        'jobs'       => (int) $row->job_count,
    ]));
})->middleware(['auth'])->name('api.dashboard.therapist_revenue');

use App\Http\Controllers\AnalyticController;
use App\Http\Controllers\PlatformController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\TestimoniController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TransactionController;

Route::post('api/analytics', [AnalyticController::class, 'store'])->name('api.analytics.store');

Route::middleware(['auth'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // ── DIGITAL MARKETING & ADMIN ──────────────────────────────────────────
    Route::middleware(['role:admin,marketing'])->group(function() {
        Route::get('admin/analytics', [AnalyticController::class, 'index'])->name('admin.analytics.index');
        Route::resource('testimoni', TestimoniController::class)->except(['show']);
        Route::patch('testimoni/{testimoni}/publish', [TestimoniController::class, 'togglePublish'])->name('testimoni.publish');
        Route::resource('admin/blog', BlogController::class)->names('admin.blog')->except(['show']);
    });

    // ── CS & ADMIN ─────────────────────────────────────────────────────────
    Route::middleware(['role:admin,cs'])->group(function() {
        // Transaction management
        Route::get('admin/transaction', [TransactionController::class, 'index'])->name('admin.transaction.index');
        Route::patch('admin/transaction/{transaction}', [TransactionController::class, 'update'])->name('admin.transaction.update');
        Route::patch('admin/transaction-items/{item}', [TransactionController::class, 'updateItem'])->name('admin.transaction_item.update');
        Route::get('admin/transaction/{transaction}/pdf', [TransactionController::class, 'downloadPdf'])->name('admin.transaction.pdf');
        Route::delete('admin/transaction/{transaction}', [TransactionController::class, 'destroy'])->name('admin.transaction.destroy');
        Route::get('admin/therapist/report', [TransactionController::class, 'therapistReport'])->name('admin.therapist.report');

        // POS routes
        Route::get('admin/pos', [TransactionController::class, 'pos'])->name('admin.pos.index');
        Route::post('admin/pos', [TransactionController::class, 'storePos'])->name('admin.pos.store');

        // Generate review link for a transaction
        Route::post('admin/transaction/{transaction}/review-link', [TransactionController::class, 'generateReviewLink'])->name('admin.transaction.review_link');
    });

    // ── ADMIN ONLY (Full Features) ────────────────────────────────────────
    Route::middleware(['role:admin'])->group(function() {
        Route::resource('platform', PlatformController::class)->except(['show']);
        Route::resource('faq', FaqController::class)->except(['show']);
        Route::resource('admin/package', PackageController::class)->names('admin.package')->except(['show']);
        Route::resource('admin/employee', EmployeeController::class)->names('admin.employee')->except(['show']);
        Route::resource('admin/user', UserController::class)->names('admin.user')->except(['show']);
        
        // Settings routes
        Route::get('admin/settings', [SettingController::class, 'index'])->name('admin.settings.index');
        Route::post('admin/settings', [SettingController::class, 'update'])->name('admin.settings.update');
        Route::post('admin/settings/areas', [SettingController::class, 'storeArea'])->name('admin.settings.areas.store');
        Route::put('admin/settings/areas/{area}', [SettingController::class, 'updateArea'])->name('admin.settings.areas.update');
        Route::delete('admin/settings/areas/{area}', [SettingController::class, 'destroyArea'])->name('admin.settings.areas.destroy');
    });
});

Route::get('invoice/{order_number}', [TransactionController::class, 'publicPdf'])->name('invoice.public');

// Public customer review routes (token-gated, no auth required)
Route::get('/review/{token}', [TestimoniController::class, 'showReviewForm'])->name('review.show');
Route::post('/review/{token}', [TestimoniController::class, 'submitReview'])->name('review.submit');

Route::get('/blog', function () {
    return Inertia::render('Blog/Index');
})->name('blog.index');

Route::get('/blog/{id}', function ($id) {
    return Inertia::render('Blog/Show', [
        'blogId' => $id
    ]);
})->name('blog.show');

Route::get('/pricing', function () {
    return Inertia::render('Pricing/Index', [
        'packages' => \App\Models\Package::with('durations')->latest()->get()
    ]);
})->name('pricing.index');

Route::get('/cart', function () {
    return Inertia::render('Cart/Index', [
        'packages' => \App\Models\Package::with('durations')->latest()->get()
    ]);
})->name('cart.index');

Route::get('/api/faqs', function () {
    return response()->json(\App\Models\Faq::latest()->take(6)->get());
});

Route::post('/api/transactions', [TransactionController::class, 'store'])->name('transactions.store');

require __DIR__.'/auth.php';
