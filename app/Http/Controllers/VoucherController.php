<?php

namespace App\Http\Controllers;

use App\Models\Voucher;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class VoucherController extends Controller
{
    public function index(Request $request)
    {
        $vouchers = Voucher::latest()->paginate(10);
        $packages = \App\Models\Package::where('is_signature', false)->with('durations')->get();

        return Inertia::render('Admin/Voucher/Index', [
            'vouchers' => $vouchers,
            'packages' => $packages
        ]);
    }

    public function create()
    {
        $packages = \App\Models\Package::where('is_signature', false)->with('durations')->get();
        return Inertia::render('Admin/Voucher/Form', [
            'packages' => $packages
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:vouchers,code',
            'description' => 'nullable|string',
            'category' => 'required|in:standard,bundle',
            'bundle_packages' => 'nullable|required_if:category,bundle|array',
            'type' => 'required|in:free,paid',
            'discount_amount' => 'required|numeric|min:0',
            'price' => 'nullable|required_if:type,paid|numeric|min:0',
            'customer_name' => 'nullable|required_if:type,paid|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'quota' => 'required|integer|min:1',
            'expired_at' => 'required|date|after_or_equal:today',
        ]);

        Voucher::create($validated);

        return redirect()->route('admin.voucher.index')->with('message', 'Voucher berhasil dibuat');
    }

    public function edit(Voucher $voucher)
    {
        $packages = \App\Models\Package::where('is_signature', false)->with('durations')->get();
        return Inertia::render('Admin/Voucher/Form', [
            'voucher' => $voucher,
            'packages' => $packages
        ]);
    }

    public function update(Request $request, Voucher $voucher)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:vouchers,code,' . $voucher->id,
            'description' => 'nullable|string',
            'category' => 'required|in:standard,bundle',
            'bundle_packages' => 'nullable|required_if:category,bundle|array',
            'type' => 'required|in:free,paid',
            'discount_amount' => 'required|numeric|min:0',
            'price' => 'nullable|required_if:type,paid|numeric|min:0',
            'customer_name' => 'nullable|required_if:type,paid|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'quota' => 'required|integer|min:1',
            'expired_at' => 'required|date|after_or_equal:today',
            'is_active' => 'required|boolean',
        ]);

        $voucher->update($validated);

        return redirect()->route('admin.voucher.index')->with('message', 'Voucher berhasil diperbarui');
    }

    public function downloadPdf(Voucher $voucher)
    {
        $setting = \App\Models\Setting::first();
        $pdf = Pdf::loadView('pdf.voucher', compact('voucher', 'setting'));
        
        // Use the voucher code for the filename
        $filename = 'Voucher-' . strtoupper($voucher->code) . '.pdf';
        
        return $pdf->stream($filename);
    }

    public function destroy(Voucher $voucher)
    {
        $voucher->delete();

        return back()->with('message', 'Voucher berhasil dihapus');
    }

    /**
     * API to validate voucher code
     */
    public function validateCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $voucher = Voucher::where('code', $request->code)
            ->active()
            ->notExpired()
            ->first();

        if (!$voucher) {
            return response()->json([
                'success' => false,
                'message' => 'Voucher tidak ditemukan atau sudah kadaluarsa'
            ], 404);
        }

        if ($voucher->used_count >= $voucher->quota) {
            return response()->json([
                'success' => false,
                'message' => 'Kuota voucher sudah habis'
            ], 422);
        }

        return response()->json([
            'success' => true,
            'voucher' => $voucher
        ]);
    }
}
