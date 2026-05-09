<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Platform;
use Inertia\Inertia;

class PlatformController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input('limit', 10);
        $search = $request->input('search');

        $platforms = Platform::query()
            ->when($search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('url', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($limit)
            ->withQueryString();

        return Inertia::render('Admin/Platform/Index', [
            'platforms' => $platforms,
            'filters' => [
                'search' => $search,
                'limit' => $limit,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'url' => 'required|url|max:255',
        ]);

        Platform::create($validated);

        return back()->with('message', 'Platform berhasil ditambahkan');
    }

    public function update(Request $request, Platform $platform)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'url' => 'required|url|max:255',
        ]);

        $platform->update($validated);

        return back()->with('message', 'Platform berhasil diupdate');
    }

    public function destroy(Platform $platform)
    {
        $platform->delete();

        return back()->with('message', 'Platform berhasil dihapus');
    }
}
