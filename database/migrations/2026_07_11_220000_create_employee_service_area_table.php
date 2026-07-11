<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('employee_service_area', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('service_area_id')->constrained('service_areas')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['employee_id', 'service_area_id']);
        });

        // Ensure default service areas exist if table is empty
        if (DB::table('service_areas')->count() === 0) {
            $defaultAreas = [
                ['name' => 'Pijat Panggilan Bandung', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Kota Cimahi', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Kabupaten Bandung', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Kabupaten Bandung Barat', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Jakarta Selatan', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Jakarta Pusat', 'created_at' => now(), 'updated_at' => now()],
            ];
            DB::table('service_areas')->insert($defaultAreas);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_service_area');
    }
};
