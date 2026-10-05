<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::command('push:dispatch-due')->everyMinute()->withoutOverlapping(5);

Artisan::command('push:backfill', function () {
    app(\App\Services\ScheduleReminderService::class)->backfill();
    $this->info('Future transaction reminders synchronized.');
})->purpose('Create default reminders for existing future transactions');

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
