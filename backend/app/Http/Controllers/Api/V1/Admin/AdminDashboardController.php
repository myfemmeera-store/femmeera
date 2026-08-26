<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $today = now()->startOfDay();

        $todaysSales = DB::table('orders')
            ->where('created_at', '>=', $today)
            ->where('payment_status', 'PAID')
            ->sum('total_amount');

        $ordersToday = DB::table('orders')
            ->where('created_at', '>=', $today)
            ->count();

        $totalCustomers = DB::table('users')
            ->where('user_type', 'CUSTOMER')
            ->count();

        $pendingOrders = DB::table('orders')
            ->where('order_status', 'PENDING')
            ->count();

        $lowStockProductsCount = DB::table('inventory')
            ->whereColumn('available_quantity', '<=', 'low_stock_threshold')
            ->count();

        $recentOrders = DB::table('orders')
            ->orderBy('id', 'desc')
            ->limit(5)
            ->get(['id', 'order_number', 'total_amount', 'order_status', 'payment_status', 'created_at']);

        return response()->json([
            'success' => true,
            'message' => 'Admin dashboard statistics retrieved.',
            'data' => [
                'todays_sales' => (float)$todaysSales,
                'orders_today' => $ordersToday,
                'total_customers' => $totalCustomers,
                'pending_orders' => $pendingOrders,
                'low_stock_products' => $lowStockProductsCount,
                'recent_orders' => $recentOrders,
                'sales_summary' => [
                    'currency' => 'INR',
                    'period' => 'Today',
                ],
            ],
        ], 200);
    }
}
