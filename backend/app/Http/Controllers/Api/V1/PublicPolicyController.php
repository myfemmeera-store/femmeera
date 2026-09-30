<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ShippingRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PublicPolicyController extends Controller
{
    /**
     * Get public shipping policy and active shipping charge rules.
     */
    public function getShippingPolicy(): JsonResponse
    {
        $policyVal = DB::table('settings')->where('key_name', 'shipping_policy')->value('value_content');
        $policy = $policyVal ? json_decode($policyVal, true) : null;
        $rules = ShippingRule::where('status', 'ACTIVE')->orderBy('min_order_amount', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'policy' => $policy ?: [
                    'title' => 'Femmeera Shipping & Delivery Policy',
                    'dispatch_time' => '24 - 48 Hours',
                    'free_shipping_threshold' => 0,
                    'content' => 'We deliver across India with reliable courier partners. All orders qualify for 100% FREE Delivery nationwide with no minimum order threshold.',
                ],
                'rules' => $rules,
            ],
        ]);
    }

    /**
     * Get public return & refund policy.
     */
    public function getReturnPolicy(): JsonResponse
    {
        $policyVal = DB::table('settings')->where('key_name', 'return_policy')->value('value_content');
        $policy = $policyVal ? json_decode($policyVal, true) : null;

        return response()->json([
            'success' => true,
            'data' => $policy ?: [
                'title' => 'Femmeera Return & Refund Policy',
                'return_window_days' => 7,
                'allow_returns' => true,
                'allow_exchanges' => true,
                'content' => 'Items can be returned or exchanged within 7 days of delivery. For eligible returns, Femmeera arranges free reverse courier pickup from your delivery address—customers do not need to arrange return shipping themselves. Unused condition with original tags required. Full refund within 5-7 business days after inspection with zero restocking fees.',
            ],
        ]);
    }
}
