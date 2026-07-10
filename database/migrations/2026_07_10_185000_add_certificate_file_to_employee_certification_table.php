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
        Schema::table('employee_certification', function (Blueprint $table) {
            $table->string('certificate_file')->nullable()->after('certification_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employee_certification', function (Blueprint $table) {
            $table->dropColumn('certificate_file');
        });
    }
};
