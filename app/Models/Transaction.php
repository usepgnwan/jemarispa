<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'order_number', 'customer_name', 'phone', 'address', 
        'schedule_date', 'schedule_time', 'payment_method', 
        'source', 'notes', 'total_price', 'transport_fee', 
        'discount_percent', 'discount_amount', 'status',
        'review_token', 'review_expires_at', 'voucher_id',
    ];

    protected $casts = [
        'review_expires_at' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function testimoni()
    {
        return $this->hasOne(Testimoni::class);
    }

    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }

    /**
     * Generate a unique review token valid for 24 hours.
     */
    public function generateReviewToken(): string
    {
        $token = \Illuminate\Support\Str::uuid()->toString();
        $this->update([
            'review_token' => $token,
            'review_expires_at' => now()->addHours(24),
        ]);
        return $token;
    }

    public function isReviewTokenValid(): bool
    {
        return $this->review_token && $this->review_expires_at && now()->lt($this->review_expires_at);
    }
}
