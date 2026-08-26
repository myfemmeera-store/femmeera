<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShippingAdminController extends Controller
{
    /**
     * List all shipping rules.
     */
    public function index(): JsonResponse
    {
        $rules = ShippingRule::orderBy('min_order_amount', 'asc')->get();
        $policy = DB::table('settings')->where('key_name', 'shipping_policy')->value('value_content');

        return response()->json([
            'success' => true,
            'data' => [
                'rules' => $rules,
                'policy' => $policy ? json_decode($policy, true) : null,
            ],
        ]);
    }

    /**
     * Store new shipping rule.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'min_order_amount' => 'required|numeric|min:0',
            'max_order_amount' => 'nullable|numeric|min:0',
            'shipping_fee' => 'required|numeric|min:0',
            'estimated_days' => 'required|string|max:100',
            'status' => 'required|in:ACTIVE,INACTIVE',
        ]);

        $rule = ShippingRule::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Shipping rule created successfully.',
            'data' => $rule,
        ]);
    }

    /**
     * Update existing shipping rule.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $rule = ShippingRule::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'min_order_amount' => 'required|numeric|min:0',
            'max_order_amount' => 'nullable|numeric|min:0',
            'shipping_fee' => 'required|numeric|min:0',
            'estimated_days' => 'required|string|max:100',
            'status' => 'required|in:ACTIVE,INACTIVE',
        ]);

        $rule->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Shipping rule updated successfully.',
            'data' => $rule,
        ]);
    }

    /**
     * Delete shipping rule.
     */
    public function destroy(int $id): JsonResponse
    {
        $rule = ShippingRule::findOrFail($id);
        $rule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Shipping rule deleted successfully.',
        ]);
    }

    /**
     * Save shipping policy.
     */
    public function updatePolicy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'dispatch_time' => 'required|string|max:100',
            'free_shipping_threshold' => 'required|numeric|min:0',
            'content' => 'required|string',
        ]);

        DB::table('settings')->updateOrInsert(
            ['key_name' => 'shipping_policy'],
            [
                'group_name' => 'policy',
                'value_content' => json_encode($validated),
                'updated_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Shipping policy updated successfully.',
            'data' => $validated,
        ]);
    }
}
