<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Services\CartCheckoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerOrderController extends Controller
{
    protected CartCheckoutService $cartCheckoutService;

    public function __construct(CartCheckoutService $cartCheckoutService)
    {
        $this->cartCheckoutService = $cartCheckoutService;
    }

    /**
     * POST /api/v1/customer/orders/checkout
     */
    public function checkout(Request $request): JsonResponse
    {
        $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'shipping_address' => ['required', 'array'],
            'shipping_address.name' => ['required', 'string'],
            'shipping_address.address' => ['required', 'string'],
            'shipping_address.city' => ['required', 'string'],
            'shipping_address.state' => ['required', 'string'],
            'shipping_address.pincode' => ['required', 'string'],
            'shipping_address.phone' => ['required', 'string'],
        ]);

        $order = $this->cartCheckoutService->checkout(
            $request->user(),
            $request->all()
        );

        return response()->json([
            'success' => true,
            'message' => 'Order created and stock reserved successfully.',
            'data' => $order,
        ], 201);
    }

    /**
     * GET /api/v1/customer/orders
     */
    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->orders()
            ->with('items')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Customer orders retrieved.',
            'data' => $orders->items(),
            'meta' => [
                'pagination' => [
                    'total' => $orders->total(),
                    'per_page' => $orders->perPage(),
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                ]
            ]
        ], 200);
    }
}
