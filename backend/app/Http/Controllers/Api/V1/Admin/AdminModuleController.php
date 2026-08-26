<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminModuleController extends Controller
{
    public function products(): JsonResponse
    {
        $products = DB::table('products')
            ->select('id', 'name', 'slug', 'sku', 'brand', 'status', 'created_at')
            ->orderBy('id', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Admin products directory retrieved.',
            'data' => $products->items(),
            'meta' => [
                'pagination' => [
                    'total' => $products->total(),
                    'per_page' => $products->perPage(),
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                ]
            ]
        ], 200);
    }

    public function categories(): JsonResponse
    {
        $categories = DB::table('categories')->get();

        return response()->json([
            'success' => true,
            'message' => 'Admin categories tree retrieved.',
            'data' => $categories,
        ], 200);
    }

    public function inventory(): JsonResponse
    {
        $inventory = DB::table('inventory')
            ->join('product_variants', 'inventory.variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->select('inventory.*', 'product_variants.sku', 'product_variants.size', 'product_variants.color', 'products.name as product_name')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Admin inventory stock levels retrieved.',
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

    public function orders(): JsonResponse
    {
        $orders = DB::table('orders')->orderBy('id', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Admin orders list retrieved.',
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

    public function customers(): JsonResponse
    {
        $customers = DB::table('users')
            ->where('user_type', 'CUSTOMER')
            ->select('id', 'name', 'email', 'phone', 'status', 'created_at')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Admin customer directory retrieved.',
            'data' => $customers->items(),
            'meta' => [
                'pagination' => [
                    'total' => $customers->total(),
                    'per_page' => $customers->perPage(),
                    'current_page' => $customers->currentPage(),
                    'last_page' => $customers->lastPage(),
                ]
            ]
        ], 200);
    }

    public function reviews(): JsonResponse
    {
        $reviews = DB::table('reviews')->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Admin reviews moderation list retrieved.',
            'data' => $reviews->items(),
            'meta' => [
                'pagination' => [
                    'total' => $reviews->total(),
                    'per_page' => $reviews->perPage(),
                    'current_page' => $reviews->currentPage(),
                    'last_page' => $reviews->lastPage(),
                ]
            ]
        ], 200);
    }

    public function coupons(): JsonResponse
    {
        $coupons = DB::table('coupons')->get();

        return response()->json([
            'success' => true,
            'message' => 'Admin coupons retrieved.',
            'data' => $coupons,
        ], 200);
    }

    public function offers(): JsonResponse
    {
        $offers = DB::table('offers')->get();

        return response()->json([
            'success' => true,
            'message' => 'Admin offers retrieved.',
            'data' => $offers,
        ], 200);
    }

    public function homepage(): JsonResponse
    {
        $sections = DB::table('homepage_sections')->get();

        return response()->json([
            'success' => true,
            'message' => 'Admin homepage CMS sections retrieved.',
            'data' => $sections,
        ], 200);
    }

    public function banners(): JsonResponse
    {
        $banners = DB::table('hero_banners')->get();

        return response()->json([
            'success' => true,
            'message' => 'Admin hero banners retrieved.',
            'data' => $banners,
        ], 200);
    }

    public function popups(): JsonResponse
    {
        $popups = DB::table('popups')->get();

        return response()->json([
            'success' => true,
            'message' => 'Admin popups retrieved.',
            'data' => $popups,
        ], 200);
    }

    public function reports(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Admin reports data ready.',
            'data' => ['reports_available' => ['sales', 'inventory', 'customers']],
        ], 200);
    }
}
