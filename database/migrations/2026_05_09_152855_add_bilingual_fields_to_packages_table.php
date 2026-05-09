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
        Schema::table('packages', function (Blueprint $table) {
            $table->renameColumn('title', 'title_id');
            $table->renameColumn('category', 'category_id');
            $table->renameColumn('description', 'description_id');
            
            $table->string('title_en')->nullable()->after('title_id');
            $table->string('category_en')->nullable()->after('category_id');
            $table->text('description_en')->nullable()->after('description_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            //
        });
    }
};
