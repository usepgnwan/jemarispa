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
        Schema::table('package_durations', function (Blueprint $table) {
            $table->enum('status', ['public', 'private'])->default('public')->after('commission');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('package_durations', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
