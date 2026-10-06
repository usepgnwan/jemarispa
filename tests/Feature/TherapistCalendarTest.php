<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TherapistCalendarTest extends TestCase
{
    use RefreshDatabase;

    private function booking(string $date, array $employees, string $status = 'pending'): Transaction
    {
        $booking = Transaction::withoutEvents(fn () => Transaction::create([
            'order_number' => 'CAL-'.uniqid(), 'customer_name' => 'Calendar Customer', 'address' => 'Bandung',
            'schedule_date' => $date, 'schedule_time' => '08.25', 'payment_method' => 'cash', 'total_price' => 100000, 'status' => $status,
        ]));
        foreach ($employees as $employee) {
            TransactionItem::withoutEvents(fn () => $booking->items()->create([
                'employee_id' => $employee->id, 'guest_index' => 1, 'package_name' => 'Pijat', 'package_duration' => '60', 'price' => 100000,
            ]));
        }

        return $booking;
    }

    public function test_therapist_calendar_opens_next_assigned_active_date_and_respects_selected_date(): void
    {
        $this->travelTo(\Carbon\Carbon::parse('2026-10-06 00:00:00', 'UTC'));
        $employee = Employee::create(['name' => 'Yuni', 'nohp' => '0800000000', 'title' => 'Terapis']);
        $other = Employee::create(['name' => 'Other', 'nohp' => '0800000001', 'title' => 'Terapis']);
        $therapist = User::factory()->create(['role' => 'terapis', 'employee_id' => $employee->id, 'is_active' => true]);
        $this->booking('2026-10-06', [$other]);
        $this->booking('2026-10-06', [$employee], 'success');
        $this->booking('2026-10-07', [$employee]);
        $this->booking('2026-10-08', [$employee]);

        $this->actingAs($therapist)->get('/admin/calendar')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Calendar')->where('date_range.start', '2026-10-07')->has('employees', 1)
            ->where('employees.0.id', $employee->id));
        $this->get('/admin/calendar?start=2026-10-08')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('date_range.start', '2026-10-08'));
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $this->actingAs($admin)->get('/admin/calendar')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('date_range.start', '2026-10-06')->has('employees', 2));
    }

    public function test_therapist_event_cards_only_include_own_assignments_and_valid_calendar_times(): void
    {
        $employee = Employee::create(['name' => 'Yuni', 'nohp' => '0800000000', 'title' => 'Terapis']);
        $other = Employee::create(['name' => 'Other', 'nohp' => '0800000001', 'title' => 'Terapis']);
        $therapist = User::factory()->create(['role' => 'terapis', 'employee_id' => $employee->id, 'is_active' => true]);
        $own = $this->booking('2026-10-07', [$employee, $employee, $other]);
        $this->booking('2026-10-07', [$other]);
        $this->booking('2026-10-08', [$employee]);

        $this->actingAs($therapist)->getJson('/admin/calendar/events?date=2026-10-07')->assertOk()
            ->assertJsonCount(1, 'events')->assertJsonPath('events.0.id', $own->id)
            ->assertJsonPath('events.0.start', '2026-10-07T08:25')->assertJsonPath('events.0.extendedProps.schedule_time', '08:25')
            ->assertJsonCount(2, 'events.0.extendedProps.items')->assertJsonMissing(['employee_id' => $other->id]);
        $otherUser = User::factory()->create(['role' => 'terapis', 'employee_id' => $other->id, 'is_active' => true]);
        $this->actingAs($otherUser)->getJson('/admin/calendar/events?date=2026-10-07')->assertOk()->assertJsonCount(2, 'events');
    }
}
