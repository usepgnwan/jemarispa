<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PushLog extends Model
{
    protected $guarded = ['id'];

    protected $casts = ['finished_at' => 'immutable_datetime'];
}
