<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    use HasFactory;
    protected $fillable = [
        'title_id',
        'title_en',
        'category_id',
        'category_en',
        'description_id',
        'description_en',
        'is_signature',
        'image',
    ];

    public function durations()
    {
        return $this->hasMany(PackageDuration::class);
    }
}
