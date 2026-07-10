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
        Schema::table('employees', function (Blueprint $table) {
            $table->string('fullname')->nullable()->after('name');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('fullname')->nullable()->after('name');
        });

        DB::table('employees')->update(['fullname' => DB::raw('name')]);
        DB::table('users')->update(['fullname' => DB::raw('name')]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('fullname');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('fullname');
        });
    }
};
