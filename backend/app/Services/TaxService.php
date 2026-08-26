<?php

namespace App\Services;

use App\Models\TaxRule;

class TaxService
{
    /**
     * Calculate tax for taxable subtotal.
     * All product prices on Femmeera Store are 100% inclusive of all taxes.
     */
    public function calculateTax(float $taxableSubtotal): array
    {
        return [
            'rule_name' => 'Inclusive of all taxes',
            'rate_percentage' => 0.00,
            'is_inclusive' => true,
            'tax_amount' => 0.00,
        ];
    }
}
