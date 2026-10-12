<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionInvoiceStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_completed_invoice_action_updates_unfinished_transactions_and_preserves_success(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin', 'is_active' => true]));

        foreach (['pending', 'send_terapis', 'failed', 'invoice', 'success'] as $status) {
            $transaction = $this->transaction($status);
            $this->patch(route('admin.transaction.update', $transaction), [
                'invoice_sent' => true,
                'payment_type' => 'dp',
                'dp_amount' => 50000,
            ])->assertRedirect();

            $this->assertDatabaseHas('transactions', [
                'id' => $transaction->id,
                'status' => $status === 'success' ? 'success' : 'invoice',
                'payment_type' => 'dp',
                'dp_amount' => 50000,
            ]);
        }
    }

    public function test_saving_payment_options_without_completed_invoice_action_preserves_status(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin', 'is_active' => true]));

        foreach ([['invoice_sent' => false], []] as $options) {
            $transaction = $this->transaction('pending');
            $this->patch(route('admin.transaction.update', $transaction), [
                ...$options, 'payment_type' => 'full',
            ])->assertRedirect();
            $this->assertSame('pending', $transaction->fresh()->status);
        }
    }

    private function transaction(string $status): Transaction
    {
        return Transaction::create([
            'order_number' => 'INVOICE-'.uniqid(), 'customer_name' => 'Invoice Customer',
            'address' => 'Bandung', 'schedule_date' => now()->addDay()->toDateString(),
            'schedule_time' => '15:00', 'payment_method' => 'cash',
            'total_price' => 100000, 'status' => $status,
        ]);
    }
}
