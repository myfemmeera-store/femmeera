<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTransaction extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'payment_id',
        'type',
        'transaction_type',
        'provider_reference',
        'amount',
        'status',
        'metadata',
        'created_at',
    ];

    protected $casts = [
        'amount' => 'float',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'payment_id');
    }
}
