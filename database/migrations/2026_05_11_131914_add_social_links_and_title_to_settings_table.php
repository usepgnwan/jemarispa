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
        Schema::table('settings', function (Blueprint $table) {
            $table->string('title')->nullable();
            $table->string('url_fb')->nullable();
            $table->string('url_instagram')->nullable();
            $table->string('url_x')->nullable();
            $table->string('url_tiktok')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn(['title', 'url_fb', 'url_instagram', 'url_x', 'url_tiktok']);
        });
    }
};
