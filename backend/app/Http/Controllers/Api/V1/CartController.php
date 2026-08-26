<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    protected CartService $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * Helper to resolve active cart.
     */
    protected function resolveCart(Request $request)
    {
        $user = $request->user('sanctum');
        $guestSessionId = $request->header('X-Guest-Session-ID') ?: $request->input('guest_session_id');

        return $this->cartService->getOrCreateCart($user, $guestSessionId);
    }

    /**
     * GET /api/v1/cart
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user('sanctum');
        $cart = $this->resolveCart($request);

        $couponCode = $request->input('coupon_code');
        $shippingMethodId = $request->input('shipping_method_id');

        $payload = $this->cartService->getCartPayload($cart, $couponCode, $shippingMethodId ? (int)$shippingMethodId : null, $user);

        return response()->json([
            'success' => true,
            'message' => 'Cart retrieved successfully.',
            'data' => $payload,
        ], 200);
    }

    /**
     * POST /api/v1/cart/items
     */
    public function addItem(Request $request): JsonResponse
    {
        $request->validate([
            'variant_id' => 'required|integer|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = $this->resolveCart($request);

        $result = $this->cartService->addItem(
            $cart,
            (int)$request->input('variant_id'),
            (int)$request->input('quantity')
        );

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 422);
        }

        $user = $request->user('sanctum');
        $payload = $this->cartService->getCartPayload($cart, null, null, $user);

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data' => $payload,
        ], 200);
    }

    /**
     * PATCH /api/v1/cart/items/{id}
     */
    public function updateItem(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        $cart = $this->resolveCart($request);

        $result = $this->cartService->updateItem($cart, $id, (int)$request->input('quantity'));

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 422);
        }

        $user = $request->user('sanctum');
        $payload = $this->cartService->getCartPayload($cart, null, null, $user);

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data' => $payload,
        ], 200);
    }

    /**
     * DELETE /api/v1/cart/items/{id}
     */
    public function removeItem(Request $request, int $id): JsonResponse
    {
        $cart = $this->resolveCart($request);

        $result = $this->cartService->removeItem($cart, $id);

        $user = $request->user('sanctum');
        $payload = $this->cartService->getCartPayload($cart, null, null, $user);

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data' => $payload,
        ], 200);
    }

    /**
     * POST /api/v1/cart/merge (Spec Section 11)
     */
    public function mergeCart(Request $request): JsonResponse
    {
        $request->validate([
            'guest_session_id' => 'required|string',
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required to merge cart.',
            ], 401);
        }

        $result = $this->cartService->mergeCart($request->input('guest_session_id'), $user);

        $cart = $this->cartService->getOrCreateCart($user, null);
        $payload = $this->cartService->getCartPayload($cart, null, null, $user);

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'adjustments' => $result['adjustments'] ?? [],
            'data' => $payload,
        ], 200);
    }
}
