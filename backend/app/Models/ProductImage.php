<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'product_variant_id',
        'color_name',
        'image_url',
        'is_primary',
        'sort_order',
        'alt_text',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function getImageUrlAttribute($value)
    {
        if (empty($value)) {
            return $value;
        }

        // If stored URL points to localhost or 127.0.0.1, convert to current domain
        if (str_contains($value, 'localhost') || str_contains($value, '127.0.0.1')) {
            $path = parse_url($value, PHP_URL_PATH);
            return asset(ltrim($path, '/'));
        }

        // If relative storage path
        if (!str_starts_with($value, 'http://') && !str_starts_with($value, 'https://')) {
            return asset('storage/' . ltrim($value, '/'));
        }

        return $value;
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}
