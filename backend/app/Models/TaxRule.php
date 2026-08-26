<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaxRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'rate_percentage',
        'is_inclusive',
        'status',
    ];

    protected $casts = [
        'rate_percentage' => 'decimal:2',
        'is_inclusive' => 'boolean',
    ];
}
