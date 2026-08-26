<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\TaxRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $rules = TaxRule::orderBy('id', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $rules,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'rate_percentage' => 'required|numeric|min:0|max:100',
            'is_inclusive' => 'nullable|boolean',
            'status' => 'required|in:ACTIVE,INACTIVE',
        ]);

        if ($request->input('status') === 'ACTIVE') {
            TaxRule::query()->update(['status' => 'INACTIVE']);
        }

        $rule = TaxRule::create([
            'name' => $request->input('name'),
            'rate_percentage' => $request->input('rate_percentage'),
            'is_inclusive' => $request->input('is_inclusive', false),
            'status' => $request->input('status', 'ACTIVE'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tax rule created successfully.',
            'data' => $rule,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $rule = TaxRule::findOrFail($id);

        $request->validate([
            'name' => 'nullable|string|max:100',
            'rate_percentage' => 'nullable|numeric|min:0|max:100',
            'is_inclusive' => 'nullable|boolean',
            'status' => 'nullable|in:ACTIVE,INACTIVE',
        ]);

        if ($request->input('status') === 'ACTIVE') {
            TaxRule::where('id', '!=', $id)->update(['status' => 'INACTIVE']);
        }

        $rule->update(array_filter($request->only([
            'name', 'rate_percentage', 'is_inclusive', 'status'
        ]), fn($v) => !is_null($v)));

        return response()->json([
            'success' => true,
            'message' => 'Tax rule updated successfully.',
            'data' => $rule->fresh(),
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $rule = TaxRule::findOrFail($id);
        $rule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tax rule deleted.',
        ], 200);
    }
}
