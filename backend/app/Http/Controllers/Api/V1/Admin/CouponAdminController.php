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
                
                // Paid / Successful Purchases (payment_status == 'PAID' or completed/processing)
                $paidStats = CouponUsage::where('coupon_id', $coupon->id)
                    ->join('orders', 'coupon_usages.order_id', '=', 'orders.id')
                    ->where(function ($q) {
                        $q->where('orders.payment_status', 'PAID')
                          ->orWhereIn('orders.order_status', ['COMPLETED', 'PROCESSING']);
                    })
                    ->select(
                        DB::raw('COUNT(orders.id) as paid_count'),
                        DB::raw('COALESCE(SUM(orders.discount_amount), 0) as total_discount'),
                        DB::raw('COALESCE(SUM(orders.total_amount), 0) as total_sales')
                    )
                    ->first();

                // Unpaid / Unsuccessful Attempts (used in checkout but payment incomplete)
                $unpaidCount = CouponUsage::where('coupon_id', $coupon->id)
                    ->join('orders', 'coupon_usages.order_id', '=', 'orders.id')
                    ->where('orders.payment_status', '!=', 'PAID')
                    ->whereNotIn('orders.order_status', ['COMPLETED', 'PROCESSING'])
                    ->count();

                $totalSales = (float)($paidStats->total_sales ?? 0);
                $commissionPercent = (float)($coupon->influencer_commission_percent ?? 0);

                $couponArray['successful_purchases_count'] = (int)($paidStats->paid_count ?? 0);
                $couponArray['unpaid_attempts_count'] = (int)$unpaidCount;
                $couponArray['total_discount_given'] = (float)($paidStats->total_discount ?? 0);
                $couponArray['total_sales_generated'] = $totalSales;
                $couponArray['influencer_commission_earned'] = round(($totalSales * ($commissionPercent / 100)), 2);
                
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
        
        $paidStats = CouponUsage::join('orders', 'coupon_usages.order_id', '=', 'orders.id')
            ->where(function ($q) {
                $q->where('orders.payment_status', 'PAID')
                  ->orWhereIn('orders.order_status', ['COMPLETED', 'PROCESSING']);
            })
            ->select(
                DB::raw('COUNT(orders.id) as successful_paid_count'),
                DB::raw('COALESCE(SUM(orders.discount_amount), 0) as total_discount'),
                DB::raw('COALESCE(SUM(orders.total_amount), 0) as total_sales')
            )
            ->first();

        $unpaidCount = CouponUsage::join('orders', 'coupon_usages.order_id', '=', 'orders.id')
            ->where('orders.payment_status', '!=', 'PAID')
            ->whereNotIn('orders.order_status', ['COMPLETED', 'PROCESSING'])
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_coupons' => $totalCoupons,
                'active_coupons' => $activeCoupons,
                'total_redemptions' => $totalRedemptions,
                'successful_paid_purchases' => (int)($paidStats->successful_paid_count ?? 0),
                'unpaid_attempts' => (int)$unpaidCount,
                'total_discount_issued' => (float)($paidStats->total_discount ?? 0),
                'total_sales_generated' => (float)($paidStats->total_sales ?? 0),
            ]
        ], 200);
    }

    public function show(int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);

        // Usage Orders with user details
        $usageOrders = DB::table('coupon_usages')
            ->join('orders', 'coupon_usages.order_id', '=', 'orders.id')
            ->leftJoin('users', 'orders.user_id', '=', 'users.id')
            ->where('coupon_usages.coupon_id', $coupon->id)
            ->orderBy('orders.id', 'desc')
            ->select([
                'orders.id as order_id',
                'orders.order_number',
                'orders.total_amount',
                'orders.discount_amount',
                'orders.order_status',
                'orders.payment_status',
                'orders.created_at as order_date',
                'users.name as customer_name',
                'users.email as customer_email',
            ])
            ->get();

        $paidOrdersCount = 0;
        $unpaidAttemptsCount = 0;
        $totalPaidSales = 0.00;
        $totalPaidDiscount = 0.00;

        $orderIds = [];
        foreach ($usageOrders as $ord) {
            $orderIds[] = $ord->order_id;
            $isPaid = ($ord->payment_status === 'PAID') || in_array($ord->order_status, ['COMPLETED', 'PROCESSING']);
            if ($isPaid) {
                $paidOrdersCount++;
                $totalPaidSales += (float)$ord->total_amount;
                $totalPaidDiscount += (float)$ord->discount_amount;
            } else {
                $unpaidAttemptsCount++;
            }
        }

        // Attach items purchased for each order & aggregate products summary
        $orderItemsGrouped = [];
        $productSummaryMap = [];

        if (!empty($orderIds)) {
            $items = DB::table('order_items')
                ->whereIn('order_id', $orderIds)
                ->get();

            foreach ($items as $item) {
                $orderItemsGrouped[$item->order_id][] = [
                    'id' => $item->id,
                    'product_name' => $item->product_name_snapshot,
                    'sku' => $item->sku_snapshot,
                    'color' => $item->color_snapshot,
                    'size' => $item->size_snapshot,
                    'quantity' => (int)$item->quantity,
                    'unit_price' => (float)$item->unit_price,
                    'total_amount' => (float)$item->total_amount,
                ];

                // Aggregate into product summary map for paid orders
                $prodKey = $item->product_name_snapshot . '|' . ($item->color_snapshot ?: 'Default') . '|' . ($item->size_snapshot ?: 'Free');
                if (!isset($productSummaryMap[$prodKey])) {
                    $productSummaryMap[$prodKey] = [
                        'product_name' => $item->product_name_snapshot,
                        'sku' => $item->sku_snapshot,
                        'color' => $item->color_snapshot ?: 'N/A',
                        'size' => $item->size_snapshot ?: 'N/A',
                        'total_quantity_sold' => 0,
                        'total_revenue' => 0.00,
                    ];
                }
                $productSummaryMap[$prodKey]['total_quantity_sold'] += (int)$item->quantity;
                $productSummaryMap[$prodKey]['total_revenue'] += (float)$item->total_amount;
            }
        }

        $formattedOrders = $usageOrders->map(function ($ord) use ($orderItemsGrouped) {
            $ord->items = $orderItemsGrouped[$ord->order_id] ?? [];
            return $ord;
        });

        $commissionPercent = (float)($coupon->influencer_commission_percent ?? 0);
        $commissionEarned = round(($totalPaidSales * ($commissionPercent / 100)), 2);

        return response()->json([
            'success' => true,
            'data' => [
                'coupon' => $coupon,
                'metrics' => [
                    'total_applications' => count($usageOrders),
                    'successful_paid_purchases' => $paidOrdersCount,
                    'unpaid_attempts' => $unpaidAttemptsCount,
                    'total_sales_generated' => (float)$totalPaidSales,
                    'total_discount_given' => (float)$totalPaidDiscount,
                    'commission_percent' => $commissionPercent,
                    'commission_earned' => $commissionEarned,
                ],
                'purchased_products' => array_values($productSummaryMap),
                'orders' => $formattedOrders,
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
