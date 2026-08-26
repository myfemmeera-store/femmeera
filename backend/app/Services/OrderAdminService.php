<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class OrderAdminService
{
    protected InventoryService $inventoryService;
    protected OrderStatusService $orderStatusService;

    public function __construct(InventoryService $inventoryService, OrderStatusService $orderStatusService)
    {
        $this->inventoryService = $inventoryService;
        $this->orderStatusService = $orderStatusService;
    }

    /**
     * Get paginated orders list with search and filters for Admin.
     */
    public function getOrders(
        int $perPage = 15,
        ?string $search = null,
        ?string $status = null,
        ?string $paymentStatus = null
    ): LengthAwarePaginator {
        $query = Order::with(['user', 'items']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'LIKE', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'LIKE', "%{$search}%")
                        ->orWhere('email', 'LIKE', "%{$search}%");
                  });
            });
        }

        if ($status) {
            $query->where('order_status', $status);
        }

        if ($paymentStatus) {
            $query->where('payment_status', $paymentStatus);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Get order details by ID.
     */
    public function getOrderDetails(int $orderId): Order
    {
        return Order::with(['user', 'items.variant.product', 'statusHistory.changer', 'latestPayment'])
            ->findOrFail($orderId);
    }

    /**
     * Update order status with validation.
     */
    public function updateOrderStatus(int $orderId, string $newStatus, ?string $comment = null, ?int $adminId = null): Order
    {
        $order = Order::findOrFail($orderId);
        return $this->orderStatusService->transition($order, $newStatus, $comment, $adminId);
    }

    /**
     * Cancel order and release reserved stock.
     */
    public function cancelOrder(int $orderId, string $reason, ?int $adminId = null): Order
    {
        return DB::transaction(function () use ($orderId, $reason, $adminId) {
            $order = Order::with('items')->where('id', $orderId)->lockForUpdate()->firstOrFail();

            if ($order->order_status === 'CANCELLED') {
                throw new HttpException(400, 'Order is already cancelled.');
            }

            if (in_array($order->order_status, ['DELIVERED', 'RETURNED', 'REFUNDED'], true)) {
                throw new HttpException(400, "Cannot cancel order in {$order->order_status} status.");
            }

            $oldStatus = $order->order_status;
            $order->order_status = 'CANCELLED';
            $order->save();

            // Release reserved inventory for each order item
            foreach ($order->items as $item) {
                $this->inventoryService->releaseStock($item->variant_id, $item->quantity, $order->order_number);
            }

            // Record Order Status History
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'previous_status' => $oldStatus,
                'new_status' => 'CANCELLED',
                'comment' => "Order cancelled. Reason: {$reason}",
                'changed_by' => $adminId,
                'created_at' => now(),
            ]);

            // Record Audit Log
            AuditLogService::log(
                'ORDER_CANCELLED',
                $adminId,
                'Order',
                (string)$order->id,
                ['order_status' => $oldStatus],
                ['order_status' => 'CANCELLED', 'reason' => $reason]
            );

            return $order->load(['items', 'statusHistory']);
        });
    }

    /**
     * Update shipping and tracking details.
     */
    public function updateTracking(
        int $orderId,
        string $carrier,
        string $trackingNumber,
        ?string $trackingUrl = null,
        ?int $adminId = null
    ): Order {
        return DB::transaction(function () use ($orderId, $carrier, $trackingNumber, $trackingUrl, $adminId) {
            $order = Order::findOrFail($orderId);

            $order->carrier = $carrier;
            $order->tracking_number = $trackingNumber;
            $order->tracking_url = $trackingUrl;

            if ($order->order_status === 'CONFIRMED' || $order->order_status === 'PROCESSING' || $order->order_status === 'PACKED') {
                $order->order_status = 'SHIPPED';
                $order->shipped_at = now();
            }

            $order->save();

            AuditLogService::log(
                'ORDER_TRACKING_UPDATED',
                $adminId,
                'Order',
                (string)$order->id,
                null,
                ['carrier' => $carrier, 'tracking_number' => $trackingNumber]
            );

            return $order->load(['items', 'statusHistory']);
        });
    }
}
