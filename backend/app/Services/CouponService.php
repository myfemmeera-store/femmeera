<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\User;

class CouponService
{
    /**
     * Validate coupon eligibility and return coupon or error array.
     */
    public function validateCoupon(string $code, float $subtotal, ?User $user = null): array
    {
        $codeClean = strtoupper(trim($code));
        $coupon = Coupon::where('code', $codeClean)->first();

        if (!$coupon) {
            return [
                'valid' => false,
                'message' => "Coupon code '{$codeClean}' does not exist.",
            ];
        }

        if ($coupon->status !== 'ACTIVE') {
            return [
                'valid' => false,
                'message' => "Coupon '{$codeClean}' is inactive or expired.",
            ];
        }

        $now = now();

        if ($coupon->start_at && $now->lt($coupon->start_at)) {
            return [
                'valid' => false,
                'message' => "Coupon '{$codeClean}' is not active yet.",
            ];
        }

        if ($coupon->end_at && $now->gt($coupon->end_at)) {
            return [
                'valid' => false,
                'message' => "Coupon '{$codeClean}' has expired.",
            ];
        }

        if ($subtotal < (float) $coupon->minimum_order_amount) {
            return [
                'valid' => false,
                'message' => "Minimum order amount of ₹" . number_format($coupon->minimum_order_amount, 2) . " required for coupon '{$codeClean}'.",
            ];
        }

        if ($coupon->usage_limit !== null) {
            $totalUsages = CouponUsage::where('coupon_id', $coupon->id)->count();
            if ($totalUsages >= $coupon->usage_limit) {
                return [
                    'valid' => false,
                    'message' => "Coupon '{$codeClean}' maximum global usage limit reached.",
                ];
            }
        }

        if ($user && $coupon->usage_limit_per_customer !== null) {
            $customerUsages = CouponUsage::where('coupon_id', $coupon->id)
                ->where('user_id', $user->id)
                ->count();

            if ($customerUsages >= $coupon->usage_limit_per_customer) {
                return [
                    'valid' => false,
                    'message' => "You have already used coupon '{$codeClean}' the maximum allowed number of times.",
                ];
            }
        }

        $discountCalculated = $this->calculateDiscount($coupon, $subtotal);

        return [
            'valid' => true,
            'coupon' => $coupon,
            'discount_amount' => $discountCalculated['discount_amount'],
            'discount_type' => $coupon->discount_type,
            'code' => $coupon->code,
            'message' => "Coupon '{$codeClean}' applied successfully!",
        ];
    }

    /**
     * Calculate discount amount for coupon based on subtotal.
     */
    public function calculateDiscount(Coupon $coupon, float $subtotal): array
    {
        $discountAmount = 0.00;

        if ($coupon->discount_type === 'PERCENTAGE') {
            $rawDiscount = $subtotal * ((float) $coupon->discount_value / 100);
            if ($coupon->maximum_discount_amount !== null && $coupon->maximum_discount_amount > 0) {
                $discountAmount = min($rawDiscount, (float) $coupon->maximum_discount_amount);
            } else {
                $discountAmount = $rawDiscount;
            }
        } elseif ($coupon->discount_type === 'FIXED_AMOUNT') {
            $discountAmount = min($subtotal, (float) $coupon->discount_value);
        }

        return [
            'discount_amount' => round($discountAmount, 2),
        ];
    }

    /**
     * Record usage of a coupon upon completed order checkout.
     */
    public function recordUsage(int $couponId, ?int $userId, int $orderId): void
    {
        CouponUsage::create([
            'coupon_id' => $couponId,
            'user_id' => $userId,
            'order_id' => $orderId,
            'created_at' => now(),
        ]);
    }
}
