<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class CalendarEventsTest extends TestCase
{
    public function test_daily_events_only_include_the_requested_date(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->date('schedule_date');
            $table->string('customer_name');
            $table->string('status');
        });
        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('transaction_id');
            $table->unsignedBigInteger('employee_id')->nullable();
        });
        DB::table('transactions')->insert([
            ['schedule_date' => '2026-09-29', 'customer_name' => 'Before', 'status' => 'pending'],
            ['schedule_date' => '2026-09-30', 'customer_name' => 'Today', 'status' => 'pending'],
            ['schedule_date' => '2026-10-01', 'customer_name' => 'After', 'status' => 'pending'],
        ]);

        $this->actingAs(new User(['role' => 'admin']))
            ->getJson('/admin/calendar/events?date=2026-09-30')
            ->assertOk()
            ->assertJsonCount(1, 'events')
            ->assertJsonPath('date', '2026-09-30')
            ->assertJsonPath('events.0.extendedProps.customer_name', 'Today');

        $this->actingAs(new User(['role' => 'terapis', 'employee_id' => 10]))
            ->getJson('/admin/calendar/events?date=2026-09-30')
            ->assertOk()->assertJsonCount(0, 'events');
    }

    public function test_daily_events_validate_dates_and_require_an_allowed_role(): void
    {
        $this->actingAs(new User(['role' => 'admin']))
            ->getJson('/admin/calendar/events?date=invalid')
            ->assertUnprocessable()->assertJsonValidationErrors('date');

        $this->actingAs(new User(['role' => 'marketing']))
            ->withHeader('X-Inertia', 'true')
            ->getJson('/admin/calendar/events?date=2026-09-30')
            ->assertForbidden();
    }

    public function test_therapist_without_employee_does_not_receive_other_bookings(): void
    {
        $this->actingAs(new User(['role' => 'terapis']))
            ->getJson('/admin/calendar/events?date=2026-09-30')
            ->assertOk()->assertJsonCount(0, 'events');
    }
}
