<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'min_order_amount',
        'max_order_amount',
        'shipping_fee',
        'estimated_days',
        'status',
    ];

    protected $casts = [
        'min_order_amount' => 'float',
        'max_order_amount' => 'float',
        'shipping_fee' => 'float',
    ];
}
