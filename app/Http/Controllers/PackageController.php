<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PackageController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input('limit', 10);
        $search = $request->input('search');

        $packages = Package::query()
            ->with('durations')
            ->when($search, function ($query, $search) {
                $query->where('title_id', 'like', "%{$search}%")
                      ->orWhere('title_en', 'like', "%{$search}%")
                      ->orWhere('category_id', 'like', "%{$search}%")
                      ->orWhere('category_en', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($limit)
            ->withQueryString();

        return Inertia::render('Admin/Package/Index', [
            'packages' => $packages,
            'filters' => $request->only(['search', 'limit']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Package/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title_id' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'category_id' => 'nullable|string|max:255',
            'category_en' => 'nullable|string|max:255',
            'description_id' => 'nullable|string',
            'description_en' => 'nullable|string',
            'durations' => 'required|array|min:1',
            'durations.*.duration' => 'required|string|max:255',
            'durations.*.price' => 'required|numeric|min:0',
            'durations.*.commission' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $package = Package::create([
                'title_id' => $validated['title_id'],
                'title_en' => $validated['title_en'],
                'category_id' => $validated['category_id'],
                'category_en' => $validated['category_en'],
                'description_id' => $validated['description_id'],
                'description_en' => $validated['description_en'],
            ]);

            foreach ($validated['durations'] as $durationData) {
                $package->durations()->create([
                    'duration' => $durationData['duration'],
                    'price' => $durationData['price'],
                    'commission' => $durationData['commission'] ?? 0,
                ]);
            }
        });

        return redirect()->route('admin.package.index')->with('message', 'Paket berhasil ditambahkan!');
    }

    public function edit(Package $package)
    {
        $package->load('durations');

        return Inertia::render('Admin/Package/Edit', [
            'package' => $package
        ]);
    }

    public function update(Request $request, Package $package)
    {
        $validated = $request->validate([
            'title_id' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'category_id' => 'nullable|string|max:255',
            'category_en' => 'nullable|string|max:255',
            'description_id' => 'nullable|string',
            'description_en' => 'nullable|string',
            'durations' => 'required|array|min:1',
            'durations.*.duration' => 'required|string|max:255',
            'durations.*.price' => 'required|numeric|min:0',
            'durations.*.commission' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($request, $package, $validated) {
            $package->update([
                'title_id' => $validated['title_id'],
                'title_en' => $validated['title_en'],
                'category_id' => $validated['category_id'],
                'category_en' => $validated['category_en'],
                'description_id' => $validated['description_id'],
                'description_en' => $validated['description_en'],
            ]);

            // Sync durations by deleting old ones and inserting new ones
            $package->durations()->delete();

            foreach ($validated['durations'] as $durationData) {
                $package->durations()->create([
                    'duration' => $durationData['duration'],
                    'price' => $durationData['price'],
                    'commission' => $durationData['commission'] ?? 0,
                ]);
            }
        });

        return redirect()->route('admin.package.index')->with('message', 'Paket berhasil diperbarui!');
    }

    public function destroy(Package $package)
    {
        $package->delete(); // Cascade on delete will handle durations

        return redirect()->route('admin.package.index')->with('message', 'Paket berhasil dihapus!');
    }
}
