<?php

namespace App\Services;

use App\Models\Offer;

class OfferService
{
    /**
     * Calculate automatic offers on cart items.
     */
    public function calculateAutomaticOffers(array $cartItems, float $subtotal): array
    {
        $now = now();
        $activeOffers = Offer::where('status', 'ACTIVE')
            ->where(function ($q) use ($now) {
                $q->whereNull('start_at')->orWhere('start_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('end_at')->orWhere('end_at', '>=', $now);
            })
            ->get();

        $totalOfferDiscount = 0.00;
        $appliedOffers = [];

        foreach ($activeOffers as $offer) {
            if ($subtotal < (float) $offer->minimum_order_amount) {
                continue;
            }

            $totalQtyInCart = array_reduce($cartItems, function ($carry, $item) {
                return $carry + ($item['quantity'] ?? 1);
            }, 0);

            if ($totalQtyInCart < $offer->minimum_quantity) {
                continue;
            }

            $discount = 0.00;
            if ($offer->discount_type === 'PERCENTAGE') {
                $raw = $subtotal * ((float) $offer->discount_value / 100);
                $discount = $offer->maximum_discount ? min($raw, (float) $offer->maximum_discount) : $raw;
            } elseif ($offer->discount_type === 'FIXED_AMOUNT') {
                $discount = min($subtotal, (float) $offer->discount_value);
            }

            if ($discount > 0) {
                $totalOfferDiscount += $discount;
                $appliedOffers[] = [
                    'id' => $offer->id,
                    'name' => $offer->name,
                    'discount_amount' => round($discount, 2),
                ];
            }
        }

        return [
            'total_discount' => round($totalOfferDiscount, 2),
            'offers' => $appliedOffers,
        ];
    }
}
