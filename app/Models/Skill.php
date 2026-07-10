<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];

    public function employees()
    {
        return $this->belongsToMany(Employee::class, 'employee_skill');
    }
}
