<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('push_logs', function (Blueprint $table) {
            $table->foreignId('receiver_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('receiver_user_name')->nullable();
        });

        DB::table('push_logs')->join('push_devices', 'push_devices.id', '=', 'push_logs.push_device_id')
            ->join('users', 'users.id', '=', 'push_devices.user_id')
            ->select('push_logs.id', 'users.id as receiver_id', 'users.name as receiver_name')
            ->chunkById(100, function ($logs) {
                foreach ($logs as $log) {
                    DB::table('push_logs')->where('id', $log->id)->update([
                        'receiver_user_id' => $log->receiver_id,
                        'receiver_user_name' => $log->receiver_name,
                    ]);
                }
            }, 'push_logs.id', 'id');
    }

    public function down(): void
    {
        Schema::table('push_logs', function (Blueprint $table) {
            $table->dropForeign(['receiver_user_id']);
            $table->dropColumn(['receiver_user_id', 'receiver_user_name']);
        });
    }
};
