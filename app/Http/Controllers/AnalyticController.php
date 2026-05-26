<?php

namespace App\Http\Controllers;

use App\Models\Analytic;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $analyticQuery = Analytic::query();
        $transactionQuery = \App\Models\Transaction::query();

        if ($startDate && $endDate) {
            $analyticQuery->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
            $transactionQuery->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }

        // History table
        $analytics = (clone $analyticQuery)->orderBy('created_at', 'desc')->paginate(20)->appends($request->query());

        // Summary Stats
        $totalClicks = (clone $analyticQuery)->count();
        // Today and This Month logic (always relative to now unless you want them relative to filter, keeping relative to now for "Today" label logic)
        $clicksToday = Analytic::whereDate('created_at', now()->today())->count();
        $clicksThisMonth = Analytic::where('created_at', '>=', now()->startOfMonth())->count();

        // Get Top 5 titles for the multi-line trend chart
        $top5Titles = (clone $analyticQuery)->select('title')
            ->groupBy('title')
            ->orderByRaw('count(*) desc')
            ->limit(5)
            ->pluck('title')
            ->toArray();

        // Data for Daily Trend per Title (last 14 days or filtered)
        $rawTrend = (clone $analyticQuery)->select(
                \DB::raw("TO_CHAR(created_at, 'DD Mon') as date_label"),
                'title',
                \DB::raw('count(*) as total')
            )
            ->whereIn('title', $top5Titles)
            ->when(!$startDate, function($q) {
                $q->where('created_at', '>=', now()->subDays(14));
            })
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

        // Data for Item Distribution (Pie Chart)
        $byItem = (clone $analyticQuery)->select('title as name', \DB::raw('count(*) as value'))
            ->groupBy('title')
            ->orderBy('value', 'desc')
            ->limit(10)
            ->get();

        // Device Detection Stats
        $analyticsAll = (clone $analyticQuery)->get();
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
        $topActions = (clone $analyticQuery)->select('title', 'category', \DB::raw('count(*) as total'))
            ->groupBy('title', 'category')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get();

        // Booking Sources (Transactions)
        $sourceCounts = $transactionQuery->select('source', \DB::raw('count(*) as count'))
            ->groupBy('source')
            ->pluck('count', 'source');
        
        $platforms = \App\Models\Platform::all()->pluck('title')->toArray();
        $allSources = array_unique(array_merge(['Website', 'Whatsapp', 'Instagram'], $platforms, $sourceCounts->keys()->toArray()));
        
        $bookingSources = [];
        foreach ($allSources as $src) {
            $bookingSources[] = [
                'name' => $src,
                'value' => $sourceCounts[$src] ?? 0,
            ];
        }
        
        // Sort descending by value
        usort($bookingSources, function($a, $b) {
            return $b['value'] <=> $a['value'];
        });

        return Inertia::render('Admin/Analytic/Index', [
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'analytics' => $analytics,
            'stats' => [
                'total' => $totalClicks,
                'today' => $clicksToday,
                'this_month' => $clicksThisMonth,
                'by_item' => $byItem,
                'trend' => $trend,
                'top_titles' => $top5Titles,
                'top_actions' => $topActions,
                'device_distribution' => $deviceDistribution,
                'booking_sources' => $bookingSources
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
