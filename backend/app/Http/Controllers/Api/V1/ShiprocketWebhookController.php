<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ShiprocketWebhookController extends Controller
{
    /**
     * Handle incoming Shiprocket shipment status updates
     * Endpoint: POST /api/v1/shipment-updates (and /api/shiprocket/webhook)
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        // 0. Handle GET request (e.g., when tested directly in browser)
        if ($request->isMethod('get')) {
            return response()->json([
                'success' => true,
                'message' => 'Shiprocket webhook endpoint is active and operational. Please send a POST request with x-api-key header to trigger webhook processing.',
                'endpoint' => $request->url(),
            ], 200);
        }

        // 1. Verify x-api-key authentication header securely against SHIPROCKET_WEBHOOK_TOKEN
        $incomingToken = $request->header('x-api-key') ?: $request->header('X-Api-Key');
        $expectedToken = env('SHIPROCKET_WEBHOOK_TOKEN');

        if (!empty($expectedToken)) {
            if (empty($incomingToken) || !hash_equals((string) $expectedToken, (string) $incomingToken)) {
                Log::warning('ShiprocketWebhook: Unauthorized access attempt with token: ' . substr((string) $incomingToken, 0, 8));
                return response()->json(['success' => false, 'message' => 'Unauthorized webhook token'], 401);
            }
        }

        $payload = $request->all();
        Log::info('Shiprocket Webhook Received', ['payload' => $payload]);

        $orderIdStr = $payload['order_id'] ?? $payload['channel_order_id'] ?? null;
        $srShipmentId = $payload['shipment_id'] ?? null;
        $awbCode = $payload['awb'] ?? $payload['awb_code'] ?? null;
        $currentStatus = strtoupper(trim((string) ($payload['current_status'] ?? $payload['status'] ?? '')));

        if (!$orderIdStr && !$srShipmentId && !$awbCode) {
            return response()->json(['success' => true, 'message' => 'Webhook payload logged, no matching identifier found'], 200);
        }

        // 2. Identify corresponding Femmeera order
        $orderQuery = Order::query();
        if ($orderIdStr) {
            $orderQuery->where('order_number', $orderIdStr)->orWhere('id', $orderIdStr)->orWhere('shiprocket_order_id', $orderIdStr);
        }
        if ($srShipmentId) {
            $orderQuery->orWhere('shiprocket_shipment_id', $srShipmentId);
        }
        if ($awbCode) {
            $orderQuery->orWhere('awb_code', $awbCode)->orWhere('tracking_number', $awbCode);
        }

        $order = $orderQuery->first();

        if (!$order) {
            Log::info("ShiprocketWebhook: Order not found for identifier: {$orderIdStr} / AWB: {$awbCode}");
            return response()->json(['success' => true, 'message' => 'Webhook logged, order not found'], 200);
        }

        // 3. Map Shiprocket Status to Femmeera Order Status
        $mappedStatus = null;
        $statusLower = strtolower($currentStatus);

        if (str_contains($statusLower, 'delivered')) {
            $mappedStatus = 'DELIVERED';
        } elseif (str_contains($statusLower, 'out for delivery')) {
            $mappedStatus = 'OUT_FOR_DELIVERY';
        } elseif (str_contains($statusLower, 'shipped') || str_contains($statusLower, 'in transit') || str_contains($statusLower, 'pickup')) {
            $mappedStatus = 'SHIPPED';
        } elseif (str_contains($statusLower, 'cancelled') || str_contains($statusLower, 'rto') || str_contains($statusLower, 'returned')) {
            $mappedStatus = 'CANCELLED';
        } elseif (str_contains($statusLower, 'confirmed') || str_contains($statusLower, 'processing')) {
            $mappedStatus = 'CONFIRMED';
        }

        // 4. Idempotency Check: Do not duplicate update if order is already in target status
        if ($mappedStatus && $order->order_status === $mappedStatus) {
            return response()->json(['success' => true, 'message' => 'Order already in status ' . $mappedStatus], 200);
        }

        // 5. Update Order & Shipment Status
        $updateFields = [
            'shipment_status' => $currentStatus ?: $order->shipment_status,
            'updated_at' => now(),
        ];

        if ($awbCode && empty($order->awb_code)) {
            $updateFields['awb_code'] = $awbCode;
            $updateFields['tracking_number'] = $awbCode;
            $updateFields['tracking_url'] = "https://shiprocket.co/tracking/{$awbCode}";
        }

        if ($mappedStatus) {
            $updateFields['order_status'] = $mappedStatus;
            if ($mappedStatus === 'SHIPPED' && empty($order->shipped_at)) {
                $updateFields['shipped_at'] = now();
            }
            if ($mappedStatus === 'DELIVERED' && empty($order->delivered_at)) {
                $updateFields['delivered_at'] = now();
            }
        }

        DB::table('orders')->where('id', $order->id)->update($updateFields);

        // Record Order Status Audit History (if table exists)
        if ($mappedStatus && $order->order_status !== $mappedStatus) {
            if (\Illuminate\Support\Facades\Schema::hasTable('order_status_history')) {
                DB::table('order_status_history')->insert([
                    'order_id' => $order->id,
                    'previous_status' => $order->order_status,
                    'new_status' => $mappedStatus,
                    'comment' => "Shiprocket Webhook update: {$currentStatus}",
                    'created_at' => now(),
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Order #{$order->order_number} status updated to {$mappedStatus}",
        ], 200);
    }
}
