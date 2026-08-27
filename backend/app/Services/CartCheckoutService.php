<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CartCheckoutService
{
    protected InventoryService $inventoryService;
    protected DiscountService $discountService;
    protected ShippingService $shippingService;
    protected TaxService $taxService;
    protected CouponService $couponService;

    public function __construct(
        InventoryService $inventoryService,
        DiscountService $discountService,
        ShippingService $shippingService,
        TaxService $taxService,
        CouponService $couponService
    ) {
        $this->inventoryService = $inventoryService;
        $this->discountService = $discountService;
        $this->shippingService = $shippingService;
        $this->taxService = $taxService;
        $this->couponService = $couponService;
    }

    /**
     * Process Cart Checkout and Create Order atomically (Spec Section 31).
     */
    public function checkout(User $user, array $checkoutData): Order
    {
        return DB::transaction(function () use ($user, $checkoutData) {
            $itemsData = $checkoutData['items'] ?? [];

            // If items not directly provided in payload, load from user's active cart
            if (empty($itemsData)) {
                $cart = Cart::where('customer_id', $user->id)
                    ->where('status', 'ACTIVE')
                    ->first();

                if ($cart) {
                    $cartItems = CartItem::where('cart_id', $cart->id)->get();
                    foreach ($cartItems as $cItem) {
                        $itemsData[] = [
                            'variant_id' => $cItem->variant_id,
                            'quantity' => $cItem->quantity,
                        ];
                    }
                }
            }

            if (empty($itemsData)) {
                throw new HttpException(400, 'Cart is empty. Cannot process checkout.');
            }

            // 1. Generate unique human-friendly order number: ORD-YYYYMMDD-XXXXXX
            $datePrefix = now()->format('Ymd');
            $randomSuffix = str_pad((string)rand(1, 999999), 6, '0', STR_PAD_LEFT);
            $orderNumber = "ORD-{$datePrefix}-{$randomSuffix}";

            $subtotal = 0.00;
            $orderItemsToCreate = [];

            // 2. Lock variant inventory rows and calculate authoritative prices server-side
            foreach ($itemsData as $item) {
                $variantId = $item['variant_id'];
                $qty = (int)$item['quantity'];

                if ($qty <= 0) {
                    throw new HttpException(400, 'Quantity must be at least 1.');
                }

                // Row-level locking to prevent race conditions on stock (Spec Section 32)
                $variant = ProductVariant::with('product')
                    ->where('id', $variantId)
                    ->lockForUpdate()
                    ->first();

                if (!$variant || !$variant->product) {
                    throw new HttpException(404, "Product variant #{$variantId} not found.");
                }

                if ($variant->status !== 'ACTIVE' || $variant->product->status !== 'ACTIVE') {
                    throw new HttpException(400, "Product {$variant->product->name} is no longer available.");
                }

                // Verify stock availability
                $inventory = $variant->inventory;
                if (!$inventory || $inventory->available_quantity < $qty) {
                    $available = $inventory ? $inventory->available_quantity : 0;
                    throw new HttpException(
                        400,
                        "Insufficient stock for {$variant->product->name} ({$variant->size}/{$variant->color}). Available: {$available}, Requested: {$qty}"
                    );
                }

                $unitPrice = (float)$variant->price;
                $lineTotal = round($unitPrice * $qty, 2);
                $subtotal += $lineTotal;

                $orderItemsToCreate[] = [
                    'product_id' => $variant->product_id,
                    'variant_id' => $variant->id,
                    'product_name_snapshot' => $variant->product->name,
                    'sku_snapshot' => $variant->sku,
                    'size_snapshot' => $variant->size,
                    'color_snapshot' => $variant->color,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'discount_amount' => 0.00,
                    'total_amount' => $lineTotal,
                ];
            }

            // 3. Authoritative server-side calculations (Spec Section 33)
            $couponCode = isset($checkoutData['coupon_code']) ? trim($checkoutData['coupon_code']) : null;
            $discountCalc = $this->discountService->calculateDiscounts($subtotal, $orderItemsToCreate, $couponCode, $user);

            $discountAmount = $discountCalc['total_discount'];
            $netSubtotal = max(0.00, $subtotal - $discountAmount);

            $shippingMethodId = $checkoutData['shipping_method_id'] ?? null;
            $shippingCalc = $this->shippingService->calculateShipping($shippingMethodId, $netSubtotal);
            $shippingAmount = $shippingCalc['amount'];

            $taxCalc = $this->taxService->calculateTax($netSubtotal);
            $taxAmount = $taxCalc['tax_amount'];
            $taxAdded = !empty($taxCalc['is_inclusive']) ? 0.00 : $taxAmount;

            $totalAmount = round($netSubtotal + $shippingAmount + $taxAdded, 2);

            // 4. Address Snapshots
            $shippingAddress = $checkoutData['shipping_address'] ?? [
                'name' => $user->name,
                'address' => '123 Main Street',
                'city' => 'Mumbai',
                'state' => 'Maharashtra',
                'pincode' => '400001',
                'phone' => $user->phone ?? '9876543210',
            ];

            $billingAddress = $checkoutData['billing_address'] ?? $shippingAddress;

            // 5. Create Order (payment_status = PENDING)
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'subtotal' => round($subtotal, 2),
                'discount_amount' => round($discountAmount, 2),
                'shipping_amount' => round($shippingAmount, 2),
                'tax_amount' => round($taxAmount, 2),
                'total_amount' => round($totalAmount, 2),
                'currency' => 'INR',
                'payment_status' => 'PENDING',
                'order_status' => 'PENDING',
                'shipping_address_snapshot' => $shippingAddress,
                'billing_address_snapshot' => $billingAddress,
            ]);

            // 6. Create Order Items & Reserve Inventory
            foreach ($orderItemsToCreate as $itemData) {
                $itemData['order_id'] = $order->id;
                OrderItem::create($itemData);

                // Reserve inventory atomically
                $this->inventoryService->reserveStock($itemData['variant_id'], $itemData['quantity'], $orderNumber);
            }

            // 7. Record Payment details (COD / Pending)
            $payMethod = strtoupper($checkoutData['payment_method'] ?? 'COD');
            \App\Models\Payment::create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'payment_method' => $payMethod,
                'provider' => $payMethod,
                'amount' => $totalAmount,
                'currency' => 'INR',
                'status' => $payMethod === 'COD' ? 'PENDING' : 'INITIATED',
            ]);

            // 8. Record Coupon Usage if coupon applied
            if (!empty($discountCalc['applied_coupon'])) {
                $this->couponService->recordUsage($discountCalc['applied_coupon']['id'], $user->id, $order->id);
            }

            // 8. Mark customer cart as CONVERTED
            $cart = Cart::where('customer_id', $user->id)->where('status', 'ACTIVE')->first();
            if ($cart) {
                $cart->update(['status' => 'CONVERTED']);
            }

            // 9. Initial Order Status History
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'previous_status' => null,
                'new_status' => 'PENDING',
                'comment' => 'Order created via checkout.',
                'changed_by' => $user->id,
                'created_at' => now(),
            ]);

            return $order->load(['items', 'latestPayment', 'statusHistory']);
        });
    }
}
