<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\OrderAdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderAdminController extends Controller
{
    protected OrderAdminService $orderAdminService;

    public function __construct(OrderAdminService $orderAdminService)
    {
        $this->orderAdminService = $orderAdminService;
    }

    /**
     * GET /api/v1/admin/orders
     */
    public function index(Request $request): JsonResponse
    {
        $orders = $this->orderAdminService->getOrders(
            (int)$request->query('per_page', 15),
            $request->query('search'),
            $request->query('status'),
            $request->query('payment_status')
        );

        return response()->json([
            'success' => true,
            'message' => 'Orders list retrieved.',
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

    /**
     * GET /api/v1/admin/orders/{id}
     */
    public function show(int $id): JsonResponse
    {
        $order = $this->orderAdminService->getOrderDetails($id);

        return response()->json([
            'success' => true,
            'message' => 'Order details retrieved.',
            'data' => $order,
        ], 200);
    }

    /**
     * PUT /api/v1/admin/orders/{id}/status
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'string'],
            'comment' => ['nullable', 'string', 'max:500'],
        ]);

        $order = $this->orderAdminService->updateOrderStatus(
            $id,
            $request->input('status'),
            $request->input('comment'),
            $request->user()?->id
        );

        return response()->json([
            'success' => true,
            'message' => "Order status updated to {$order->order_status}.",
            'data' => $order,
        ], 200);
    }

    /**
     * POST /api/v1/admin/orders/{id}/cancel
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $order = $this->orderAdminService->cancelOrder(
            $id,
            $request->input('reason'),
            $request->user()?->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Order cancelled and reserved stock released successfully.',
            'data' => $order,
        ], 200);
    }

    /**
     * POST /api/v1/admin/orders/{id}/tracking
     */
    public function tracking(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'carrier' => ['required', 'string', 'max:100'],
            'tracking_number' => ['required', 'string', 'max:100'],
            'tracking_url' => ['nullable', 'url', 'max:255'],
        ]);

        $order = $this->orderAdminService->updateTracking(
            $id,
            $request->input('carrier'),
            $request->input('tracking_number'),
            $request->input('tracking_url'),
            $request->user()?->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Shipping tracking details updated.',
            'data' => $order,
        ], 200);
    }

    /**
     * GET /api/v1/admin/orders/{id}/history
     */
    public function history(int $id): JsonResponse
    {
        $order = $this->orderAdminService->getOrderDetails($id);

        return response()->json([
            'success' => true,
            'message' => 'Order status history retrieved.',
            'data' => $order->statusHistory,
        ], 200);
    }
}
