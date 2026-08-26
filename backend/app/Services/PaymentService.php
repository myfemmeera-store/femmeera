<?php

namespace App\Services;

use App\Contracts\PaymentGatewayInterface;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentTransaction;
use App\Models\Refund;
use App\Models\User;
use App\Services\Gateways\RazorpayPaymentGateway;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class PaymentService
{
    protected PaymentGatewayInterface $gateway;

    public function __construct(PaymentGatewayInterface $gateway = null)
    {
        $this->gateway = $gateway ?? new RazorpayPaymentGateway();
    }

    /**
     * Create a payment order for an existing unpaid customer order.
     */
    public function createPaymentOrder(Order $order, User $customer): array
    {
        // 1. Verify customer ownership
        $orderCustomerId = (int) ($order->user_id ?? $order->customer_id);
        if ($orderCustomerId !== (int) $customer->id) {
            throw new RuntimeException('Unauthorized: This order does not belong to your customer account.');
        }

        // 2. Verify order is in payable state
        $orderStatus = (string) ($order->order_status ?? $order->status ?? 'PENDING');
        if (!in_array($orderStatus, ['PENDING', 'PAYMENT_PENDING'])) {
            throw new RuntimeException("Order is not in a payable status (current status: {$orderStatus}).");
        }

        if ($order->payment_status === 'PAID') {
            throw new RuntimeException('This order has already been paid for.');
        }

        // 3. Retrieve authoritative order total from database (NEVER TRUST BROWSER AMOUNT!)
        $amount = (float) $order->total_amount;

        return DB::transaction(function () use ($order, $amount) {
            // 4. Create provider payment order
            $providerOrderData = $this->gateway->createPaymentOrder($order);

            // 5. Find or create internal Payment record
            $payment = Payment::firstOrCreate(
                [
                    'order_id' => $order->id,
                    'provider' => 'RAZORPAY',
                    'status' => 'PENDING',
                ],
                [
                    'provider_payment_order_id' => $providerOrderData['provider_payment_order_id'],
                    'amount' => $amount,
                    'currency' => $order->currency ?? 'INR',
                    'method' => 'RAZORPAY_CHECKOUT',
                ]
            );

            // Update provider payment order ID if retry/new attempt
            if ($payment->provider_payment_order_id !== $providerOrderData['provider_payment_order_id']) {
                $payment->update([
                    'provider_payment_order_id' => $providerOrderData['provider_payment_order_id'],
                    'status' => 'PENDING',
                ]);
            }

            // 6. Record Payment Transaction History
            PaymentTransaction::create([
                'payment_id' => $payment->id,
                'type' => 'PAYMENT_CREATED',
                'transaction_type' => 'PAYMENT_CREATED',
                'provider_reference' => $providerOrderData['provider_payment_order_id'],
                'amount' => $amount,
                'status' => 'PENDING',
                'metadata' => [
                    'order_number' => $order->order_number,
                    'amount_paise' => $providerOrderData['amount_paise'] ?? null,
                ],
            ]);

            return [
                'payment_id' => $payment->id,
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'amount' => $amount,
                'currency' => $payment->currency,
                'provider' => 'RAZORPAY',
                'provider_payment_order_id' => $providerOrderData['provider_payment_order_id'],
                'key_id' => $providerOrderData['key_id'] ?? env('RAZORPAY_KEY_ID'),
            ];
        });
    }

    /**
     * Verify payment signature and process state transition idempotently.
     */
    public function verifyPayment(array $payload, User $customer): array
    {
        $razorpayOrderId = $payload['razorpay_order_id'] ?? '';
        $razorpayPaymentId = $payload['razorpay_payment_id'] ?? '';
        $razorpaySignature = $payload['razorpay_signature'] ?? '';

        // 1. Locate internal payment record
        $payment = Payment::where('provider_payment_order_id', $razorpayOrderId)->first();

        if (!$payment) {
            throw new RuntimeException('Payment record not found for provider order ID: ' . $razorpayOrderId);
        }

        $order = $payment->order;
        $orderCustomerId = (int) ($order->user_id ?? $order->customer_id ?? 0);
        if (!$order || $orderCustomerId !== (int) $customer->id) {
            throw new RuntimeException('Unauthorized payment verification attempt.');
        }

        // 2. IDEMPOTENCY CHECK: If already paid, return success immediately
        $currentOrderStatus = (string) ($order->order_status ?? $order->status ?? '');
        if ($payment->status === 'PAID' && $currentOrderStatus === 'CONFIRMED') {
            return [
                'success' => true,
                'message' => 'Payment already verified and order confirmed.',
                'payment' => $payment,
                'order' => $order,
            ];
        }

        // 3. Perform server-authoritative HMAC signature verification
        $isValidSignature = $this->gateway->verifyPayment($payload);

        if (!$isValidSignature) {
            PaymentTransaction::create([
                'payment_id' => $payment->id,
                'type' => 'PAYMENT_FAILED',
                'transaction_type' => 'PAYMENT_FAILED',
                'provider_reference' => $razorpayPaymentId,
                'amount' => $payment->amount,
                'status' => 'FAILED',
                'metadata' => [
                    'reason' => 'Invalid Razorpay Signature',
                    'payload' => $payload,
                ],
            ]);

            $payment->update([
                'status' => 'FAILED',
                'failure_reason' => 'Signature verification failed',
            ]);

            throw new RuntimeException('Payment verification failed: Invalid provider signature.');
        }

        // 4. Atomic Transactional Order & Payment State Update
        return DB::transaction(function () use ($payment, $order, $razorpayPaymentId, $razorpaySignature, $payload) {
            // Update Payment Record
            $payment->update([
                'status' => 'PAID',
                'provider_payment_id' => $razorpayPaymentId,
                'provider_signature' => $razorpaySignature,
                'paid_at' => now(),
            ]);

            // Update Order Record: Order transitions from PENDING -> CONFIRMED
            $order->update([
                'order_status' => 'CONFIRMED',
                'payment_status' => 'PAID',
            ]);

            // Record Payment Transaction History
            PaymentTransaction::create([
                'payment_id' => $payment->id,
                'type' => 'PAYMENT_CAPTURED',
                'transaction_type' => 'PAYMENT_CAPTURED',
                'provider_reference' => $razorpayPaymentId,
                'amount' => $payment->amount,
                'status' => 'PAID',
                'metadata' => [
                    'payload' => $payload,
                    'order_number' => $order->order_number,
                ],
            ]);

            $freshOrder = $order->fresh();
            $orderData = $freshOrder->toArray();

            // Queue Transactional Emails asynchronously ONLY AFTER payment signature verification
            try {
                $customerEmail = $order->shipping_address['email'] ?? $customer->email ?? '';
                $customerName = $order->shipping_address['name'] ?? $customer->name ?? '';

                if (!empty($customerEmail)) {
                    // 1. Order Confirmation Email
                    \App\Jobs\SendEmailNotificationJob::dispatch(
                        'order_confirmation',
                        $customerEmail,
                        $customerName,
                        ['order' => $orderData, 'customer_name' => $customerName]
                    );

                    // 2. Payment Confirmation Email
                    \App\Jobs\SendEmailNotificationJob::dispatch(
                        'payment_confirmation',
                        $customerEmail,
                        $customerName,
                        ['order' => $orderData, 'transaction_id' => $razorpayPaymentId]
                    );
                }

                // 3. Admin Alert: New Order Placed
                $adminEmail = env('ADMIN_NOTIFICATION_EMAIL', env('MAIL_FROM_ADDRESS', 'admin@femmeera.com'));
                \App\Jobs\SendEmailNotificationJob::dispatch(
                    'admin_new_order',
                    $adminEmail,
                    'Admin Concierge',
                    ['order' => $orderData]
                );
            } catch (\Throwable $ex) {
                Log::warning("PaymentService: Failed to queue order confirmation emails: " . $ex->getMessage());
            }

            return [
                'success' => true,
                'message' => 'Payment verified successfully. Order confirmed!',
                'payment' => $payment->fresh(),
                'order' => $freshOrder,
            ];
        });
    }

    /**
     * Handle Razorpay Webhook Events Idempotently with Signature Verification.
     */
    public function handleWebhook(array $payload, string $signature, string $rawBody): array
    {
        // 1. Verify HMAC Webhook Signature
        if ($this->gateway instanceof RazorpayPaymentGateway) {
            if (!$this->gateway->verifyWebhookSignature($rawBody, $signature)) {
                Log::warning('Razorpay Webhook Invalid Signature Received');
                throw new RuntimeException('Invalid webhook signature');
            }
        }

        $event = $payload['event'] ?? '';
        $entity = $payload['payload']['payment']['entity'] ?? ($payload['payload']['refund']['entity'] ?? []);

        $razorpayOrderId = $entity['order_id'] ?? null;
        $razorpayPaymentId = $entity['id'] ?? null;

        Log::info("Processing Razorpay Webhook Event: {$event} for Order ID: {$razorpayOrderId}");

        if (!$razorpayOrderId) {
            return ['status' => 'ignored', 'reason' => 'No order_id in webhook entity'];
        }

        $payment = Payment::where('provider_payment_order_id', $razorpayOrderId)->first();

        if (!$payment) {
            return ['status' => 'ignored', 'reason' => 'Matching payment record not found'];
        }

        return DB::transaction(function () use ($payment, $event, $entity, $razorpayPaymentId, $payload) {
            // Log Webhook Received Transaction
            PaymentTransaction::create([
                'payment_id' => $payment->id,
                'type' => 'WEBHOOK_RECEIVED',
                'transaction_type' => 'WEBHOOK_RECEIVED',
                'provider_reference' => $razorpayPaymentId,
                'amount' => isset($entity['amount']) ? ((float) $entity['amount'] / 100) : $payment->amount,
                'status' => $event,
                'metadata' => ['event' => $event],
            ]);

            if ($event === 'payment.captured' || $event === 'payment.authorized') {
                if ($payment->status !== 'PAID') {
                    $payment->update([
                        'status' => 'PAID',
                        'provider_payment_id' => $razorpayPaymentId,
                        'paid_at' => now(),
                    ]);

                    $payment->order->update([
                        'order_status' => 'CONFIRMED',
                        'payment_status' => 'PAID',
                    ]);
                }
            } elseif ($event === 'payment.failed') {
                if ($payment->status !== 'PAID') {
                    $payment->update([
                        'status' => 'FAILED',
                        'failure_reason' => $entity['error_description'] ?? 'Payment failed at gateway',
                    ]);
                }
            } elseif ($event === 'refund.processed') {
                $payment->update(['status' => 'REFUNDED']);
                $payment->order->update([
                    'order_status' => 'CANCELLED',
                    'payment_status' => 'REFUNDED',
                ]);
            }

            return ['status' => 'processed', 'event' => $event, 'payment_id' => $payment->id];
        });
    }

    /**
     * Process full or partial refund for a paid order (Admin only).
     */
    public function processRefund(Payment $payment, float $amount, string $reason, User $admin): Refund
    {
        if ($payment->status !== 'PAID' && $payment->status !== 'PARTIALLY_REFUNDED') {
            throw new RuntimeException('Only paid payments can be refunded.');
        }

        // Validate refund amount limit (cannot exceed total paid amount)
        $alreadyRefunded = Refund::where('payment_id', $payment->id)
            ->where('status', 'COMPLETED')
            ->sum('amount');

        $remainingCap = $payment->amount - $alreadyRefunded;

        if ($amount <= 0 || $amount > $remainingCap) {
            throw new RuntimeException("Invalid refund amount. Maximum refundable amount is ₹{$remainingCap}.");
        }

        return DB::transaction(function () use ($payment, $amount, $reason, $admin, $alreadyRefunded) {
            // Call gateway refund
            $refundResult = $this->gateway->refundPayment($payment, $amount, $reason);

            if (!($refundResult['success'] ?? false)) {
                throw new RuntimeException($refundResult['message'] ?? 'Gateway refund execution failed.');
            }

            $refund = Refund::create([
                'payment_id' => $payment->id,
                'order_id' => $payment->order_id,
                'amount' => $amount,
                'reason' => $reason,
                'status' => 'COMPLETED',
                'provider_refund_id' => $refundResult['provider_refund_id'] ?? null,
                'created_by' => $admin->id,
            ]);

            $totalRefunded = $alreadyRefunded + $amount;
            $newStatus = ($totalRefunded >= $payment->amount) ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

            $payment->update(['status' => $newStatus]);
            $payment->order->update([
                'payment_status' => $newStatus,
                'order_status' => ($newStatus === 'REFUNDED') ? 'CANCELLED' : $payment->order->order_status,
            ]);

            PaymentTransaction::create([
                'payment_id' => $payment->id,
                'type' => 'REFUND_COMPLETED',
                'transaction_type' => 'REFUND_COMPLETED',
                'provider_reference' => $refund->provider_refund_id,
                'amount' => $amount,
                'status' => 'COMPLETED',
                'metadata' => [
                    'refund_id' => $refund->id,
                    'reason' => $reason,
                    'admin_id' => $admin->id,
                ],
            ]);

            return $refund;
        });
    }
}
