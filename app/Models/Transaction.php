<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'order_number', 'customer_name', 'phone', 'address', 
        'schedule_date', 'schedule_time', 'payment_method', 
        'source', 'notes', 'total_price', 'transport_fee', 'status'
    ];

    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }
}
