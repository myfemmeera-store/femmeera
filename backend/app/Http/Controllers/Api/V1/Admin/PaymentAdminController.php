<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class PaymentAdminController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Paginated List of Payments for Admin Panel with Search & Filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with(['order.customer', 'refunds'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('provider')) {
            $query->where('provider', $request->input('provider'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('provider_payment_order_id', 'like', "%{$search}%")
                  ->orWhere('provider_payment_id', 'like', "%{$search}%")
                  ->orWhereHas('order', function ($oq) use ($search) {
                      $oq->where('order_number', 'like', "%{$search}%");
                  });
            });
        }

        $payments = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Payments list retrieved.',
            'data' => $payments,
        ], 200);
    }

    /**
     * Detailed Payment View for Admin Panel.
     */
    public function show(Request $request, $id): JsonResponse
    {
        $payment = Payment::with(['order.items.variant.product', 'order.customer', 'transactions', 'refunds.creator'])
            ->find($id);

        if (!$payment) {
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
     * Process Full or Partial Refund for a Payment (Admin permissions required).
     */
    public function refund(Request $request, $id): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:500',
        ]);

        $admin = $request->user();
        $payment = Payment::find($id);

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment record not found.',
            ], 404);
        }

        try {
            $refund = $this->paymentService->processRefund(
                $payment,
                (float) $request->input('amount'),
                $request->input('reason'),
                $admin
            );

            return response()->json([
                'success' => true,
                'message' => 'Refund processed successfully.',
                'data' => $refund,
            ], 200);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
