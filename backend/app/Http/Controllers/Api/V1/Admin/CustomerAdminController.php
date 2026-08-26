<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');

        $query = User::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('id', 'desc')->get();

        $formatted = $users->map(function ($u) {
            $ordersCount = DB::table('orders')->where('user_id', $u->id)->count();
            $totalSpent = DB::table('orders')->where('user_id', $u->id)->where('payment_status', 'PAID')->sum('total_amount');

            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone || 'N/A',
                'user_type' => $u->user_type ?? 'CUSTOMER',
                'provider' => $u->google_id ? 'Google OAuth' : 'Email & Password',
                'status' => $u->status ?? 'ACTIVE',
                'avatar' => $u->avatar,
                'orders_count' => $ordersCount,
                'total_spent' => (float)$totalSpent,
                'created_at' => $u->created_at ? $u->created_at->toIso8601String() : null,
                'updated_at' => $u->updated_at ? $u->updated_at->toIso8601String() : null,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Customer user accounts retrieved.',
            'data' => $formatted,
        ], 200);
    }

    public function show(int $id): JsonResponse
    {
        $u = User::find($id);

        if (!$u) {
            return response()->json([
                'success' => false,
                'message' => 'Customer user account not found.',
            ], 404);
        }

        $orders = DB::table('orders')
            ->where('user_id', $u->id)
            ->orderBy('id', 'desc')
            ->get(['id', 'order_number', 'total_amount', 'order_status', 'payment_status', 'created_at']);

        $totalSpent = DB::table('orders')->where('user_id', $u->id)->where('payment_status', 'PAID')->sum('total_amount');

        return response()->json([
            'success' => true,
            'message' => 'Customer user profile retrieved.',
            'data' => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone || 'N/A',
                'user_type' => $u->user_type ?? 'CUSTOMER',
                'provider' => $u->google_id ? 'Google OAuth' : 'Email & Password',
                'status' => $u->status ?? 'ACTIVE',
                'orders_count' => count($orders),
                'total_spent' => (float)$totalSpent,
                'created_at' => $u->created_at ? $u->created_at->toIso8601String() : null,
                'orders' => $orders,
            ],
        ], 200);
    }

    public function toggleStatus(int $id): JsonResponse
    {
        $u = User::find($id);

        if (!$u) {
            return response()->json([
                'success' => false,
                'message' => 'Customer user account not found.',
            ], 404);
        }

        $u->status = ($u->status === 'INACTIVE') ? 'ACTIVE' : 'INACTIVE';
        $u->save();

        return response()->json([
            'success' => true,
            'message' => "Customer status updated to {$u->status}.",
            'data' => [
                'id' => $u->id,
                'status' => $u->status,
            ],
        ], 200);
    }
}
