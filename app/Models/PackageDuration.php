<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PackageDuration extends Model
{
    use HasFactory;
    protected $fillable = [
        'package_id',
        'duration',
        'price',
    ];

    public function package()
    {
        return $this->belongsTo(Package::class);
    }
}
