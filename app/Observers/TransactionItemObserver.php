<?php

namespace App\Observers;

use App\Models\TransactionItem;
use App\Services\ScheduleReminderService;

class TransactionItemObserver
{
    public function saved(TransactionItem $item): void
    {
        if ($item->wasRecentlyCreated || $item->wasChanged(['employee_id', 'transaction_id'])) {
            $this->sync($item);
        }
    }

    public function deleted(TransactionItem $item): void
    {
        $this->sync($item);
    }

    private function sync(TransactionItem $item): void
    {
        if ($schedule = $item->transaction()->first()) {
            app(ScheduleReminderService::class)->sync($schedule);
        }
    }
}
