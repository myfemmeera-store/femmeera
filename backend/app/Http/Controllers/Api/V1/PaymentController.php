<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class PaymentController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Create a Razorpay Payment Order for an existing unpaid customer order.
     */
    public function createOrder(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => 'required',
        ]);

        $customer = $request->user();

        $orderParam = $request->input('order_id');
        $order = Order::where('id', $orderParam)
            ->orWhere('order_number', $orderParam)
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        try {
            $paymentOrder = $this->paymentService->createPaymentOrder($order, $customer);

            return response()->json([
                'success' => true,
                'message' => 'Payment order created successfully.',
                'data' => $paymentOrder,
            ], 200);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Verify payment signature and complete payment / confirm order.
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'razorpay_order_id' => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature' => 'required|string',
        ]);

        $customer = $request->user();

        try {
            $result = $this->paymentService->verifyPayment($request->only([
                'razorpay_order_id',
                'razorpay_payment_id',
                'razorpay_signature',
            ]), $customer);

            return response()->json($result, 200);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Fetch payment details for a specific payment ID or order.
     */
    public function show(Request $request, $id): JsonResponse
    {
        $customer = $request->user();

        $payment = Payment::with(['order', 'transactions', 'refunds'])
            ->where('id', $id)
            ->orWhere('provider_payment_order_id', $id)
            ->first();

        if (!$payment || $payment->order->customer_id !== $customer->id) {
            return response()->json([
                'success' => false,
                'message' => 'Payment record not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $payment,
        ], 200);
    }

    /**
     * Retry payment for an unpaid order.
     */
    public function retry(Request $request, $id): JsonResponse
    {
        $customer = $request->user();

        $order = Order::where('id', $id)->orWhere('order_number', $id)->first();
        if (!$order || $order->customer_id !== $customer->id) {
            return response()->json(['success' => false, 'message' => 'Order not found.'], 404);
        }

        try {
            $paymentOrder = $this->paymentService->createPaymentOrder($order, $customer);
            return response()->json([
                'success' => true,
                'message' => 'Payment retry order created.',
                'data' => $paymentOrder,
            ], 200);
        } catch (Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}
