<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Testimoni;
use App\Models\Transaction;
use Inertia\Inertia;

class TestimoniController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input('limit', 10);
        $search = $request->input('search');

        $testimonis = Testimoni::with('transaction.items.employee')
            ->when($search, function ($query, $search) {
                $query->where('name', 'ilike', "%{$search}%")
                      ->orWhere('packages_description', 'ilike', "%{$search}%")
                      ->orWhere('source', 'ilike', "%{$search}%");
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
            'is_published' => 'boolean',
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
            'is_published' => 'boolean',
        ]);

        $testimoni->update($validated);

        return back();
    }

    public function destroy(Testimoni $testimoni)
    {
        $testimoni->delete();

        return back();
    }

    /**
     * Toggle the publish status of a testimonial.
     */
    public function togglePublish(Testimoni $testimoni)
    {
        $testimoni->update(['is_published' => !$testimoni->is_published]);
        return back()->with('message', $testimoni->is_published ? 'Testimoni dipublikasikan' : 'Testimoni disembunyikan');
    }

    /**
     * Show the customer-facing review form (public, token-gated).
     */
    public function showReviewForm(string $token)
    {
        $transaction = Transaction::where('review_token', $token)->firstOrFail();

        if (!$transaction->isReviewTokenValid()) {
            abort(404);
        }

        // Check if already submitted
        $alreadyReviewed = $transaction->testimoni()->exists();

        return Inertia::render('Review/Index', [
            'transaction' => [
                'customer_name' => $transaction->customer_name,
                'order_number' => $transaction->order_number,
                'packages' => $transaction->items->map(fn($i) => $i->package_name)->unique()->values(),
            ],
            'token' => $token,
            'already_reviewed' => $alreadyReviewed,
        ]);
    }

    /**
     * Handle submission from the customer review form.
     */
    public function submitReview(Request $request, string $token)
    {
        $transaction = Transaction::where('review_token', $token)->firstOrFail();

        if (!$transaction->isReviewTokenValid()) {
            return back()->withErrors(['token' => 'Link review sudah kedaluwarsa.']);
        }

        if ($transaction->testimoni()->exists()) {
            return back()->withErrors(['token' => 'Review sudah pernah dikirimkan.']);
        }

        $validated = $request->validate([
            'description' => 'required|string|max:1000',
            'star' => 'required|integer|min:1|max:5',
        ]);

        Testimoni::create([
            'name' => $transaction->customer_name,
            'description' => $validated['description'],
            'packages_description' => $transaction->items->map(fn($i) => $i->package_name)->unique()->implode(', '),
            'source' => 'Website',
            'star' => $validated['star'],
            'is_published' => false, // Admin must publish manually
            'transaction_id' => $transaction->id,
        ]);

        return back()->with('success', true);
    }
}
