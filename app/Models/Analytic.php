<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Analytic extends Model
{
    protected $fillable = ['title', 'category', 'ip_address', 'user_agent'];
}
