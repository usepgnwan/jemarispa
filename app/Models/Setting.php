<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'description_id',
        'description_en',
        'phone',
        'email',
        'template_order',
        'template_question',
        'template_invoice',
        'default_commission',
        'title',
        'url_fb',
        'url_instagram',
        'url_x',
        'url_tiktok',
        'voucher_instructions',
        'website',
        'operational_start',
        'operational_end',
    ];
}
