<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('push_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('fcm_token');
            $table->char('token_hash', 64)->unique();
            $table->string('device_name')->nullable();
            $table->string('platform', 30)->default('web');
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });
        Schema::create('schedule_notifications', function (Blueprint $table) {
            $table->id();
            // Existing transactions are the schedules. NULL is reserved for pipeline tests.
            $table->foreignId('schedule_id')->nullable()->constrained('transactions')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('notify_before_minutes')->default(360);
            $table->timestamp('notify_at');
            $table->string('status', 20)->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->text('fcm_message_id')->nullable();
            $table->text('error_message')->nullable();
            $table->boolean('is_test')->default(false);
            $table->unsignedInteger('revision')->default(1);
            $table->timestamps();
            $table->unique(['schedule_id', 'user_id']);
            $table->index(['status', 'notify_at']);
        });
        Schema::create('push_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_notification_id')->constrained()->cascadeOnDelete();
            $table->foreignId('push_device_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('revision');
            $table->string('status', 20)->default('pending');
            $table->text('fcm_message_id')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
            $table->unique(['schedule_notification_id', 'push_device_id', 'revision'], 'push_delivery_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_deliveries');
        Schema::dropIfExists('schedule_notifications');
        Schema::dropIfExists('push_devices');
    }
};
