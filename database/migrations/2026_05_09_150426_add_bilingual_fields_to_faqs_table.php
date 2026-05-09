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
        Schema::table('faqs', function (Blueprint $table) {
            $table->renameColumn('title', 'title_id');
            $table->renameColumn('description', 'description_id');
            $table->string('title_en')->nullable()->after('title');
            $table->text('description_en')->nullable()->after('description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('faqs', function (Blueprint $table) {
            $table->renameColumn('title_id', 'title');
            $table->renameColumn('description_id', 'description');
            $table->dropColumn(['title_en', 'description_en']);
        });
    }
};
