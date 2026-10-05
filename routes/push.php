<?php

use App\Http\Controllers\PushNotificationController;
use Illuminate\Support\Facades\Route;

// Keep the existing session authentication and CSRF protection for the Inertia PWA.
Route::prefix('api')->middleware(['auth', 'role:admin,cs', 'push.active'])->group(function () {
    Route::post('push/devices', [PushNotificationController::class, 'storeDevice'])->middleware('throttle:20,1');
    Route::delete('push/devices/{device}', [PushNotificationController::class, 'destroyDevice']);
    Route::get('schedules/today', [PushNotificationController::class, 'today']);
    Route::get('notifications/logs', [PushNotificationController::class, 'logs']);
    Route::patch('schedules/{schedule}/notification', [PushNotificationController::class, 'updateNotification']);
    Route::post('notifications/test-now', [PushNotificationController::class, 'testNow'])->middleware('throttle:10,1');
    Route::post('notifications/test-schedule', [PushNotificationController::class, 'testSchedule'])->middleware('throttle:10,1');
});

// Firebase web configuration is public; service-account credentials never enter this response.
Route::get('/firebase-config.js', function () {
    return response('self.JEMARI_FIREBASE_CONFIG = '.json_encode(config('push.web'), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT).';')
        ->header('Content-Type', 'application/javascript')->header('Cache-Control', 'no-cache');
});
