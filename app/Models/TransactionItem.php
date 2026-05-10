<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionItem extends Model
{
    protected $fillable = [
        'transaction_id', 'guest_index', 'guest_gender', 'therapist_gender_preference', 
        'package_name', 'package_duration', 'price', 'employee_id', 'therapist_commission'
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
