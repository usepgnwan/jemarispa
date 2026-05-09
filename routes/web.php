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
    return Inertia::render('Pricing/Index');
})->name('pricing.index');

Route::get('/cart', function () {
    return Inertia::render('Cart/Index');
})->name('cart.index');

require __DIR__.'/auth.php';
