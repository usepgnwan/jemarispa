<?php

namespace App\Services;

use App\Exceptions\FcmException;
use App\Models\PushDevice;
use App\Models\PushLog;
use App\Models\ScheduleNotification;
use App\Models\Transaction;
use Illuminate\Http\Client\ConnectionException;
use Throwable;

class PushLogService
{
    public function start(int $userId, string $type, array $message, ?PushDevice $device = null,
        ?Transaction $schedule = null, ?ScheduleNotification $notification = null): PushLog
    {
        return PushLog::create([
            'user_id' => $userId, 'type' => $type,
            'push_device_id' => $device?->id, 'device_name' => $device?->device_name ?? ($device ? 'Device '.$device->id : null),
            'device_label' => $device?->device_label,
            'receiver_user_id' => $device?->user_id,
            'receiver_user_name' => $device?->user?->name,
            'schedule_id' => $schedule?->id, 'order_number' => $schedule?->order_number,
            'schedule_notification_id' => $notification?->id, 'revision' => $notification?->revision,
            'notify_before_minutes' => $notification?->notify_before_minutes,
            'title' => $message['title'], 'body' => $message['body'], 'status' => 'pending',
        ]);
    }

    public function send(FcmService $fcm, PushLog $log, PushDevice $device, array $data): string
    {
        try {
            $id = $fcm->send($device->fcm_token, $data);
        } catch (Throwable $exception) {
            $this->fail($log, ...$this->error($exception));
            throw $exception;
        }
        $log->update(['status' => 'success', 'fcm_message_id' => $id, 'finished_at' => now('UTC')]);

        return $id;
    }

    public function fail(PushLog $log, string $code, string $message): void
    {
        $log->update(['status' => 'failed', 'error_code' => $code, 'error_message' => $message, 'finished_at' => now('UTC')]);
    }

    public function error(Throwable $exception): array
    {
        if ($exception instanceof FcmException) {
            $detail = match ($exception->fcmCode) {
                'UNREGISTERED' => 'Token device sudah tidak aktif. Aktifkan push kembali di perangkat.',
                'SENDER_ID_MISMATCH' => 'Device terdaftar pada proyek Firebase yang berbeda.',
                'UNAUTHENTICATED', 'THIRD_PARTY_AUTH_ERROR' => 'Autentikasi Firebase atau kredensial push tidak valid.',
                'PERMISSION_DENIED' => 'Akun layanan tidak memiliki izin mengirim push.',
                'INVALID_ARGUMENT' => 'Token device atau isi pesan tidak valid.',
                'QUOTA_EXCEEDED', 'RESOURCE_EXHAUSTED' => 'Batas pengiriman Firebase tercapai.',
                'UNAVAILABLE', 'INTERNAL' => 'Layanan Firebase sedang bermasalah. Pengiriman dapat dicoba kembali.',
                default => 'Firebase menolak pengiriman notifikasi.',
            };

            return [$exception->fcmCode, $exception->getMessage().'. '.$detail];
        }
        if ($exception instanceof ConnectionException) {
            return ['CONNECTION_ERROR', 'Koneksi ke Firebase gagal atau melewati batas waktu.'];
        }
        // Only known application messages are safe to show; raw SDK exceptions can contain tokens or credentials.
        $safeMessages = [
            'Firebase credentials belum tersedia di storage privat.',
            'Firebase credentials tidak boleh disimpan di public.',
            'Gagal mendapatkan Firebase OAuth token.',
            'FIREBASE_PROJECT_ID belum dikonfigurasi.',
            'FCM response tidak memiliki message ID.',
        ];

        return ['SEND_ERROR', in_array($exception->getMessage(), $safeMessages, true)
            ? $exception->getMessage() : 'Pengiriman gagal ('.class_basename($exception).'). Periksa koneksi dan konfigurasi Firebase.'];
    }
}
