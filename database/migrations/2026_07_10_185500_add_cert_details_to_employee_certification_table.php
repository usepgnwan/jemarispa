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
            $table->string('certificate_number')->nullable()->after('certificate_file');
            $table->date('valid_until')->nullable()->after('certificate_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employee_certification', function (Blueprint $table) {
            $table->dropColumn(['certificate_number', 'valid_until']);
        });
    }
};
