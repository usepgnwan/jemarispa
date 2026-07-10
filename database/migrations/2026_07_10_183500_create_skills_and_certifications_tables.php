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
        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('certifications', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('employee_skill', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('skill_id')->constrained('skills')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['employee_id', 'skill_id']);
        });

        Schema::create('employee_certification', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('certification_id')->constrained('certifications')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['employee_id', 'certification_id']);
        });

        // Seed default skills
        $skills = [
            ['name' => 'Pijat Tradisional', 'description' => 'Teknik pijat urut tradisional seluruh tubuh', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Lulur & Scrub', 'description' => 'Perawatan eksfoliasi kulit tubuh', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Totok Wajah', 'description' => 'Pijatan akupresur pada area wajah', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Refleksi', 'description' => 'Pijat titik saraf telapak kaki & tangan', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Spa & Aromaterapi', 'description' => 'Perawatan relaksasi dengan essential oil', 'created_at' => now(), 'updated_at' => now()],
        ];
        DB::table('skills')->insert($skills);

        // Seed default certifications
        $certifications = [
            ['name' => 'Pelatihan Internal Jemari Home Spa', 'description' => 'Lulus standar SOP dan pelatihan internal Jemari Home Spa', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Sertifikasi Kompetensi BNSP', 'description' => 'Sertifikat resmi keahlian terapis dari BNSP', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Sertifikasi Terapis Profesional', 'description' => 'Sertifikat pelatihan dari lembaga resmi spa & kecantikan', 'created_at' => now(), 'updated_at' => now()],
        ];
        DB::table('certifications')->insert($certifications);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_certification');
        Schema::dropIfExists('employee_skill');
        Schema::dropIfExists('certifications');
        Schema::dropIfExists('skills');
    }
};
