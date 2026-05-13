<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Voucher extends Model
{
    protected $fillable = [
        'code',
        'description',
        'category',
        'bundle_packages',
        'type',
        'discount_amount',
        'price',
        'customer_name',
        'customer_phone',
        'quota',
        'used_count',
        'expired_at',
        'is_active',
    ];

    protected $casts = [
        'expired_at' => 'date',
        'is_active' => 'boolean',
        'discount_amount' => 'decimal:2',
        'price' => 'decimal:2',
        'bundle_packages' => 'array',
    ];

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Scope a query to only include active vouchers.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include vouchers that are not expired.
     */
    public function scopeNotExpired($query)
    {
        return $query->where('expired_at', '>=', now()->toDateString());
    }

    /**
     * Check if the voucher is valid (active, not expired, and has quota left).
     */
    public function isValid(): bool
    {
        return $this->is_active && 
               $this->expired_at->isFuture() || $this->expired_at->isToday() && 
               ($this->quota > $this->used_count);
    }
}
