<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Skill;
use Inertia\Inertia;

class SkillController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input('limit', 10);
        $search = $request->input('search');

        $skills = Skill::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'ilike', "%{$search}%")
                      ->orWhere('description', 'ilike', "%{$search}%");
            })
            ->latest()
            ->paginate($limit)
            ->withQueryString();

        return Inertia::render('Admin/Skill/Index', [
            'skills' => $skills,
            'filters' => [
                'search' => $search,
                'limit' => $limit,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:skills,name',
            'description' => 'nullable|string',
        ]);

        Skill::create($validated);

        return back()->with('message', 'Bidang keahlian berhasil ditambahkan!');
    }

    public function update(Request $request, Skill $skill)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:skills,name,' . $skill->id,
            'description' => 'nullable|string',
        ]);

        $skill->update($validated);

        return back()->with('message', 'Bidang keahlian berhasil diperbarui!');
    }

    public function destroy(Skill $skill)
    {
        $skill->delete();

        return back()->with('message', 'Bidang keahlian berhasil dihapus!');
    }
}
