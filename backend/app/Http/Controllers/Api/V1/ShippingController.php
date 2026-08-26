<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    protected ShippingService $shippingService;

    public function __construct(ShippingService $shippingService)
    {
        $this->shippingService = $shippingService;
    }

    public function getMethods(): JsonResponse
    {
        $methods = $this->shippingService->getAvailableMethods();
        $threshold = $this->shippingService->getFreeShippingThreshold();

        return response()->json([
            'success' => true,
            'data' => [
                'methods' => $methods,
                'free_shipping_threshold' => $threshold,
            ],
        ], 200);
    }

    public function checkServiceability(Request $request): JsonResponse
    {
        $request->validate([
            'postal_code' => 'required|string',
        ]);

        $res = $this->shippingService->checkServiceability($request->input('postal_code'));

        return response()->json([
            'success' => true,
            'data' => $res,
        ], 200);
    }
}
