<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\ShiprocketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class ShiprocketAdminController extends Controller
{
    protected ShiprocketService $shiprocketService;

    public function __construct(ShiprocketService $shiprocketService)
    {
        $this->shiprocketService = $shiprocketService;
    }

    /**
     * Ensure Shiprocket database columns exist on orders table
     */
    private function ensureOrderColumns(): void
    {
        if (!Schema::hasColumn('orders', 'shiprocket_order_id')) {
            Schema::table('orders', function ($table) {
                $table->string('shiprocket_order_id', 100)->nullable();
                $table->string('shiprocket_shipment_id', 100)->nullable();
                $table->string('shiprocket_courier_id', 100)->nullable();
                $table->string('courier_name', 100)->nullable();
                $table->string('shipment_status', 100)->nullable();
                $table->decimal('chargeable_weight', 10, 2)->nullable();
                $table->string('awb_code', 100)->nullable();
            });
        }
    }

    /**
     * Shipping Rate Calculator for Admin Dashboard
     * POST /api/v1/admin/shipping/rates/calculate
     */
    public function calculateRates(Request $request): JsonResponse
    {
        $request->validate([
            'delivery_postcode' => 'required|string|regex:/^[1-9][0-9]{5}$/',
            'pickup_postcode' => 'nullable|string',
            'weight' => 'required|numeric|min:0.01',
            'declared_value' => 'required|numeric|min:1',
            'cod' => 'nullable|boolean',
            'length' => 'nullable|numeric|min:0.1',
            'breadth' => 'nullable|numeric|min:0.1',
            'height' => 'nullable|numeric|min:0.1',
            'is_dangerous' => 'nullable|boolean',
        ]);

        $defaultPickup = DB::table('settings')->where('key_name', 'pickup_pincode')->value('value_content') ?: '570019';
        $pickupPostcode = $request->input('pickup_postcode') ?: $defaultPickup;

        $actualWeight = (float) $request->input('weight');
        $length = (float) $request->input('length', 0);
        $breadth = (float) $request->input('breadth', 0);
        $height = (float) $request->input('height', 0);

        $volumetricWeight = 0.0;
        if ($length > 0 && $breadth > 0 && $height > 0) {
            $volumetricWeight = round(($length * $breadth * $height) / 5000, 2);
        }

        $applicableWeight = max($actualWeight, $volumetricWeight);

        $result = $this->shiprocketService->calculateRates([
            'pickup_postcode' => $pickupPostcode,
            'delivery_postcode' => $request->input('delivery_postcode'),
            'weight' => $applicableWeight,
            'declared_value' => $request->input('declared_value'),
            'cod' => $request->boolean('cod'),
            'length' => $length ?: null,
            'breadth' => $breadth ?: null,
            'height' => $height ?: null,
            'is_dangerous' => $request->boolean('is_dangerous') ? 1 : 0,
        ]);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'data' => null,
            ], 422);
        }

        $calcSummary = [
            'shipment_details' => [
                'actual_weight_kg' => $actualWeight,
                'volumetric_weight_kg' => $volumetricWeight,
                'applicable_weight_kg' => $applicableWeight,
                'dimensions_cm' => [
                    'length' => $length,
                    'breadth' => $breadth,
                    'height' => $height,
                ],
                'payment_mode' => $request->boolean('cod') ? 'COD' : 'Prepaid',
                'declared_value_inr' => (float) $request->input('declared_value'),
                'is_dangerous' => $request->boolean('is_dangerous'),
            ],
            'pickup_location' => $result['data']['pickup_location'],
            'delivery_location' => $result['data']['delivery_location'],
            'available_couriers' => $result['data']['available_couriers'],
        ];

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data' => $calcSummary,
        ]);
    }

    /**
     * Create Shiprocket Shipment for an existing Femmeera Order
     * POST /api/v1/admin/orders/{id}/create-shipment
     */
    public function createShipment(Request $request, int $id): JsonResponse
    {
        $this->ensureOrderColumns();

        $order = Order::with(['items', 'user'])->find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found.'], 404);
        }

        $custom = [
            'courier_id' => $request->input('courier_id'),
            'pickup_location' => $request->input('pickup_location') ?: env('SHIPROCKET_PICKUP_LOCATION', 'Primary'),
            'weight' => $request->input('weight') ?: 0.5,
            'length' => $request->input('length') ?: 10,
            'breadth' => $request->input('breadth') ?: 10,
            'height' => $request->input('height') ?: 10,
        ];

        $res = $this->shiprocketService->createOrder($order, $custom);
        if (!$res['success']) {
            return response()->json(['success' => false, 'message' => $res['message']], 422);
        }

        $shipmentData = $res['data'];
        $srOrderId = $shipmentData['order_id'];
        $srShipmentId = $shipmentData['shipment_id'];

        $awbCode = null;
        $courierName = $request->input('courier_name') ?: 'Shiprocket Partner';

        if ($srShipmentId && !empty($custom['courier_id'])) {
            $awbRes = $this->shiprocketService->assignAwb((int) $srShipmentId, (int) $custom['courier_id']);
            if ($awbRes['success']) {
                $awbCode = $awbRes['data']['awb_code'];
                $courierName = $awbRes['data']['courier_name'] ?: $courierName;
            }
        }

        $trackingUrl = $awbCode ? "https://shiprocket.co/tracking/{$awbCode}" : null;

        $updateData = [
            'shiprocket_order_id' => (string) $srOrderId,
            'shiprocket_shipment_id' => (string) $srShipmentId,
            'shiprocket_courier_id' => (string) ($custom['courier_id'] ?? ''),
            'awb_code' => $awbCode,
            'courier_name' => $courierName,
            'carrier' => $courierName,
            'tracking_number' => $awbCode ?: (string) $srShipmentId,
            'tracking_url' => $trackingUrl,
            'shipment_status' => 'SHIPMENT_CREATED',
            'order_status' => 'SHIPPED',
            'shipped_at' => now(),
            'updated_at' => now(),
        ];

        DB::table('orders')->where('id', $order->id)->update($updateData);

        // Record Order Status History
        DB::table('order_status_history')->insert([
            'order_id' => $order->id,
            'previous_status' => $order->order_status,
            'new_status' => 'SHIPPED',
            'comment' => "Shiprocket shipment created. Shipment ID: {$srShipmentId}" . ($awbCode ? ", AWB: {$awbCode}" : ''),
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Shiprocket shipment created & AWB assigned successfully.',
            'data' => Order::with(['items', 'user'])->find($id),
        ]);
    }

    /**
     * Get Shiprocket Shipment Tracking Status
     * GET /api/v1/admin/orders/{id}/track-shipment
     */
    public function trackShipment(int $id): JsonResponse
    {
        $this->ensureOrderColumns();

        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found.'], 404);
        }

        $awbCode = $order->awb_code ?: $order->tracking_number;
        if (!$awbCode) {
            return response()->json(['success' => false, 'message' => 'No AWB code or tracking number attached to this order.'], 422);
        }

        $trackRes = $this->shiprocketService->trackByAwb($awbCode);

        // Auto-sync cancellation status if tracking response indicates shipment was cancelled in Shiprocket
        if (!empty($trackRes['success']) && !empty($trackRes['data'])) {
            $data = $trackRes['data'];
            $statusStr = strtoupper((string) ($data['current_status'] ?? $data['shipment_track'][0]['current_status'] ?? ''));
            if (str_contains(strtolower($statusStr), 'cancel') || str_contains(strtolower($statusStr), 'rto') || str_contains(strtolower($statusStr), 'reject')) {
                DB::table('orders')->where('id', $order->id)->update([
                    'shipment_status' => 'CANCELLED',
                    'order_status' => 'CANCELLED',
                    'updated_at' => now(),
                ]);
            }
        }

        return response()->json($trackRes);
    }

    /**
     * Cancel Shiprocket Shipment for an Order
     * POST /api/v1/admin/orders/{id}/cancel-shipment
     */
    public function cancelShipment(Request $request, int $id): JsonResponse
    {
        $this->ensureOrderColumns();

        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found.'], 404);
        }

        $srOrderId = $order->shiprocket_order_id;
        $awbCode = $order->awb_code ?: $order->tracking_number;

        // Call Shiprocket API to cancel order in Shiprocket account
        $orderIds = [];
        if ($srOrderId) {
            $orderIds[] = (int) $srOrderId;
        }

        $awbs = [];
        if ($awbCode) {
            $awbs[] = (string) $awbCode;
        }

        $cancelRes = $this->shiprocketService->cancelOrder($orderIds, $awbs);

        // Update Order Status in MySQL DB
        $updateData = [
            'shipment_status' => 'CANCELLED',
            'order_status' => 'CANCELLED',
            'updated_at' => now(),
        ];

        DB::table('orders')->where('id', $order->id)->update($updateData);

        // Record Audit History
        if (Schema::hasTable('order_status_history')) {
            DB::table('order_status_history')->insert([
                'order_id' => $order->id,
                'previous_status' => $order->order_status,
                'new_status' => 'CANCELLED',
                'comment' => "Shiprocket shipment cancelled by Admin. SR Order ID: {$srOrderId}, AWB: {$awbCode}",
                'created_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Shiprocket shipment cancelled successfully and updated in your Shiprocket account.',
            'data' => Order::with(['items', 'user'])->find($id),
        ]);
    }

    /**
     * Test & Diagnostics for Shiprocket Connection
     * GET /api/v1/admin/shipping/shiprocket-test
     */
    public function testConnection(): JsonResponse
    {
        $token = $this->shiprocketService->getToken();
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to authenticate with Shiprocket API. Check SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in .env',
                'pickup_locations' => [],
            ], 422);
        }

        $pickupLocations = $this->shiprocketService->getPickupLocations();

        return response()->json([
            'success' => true,
            'message' => 'Successfully connected to Shiprocket API!',
            'data' => [
                'connection_status' => 'CONNECTED',
                'token_present' => true,
                'pickup_locations' => $pickupLocations,
                'default_pickup_location' => $pickupLocations[0] ?? 'Primary',
            ],
        ]);
    }
}
