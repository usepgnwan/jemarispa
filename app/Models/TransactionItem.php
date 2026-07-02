<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionItem extends Model
{
    protected $fillable = [
        'transaction_id', 'guest_index', 'guest_gender', 'therapist_gender_preference',
        'package_name', 'package_duration', 'package_id', 'package_duration_id',
        'price', 'employee_id', 'therapist_commission'
    ];

    protected $with = ['package', 'packageDurationRel'];

    public function getPackageNameAttribute($value)
    {
        if ($this->relationLoaded('package')) {
            $rel = $this->getRelation('package');
            if ($rel && !empty($rel->title_id)) {
                return $rel->title_id;
            }
        }
        return $value;
    }

    public function getPackageDurationAttribute($value)
    {
        if ($this->relationLoaded('packageDurationRel')) {
            $rel = $this->getRelation('packageDurationRel');
            if ($rel && !empty($rel->duration)) {
                return $rel->duration;
            }
        }
        return $value;
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function packageDurationRel()
    {
        return $this->belongsTo(PackageDuration::class, 'package_duration_id');
    }

    public function invoiceItems()
    {
        return $this->hasMany(TherapistInvoiceItem::class);
    }
}
