<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certification extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];

    public function employees()
    {
        return $this->belongsToMany(Employee::class, 'employee_certification')
                    ->withPivot(['certificate_file', 'certificate_number', 'valid_until'])
                    ->withTimestamps();
    }
}
