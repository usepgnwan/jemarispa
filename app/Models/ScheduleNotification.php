<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScheduleNotification extends Model
{
    public const REMINDERS = [360, 240, 180, 120, 60];

    protected $guarded = ['id'];

    protected $attributes = ['revision' => 1, 'notify_before_minutes' => 360, 'status' => 'pending', 'is_test' => false];

    protected $casts = [
        'notify_at' => 'immutable_datetime', 'sent_at' => 'immutable_datetime', 'is_test' => 'boolean',
        'revision' => 'integer', 'notify_before_minutes' => 'integer', 'user_id' => 'integer',
    ];

    public function schedule()
    {
        return $this->belongsTo(Transaction::class, 'schedule_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
