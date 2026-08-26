<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'sku',
        'size',
        'color',
        'price',
        'mrp',
        'stock',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'mrp' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function inventory()
    {
        return $this->hasOne(Inventory::class, 'variant_id');
    }
}
