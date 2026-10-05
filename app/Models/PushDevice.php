<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PushDevice extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['fcm_token', 'token_hash'];

    protected $casts = ['last_used_at' => 'immutable_datetime', 'user_id' => 'integer'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
