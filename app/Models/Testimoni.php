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
        'star'
    ];
}
