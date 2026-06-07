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
        'signaturePackages' => \App\Models\Package::where('is_signature', true)->orderByRaw('priority ASC NULLS LAST')->orderBy('id', 'desc')->get(),
        'packages' => \App\Models\Package::with('durations')->where('is_signature', false)->orderByRaw('priority ASC NULLS LAST')->orderBy('id', 'desc')->get(),
        'testimonials' => \App\Models\Testimoni::where('is_published', true)->inRandomOrder()->take(6)->get(),
        'platforms' => \App\Models\Platform::latest()->get()
    ]);
});

Route::get('/dashboard', function (\Illuminate\Http\Request $request) {
    $month = $request->query('month');

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

    $baseQuery = \App\Models\Transaction::query();
    if ($month) {
        $baseQuery->whereRaw("TO_CHAR(created_at, 'YYYY-MM') = ?", [$month]);
    }

    // ── Status Counts ─────────────────────────────────────────────
    $statusCounts = (clone $baseQuery)->selectRaw('status, COUNT(*) as count')
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

    $monthFilterSql = $month ? "AND TO_CHAR(t.created_at, 'YYYY-MM') = '" . addslashes($month) . "'" : "";

    $therapistRows = \Illuminate\Support\Facades\DB::select("
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
              {$monthFilterSql}
            GROUP BY ti.employee_id
        )
        SELECT
            r.employee_id,
            e.name,
            r.total_revenue,
            COALESCE(r.total_commission, 0) AS total_commission,
            r.job_count
        FROM revenue r
        JOIN employees e ON e.id = r.employee_id
        ORDER BY r.total_revenue DESC
    ");

    $therapistRevenue = collect($therapistRows)->map(fn($row) => [
        'id'         => $row->employee_id,
        'name'       => $row->name,
        'revenue'    => (float) $row->total_revenue,
        'commission' => (float) $row->total_commission,
        'jobs'       => (int) $row->job_count,
    ]);

    // ── Summary Stats ────────────────────────────────────────────────────────
    $totalRevenue  = (float) (clone $baseQuery)->where('status', 'success')
        ->selectRaw('SUM(total_price + COALESCE(transport_fee, 0)) as total')
        ->value('total');

    $thisMonth = (float) \App\Models\Transaction::where('status', 'success')
        ->whereRaw('EXTRACT(MONTH FROM created_at) = ?', [now()->month])
        ->whereRaw('EXTRACT(YEAR FROM created_at) = ?', [now()->year])
        ->selectRaw('SUM(total_price + COALESCE(transport_fee, 0)) as total')
        ->value('total');

    $totalCommission = (float) \Illuminate\Support\Facades\DB::selectOne("
        SELECT COALESCE(SUM(therapist_commission), 0) AS total
        FROM transaction_items ti
        JOIN transactions t ON t.id = ti.transaction_id
        WHERE ti.employee_id IS NOT NULL
          AND t.status = 'success'
          {$monthFilterSql}
    ")->total ?? 0;

    $totalOrders   = (clone $baseQuery)->count();
    $successOrders = (clone $baseQuery)->where('status', 'success')->count();

    return Inertia::render('Dashboard', [
        'filters'          => ['month' => $month],
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
                SUM(COALESCE(ti.therapist_commission, 0)) AS total_commission,
                COUNT(DISTINCT CONCAT(ti.transaction_id, '-', COALESCE(ti.guest_index, 1))) AS job_count
            FROM transaction_items ti
            JOIN transactions t ON t.id = ti.transaction_id
            WHERE ti.employee_id IS NOT NULL
              AND t.status = 'success'
              {$monthFilter}
            GROUP BY ti.employee_id
        )
        SELECT
            r.employee_id,
            e.name,
            r.total_revenue,
            COALESCE(r.total_commission, 0) AS total_commission,
            r.job_count
        FROM revenue r
        JOIN employees e ON e.id = r.employee_id
        ORDER BY r.total_revenue DESC
    ");

    return response()->json(collect($rows)->map(fn($row) => [
        'id'         => $row->employee_id,
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
use App\Http\Controllers\VoucherController;

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
        // Calendar
        Route::get('admin/calendar', [\App\Http\Controllers\CalendarController::class, 'index'])->name('admin.calendar.index');

        // Transaction management
        Route::get('admin/transaction', [TransactionController::class, 'index'])->name('admin.transaction.index');
        Route::patch('admin/transaction/{transaction}', [TransactionController::class, 'update'])->name('admin.transaction.update');
        Route::patch('admin/transaction-items/{item}', [TransactionController::class, 'updateItem'])->name('admin.transaction_item.update');
        Route::get('admin/transaction/{transaction}/pdf', [TransactionController::class, 'downloadPdf'])->name('admin.transaction.pdf');
        Route::delete('admin/transaction/{transaction}', [TransactionController::class, 'destroy'])->name('admin.transaction.destroy');
        Route::get('admin/therapist/report', [TransactionController::class, 'therapistReport'])->name('admin.therapist.report');
        Route::get('admin/therapist/report/detail', [TransactionController::class, 'therapistDetail'])->name('admin.therapist.report.detail');

        // POS routes
        Route::get('admin/pos', [TransactionController::class, 'pos'])->name('admin.pos.index');
        Route::post('admin/pos', [TransactionController::class, 'storePos'])->name('admin.pos.store');

        // Generate review link for a transaction
        Route::post('admin/transaction/{transaction}/review-link', [TransactionController::class, 'generateReviewLink'])->name('admin.transaction.review_link');

        // Voucher validation for POS
        Route::post('admin/voucher/validate', [VoucherController::class, 'validateCode'])->name('admin.voucher.validate');
        Route::get('admin/voucher/{voucher}/download', [VoucherController::class, 'downloadPdf'])->name('admin.voucher.download');
        Route::resource('admin/voucher', VoucherController::class)->names('admin.voucher')->except(['show']);
    });

    // ── ADMIN ONLY (Full Features) ────────────────────────────────────────
    Route::middleware(['role:admin'])->group(function() {
        Route::resource('platform', PlatformController::class)->except(['show']);
        Route::resource('faq', FaqController::class)->except(['show']);
        Route::resource('admin/package', PackageController::class)->names('admin.package')->except(['show']);
        Route::resource('admin/signature-ritual', \App\Http\Controllers\SignatureRitualController::class)->names('admin.signature-ritual')->except(['show']);
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

Route::get('/blog', [BlogController::class, 'publicIndex'])->name('blog.index');
Route::get('/blog/{slug}', [BlogController::class, 'publicShow'])->name('blog.show');

Route::get('/treatment/{slug?}', function ($slug = null) {
    return Inertia::render('Pricing/Index', [
        'packages' => \App\Models\Package::with('durations')->where('is_signature', false)->orderByRaw('priority ASC NULLS LAST')->orderBy('id', 'desc')->get(),
        'signaturePackages' => \App\Models\Package::where('is_signature', true)->orderByRaw('priority ASC NULLS LAST')->orderBy('id', 'desc')->get(),
        'initialSlug' => $slug
    ]);
})->name('treatment.index');

Route::redirect('/pricing', '/treatment', 301);

Route::get('/cart', function () {
    return Inertia::render('Cart/Index', [
        'packages' => \App\Models\Package::with('durations')->where('is_signature', false)->orderByRaw('priority ASC NULLS LAST')->orderBy('id', 'desc')->get(),
        'signaturePackages' => \App\Models\Package::where('is_signature', true)->orderByRaw('priority ASC NULLS LAST')->orderBy('id', 'desc')->get()
    ]);
})->name('cart.index');

Route::get('/api/faqs', function () {
    return response()->json(\App\Models\Faq::latest()->take(6)->get());
});

Route::post('/api/voucher/validate', [VoucherController::class, 'validateCode'])->name('api.voucher.validate');

Route::post('/api/transactions', [TransactionController::class, 'store'])->name('transactions.store');

Route::get('/sitemap.xml', function () {
    $blogs = \App\Models\Blog::latest()->get();
    $packages = \App\Models\Package::where('is_signature', true)->get();

    return response()->view('sitemap', [
        'blogs' => $blogs,
        'packages' => $packages,
    ])->header('Content-Type', 'text/xml');
});

require __DIR__.'/auth.php';
