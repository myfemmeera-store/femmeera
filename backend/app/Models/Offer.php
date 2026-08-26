<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Offer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'type',
        'discount_type',
        'discount_value',
        'minimum_quantity',
        'minimum_order_amount',
        'maximum_discount',
        'start_at',
        'end_at',
        'status',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'minimum_order_amount' => 'decimal:2',
        'maximum_discount' => 'decimal:2',
        'minimum_quantity' => 'integer',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'offer_product', 'offer_id', 'product_id');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'offer_category', 'offer_id', 'category_id');
    }
}
