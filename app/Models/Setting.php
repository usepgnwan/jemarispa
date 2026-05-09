<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'description_id',
        'description_en',
        'phone',
        'template_order',
        'template_question',
        'template_invoice',
    ];
}
