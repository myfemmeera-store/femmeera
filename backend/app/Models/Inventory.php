<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory;

    protected $table = 'inventory';

    protected $fillable = [
        'variant_id',
        'available_quantity',
        'reserved_quantity',
        'low_stock_threshold',
    ];

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }
}
