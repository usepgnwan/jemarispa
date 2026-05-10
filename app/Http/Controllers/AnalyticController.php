<?php

namespace App\Http\Controllers;

use App\Models\Analytic;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticController extends Controller
{
    public function index()
    {
        // History table
        $analytics = Analytic::orderBy('created_at', 'desc')->paginate(20);

        // Summary Stats
        $totalClicks = Analytic::count();
        $clicksToday = Analytic::whereDate('created_at', now()->today())->count();
        $clicksThisMonth = Analytic::where('created_at', '>=', now()->startOfMonth())->count();

        // Get Top 5 titles for the multi-line trend chart
        $top5Titles = Analytic::select('title')
            ->groupBy('title')
            ->orderByRaw('count(*) desc')
            ->limit(5)
            ->pluck('title')
            ->toArray();

        // Data for Daily Trend per Title (last 14 days)
        $rawTrend = Analytic::select(
                \DB::raw("TO_CHAR(created_at, 'DD Mon') as date_label"),
                'title',
                \DB::raw('count(*) as total')
            )
            ->whereIn('title', $top5Titles)
            ->where('created_at', '>=', now()->subDays(14))
            ->groupBy('date_label', 'title')
            ->orderBy(\DB::raw('min(created_at)'), 'asc')
            ->get();

        // Pivot trend data for Recharts: [{ date_label: '10 May', 'Menu A': 5, 'Menu B': 3, ... }]
        $trend = $rawTrend->groupBy('date_label')->map(function ($items, $date) {
            $row = ['date_label' => $date];
            foreach ($items as $item) {
                $row[$item->title] = (int) $item->total;
            }
            return $row;
        })->values();

        // Get unique categories for chart lines (optional, kept for flexibility)
        $categories = Analytic::whereNotNull('category')->distinct()->pluck('category')->toArray();

        // Data for Item Distribution (Pie Chart)
        $byItem = Analytic::select('title as name', \DB::raw('count(*) as value'))
            ->groupBy('title')
            ->orderBy('value', 'desc')
            ->limit(10)
            ->get();

        // Device Detection Stats
        $analyticsAll = Analytic::all();
        $deviceStats = [
            'Mobile' => 0,
            'Desktop' => 0
        ];

        foreach ($analyticsAll as $a) {
            $agent = strtolower($a->user_agent);
            $isMobile = str_contains($agent, 'mobile') || str_contains($agent, 'android') || str_contains($agent, 'iphone');
            if ($isMobile) {
                $deviceStats['Mobile']++;
            } else {
                $deviceStats['Desktop']++;
            }
        }

        $deviceDistribution = [
            ['name' => 'Mobile', 'value' => $deviceStats['Mobile']],
            ['name' => 'Desktop', 'value' => $deviceStats['Desktop']],
        ];

        // Top Actions (keep for list)
        $topActions = Analytic::select('title', 'category', \DB::raw('count(*) as total'))
            ->groupBy('title', 'category')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Admin/Analytic/Index', [
            'analytics' => $analytics,
            'stats' => [
                'total' => $totalClicks,
                'today' => $clicksToday,
                'this_month' => $clicksThisMonth,
                'by_item' => $byItem,
                'trend' => $trend,
                'top_titles' => $top5Titles,
                'top_actions' => $topActions,
                'device_distribution' => $deviceDistribution
            ]
        ]);
    }

    public function store(Request $request)
    {
        Analytic::create([
            'title' => $request->title,
            'category' => $request->category, // menu name
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['success' => true]);
    }
}
