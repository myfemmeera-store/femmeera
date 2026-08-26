<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'estimated_min_days',
        'estimated_max_days',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'estimated_min_days' => 'integer',
        'estimated_max_days' => 'integer',
    ];
}
