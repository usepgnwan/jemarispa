<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TherapistInvoice extends Model
{
    protected $guarded = ['id'];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function items()
    {
        return $this->hasMany(TherapistInvoiceItem::class);
    }
}
