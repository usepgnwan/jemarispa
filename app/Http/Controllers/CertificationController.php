<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Certification;
use Inertia\Inertia;

class CertificationController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input('limit', 10);
        $search = $request->input('search');

        $certifications = Certification::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'ilike', "%{$search}%")
                      ->orWhere('description', 'ilike', "%{$search}%");
            })
            ->latest()
            ->paginate($limit)
            ->withQueryString();

        return Inertia::render('Admin/Certification/Index', [
            'certifications' => $certifications,
            'filters' => [
                'search' => $search,
                'limit' => $limit,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:certifications,name',
            'description' => 'nullable|string',
        ]);

        Certification::create($validated);

        return back()->with('message', 'Status sertifikasi berhasil ditambahkan!');
    }

    public function update(Request $request, Certification $certification)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:certifications,name,' . $certification->id,
            'description' => 'nullable|string',
        ]);

        $certification->update($validated);

        return back()->with('message', 'Status sertifikasi berhasil diperbarui!');
    }

    public function destroy(Certification $certification)
    {
        $certification->delete();

        return back()->with('message', 'Status sertifikasi berhasil dihapus!');
    }
}
