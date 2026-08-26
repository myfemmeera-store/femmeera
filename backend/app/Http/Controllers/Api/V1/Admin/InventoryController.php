<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * GET /api/v1/admin/inventory
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int)$request->query('per_page', 15);
        $search = $request->query('search');

        $inventory = $this->inventoryService->getInventory($perPage, $search);

        return response()->json([
            'success' => true,
            'message' => 'Inventory stock levels retrieved.',
            'data' => $inventory->items(),
            'meta' => [
                'pagination' => [
                    'total' => $inventory->total(),
                    'per_page' => $inventory->perPage(),
                    'current_page' => $inventory->currentPage(),
                    'last_page' => $inventory->lastPage(),
                ]
            ]
        ], 200);
    }

    /**
     * GET /api/v1/admin/inventory/low-stock
     */
    public function lowStock(Request $request): JsonResponse
    {
        $inventory = $this->inventoryService->getLowStock((int)$request->query('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Low stock inventory retrieved.',
            'data' => $inventory->items(),
            'meta' => [
                'pagination' => [
                    'total' => $inventory->total(),
                    'per_page' => $inventory->perPage(),
                    'current_page' => $inventory->currentPage(),
                    'last_page' => $inventory->lastPage(),
                ]
            ]
        ], 200);
    }

    /**
     * GET /api/v1/admin/inventory/out-of-stock
     */
    public function outOfStock(Request $request): JsonResponse
    {
        $inventory = $this->inventoryService->getOutOfStock((int)$request->query('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Out of stock inventory retrieved.',
            'data' => $inventory->items(),
            'meta' => [
                'pagination' => [
                    'total' => $inventory->total(),
                    'per_page' => $inventory->perPage(),
                    'current_page' => $inventory->currentPage(),
                    'last_page' => $inventory->lastPage(),
                ]
            ]
        ], 200);
    }

    /**
     * GET /api/v1/admin/inventory/history
     */
    public function history(Request $request): JsonResponse
    {
        $variantId = $request->query('variant_id') ? (int)$request->query('variant_id') : null;
        $history = $this->inventoryService->getHistory($variantId, (int)$request->query('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Inventory transaction history retrieved.',
            'data' => $history->items(),
            'meta' => [
                'pagination' => [
                    'total' => $history->total(),
                    'per_page' => $history->perPage(),
                    'current_page' => $history->currentPage(),
                    'last_page' => $history->lastPage(),
                ]
            ]
        ], 200);
    }

    /**
     * POST /api/v1/admin/inventory/{variantId}/adjust
     */
    public function adjust(Request $request, int $variantId): JsonResponse
    {
        $request->validate([
            'quantity' => ['required', 'integer'],
            'type' => ['required', 'string', 'in:PURCHASE,SALE,RETURN,CANCELLATION,DAMAGE,ADJUSTMENT'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $inventory = $this->inventoryService->adjustStock(
            $variantId,
            (int)$request->input('quantity'),
            $request->input('type'),
            $request->input('notes'),
            $request->user()?->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Inventory stock adjusted successfully.',
            'data' => $inventory,
        ], 200);
    }
}
