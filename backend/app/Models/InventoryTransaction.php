<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryTransaction extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'variant_id',
        'type',
        'quantity',
        'reference_type',
        'reference_id',
        'notes',
        'created_by',
        'created_at',
    ];

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
