<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use App\Models\Setting;
use App\Models\ServiceArea;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $notifications = [];
        if ($request->user() && in_array($request->user()->role, ['admin', 'cs'])) {
            $notifications = \App\Models\Transaction::whereDate('created_at', \Carbon\Carbon::today())
                                ->orderBy('created_at', 'desc')
                                ->get()
                                ->map(function($t) {
                                    return [
                                        'id' => $t->id,
                                        'order_number' => $t->order_number,
                                        'customer_name' => $t->customer_name,
                                        'status' => $t->status,
                                        'time' => $t->created_at->format('H:i'),
                                    ];
                                });
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'message' => $request->session()->get('message'),
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'app_settings' => Setting::first(),
            'service_areas' => ServiceArea::all(),
            'notifications' => $notifications,
        ];
    }
}
