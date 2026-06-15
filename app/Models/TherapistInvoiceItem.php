<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TherapistInvoiceItem extends Model
{
    protected $guarded = ['id'];

    public function invoice()
    {
        return $this->belongsTo(TherapistInvoice::class, 'therapist_invoice_id');
    }

    public function transactionItem()
    {
        return $this->belongsTo(TransactionItem::class);
    }
}
