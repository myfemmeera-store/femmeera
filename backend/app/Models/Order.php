<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'subtotal',
        'discount_amount',
        'shipping_amount',
        'tax_amount',
        'total_amount',
        'currency',
        'payment_status',
        'order_status',
        'shipping_address_snapshot',
        'billing_address_snapshot',
        'carrier',
        'tracking_number',
        'tracking_url',
        'shipped_at',
        'delivered_at',
    ];

    protected $casts = [
        'shipping_address_snapshot' => 'array',
        'billing_address_snapshot' => 'array',
        'subtotal' => 'float',
        'discount_amount' => 'float',
        'shipping_amount' => 'float',
        'tax_amount' => 'float',
        'total_amount' => 'float',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getCustomerIdAttribute()
    {
        return $this->attributes['user_id'] ?? null;
    }

    public function getStatusAttribute()
    {
        return $this->attributes['order_status'] ?? 'PENDING';
    }

    public function setStatusAttribute($value)
    {
        $this->attributes['order_status'] = $value;
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'order_id');
    }

    public function latestPayment()
    {
        return $this->hasOne(Payment::class, 'order_id')->latestOfMany();
    }

    public function statusHistory()
    {
        return $this->hasMany(OrderStatusHistory::class, 'order_id')->orderBy('id', 'desc');
    }
}
