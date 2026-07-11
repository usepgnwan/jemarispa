<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $fillable = [
        'nip',
        'name',
        'fullname',
        'photo',
        'nohp',
        'title',
        'work_area',
        'status',
        'join_date',
    ];

    public function user()
    {
        return $this->hasOne(User::class, 'employee_id');
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'employee_skill');
    }

    public function certifications()
    {
        return $this->belongsToMany(Certification::class, 'employee_certification')
                    ->withPivot(['certificate_file', 'certificate_number', 'valid_until'])
                    ->withTimestamps();
    }

    public function serviceAreas()
    {
        return $this->belongsToMany(ServiceArea::class, 'employee_service_area')
                    ->withTimestamps();
    }
}
