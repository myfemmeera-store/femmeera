<?php

namespace App\Services;

use App\Models\User;

class DiscountService
{
    protected CouponService $couponService;
    protected OfferService $offerService;

    public function __construct(CouponService $couponService, OfferService $offerService)
    {
        $this->couponService = $couponService;
        $this->offerService = $offerService;
    }

    /**
     * Calculate all discounts for a cart payload.
     */
    public function calculateDiscounts(float $subtotal, array $cartItems, ?string $couponCode = null, ?User $user = null): array
    {
        // 1. Automatic Offers
        $offerResult = $this->offerService->calculateAutomaticOffers($cartItems, $subtotal);
        $offerDiscount = $offerResult['total_discount'];

        $subtotalAfterOffers = max(0.00, $subtotal - $offerDiscount);

        // 2. Coupon Discount
        $couponDiscount = 0.00;
        $couponData = null;
        $couponError = null;

        if ($couponCode) {
            $couponVal = $this->couponService->validateCoupon($couponCode, $subtotalAfterOffers, $user);
            if ($couponVal['valid']) {
                $couponDiscount = $couponVal['discount_amount'];
                $couponData = [
                    'id' => $couponVal['coupon']->id,
                    'code' => $couponVal['coupon']->code,
                    'name' => $couponVal['coupon']->name,
                    'discount_amount' => $couponDiscount,
                ];
            } else {
                $couponError = $couponVal['message'];
            }
        }

        $totalDiscount = min($subtotal, round($offerDiscount + $couponDiscount, 2));

        return [
            'total_discount' => $totalDiscount,
            'offer_discount' => $offerDiscount,
            'coupon_discount' => $couponDiscount,
            'applied_offers' => $offerResult['offers'],
            'applied_coupon' => $couponData,
            'coupon_error' => $couponError,
        ];
    }
}
