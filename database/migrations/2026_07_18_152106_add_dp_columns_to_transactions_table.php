<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->enum('payment_type', ['full', 'dp'])->default('full')->after('payment_method');
            $table->decimal('dp_amount', 12, 2)->nullable()->after('payment_type');
            $table->boolean('is_pelunasan_paid')->default(false)->after('dp_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['payment_type', 'dp_amount', 'is_pelunasan_paid']);
        });
    }
};
