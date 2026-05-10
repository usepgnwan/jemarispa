<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class SignatureRitualController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input('limit', 10);
        $search = $request->input('search');

        $rituals = Package::query()
            ->where('is_signature', true)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title_id', 'like', "%{$search}%")
                      ->orWhere('title_en', 'like', "%{$search}%")
                      ->orWhere('category_id', 'like', "%{$search}%")
                      ->orWhere('category_en', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($limit)
            ->withQueryString();

        return Inertia::render('Admin/SignatureRitual/Index', [
            'rituals' => $rituals,
            'filters' => $request->only(['search', 'limit']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/SignatureRitual/Create');
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
            'image' => 'nullable|image|max:5120',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('packages', 'public');
        }

        Package::create([
            'title_id' => $validated['title_id'],
            'title_en' => $validated['title_en'],
            'category_id' => $validated['category_id'],
            'category_en' => $validated['category_en'],
            'description_id' => $validated['description_id'],
            'description_en' => $validated['description_en'],
            'is_signature' => true,
            'image' => $imagePath,
        ]);

        return redirect()->route('admin.signature-ritual.index')->with('message', 'Main Service berhasil ditambahkan!');
    }

    public function edit(Package $signature_ritual)
    {
        // Check if it's actually a signature ritual
        if (!$signature_ritual->is_signature) {
            return redirect()->route('admin.signature-ritual.index');
        }

        return Inertia::render('Admin/SignatureRitual/Edit', [
            'ritual' => $signature_ritual
        ]);
    }

    public function update(Request $request, Package $signature_ritual)
    {
        $validated = $request->validate([
            'title_id' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'category_id' => 'nullable|string|max:255',
            'category_en' => 'nullable|string|max:255',
            'description_id' => 'nullable|string',
            'description_en' => 'nullable|string',
            'image' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            if ($signature_ritual->image) {
                Storage::disk('public')->delete($signature_ritual->image);
            }
            $signature_ritual->image = $request->file('image')->store('packages', 'public');
        }

        $signature_ritual->update([
            'title_id' => $validated['title_id'],
            'title_en' => $validated['title_en'],
            'category_id' => $validated['category_id'],
            'category_en' => $validated['category_en'],
            'description_id' => $validated['description_id'],
            'description_en' => $validated['description_en'],
            'is_signature' => true,
            'image' => $signature_ritual->image,
        ]);

        return redirect()->route('admin.signature-ritual.index')->with('message', 'Main Service berhasil diperbarui!');
    }

    public function destroy(Package $signature_ritual)
    {
        if ($signature_ritual->image) {
            Storage::disk('public')->delete($signature_ritual->image);
        }
        
        $signature_ritual->delete();

        return redirect()->route('admin.signature-ritual.index')->with('message', 'Main Service berhasil dihapus!');
    }
}
