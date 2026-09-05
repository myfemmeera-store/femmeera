<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CustomerReviewController extends Controller
{
    /**
     * Submit a product review / feedback from customer
     * POST /api/v1/customer/reviews
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'order_item_id' => 'nullable|integer',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'required|string|max:2000',
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        // Insert review into reviews table
        $reviewId = DB::table('reviews')->insertGetId([
            'product_id' => $request->input('product_id'),
            'user_id' => $user->id,
            'order_item_id' => $request->input('order_item_id'),
            'rating' => (int) $request->input('rating'),
            'title' => $request->input('title') ?: 'Customer Review',
            'comment' => $request->input('comment'),
            'status' => 'APPROVED', // Automatically approve customer order reviews
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Log::info("CustomerReviewController: New review #{$reviewId} created by user #{$user->id} for product #{$request->input('product_id')}");

        return response()->json([
            'success' => true,
            'message' => 'Thank you! Your product review has been submitted successfully.',
            'data' => [
                'id' => $reviewId,
                'rating' => (int) $request->input('rating'),
                'title' => $request->input('title'),
                'comment' => $request->input('comment'),
                'status' => 'APPROVED',
            ],
        ], 201);
    }

    /**
     * Get reviews submitted by current customer
     * GET /api/v1/customer/reviews
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $reviews = DB::table('reviews')
            ->join('products', 'reviews.product_id', '=', 'products.id')
            ->select(
                'reviews.*',
                'products.name as product_name',
                'products.slug as product_slug'
            )
            ->where('reviews.user_id', $user->id)
            ->orderBy('reviews.id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reviews,
        ]);
    }
}
