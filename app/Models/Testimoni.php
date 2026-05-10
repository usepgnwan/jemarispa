<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimoni extends Model
{
    protected $fillable = [
        'name',
        'description',
        'packages_description',
        'source',
        'star',
        'is_published',
        'transaction_id',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
