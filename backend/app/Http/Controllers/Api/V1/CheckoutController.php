<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\CartCheckoutService;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    protected CartService $cartService;
    protected CartCheckoutService $cartCheckoutService;

    public function __construct(CartService $cartService, CartCheckoutService $cartCheckoutService)
    {
        $this->cartService = $cartService;
        $this->cartCheckoutService = $cartCheckoutService;
    }

    /**
     * POST /api/v1/checkout/summary
     * Recalculates real-time checkout summary upon address/shipping/coupon changes (Spec Section 35).
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        $cart = $this->cartService->getOrCreateCart($user, $request->header('X-Guest-Session-ID'));

        $couponCode = $request->input('coupon_code');
        $shippingMethodId = $request->input('shipping_method_id') ? (int)$request->input('shipping_method_id') : null;

        $payload = $this->cartService->getCartPayload($cart, $couponCode, $shippingMethodId, $user);

        return response()->json([
            'success' => true,
            'message' => 'Checkout summary calculated.',
            'data' => $payload,
        ], 200);
    }

    /**
     * POST /api/v1/checkout/validate
     * Validates cart items, address, stock availability prior to placing order (Spec Section 31).
     */
    public function validateCheckout(Request $request): JsonResponse
    {
        $user = $request->user();
        $cart = $this->cartService->getOrCreateCart($user, $request->header('X-Guest-Session-ID'));

        $couponCode = $request->input('coupon_code');
        $shippingMethodId = $request->input('shipping_method_id') ? (int)$request->input('shipping_method_id') : null;

        $payload = $this->cartService->getCartPayload($cart, $couponCode, $shippingMethodId, $user);

        if (empty($payload['items'])) {
            return response()->json([
                'success' => false,
                'message' => 'Your cart is empty.',
            ], 422);
        }

        $outOfStockItems = array_filter($payload['items'], function ($item) {
            return !$item['is_available'] || $item['stock'] <= 0;
        });

        if (!empty($outOfStockItems)) {
            return response()->json([
                'success' => false,
                'message' => 'Some items in your cart are no longer available in the requested quantity.',
                'out_of_stock_items' => array_values($outOfStockItems),
                'data' => $payload,
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Checkout validated successfully.',
            'data' => $payload,
        ], 200);
    }

    /**
     * POST /api/v1/checkout/create-order (Spec Section 31 & 34)
     * Creates order transactionally and sets payment_status = PENDING.
     */
    public function createOrder(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'shipping_address' => 'required|array',
            'shipping_address.name' => 'required|string|max:255',
            'shipping_address.phone' => 'required|string|max:20',
            'shipping_address.address' => 'required|string|max:255',
            'shipping_address.city' => 'required|string|max:100',
            'shipping_address.state' => 'required|string|max:100',
            'shipping_address.pincode' => 'required|string|regex:/^[1-9][0-9]{5}$/',
            'shipping_method_id' => 'nullable|integer',
            'coupon_code' => 'nullable|string',
        ]);

        $payload = [
            'shipping_address' => [
                'name' => $request->input('shipping_address.name'),
                'phone' => $request->input('shipping_address.phone'),
                'address' => $request->input('shipping_address.address'),
                'address_line_2' => $request->input('shipping_address.address_line_2', ''),
                'city' => $request->input('shipping_address.city'),
                'state' => $request->input('shipping_address.state'),
                'pincode' => $request->input('shipping_address.pincode'),
                'country' => $request->input('shipping_address.country', 'India'),
            ],
            'shipping_method_id' => $request->input('shipping_method_id'),
            'coupon_code' => $request->input('coupon_code'),
            'payment_method' => $request->input('payment_method', 'COD'),
        ];

        $order = $this->cartCheckoutService->checkout($user, $payload);

        return response()->json([
            'success' => true,
            'message' => 'Order created successfully.',
            'data' => [
                'order' => $order,
                'redirect_url' => '/account/orders/' . $order->order_number,
            ],
        ], 201);
    }
}
