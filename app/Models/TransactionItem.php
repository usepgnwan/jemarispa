<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionItem extends Model
{
    protected $fillable = [
        'transaction_id', 'guest_index', 'guest_gender', 'therapist_gender_preference', 
        'package_name', 'package_duration', 'price'
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
