<?php

namespace App\Observers;

use App\Models\Transaction;
use App\Services\ScheduleReminderService;

class TransactionObserver
{
    public function saved(Transaction $transaction): void
    {
        if ($transaction->wasRecentlyCreated || $transaction->wasChanged(['schedule_date', 'schedule_time', 'status'])) {
            app(ScheduleReminderService::class)->sync($transaction);
        }
    }
}
