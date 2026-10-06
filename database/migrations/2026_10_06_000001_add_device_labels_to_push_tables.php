<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('push_devices', function (Blueprint $table) {
            $table->string('device_label')->nullable();
        });
        Schema::table('push_logs', function (Blueprint $table) {
            $table->string('device_label')->nullable();
        });

        // Preserve labels saved in device_name by the previous label editor.
        DB::table('push_devices')->orderBy('id')->chunkById(100, function ($devices) {
            foreach ($devices as $device) {
                if (!$device->device_name || preg_match('/^(web|android|ios) • /u', $device->device_name)) {
                    continue;
                }
                $original = DB::table('push_logs')->where('push_device_id', $device->id)
                    ->where('device_name', 'like', $device->platform.' • %')->orderBy('id')->value('device_name');
                DB::table('push_devices')->where('id', $device->id)->update([
                    'device_label' => $device->device_name,
                    'device_name' => $original ?? $device->device_name,
                ]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('push_logs', fn (Blueprint $table) => $table->dropColumn('device_label'));
        Schema::table('push_devices', fn (Blueprint $table) => $table->dropColumn('device_label'));
    }
};
