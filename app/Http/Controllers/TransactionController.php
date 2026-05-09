<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input('limit', 10);
        $search = $request->input('search');
        $tab = $request->input('tab', 'recent');

        $query = Transaction::with(['items' => function($query) {
            $query->orderBy('guest_index', 'asc');
        }]);

        // Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Tab Filtering
        if ($tab === 'recent') {
            $query->where('created_at', '>=', now()->subDays(3));
        } else if (in_array($tab, ['pending', 'send_terapis', 'invoice', 'success', 'failed'])) {
            $query->where('status', $tab);
        }

        $transactions = $query->latest()
            ->paginate($limit)
            ->withQueryString();

        // Get counts for tabs
        $counts = [
            'recent' => Transaction::where('created_at', '>=', now()->subDays(3))->count(),
            'pending' => Transaction::where('status', 'pending')->count(),
            'send_terapis' => Transaction::where('status', 'send_terapis')->count(),
            'invoice' => Transaction::where('status', 'invoice')->count(),
            'success' => Transaction::where('status', 'success')->count(),
            'failed' => Transaction::where('status', 'failed')->count(),
        ];

        return Inertia::render('Admin/Transaction/Index', [
            'transactions' => $transactions,
            'filters' => [
                'search' => $search,
                'limit' => $limit,
                'tab' => $tab,
            ],
            'counts' => $counts
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'required|string',
            'schedule_date' => 'required|date',
            'schedule_time' => 'required|string',
            'payment_method' => 'required|string',
            'source' => 'nullable|string',
            'notes' => 'nullable|string',
            'total_price' => 'required|numeric',
            'guests' => 'required|array|min:1',
        ]);

        return DB::transaction(function () use ($validated) {
            $orderNumber = 'INV/' . date('y/m/') . sprintf('%04d', Transaction::count() + 1);

            $transaction = Transaction::create([
                'order_number' => $orderNumber,
                'customer_name' => $validated['customer_name'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
                'schedule_date' => $validated['schedule_date'],
                'schedule_time' => $validated['schedule_time'],
                'payment_method' => $validated['payment_method'],
                'source' => $validated['source'],
                'notes' => $validated['notes'],
                'total_price' => $validated['total_price'],
                'status' => 'pending',
            ]);

            foreach ($validated['guests'] as $i => $guest) {
                foreach ($guest['packages'] as $package) {
                    TransactionItem::create([
                        'transaction_id' => $transaction->id,
                        'guest_index' => $i + 1,
                        'guest_gender' => $guest['guestGender'],
                        'therapist_gender_preference' => $guest['therapistGender'],
                        'package_name' => $package['name'],
                        'package_duration' => $package['duration'] . ' Menit',
                        'price' => $package['price'],
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Transaction created successfully',
                'transaction' => $transaction,
            ]);
        });
    }

    public function updateStatus(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,send_terapis,invoice,success,failed',
        ]);

        $transaction->update($validated);

        return back()->with('message', 'Status transaksi berhasil diperbarui');
    }

    public function destroy(Transaction $transaction)
    {
        $transaction->delete();
        return back()->with('message', 'Transaksi berhasil dihapus');
    }
}
