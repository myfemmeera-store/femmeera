<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class OrderStatusService
{
    /**
     * Define allowed state transition map for order lifecycle.
     */
    protected array $allowedTransitions = [
        'PENDING' => ['CONFIRMED', 'CANCELLED'],
        'CONFIRMED' => ['PROCESSING', 'CANCELLED'],
        'PROCESSING' => ['PACKED', 'CANCELLED'],
        'PACKED' => ['SHIPPED', 'CANCELLED'],
        'SHIPPED' => ['OUT_FOR_DELIVERY', 'CANCELLED'],
        'OUT_FOR_DELIVERY' => ['DELIVERED', 'CANCELLED'],
        'DELIVERED' => ['RETURN_REQUESTED'],
        'RETURN_REQUESTED' => ['RETURNED', 'DELIVERED'],
        'RETURNED' => ['REFUNDED'],
        'CANCELLED' => [],
        'REFUNDED' => [],
    ];

    /**
     * Transition order to new status if valid.
     */
    public function transition(Order $order, string $newStatus, ?string $comment = null, ?int $changedBy = null): Order
    {
        $currentStatus = $order->order_status;

        if ($currentStatus === $newStatus) {
            return $order;
        }

        $allowed = $this->allowedTransitions[$currentStatus] ?? [];

        if (!in_array($newStatus, $allowed, true)) {
            throw new HttpException(
                400,
                "Invalid status transition from {$currentStatus} to {$newStatus}. Allowed transitions: " . implode(', ', $allowed)
            );
        }

        return DB::transaction(function () use ($order, $currentStatus, $newStatus, $comment, $changedBy) {
            $order->order_status = $newStatus;

            // Automatically set timestamp if status becomes SHIPPED or DELIVERED
            if ($newStatus === 'SHIPPED' && !$order->shipped_at) {
                $order->shipped_at = now();
            }
            if ($newStatus === 'DELIVERED' && !$order->delivered_at) {
                $order->delivered_at = now();
            }

            $order->save();

            // Record Order Status History log
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'previous_status' => $currentStatus,
                'new_status' => $newStatus,
                'comment' => $comment ?: "Status transitioned from {$currentStatus} to {$newStatus}.",
                'changed_by' => $changedBy,
                'created_at' => now(),
            ]);

            // Record Audit Log if changed by Admin
            if ($changedBy) {
                AuditLogService::log(
                    'ORDER_STATUS_CHANGED',
                    $changedBy,
                    'Order',
                    (string)$order->id,
                    ['order_status' => $currentStatus],
                    ['order_status' => $newStatus, 'comment' => $comment]
                );
            }

            // Dispatch Order Status Change Email Notifications
            try {
                $orderData = $order->fresh()->load('items')->toArray();
                $customerEmail = $order->shipping_address['email'] ?? $order->user->email ?? '';
                $customerName = $order->shipping_address['name'] ?? $order->user->name ?? '';

                if (!empty($customerEmail)) {
                    if ($newStatus === 'PROCESSING') {
                        \App\Jobs\SendEmailNotificationJob::dispatch('order_processing', $customerEmail, $customerName, ['order' => $orderData]);
                    } elseif ($newStatus === 'SHIPPED') {
                        \App\Jobs\SendEmailNotificationJob::dispatch('order_shipped', $customerEmail, $customerName, ['order' => $orderData]);
                    } elseif ($newStatus === 'DELIVERED') {
                        \App\Jobs\SendEmailNotificationJob::dispatch('order_delivered', $customerEmail, $customerName, ['order' => $orderData]);
                    }
                }
            } catch (\Throwable $ex) {
                \Illuminate\Support\Facades\Log::warning("OrderStatusService: Failed to dispatch status email: " . $ex->getMessage());
            }

            return $order->load(['items', 'statusHistory']);
        });
    }

    /**
     * Get valid next statuses for a given current order status.
     */
    public function getValidNextStatuses(string $currentStatus): array
    {
        return $this->allowedTransitions[$currentStatus] ?? [];
    }
}
