<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('push_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('push_device_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('schedule_notification_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('schedule_id')->nullable()->constrained('transactions')->nullOnDelete();
            $table->string('type', 20);
            $table->string('status', 20)->default('pending');
            $table->string('order_number')->nullable();
            $table->string('device_name')->nullable();
            $table->text('title');
            $table->text('body');
            $table->unsignedInteger('revision')->nullable();
            $table->unsignedSmallInteger('notify_before_minutes')->nullable();
            $table->text('fcm_message_id')->nullable();
            $table->string('error_code')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_logs');
    }
};
