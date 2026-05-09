<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Testimoni;
use Inertia\Inertia;

class TestimoniController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input('limit', 10);
        $search = $request->input('search');

        $testimonis = Testimoni::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('packages_description', 'like', "%{$search}%")
                      ->orWhere('source', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($limit)
            ->withQueryString();

        return Inertia::render('Admin/Testimoni/Index', [
            'testimonis' => $testimonis,
            'filters' => $request->only(['search', 'limit']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'packages_description' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:255',
            'star' => 'required|integer|min:1|max:5',
        ]);

        Testimoni::create($validated);

        return back();
    }

    public function update(Request $request, Testimoni $testimoni)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'packages_description' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:255',
            'star' => 'required|integer|min:1|max:5',
        ]);

        $testimoni->update($validated);

        return back();
    }

    public function destroy(Testimoni $testimoni)
    {
        $testimoni->delete();

        return back();
    }
}
