<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderReturn;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerReturnController extends Controller
{
    /**
     * List current customer's return requests.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $returns = OrderReturn::with(['order', 'product'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $returns,
        ]);
    }

    /**
     * Submit a return request for an order item.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'order_item_id' => 'nullable|exists:order_items,id',
            'product_id' => 'nullable|exists:products,id',
            'reason' => 'required|string|max:255',
            'comment' => 'nullable|string|max:1000',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string',
        ]);

        // 1. Verify order belongs to user
        $order = Order::where('id', $validated['order_id'])
            ->where('user_id', $user->id)
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found or access denied.',
            ], 404);
        }

        // 2. Verify order status eligibility (DELIVERED)
        if ($order->order_status !== 'DELIVERED') {
            return response()->json([
                'success' => false,
                'message' => 'Return requests can only be submitted for delivered orders.',
            ], 422);
        }

        // 3. Verify product returnability
        if (!empty($validated['product_id'])) {
            $product = Product::find($validated['product_id']);
            if ($product && $product->return_policy_type === 'NON_RETURNABLE') {
                return response()->json([
                    'success' => false,
                    'message' => 'This product is marked as non-returnable.',
                ], 422);
            }
        }

        // 4. Verify return window policy (e.g. 7 days from delivered_at or created_at)
        $policyVal = DB::table('settings')->where('key_name', 'return_policy')->value('value_content');
        $policy = $policyVal ? json_decode($policyVal, true) : null;
        $windowDays = isset($policy['return_window_days']) ? (int) $policy['return_window_days'] : 7;

        $referenceDate = $order->delivered_at ?: $order->updated_at;
        if ($referenceDate && $referenceDate->diffInDays(now()) > $windowDays) {
            return response()->json([
                'success' => false,
                'message' => "Return window of {$windowDays} days has expired for this order.",
            ], 422);
        }

        // 5. Prevent duplicate return requests for same order item
        $existing = OrderReturn::where('order_id', $order->id)
            ->where('user_id', $user->id)
            ->where('order_item_id', $validated['order_item_id'] ?? null)
            ->whereNotIn('status', ['REJECTED'])
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'A return request is already active for this item.',
                'data' => $existing,
            ], 409);
        }

        // 6. Create return request
        $returnRequest = OrderReturn::create([
            'order_id' => $order->id,
            'user_id' => $user->id,
            'order_item_id' => $validated['order_item_id'] ?? null,
            'product_id' => $validated['product_id'] ?? null,
            'reason' => $validated['reason'],
            'comment' => $validated['comment'] ?? null,
            'images' => $validated['images'] ?? [],
            'status' => 'REQUESTED',
            'refund_amount' => $order->total_amount,
        ]);

        // Queue Return Notification Emails
        try {
            // 1. Customer Email
            \App\Jobs\SendEmailNotificationJob::dispatch(
                'return_requested',
                $user->email,
                $user->name,
                [
                    'order_number' => $order->order_number,
                    'return_id' => $returnRequest->id,
                    'return_reason' => $returnRequest->reason,
                    'customer_name' => $user->name,
                ]
            );

            // 2. Admin Alert Email
            $adminEmail = env('ADMIN_NOTIFICATION_EMAIL', env('MAIL_FROM_ADDRESS', 'admin@femmeera.com'));
            \App\Jobs\SendEmailNotificationJob::dispatch(
                'admin_new_return',
                $adminEmail,
                'Admin Concierge',
                [
                    'order_number' => $order->order_number,
                    'return_id' => $returnRequest->id,
                    'return_reason' => $returnRequest->reason,
                ]
            );
        } catch (\Throwable $ex) {
            \Illuminate\Support\Facades\Log::warning("CustomerReturnController: Failed to dispatch return email: " . $ex->getMessage());
        }

        $order->update(['order_status' => 'RETURN_REQUESTED']);

        return response()->json([
            'success' => true,
            'message' => 'Return request submitted successfully.',
            'data' => $returnRequest,
        ], 201);
    }
}
