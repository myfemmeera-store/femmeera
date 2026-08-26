<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CustomerAddress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerAddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $addresses = CustomerAddress::where('customer_id', $user->id)
            ->orderBy('is_default', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $addresses,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'type' => 'required|in:SHIPPING,BILLING',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'landmark' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'postal_code' => 'required|string|regex:/^[1-9][0-9]{5}$/',
            'country' => 'nullable|string|max:100',
            'is_default' => 'nullable|boolean',
        ]);

        $isDefault = (bool) $request->input('is_default', false);

        // If this is set as default, reset other default addresses for user
        if ($isDefault) {
            CustomerAddress::where('customer_id', $user->id)->update(['is_default' => false]);
        }

        // If first address for user, automatically set as default
        $count = CustomerAddress::where('customer_id', $user->id)->count();
        if ($count === 0) {
            $isDefault = true;
        }

        $address = CustomerAddress::create([
            'customer_id' => $user->id,
            'type' => $request->input('type'),
            'name' => $request->input('name'),
            'phone' => $request->input('phone'),
            'address_line_1' => $request->input('address_line_1'),
            'address_line_2' => $request->input('address_line_2'),
            'landmark' => $request->input('landmark'),
            'city' => $request->input('city'),
            'state' => $request->input('state'),
            'postal_code' => $request->input('postal_code'),
            'country' => $request->input('country', 'India'),
            'is_default' => $isDefault,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Address added successfully.',
            'data' => $address,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $address = CustomerAddress::where('customer_id', $user->id)->where('id', $id)->firstOrFail();

        $request->validate([
            'type' => 'nullable|in:SHIPPING,BILLING',
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'landmark' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|regex:/^[1-9][0-9]{5}$/',
            'country' => 'nullable|string|max:100',
            'is_default' => 'nullable|boolean',
        ]);

        if ($request->has('is_default') && $request->input('is_default')) {
            CustomerAddress::where('customer_id', $user->id)->update(['is_default' => false]);
        }

        $address->update($request->only([
            'type', 'name', 'phone', 'address_line_1', 'address_line_2',
            'landmark', 'city', 'state', 'postal_code', 'country', 'is_default'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Address updated successfully.',
            'data' => $address->fresh(),
        ], 200);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $address = CustomerAddress::where('customer_id', $user->id)->where('id', $id)->firstOrFail();
        $address->delete();

        return response()->json([
            'success' => true,
            'message' => 'Address deleted successfully.',
        ], 200);
    }

    public function setDefault(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $address = CustomerAddress::where('customer_id', $user->id)->where('id', $id)->firstOrFail();

        CustomerAddress::where('customer_id', $user->id)->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Default address set.',
            'data' => $address->fresh(),
        ], 200);
    }
}
