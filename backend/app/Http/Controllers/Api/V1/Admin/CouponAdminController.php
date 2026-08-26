<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\CouponUsage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CouponAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $coupons = Coupon::withCount('usages')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($coupon) {
                $couponArray = $coupon->toArray();
                
                // Calculate total discount given & total sales generated via usages
                $usageStats = CouponUsage::where('coupon_id', $coupon->id)
                    ->join('orders', 'coupon_usages.order_id', '=', 'orders.id')
                    ->select(
                        DB::raw('COALESCE(SUM(orders.discount_amount), 0) as total_discount'),
                        DB::raw('COALESCE(SUM(orders.total_amount), 0) as total_sales')
                    )
                    ->first();

                $couponArray['total_discount_given'] = (float)($usageStats->total_discount ?? 0);
                $couponArray['total_sales_generated'] = (float)($usageStats->total_sales ?? 0);
                
                return $couponArray;
            });

        return response()->json([
            'success' => true,
            'data' => $coupons,
            'meta' => [
                'pagination' => [
                    'total' => $coupons->count(),
                    'per_page' => 100,
                    'current_page' => 1,
                    'last_page' => 1,
                ]
            ]
        ], 200);
    }

    public function analytics(): JsonResponse
    {
        $totalCoupons = Coupon::count();
        $activeCoupons = Coupon::where('status', 'ACTIVE')->count();
        
        $totalRedemptions = CouponUsage::count();
        
        $stats = CouponUsage::join('orders', 'coupon_usages.order_id', '=', 'orders.id')
            ->select(
                DB::raw('COALESCE(SUM(orders.discount_amount), 0) as total_discount'),
                DB::raw('COALESCE(SUM(orders.total_amount), 0) as total_sales')
            )
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'total_coupons' => $totalCoupons,
                'active_coupons' => $activeCoupons,
                'total_redemptions' => $totalRedemptions,
                'total_discount_issued' => (float)($stats->total_discount ?? 0),
                'total_sales_generated' => (float)($stats->total_sales ?? 0),
            ]
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|max:50|unique:coupons,code',
            'name' => 'required|string|max:100',
            'influencer_name' => 'nullable|string|max:150',
            'influencer_handle' => 'nullable|string|max:100',
            'influencer_commission_percent' => 'nullable|numeric|min:0|max:100',
            'description' => 'nullable|string',
            'discount_type' => 'required|in:PERCENTAGE,FIXED_AMOUNT,FREE_SHIPPING',
            'discount_value' => 'required|numeric|min:0',
            'minimum_order_amount' => 'nullable|numeric|min:0',
            'maximum_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'usage_limit_per_customer' => 'nullable|integer|min:1',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
            'status' => 'required|in:ACTIVE,INACTIVE,EXPIRED',
        ]);

        $coupon = Coupon::create([
            'code' => strtoupper(trim($request->input('code'))),
            'name' => $request->input('name'),
            'influencer_name' => $request->input('influencer_name'),
            'influencer_handle' => $request->input('influencer_handle'),
            'influencer_commission_percent' => $request->input('influencer_commission_percent', 0),
            'description' => $request->input('description'),
            'discount_type' => $request->input('discount_type'),
            'discount_value' => $request->input('discount_value'),
            'minimum_order_amount' => $request->input('minimum_order_amount', 0),
            'maximum_discount_amount' => $request->input('maximum_discount_amount'),
            'usage_limit' => $request->input('usage_limit'),
            'usage_limit_per_customer' => $request->input('usage_limit_per_customer', 1),
            'start_at' => $request->input('start_at'),
            'end_at' => $request->input('end_at'),
            'status' => $request->input('status', 'ACTIVE'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Influencer coupon created successfully.',
            'data' => $coupon,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);

        $request->validate([
            'code' => "nullable|string|max:50|unique:coupons,code,{$id}",
            'name' => 'nullable|string|max:100',
            'influencer_name' => 'nullable|string|max:150',
            'influencer_handle' => 'nullable|string|max:100',
            'influencer_commission_percent' => 'nullable|numeric|min:0|max:100',
            'description' => 'nullable|string',
            'discount_type' => 'nullable|in:PERCENTAGE,FIXED_AMOUNT,FREE_SHIPPING',
            'discount_value' => 'nullable|numeric|min:0',
            'minimum_order_amount' => 'nullable|numeric|min:0',
            'maximum_discount_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'usage_limit_per_customer' => 'nullable|integer|min:1',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date',
            'status' => 'nullable|in:ACTIVE,INACTIVE,EXPIRED',
        ]);

        $data = $request->only([
            'name', 'influencer_name', 'influencer_handle', 'influencer_commission_percent',
            'description', 'discount_type', 'discount_value',
            'minimum_order_amount', 'maximum_discount_amount',
            'usage_limit', 'usage_limit_per_customer', 'start_at', 'end_at', 'status'
        ]);

        if ($request->filled('code')) {
            $data['code'] = strtoupper(trim($request->input('code')));
        }

        $coupon->update(array_filter($data, fn($v) => !is_null($v)));

        return response()->json([
            'success' => true,
            'message' => 'Influencer coupon updated successfully.',
            'data' => $coupon->fresh(),
        ], 200);
    }

    public function toggleStatus(int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);
        $newStatus = $coupon->status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        $coupon->update(['status' => $newStatus]);

        return response()->json([
            'success' => true,
            'message' => "Coupon code #{$coupon->code} is now {$newStatus}.",
            'data' => $coupon->fresh(),
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return response()->json([
            'success' => true,
            'message' => 'Coupon deleted successfully.',
        ], 200);
    }
}
