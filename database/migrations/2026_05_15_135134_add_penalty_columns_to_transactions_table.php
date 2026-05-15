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
        Schema::table('transactions', function (Blueprint $column) {
            $column->decimal('penalty_percent', 5, 2)->default(0)->after('discount_amount');
            $column->decimal('penalty_amount', 15, 2)->default(0)->after('penalty_percent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $column) {
            $column->dropColumn(['penalty_percent', 'penalty_amount']);
        });
    }
};
