<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $reviews = DB::table('reviews')
            ->join('products', 'reviews.product_id', '=', 'products.id')
            ->join('users', 'reviews.user_id', '=', 'users.id')
            ->select(
                'reviews.*',
                'products.name as product_name',
                'products.slug as product_slug',
                'users.name as user_name',
                'users.email as user_email'
            )
            ->orderBy('reviews.id', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
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

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:APPROVED,REJECTED,PENDING',
        ]);

        DB::table('reviews')->where('id', $id)->update([
            'status' => $request->input('status'),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Review status updated to {$request->input('status')}.",
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        DB::table('reviews')->where('id', $id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully.',
        ], 200);
    }
}
