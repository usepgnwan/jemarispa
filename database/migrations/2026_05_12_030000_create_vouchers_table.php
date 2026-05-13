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
        Schema::create('vouchers', function (Blueprint $description) {
            $description->id();
            $description->string('code')->unique();
            $description->text('description')->nullable();
            $description->enum('type', ['free', 'paid'])->default('free');
            $description->decimal('discount_amount', 15, 2);
            $description->decimal('price', 15, 2)->nullable();
            $description->string('customer_name')->nullable();
            $description->integer('quota')->default(1);
            $description->integer('used_count')->default(0);
            $description->date('expired_at');
            $description->boolean('is_active')->default(true);
            $description->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
