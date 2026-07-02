<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * 1. Tambah kolom package_id & package_duration_id (nullable) ke transaction_items
     * 2. Strip durasi dari package_name yang tersimpan salah (misal "Full Body Massage 90 Menit" → "Full Body Massage")
     * 3. Backfill package_id & package_duration_id dari data yang ada
     */
    public function up(): void
    {
        // ─── STEP 1: Tambah kolom ───────────────────────────────────────────────────
        Schema::table('transaction_items', function (Blueprint $table) {
            $table->unsignedBigInteger('package_id')->nullable()->after('transaction_id');
            $table->unsignedBigInteger('package_duration_id')->nullable()->after('package_id');

            $table->foreign('package_id')->references('id')->on('packages')->nullOnDelete();
            $table->foreign('package_duration_id')->references('id')->on('package_durations')->nullOnDelete();
        });

        // ─── STEP 2: Strip durasi dari package_name ─────────────────────────────────
        // Contoh: "Full Body Massage 90 Menit" → "Full Body Massage"
        $items = DB::table('transaction_items')->get(['id', 'package_name', 'package_duration']);

        foreach ($items as $item) {
            $cleanedName = trim(preg_replace('/\s+\d+(?:\s*(?:menit|minutes|mins|min))?$/i', '', $item->package_name));

            // ─── STEP 3: Backfill package_id & package_duration_id ──────────────────
            // Prioritaskan paket reguler (is_signature = false) dan cocokkan ke title_id dulu
            $package = DB::table('packages')
                ->where('is_signature', false)
                ->where('title_id', $cleanedName)
                ->first()
            ?? DB::table('packages')
                ->where('is_signature', false)
                ->where('title_en', $cleanedName)
                ->first()
            ?? DB::table('packages')
                ->where('is_signature', false)
                ->where('title_id', 'ilike', '%' . $cleanedName . '%')
                ->first()
            ?? DB::table('packages')
                ->where('title_id', $cleanedName)
                ->first()
            ?? DB::table('packages')
                ->where('title_en', $cleanedName)
                ->first();

            $pkgId = $package?->id;

            $durNum = preg_match('/^\d+/', $item->package_duration, $m) ? $m[0] : null;
            $durationRow = $pkgId ? (DB::table('package_durations')
                ->where('package_id', $pkgId)
                ->where('duration', $item->package_duration)
                ->first()
            ?? ($durNum ? DB::table('package_durations')
                ->where('package_id', $pkgId)
                ->where('duration', 'like', $durNum . '%')
                ->first() : null)) : null;

            DB::table('transaction_items')
                ->where('id', $item->id)
                ->update([
                    'package_name'        => $cleanedName,
                    'package_id'          => $pkgId,
                    'package_duration_id' => $durationRow?->id,
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaction_items', function (Blueprint $table) {
            $table->dropForeign(['package_id']);
            $table->dropForeign(['package_duration_id']);
            $table->dropColumn(['package_id', 'package_duration_id']);
        });

        // package_name tidak dikembalikan karena data asli sudah tidak ada
    }
};
