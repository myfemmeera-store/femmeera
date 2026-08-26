<?php

namespace App\Contracts;

use App\Models\Order;
use App\Models\Payment;

interface PaymentGatewayInterface
{
    /**
     * Create a payment order with the provider.
     */
    public function createPaymentOrder(Order $order): array;

    /**
     * Verify payment signature/response from provider.
     */
    public function verifyPayment(array $payload): bool;

    /**
     * Capture an authorized payment.
     */
    public function capturePayment(Payment $payment, float $amount): bool;

    /**
     * Refund a paid transaction (full or partial).
     */
    public function refundPayment(Payment $payment, float $amount, string $reason): array;

    /**
     * Fetch status of a payment directly from provider API.
     */
    public function getPaymentStatus(string $providerPaymentId): string;
}
