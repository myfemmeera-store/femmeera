<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class PaymentWebhookController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Handle incoming Razorpay Webhook Callbacks.
     */
    public function handleRazorpay(Request $request): JsonResponse
    {
        $signature = $request->header('X-Razorpay-Signature') ?? '';
        $rawBody = $request->getContent();
        $payload = $request->all();

        try {
            $result = $this->paymentService->handleWebhook($payload, $signature, $rawBody);

            return response()->json([
                'success' => true,
                'result' => $result,
            ], 200);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
