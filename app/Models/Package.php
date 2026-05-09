<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'title',
        'category',
        'description',
    ];

    public function durations()
    {
        return $this->hasMany(PackageDuration::class);
    }
}
