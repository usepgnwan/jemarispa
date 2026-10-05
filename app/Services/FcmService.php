<?php

namespace App\Services;

use App\Exceptions\FcmException;
use Google\Auth\Credentials\ServiceAccountCredentials;
use Google\Auth\HttpHandler\HttpHandlerFactory;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class FcmService
{
    protected function accessToken(): string
    {
        $path = config('push.credentials');
        if (! preg_match('~^(?:[A-Za-z]:[\\\\/]|/)~', $path)) {
            $path = base_path($path);
        }
        if (! is_file($path) || ! is_readable($path)) {
            throw new RuntimeException('Firebase credentials belum tersedia di storage privat.');
        }
        $public = realpath(public_path());
        if (str_starts_with(str_replace('\\', '/', realpath($path)), str_replace('\\', '/', $public).'/')) {
            throw new RuntimeException('Firebase credentials tidak boleh disimpan di public.');
        }

        return Cache::remember('fcm.oauth.'.hash('sha256', $path.filemtime($path)), 3000, function () use ($path) {
            $credentials = new ServiceAccountCredentials('https://www.googleapis.com/auth/firebase.messaging', $path);
            $token = $credentials->fetchAuthToken(HttpHandlerFactory::build(new Client([
                'connect_timeout' => 5, 'timeout' => 10,
            ])));

            return $token['access_token'] ?? throw new RuntimeException('Gagal mendapatkan Firebase OAuth token.');
        });
    }

    public function send(string $token, array $data): string
    {
        $project = config('push.project_id');
        if (! $project) {
            throw new RuntimeException('FIREBASE_PROJECT_ID belum dikonfigurasi.');
        }
        // Data-only message: one background notification is displayed by our SW.
        $response = Http::withToken($this->accessToken())->connectTimeout(5)->timeout(10)
            ->post('https://fcm.googleapis.com/v1/projects/'.rawurlencode($project).'/messages:send', [
                'message' => [
                    'token' => $token,
                    'data' => array_map(fn ($value) => (string) $value, $data),
                    'webpush' => ['headers' => ['Urgency' => 'high', 'TTL' => '3600']],
                ],
            ]);
        if (! $response->successful()) {
            $code = collect($response->json('error.details', []))
                ->first(fn ($detail) => ($detail['@type'] ?? '') === 'type.googleapis.com/google.firebase.fcm.v1.FcmError')['errorCode']
                ?? $response->json('error.status', 'UNKNOWN');
            // Keep credentials and registration tokens out of errors/logs.
            throw new FcmException($code, $response->status() === 429 || $response->serverError());
        }

        return $response->json('name') ?? throw new RuntimeException('FCM response tidak memiliki message ID.');
    }
}
