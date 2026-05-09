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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('customer_name');
            $table->string('phone')->nullable();
            $table->text('address');
            $table->date('schedule_date');
            $table->string('schedule_time');
            $table->string('payment_method');
            $table->string('source')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('total_price', 12, 2);
            $table->enum('status', ['pending', 'send_terapis', 'invoice', 'success', 'failed'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
