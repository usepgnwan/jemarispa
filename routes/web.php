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
        'testimonials' => \App\Models\Testimoni::latest()->take(6)->get()
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

use App\Http\Controllers\PlatformController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\TestimoniController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TransactionController;

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Admin routes
    Route::resource('platform', PlatformController::class)->except(['show']);
    Route::resource('faq', FaqController::class)->except(['show']);
    Route::resource('testimoni', TestimoniController::class)->except(['show']);
    Route::resource('admin/blog', BlogController::class)->names('admin.blog')->except(['show']);
    Route::resource('admin/package', PackageController::class)->names('admin.package')->except(['show']);
    Route::resource('admin/employee', EmployeeController::class)->names('admin.employee')->except(['show']);
    
    // Settings routes
    Route::get('admin/settings', [SettingController::class, 'index'])->name('admin.settings.index');
    Route::post('admin/settings', [SettingController::class, 'update'])->name('admin.settings.update');
    Route::post('admin/settings/areas', [SettingController::class, 'storeArea'])->name('admin.settings.areas.store');
    Route::put('admin/settings/areas/{area}', [SettingController::class, 'updateArea'])->name('admin.settings.areas.update');
    Route::delete('admin/settings/areas/{area}', [SettingController::class, 'destroyArea'])->name('admin.settings.areas.destroy');

    // Transaction management
    Route::get('admin/transaction', [TransactionController::class, 'index'])->name('admin.transaction.index');
    Route::patch('admin/transaction/{transaction}/status', [TransactionController::class, 'updateStatus'])->name('admin.transaction.update-status');
    Route::delete('admin/transaction/{transaction}', [TransactionController::class, 'destroy'])->name('admin.transaction.destroy');
});

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
