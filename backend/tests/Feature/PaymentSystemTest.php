<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Permission;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentSystemTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    protected User $customer;
    protected User $otherCustomer;
    protected User $admin;
    protected Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customer = User::factory()->create();
        $this->otherCustomer = User::factory()->create();

        $superAdminRole = Role::firstOrCreate(
            ['name' => 'SUPER_ADMIN'],
            ['display_name' => 'Super Administrator', 'description' => 'Super Administrator']
        );

        $permission = Permission::firstOrCreate(
            ['name' => 'orders.update'],
            ['display_name' => 'Update Orders', 'module' => 'orders']
        );
        $superAdminRole->permissions()->syncWithoutDetaching([$permission->id]);

        $this->admin = User::factory()->create([
            'user_type' => 'ADMIN',
            'status' => 'ACTIVE',
        ]);
        $this->admin->roles()->attach($superAdminRole->id);

        $category = Category::firstOrCreate(
            ['slug' => 'payment-test-cat'],
            ['name' => 'Payment Test Category', 'status' => 'ACTIVE', 'sort_order' => 1]
        );

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Silk Lehenga ' . uniqid(),
            'slug' => 'silk-lehenga-' . uniqid(),
            'sku' => 'LEHENGA-' . uniqid(),
            'brand' => 'Femmeera',
            'gender' => 'WOMEN',
            'status' => 'ACTIVE',
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'VAR-' . uniqid(),
            'size' => 'M',
            'color' => 'Gold',
            'price' => 2499.00,
            'mrp' => 2999.00,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        $this->order = Order::create([
            'order_number' => 'ORD-PAY-' . uniqid(),
            'user_id' => $this->customer->id,
            'order_status' => 'PENDING',
            'subtotal' => 2499.00,
            'tax_amount' => 0.00,
            'shipping_amount' => 0.00,
            'discount_amount' => 0.00,
            'total_amount' => 2499.00,
            'payment_status' => 'PENDING',
            'currency' => 'INR',
            'shipping_address_snapshot' => [
                'name' => 'Priya Sharma',
                'address' => 'HSR Layout',
                'city' => 'Bangalore',
                'state' => 'Karnataka',
                'pincode' => '560001',
                'country' => 'India',
            ],
            'billing_address_snapshot' => [
                'name' => 'Priya Sharma',
                'address' => 'HSR Layout',
                'city' => 'Bangalore',
                'state' => 'Karnataka',
                'pincode' => '560001',
                'country' => 'India',
            ],
        ]);

        OrderItem::create([
            'order_id' => $this->order->id,
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'product_name_snapshot' => $product->name,
            'sku_snapshot' => $variant->sku,
            'size_snapshot' => 'M',
            'color_snapshot' => 'Gold',
            'unit_price' => 2499.00,
            'quantity' => 1,
            'total_amount' => 2499.00,
        ]);
    }

    public function test_customer_can_create_payment_order_with_server_authoritative_amount(): void
    {
        $response = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/v1/payments/create', [
                'order_id' => $this->order->id,
            ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $this->assertEquals(2499.00, (float) $response->json('data.amount'));
        $this->assertNotEmpty($response->json('data.provider_payment_order_id'));

        $this->assertDatabaseHas('payments', [
            'order_id' => $this->order->id,
            'amount' => 2499.00,
            'status' => 'PENDING',
        ]);
    }

    public function test_customer_cannot_create_payment_for_another_customer_order(): void
    {
        $response = $this->actingAs($this->otherCustomer, 'sanctum')
            ->postJson('/api/v1/payments/create', [
                'order_id' => $this->order->id,
            ]);

        $response->assertStatus(400);
        $response->assertJsonPath('success', false);
    }

    public function test_valid_signature_verifies_payment_and_confirms_order(): void
    {
        // 1. Create Payment Order
        $createRes = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/v1/payments/create', [
                'order_id' => $this->order->id,
            ]);

        $providerOrderId = $createRes->json('data.provider_payment_order_id');

        // 2. Verify Payment
        $verifyRes = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/v1/payments/verify', [
                'razorpay_order_id' => $providerOrderId,
                'razorpay_payment_id' => 'pay_test_' . uniqid(),
                'razorpay_signature' => 'valid_test_signature_' . uniqid(),
            ]);

        $verifyRes->assertStatus(200);
        $verifyRes->assertJsonPath('success', true);

        // Verify Order is CONFIRMED & Payment is PAID
        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'order_status' => 'CONFIRMED',
            'payment_status' => 'PAID',
        ]);

        $this->assertDatabaseHas('payments', [
            'order_id' => $this->order->id,
            'status' => 'PAID',
        ]);
    }

    public function test_invalid_signature_is_rejected_and_payment_marked_failed(): void
    {
        $createRes = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/v1/payments/create', [
                'order_id' => $this->order->id,
            ]);

        $providerOrderId = $createRes->json('data.provider_payment_order_id');

        $verifyRes = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/v1/payments/verify', [
                'razorpay_order_id' => $providerOrderId,
                'razorpay_payment_id' => 'pay_fake_' . uniqid(),
                'razorpay_signature' => 'invalid_forged_signature',
            ]);

        $verifyRes->assertStatus(400);
        $verifyRes->assertJsonPath('success', false);

        $this->assertDatabaseHas('payments', [
            'order_id' => $this->order->id,
            'status' => 'FAILED',
        ]);
    }

    public function test_idempotent_payment_verification(): void
    {
        $createRes = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/v1/payments/create', [
                'order_id' => $this->order->id,
            ]);

        $providerOrderId = $createRes->json('data.provider_payment_order_id');
        $paymentId = 'pay_test_' . uniqid();
        $signature = 'valid_test_signature_' . uniqid();

        // Call 1
        $res1 = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/v1/payments/verify', [
                'razorpay_order_id' => $providerOrderId,
                'razorpay_payment_id' => $paymentId,
                'razorpay_signature' => $signature,
            ]);
        $res1->assertStatus(200);

        // Call 2 (Duplicate)
        $res2 = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/v1/payments/verify', [
                'razorpay_order_id' => $providerOrderId,
                'razorpay_payment_id' => $paymentId,
                'razorpay_signature' => $signature,
            ]);
        $res2->assertStatus(200);
        $res2->assertJsonPath('success', true);
    }

    public function test_webhook_idempotent_processing_with_signature(): void
    {
        $createRes = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/v1/payments/create', [
                'order_id' => $this->order->id,
            ]);

        $providerOrderId = $createRes->json('data.provider_payment_order_id');

        $webhookPayload = [
            'event' => 'payment.captured',
            'payload' => [
                'payment' => [
                    'entity' => [
                        'id' => 'pay_webhook_test_123',
                        'order_id' => $providerOrderId,
                        'amount' => 249900,
                        'currency' => 'INR',
                        'status' => 'captured',
                    ]
                ]
            ]
        ];

        $response = $this->withHeaders([
            'X-Razorpay-Signature' => 'valid_test_webhook_signature',
        ])->postJson('/api/v1/payments/webhook/razorpay', $webhookPayload);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'order_status' => 'CONFIRMED',
            'payment_status' => 'PAID',
        ]);
    }

    public function test_admin_can_refund_payment_with_amount_cap(): void
    {
        // 1. Create & Verify Payment
        $createRes = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/v1/payments/create', [
                'order_id' => $this->order->id,
            ]);

        $providerOrderId = $createRes->json('data.provider_payment_order_id');

        $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/v1/payments/verify', [
                'razorpay_order_id' => $providerOrderId,
                'razorpay_payment_id' => 'pay_test_' . uniqid(),
                'razorpay_signature' => 'valid_test_signature_' . uniqid(),
            ]);

        $payment = Payment::where('order_id', $this->order->id)->first();

        // 2. Partial Refund by Admin
        $refundRes = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/payments/{$payment->id}/refund", [
                'amount' => 1000.00,
                'reason' => 'Defective item returned',
            ]);

        $refundRes->assertStatus(200);
        $refundRes->assertJsonPath('success', true);

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'PARTIALLY_REFUNDED',
        ]);

        // 3. Excess Refund Rejection Check
        $excessRefundRes = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/payments/{$payment->id}/refund", [
                'amount' => 2000.00, // Remaining cap is 1499.00
                'reason' => 'Excess refund test',
            ]);

        $excessRefundRes->assertStatus(400);
        $excessRefundRes->assertJsonPath('success', false);
    }
}
