<?php

namespace App\Services;

use App\Models\ShippingMethod;
use Illuminate\Support\Facades\DB;

class ShippingService
{
    /**
     * Validate Indian PIN code format (6 digits, does not start with 0).
     */
    public function checkServiceability(string $postalCode): array
    {
        $cleanCode = trim($postalCode);
        $isIndianPinFormat = preg_match('/^[1-9][0-9]{5}$/', $cleanCode);

        if (!$isIndianPinFormat) {
            return [
                'serviceable' => false,
                'postal_code' => $cleanCode,
                'message' => 'Invalid PIN code format. Indian PIN codes must be 6 digits.',
            ];
        }

        return [
            'serviceable' => true,
            'postal_code' => $cleanCode,
            'estimated_days' => '3–5 business days',
            'message' => 'Deliverable to ' . $cleanCode,
        ];
    }

    /**
     * Get all active shipping methods.
     */
    public function getAvailableMethods(): array
    {
        return ShippingMethod::where('status', 'ACTIVE')
            ->orderBy('price', 'asc')
            ->get()
            ->toArray();
    }

    /**
     * Get configured free shipping threshold from settings.
     */
    public function getFreeShippingThreshold(): float
    {
        $val = DB::table('settings')->where('key_name', 'free_shipping_threshold')->value('value_content');
        return $val ? (float) $val : 999.00;
    }

    /**
     * Calculate shipping cost dynamically based on DB shipping_rules and subtotal.
     */
    public function calculateShipping(?int $methodId, float $subtotal): array
    {
        $threshold = $this->getFreeShippingThreshold();
        
        // 1. Query active shipping rules in DB matching subtotal range
        $matchingRule = DB::table('shipping_rules')
            ->where('status', 'ACTIVE')
            ->where('min_order_amount', '<=', $subtotal)
            ->where(function ($q) use ($subtotal) {
                $q->whereNull('max_order_amount')
                  ->orWhere('max_order_amount', '>=', $subtotal);
            })
            ->orderBy('min_order_amount', 'desc')
            ->first();

        if ($matchingRule) {
            $shippingPrice = (float) $matchingRule->shipping_fee;
            $name = $matchingRule->name;
            $days = $matchingRule->estimated_days;
            $isFreeShipping = ($shippingPrice === 0.0);
        } else {
            $isFreeShipping = $subtotal >= $threshold;
            if (!$methodId) {
                $defaultMethod = ShippingMethod::where('status', 'ACTIVE')->orderBy('price', 'asc')->first();
                $methodId = $defaultMethod ? $defaultMethod->id : null;
            }

            $method = ShippingMethod::find($methodId);
            if (!$method) {
                $basePrice = 49.00;
                $name = 'Standard Delivery';
                $days = '3–5 working days';
            } else {
                $basePrice = (float) $method->price;
                $name = $method->name;
                $days = "{$method->estimated_min_days}–{$method->estimated_max_days} working days";
            }
            $shippingPrice = $isFreeShipping ? 0.00 : $basePrice;
        }

        return [
            'method_id' => $matchingRule ? $matchingRule->id : $methodId,
            'method_name' => $name,
            'estimated_days' => $days,
            'amount' => $shippingPrice,
            'is_free_shipping' => $isFreeShipping,
            'free_shipping_threshold' => $threshold,
            'amount_needed_for_free_shipping' => max(0.00, $threshold - $subtotal),
        ];
    }
}
