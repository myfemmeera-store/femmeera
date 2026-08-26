<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderReturn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReturnAdminController extends Controller
{
    /**
     * List all customer return requests with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = OrderReturn::with(['order', 'user', 'orderItem', 'product']);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $returns = $query->orderBy('created_at', 'desc')->paginate($request->query('per_page', 15));
        $policy = DB::table('settings')->where('key_name', 'return_policy')->value('value_content');

        return response()->json([
            'success' => true,
            'data' => $returns->items(),
            'policy' => $policy ? json_decode($policy, true) : null,
            'meta' => [
                'current_page' => $returns->currentPage(),
                'last_page' => $returns->lastPage(),
                'per_page' => $returns->perPage(),
                'total' => $returns->total(),
            ]
        ]);
    }

    /**
     * View single return request details.
     */
    public function show(int $id): JsonResponse
    {
        $returnRequest = OrderReturn::with(['order', 'user', 'orderItem', 'product'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $returnRequest,
        ]);
    }

    /**
     * Update return request status.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $returnRequest = OrderReturn::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:REQUESTED,UNDER_REVIEW,APPROVED,REJECTED,PICKUP_SCHEDULED,PICKED_UP,RECEIVED,REFUND_INITIATED,REFUNDED',
            'admin_comment' => 'nullable|string',
            'refund_amount' => 'nullable|numeric|min:0',
        ]);

        $returnRequest->update($validated);

        // Sync order status if approved or refunded
        if ($validated['status'] === 'APPROVED') {
            $returnRequest->order->update(['order_status' => 'RETURN_REQUESTED']);
        } elseif ($validated['status'] === 'REFUNDED') {
            $returnRequest->order->update([
                'order_status' => 'REFUNDED',
                'payment_status' => 'REFUNDED',
            ]);
        }

        // Dispatch Email Notifications on Return Status Change
        try {
            $returnRequest->load(['order', 'user']);
            $customerEmail = $returnRequest->user->email ?? $returnRequest->order->shipping_address['email'] ?? '';
            $customerName = $returnRequest->user->name ?? $returnRequest->order->shipping_address['name'] ?? '';
            $orderNumber = $returnRequest->order->order_number ?? '';

            if (!empty($customerEmail)) {
                $eventMap = [
                    'APPROVED' => 'return_approved',
                    'REJECTED' => 'return_rejected',
                    'REFUND_INITIATED' => 'refund_initiated',
                    'REFUNDED' => 'refund_completed',
                ];

                if (isset($eventMap[$validated['status']])) {
                    \App\Jobs\SendEmailNotificationJob::dispatch(
                        $eventMap[$validated['status']],
                        $customerEmail,
                        $customerName,
                        [
                            'order_number' => $orderNumber,
                            'customer_name' => $customerName,
                            'refund_amount' => $returnRequest->refund_amount ?? $returnRequest->order->total ?? 0,
                            'admin_notes' => $returnRequest->admin_comment ?? '',
                        ]
                    );
                }
            }
        } catch (\Throwable $ex) {
            \Illuminate\Support\Facades\Log::warning("ReturnAdminController: Failed to dispatch return status email: " . $ex->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => "Return status updated to {$validated['status']}.",
            'data' => $returnRequest,
        ]);
    }

    /**
     * Save return policy.
     */
    public function updatePolicy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'return_window_days' => 'required|integer|min:1|max:90',
            'allow_returns' => 'required|boolean',
            'allow_exchanges' => 'required|boolean',
            'content' => 'required|string',
        ]);

        DB::table('settings')->updateOrInsert(
            ['key_name' => 'return_policy'],
            [
                'group_name' => 'policy',
                'value_content' => json_encode($validated),
                'updated_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Return policy updated successfully.',
            'data' => $validated,
        ]);
    }
}
