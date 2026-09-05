<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ShiprocketService
{
    protected string $baseUrl = 'https://apiv2.shiprocket.in/v1/external';

    /**
     * Get valid Shiprocket Bearer Auth Token (cached for 24 hours)
     */
    public function getToken(): ?string
    {
        return Cache::remember('shiprocket_auth_token', 86400, function () {
            $email = env('SHIPROCKET_EMAIL');
            $password = env('SHIPROCKET_PASSWORD');

            if (empty($email) || empty($password)) {
                Log::warning('ShiprocketService: Missing SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD in .env');
                return null;
            }

            try {
                $response = Http::post("{$this->baseUrl}/auth/login", [
                    'email' => $email,
                    'password' => $password,
                ]);

                if ($response->successful() && !empty($response->json('token'))) {
                    return $response->json('token');
                }

                Log::error('ShiprocketService Authentication failed: ' . $response->body());
                return null;
            } catch (\Throwable $e) {
                Log::error('ShiprocketService Auth Exception: ' . $e->getMessage());
                return null;
            }
        });
    }

    /**
     * Clear cached auth token (used if 401 unauthorized occurs)
     */
    public function clearTokenCache(): void
    {
        Cache::forget('shiprocket_auth_token');
    }

    /**
     * Calculate courier rates and serviceability from Shiprocket API
     */
    public function calculateRates(array $params): array
    {
        $token = $this->getToken();
        if (!$token) {
            return [
                'success' => false,
                'message' => 'Unable to authenticate with Shiprocket. Please check API credentials in .env file.',
                'available_couriers' => [],
            ];
        }

        $queryParams = [
            'pickup_postcode' => $params['pickup_postcode'] ?? '570019',
            'delivery_postcode' => $params['delivery_postcode'],
            'weight' => (float) ($params['weight'] ?? 0.5),
            'cod' => (!empty($params['cod']) && $params['cod'] !== '0' && $params['cod'] !== false) ? 1 : 0,
            'declared_value' => (float) ($params['declared_value'] ?? 1000),
        ];

        if (!empty($params['length'])) $queryParams['length'] = (float) $params['length'];
        if (!empty($params['breadth'])) $queryParams['breadth'] = (float) $params['breadth'];
        if (!empty($params['height'])) $queryParams['height'] = (float) $params['height'];
        if (isset($params['is_dangerous'])) $queryParams['is_dangerous'] = (int) $params['is_dangerous'];

        try {
            $response = Http::withToken($token)
                ->get("{$this->baseUrl}/courier/serviceability/", $queryParams);

            if ($response->status() === 401) {
                $this->clearTokenCache();
                $token = $this->getToken();
                if ($token) {
                    $response = Http::withToken($token)->get("{$this->baseUrl}/courier/serviceability/", $queryParams);
                }
            }

            if (!$response->successful()) {
                $errJson = $response->json();
                $msg = $errJson['message'] ?? 'Shiprocket serviceability query failed.';
                return [
                    'success' => false,
                    'message' => $msg,
                    'available_couriers' => [],
                ];
            }

            $data = $response->json();
            $courierData = $data['data']['available_courier_companies'] ?? [];

            $normalizedCouriers = [];
            foreach ($courierData as $c) {
                $rate = (float) ($c['rate'] ?? $c['freight_charge'] ?? 0);
                $codCharge = (float) ($c['cod_charges'] ?? 0);

                $normalizedCouriers[] = [
                    'courier_company_id' => $c['courier_company_id'] ?? $c['id'] ?? null,
                    'courier_name' => $c['courier_name'] ?? 'Courier Partner',
                    'courier_rating' => (float) ($c['rating'] ?? 4.5),
                    'estimated_delivery_date' => $c['etd'] ?? $c['estimated_delivery_days'] ?? '3-5 Days',
                    'estimated_days' => $c['estimated_delivery_days'] ?? $c['etd'] ?? '3-5 Days',
                    'chargeable_weight' => (float) ($c['chargeable_weight'] ?? $queryParams['weight']),
                    'freight_charge' => $rate,
                    'cod_charge' => $codCharge,
                    'total_shipping_charge' => $rate + ($queryParams['cod'] ? $codCharge : 0),
                    'payment_mode' => $queryParams['cod'] ? 'COD' : 'Prepaid',
                    'courier_type' => (!empty($c['mode']) && $c['mode'] == 1) ? 'Surface' : 'Air',
                    'serviceability_status' => true,
                    'recommendation_score' => (float) ($c['score'] ?? 0),
                ];
            }

            return [
                'success' => true,
                'message' => count($normalizedCouriers) . ' courier options retrieved.',
                'data' => [
                    'pickup_location' => [
                        'pincode' => $queryParams['pickup_postcode'],
                        'city' => $data['data']['pickup_city'] ?? 'Warehouse',
                        'state' => $data['data']['pickup_state'] ?? 'India',
                    ],
                    'delivery_location' => [
                        'pincode' => $queryParams['delivery_postcode'],
                        'city' => $data['data']['delivery_city'] ?? '',
                        'state' => $data['data']['delivery_state'] ?? '',
                    ],
                    'available_couriers' => $normalizedCouriers,
                ],
            ];
        } catch (\Throwable $e) {
            Log::error('ShiprocketService calculateRates Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error querying Shiprocket rates: ' . $e->getMessage(),
                'available_couriers' => [],
            ];
        }
    }

    /**
     * Create Adhoc Order in Shiprocket
     */
    public function createOrder(Order $order, array $custom = []): array
    {
        $token = $this->getToken();
        if (!$token) {
            return ['success' => false, 'message' => 'Shiprocket authentication failed.'];
        }

        $address = $order->shipping_address_snapshot ?? [];
        $items = $order->items ?? [];

        $orderItems = [];
        foreach ($items as $item) {
            $orderItems[] = [
                'name' => substr($item->product_name_snapshot ?? 'Item', 0, 50),
                'sku' => $item->sku_snapshot ?? 'SKU-1',
                'units' => (int) $item->quantity,
                'selling_price' => (float) $item->unit_price,
                'discount' => (float) ($item->discount_amount ?? 0),
            ];
        }

        $nameParts = explode(' ', trim($address['name'] ?? 'Customer'), 2);
        $firstName = $nameParts[0] ?? 'Customer';
        $lastName = $nameParts[1] ?? 'User';

        $payload = [
            'order_id' => $order->order_number,
            'order_date' => $order->created_at ? $order->created_at->format('Y-m-d H:i') : now()->format('Y-m-d H:i'),
            'pickup_location' => $custom['pickup_location'] ?? env('SHIPROCKET_PICKUP_LOCATION', 'Primary'),
            'billing_customer_name' => $firstName,
            'billing_last_name' => $lastName,
            'billing_address' => substr($address['address'] ?? 'Address', 0, 100),
            'billing_city' => $address['city'] ?? 'City',
            'billing_pincode' => $address['pincode'] ?? '560001',
            'billing_state' => $address['state'] ?? 'State',
            'billing_country' => 'India',
            'billing_email' => $order->user->email ?? 'customer@femmeera.com',
            'billing_phone' => $address['phone'] ?? '9876543210',
            'shipping_is_billing' => true,
            'order_items' => $orderItems,
            'payment_method' => ($order->payment_status === 'PAID') ? 'Prepaid' : 'COD',
            'shipping_charges' => (float) $order->shipping_amount,
            'sub_total' => (float) $order->subtotal,
            'length' => (float) ($custom['length'] ?? 10),
            'breadth' => (float) ($custom['breadth'] ?? 10),
            'height' => (float) ($custom['height'] ?? 10),
            'weight' => (float) ($custom['weight'] ?? 0.5),
        ];

        try {
            $response = Http::withToken($token)->post("{$this->baseUrl}/orders/create/adhoc", $payload);

            if ($response->status() === 401) {
                $this->clearTokenCache();
                $token = $this->getToken();
                if ($token) {
                    $response = Http::withToken($token)->post("{$this->baseUrl}/orders/create/adhoc", $payload);
                }
            }

            if (!$response->successful()) {
                Log::error('Shiprocket Create Order Failed: ' . $response->body());
                return ['success' => false, 'message' => 'Shiprocket order creation failed: ' . ($response->json('message') ?: $response->body())];
            }

            $resData = $response->json();
            return [
                'success' => true,
                'message' => 'Shiprocket order created successfully.',
                'data' => [
                    'order_id' => $resData['order_id'] ?? null,
                    'shipment_id' => $resData['shipment_id'] ?? null,
                    'status' => $resData['status'] ?? 'NEW',
                    'raw' => $resData,
                ],
            ];
        } catch (\Throwable $e) {
            Log::error('Shiprocket createOrder Exception: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Assign AWB Code & Courier Partner to Shipment
     */
    public function assignAwb(int $shipmentId, ?int $courierId = null): array
    {
        $token = $this->getToken();
        if (!$token) return ['success' => false, 'message' => 'Authentication failed.'];

        $payload = ['shipment_id' => $shipmentId];
        if ($courierId) {
            $payload['courier_id'] = $courierId;
        }

        try {
            $response = Http::withToken($token)->post("{$this->baseUrl}/courier/assign/awb", $payload);
            if (!$response->successful()) {
                return ['success' => false, 'message' => $response->json('message') ?: 'AWB assignment failed.'];
            }

            $resData = $response->json();
            $awbCode = $resData['response']['data']['awb_code'] ?? null;

            return [
                'success' => true,
                'message' => 'AWB assigned successfully.',
                'data' => [
                    'awb_code' => $awbCode,
                    'courier_name' => $resData['response']['data']['courier_name'] ?? 'Shiprocket Express',
                    'shipment_id' => $shipmentId,
                    'tracking_url' => $awbCode ? "https://shiprocket.co/tracking/{$awbCode}" : null,
                ],
            ];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Track shipment by AWB Code
     */
    public function trackByAwb(string $awbCode): array
    {
        $token = $this->getToken();
        if (!$token) return ['success' => false, 'message' => 'Authentication failed.'];

        try {
            $response = Http::withToken($token)->get("{$this->baseUrl}/courier/track/awb/{$awbCode}");
            if (!$response->successful()) {
                return ['success' => false, 'message' => 'Tracking query failed.'];
            }

            return [
                'success' => true,
                'data' => $response->json()['tracking_data'] ?? $response->json(),
            ];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Cancel Order / Shipment in Shiprocket Account
     */
    public function cancelOrder(array $orderIds = [], array $awbs = []): array
    {
        $token = $this->getToken();
        if (!$token) return ['success' => false, 'message' => 'Authentication with Shiprocket failed.'];

        try {
            $results = [];

            // 1. Cancel by Order IDs
            if (!empty($orderIds)) {
                $response = Http::withToken($token)->post("{$this->baseUrl}/orders/cancel", [
                    'ids' => array_map('intval', $orderIds),
                ]);

                if ($response->status() === 401) {
                    $this->clearTokenCache();
                    $token = $this->getToken();
                    if ($token) {
                        $response = Http::withToken($token)->post("{$this->baseUrl}/orders/cancel", [
                            'ids' => array_map('intval', $orderIds),
                        ]);
                    }
                }

                if ($response->successful()) {
                    $results['order_cancel'] = $response->json();
                } else {
                    Log::warning('Shiprocket cancelOrder failed: ' . $response->body());
                }
            }

            // 2. Cancel AWB / Shipment if AWB provided
            if (!empty($awbs)) {
                $awbResponse = Http::withToken($token)->post("{$this->baseUrl}/orders/cancel/shipment/awbs", [
                    'awbs' => $awbs,
                ]);
                if ($awbResponse->successful()) {
                    $results['awb_cancel'] = $awbResponse->json();
                }
            }

            return [
                'success' => true,
                'message' => 'Shiprocket cancellation request processed successfully.',
                'data' => $results,
            ];
        } catch (\Throwable $e) {
            Log::error('Shiprocket cancelOrder Exception: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Error canceling Shiprocket order: ' . $e->getMessage()];
        }
    }
}
