<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OfferAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $offers = Offer::with(['products', 'categories'])
            ->orderBy('id', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $offers->items(),
            'meta' => [
                'pagination' => [
                    'total' => $offers->total(),
                    'per_page' => $offers->perPage(),
                    'current_page' => $offers->currentPage(),
                    'last_page' => $offers->lastPage(),
                ]
            ]
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'type' => 'required|in:PRODUCT_DISCOUNT,CATEGORY_DISCOUNT,BUY_X_GET_Y,FREE_SHIPPING,ORDER_DISCOUNT',
            'discount_type' => 'required|in:PERCENTAGE,FIXED_AMOUNT',
            'discount_value' => 'required|numeric|min:0',
            'minimum_quantity' => 'nullable|integer|min:1',
            'minimum_order_amount' => 'nullable|numeric|min:0',
            'maximum_discount' => 'nullable|numeric|min:0',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date',
            'status' => 'required|in:ACTIVE,INACTIVE',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
        ]);

        $offer = Offer::create([
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'type' => $request->input('type'),
            'discount_type' => $request->input('discount_type'),
            'discount_value' => $request->input('discount_value'),
            'minimum_quantity' => $request->input('minimum_quantity', 1),
            'minimum_order_amount' => $request->input('minimum_order_amount', 0),
            'maximum_discount' => $request->input('maximum_discount'),
            'start_at' => $request->input('start_at'),
            'end_at' => $request->input('end_at'),
            'status' => $request->input('status', 'ACTIVE'),
        ]);

        if ($request->has('product_ids')) {
            $offer->products()->sync($request->input('product_ids'));
        }

        if ($request->has('category_ids')) {
            $offer->categories()->sync($request->input('category_ids'));
        }

        return response()->json([
            'success' => true,
            'message' => 'Offer created successfully.',
            'data' => $offer->load(['products', 'categories']),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $offer = Offer::findOrFail($id);

        $request->validate([
            'name' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'type' => 'nullable|in:PRODUCT_DISCOUNT,CATEGORY_DISCOUNT,BUY_X_GET_Y,FREE_SHIPPING,ORDER_DISCOUNT',
            'discount_type' => 'nullable|in:PERCENTAGE,FIXED_AMOUNT',
            'discount_value' => 'nullable|numeric|min:0',
            'minimum_quantity' => 'nullable|integer|min:1',
            'minimum_order_amount' => 'nullable|numeric|min:0',
            'maximum_discount' => 'nullable|numeric|min:0',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date',
            'status' => 'nullable|in:ACTIVE,INACTIVE',
            'product_ids' => 'nullable|array',
            'category_ids' => 'nullable|array',
        ]);

        $offer->update(array_filter($request->only([
            'name', 'description', 'type', 'discount_type', 'discount_value',
            'minimum_quantity', 'minimum_order_amount', 'maximum_discount',
            'start_at', 'end_at', 'status'
        ]), fn($v) => !is_null($v)));

        if ($request->has('product_ids')) {
            $offer->products()->sync($request->input('product_ids'));
        }

        if ($request->has('category_ids')) {
            $offer->categories()->sync($request->input('category_ids'));
        }

        return response()->json([
            'success' => true,
            'message' => 'Offer updated successfully.',
            'data' => $offer->fresh()->load(['products', 'categories']),
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $offer = Offer::findOrFail($id);
        $offer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Offer deleted successfully.',
        ], 200);
    }
}
