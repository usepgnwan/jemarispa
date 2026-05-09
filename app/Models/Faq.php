<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    protected $fillable = [
        'title_id',
        'description_id',
        'title_en',
        'description_en'
    ];
}
