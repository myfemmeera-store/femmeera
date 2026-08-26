<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'influencer_name',
        'influencer_handle',
        'influencer_commission_percent',
        'description',
        'discount_type',
        'discount_value',
        'minimum_order_amount',
        'maximum_discount_amount',
        'usage_limit',
        'usage_limit_per_customer',
        'start_at',
        'end_at',
        'status',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'minimum_order_amount' => 'decimal:2',
        'maximum_discount_amount' => 'decimal:2',
        'influencer_commission_percent' => 'decimal:2',
        'usage_limit' => 'integer',
        'usage_limit_per_customer' => 'integer',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
    ];

    protected $appends = [
        'is_expired',
    ];

    public function getIsExpiredAttribute(): bool
    {
        if ($this->status === 'INACTIVE' || $this->status === 'EXPIRED') {
            return true;
        }
        if ($this->end_at && $this->end_at->isPast()) {
            return true;
        }
        if ($this->usage_limit && $this->usages()->count() >= $this->usage_limit) {
            return true;
        }
        return false;
    }

    public function usages()
    {
        return $this->hasMany(CouponUsage::class, 'coupon_id');
    }
}
