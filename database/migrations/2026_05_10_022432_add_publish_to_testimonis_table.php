<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('testimonis', function (Blueprint $table) {
            $table->boolean('is_published')->default(false)->after('star');
            $table->unsignedBigInteger('transaction_id')->nullable()->after('is_published');
            $table->foreign('transaction_id')->references('id')->on('transactions')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('testimonis', function (Blueprint $table) {
            $table->dropForeign(['transaction_id']);
            $table->dropColumn(['is_published', 'transaction_id']);
        });
    }
};
