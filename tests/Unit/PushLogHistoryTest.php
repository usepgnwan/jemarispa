<?php

namespace Tests\Unit;

use App\Models\PushLog;
use App\Services\PushLogHistoryService;
use Illuminate\Support\Collection;
use PHPUnit\Framework\TestCase;

class PushLogHistoryTest extends TestCase
{
    private function log(int $id, int $user, ?int $device, string $status, ?string $error = null): PushLog
    {
        $log = new PushLog;
        $log->setDateFormat('Y-m-d H:i:s');
        $log->forceFill([
            'id' => $id, 'user_id' => $user, 'receiver_user_id' => $device ? $user : null,
            'push_device_id' => $device, 'device_name' => $device ? 'Device '.$device : null,
            'status' => $status, 'error_code' => $error, 'created_at' => '2026-10-07 05:20:00',
        ]);
        return $log;
    }

    public function test_successes_across_devices_are_visible_despite_accounts_without_devices(): void
    {
        $result = (new PushLogHistoryService)->summarize(new Collection([
            $this->log(1, 1, null, 'failed', 'NO_DEVICE'),
            $this->log(2, 2, 10, 'success'),
            $this->log(3, 2, 11, 'success'),
            $this->log(4, 32, 12, 'success'),
            $this->log(5, 4, null, 'failed', 'NO_DEVICE'),
        ]));
        $this->assertSame('success', $result['status']);
        $this->assertSame(3, $result['success_count']);
        $this->assertCount(3, $result['recipients']);
        $this->assertSame(3, $result['attempt_count']);
    }

    public function test_successful_retry_replaces_failure_in_summary_and_keeps_attempt_history(): void
    {
        $result = (new PushLogHistoryService)->summarize(new Collection([
            $this->log(1, 32, 12, 'failed', 'CONNECTION_ERROR'),
            $this->log(2, 32, 12, 'success'),
        ]));
        $this->assertSame('success', $result['status']);
        $this->assertSame(0, $result['failed_count']);
        $this->assertSame(2, $result['recipients'][0]['attempt_count']);
        $this->assertSame('CONNECTION_ERROR', $result['recipients'][0]['attempts'][1]['error_code']);
    }

    public function test_actual_device_failure_is_partial_and_missing_devices_are_omitted(): void
    {
        $service = new PushLogHistoryService;
        $result = $service->summarize(new Collection([
            $this->log(1, 1, 10, 'success'), $this->log(2, 32, 12, 'failed', 'UNAVAILABLE'),
        ]));
        $this->assertSame('partial', $result['status']);
        $this->assertSame(1, $result['failed_count']);
        $result = $service->summarize(new Collection([$this->log(3, 4, null, 'failed', 'NO_DEVICE')]));
        $this->assertSame([], $result);
    }

    public function test_history_keeps_deliveries_after_the_device_is_deleted(): void
    {
        $log = $this->log(1, 32, 12, 'success');
        $log->push_device_id = null;
        $result = (new PushLogHistoryService)->summarize(new Collection([$log]));
        $this->assertSame('success', $result['status']);
        $this->assertCount(1, $result['recipients']);
        $this->assertSame('Device 12', $result['recipients'][0]['device_name']);
    }
}
