<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $fillable = [
        'name',
        'nohp',
        'title',
        'join_date',
    ];

    public function user()
    {
        return $this->hasOne(User::class, 'employee_id');
    }
}
