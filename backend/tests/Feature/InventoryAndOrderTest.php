<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Role;
use App\Models\User;
use App\Services\CartCheckoutService;
use App\Services\InventoryService;
use App\Services\OrderStatusService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class InventoryAndOrderTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;
    protected User $customer;
    protected User $superAdmin;
    protected ProductVariant $variant;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed Root Category & Product
        $category = Category::firstOrCreate(
            ['slug' => 'women'],
            ['name' => 'Women', 'status' => 'ACTIVE', 'sort_order' => 1]
        );

        $product = Product::firstOrCreate(
            ['slug' => 'silk-kurti-test'],
            [
                'category_id' => $category->id,
                'name' => 'Silk Kurti Test',
                'sku' => 'FEM-KURTI-001',
                'brand' => 'Femmeera',
                'gender' => 'WOMEN',
                'status' => 'ACTIVE',
            ]
        );

        $this->variant = ProductVariant::firstOrCreate(
            ['sku' => 'FEM-KURTI-S-TEST'],
            [
                'product_id' => $product->id,
                'size' => 'S',
                'color' => 'Red',
                'price' => 1499.00,
                'mrp' => 1999.00,
                'stock' => 10,
            ]
        );

        // Seed Inventory
        Inventory::updateOrCreate(
            ['variant_id' => $this->variant->id],
            [
                'available_quantity' => 10,
                'reserved_quantity' => 0,
                'low_stock_threshold' => 5,
            ]
        );

        // Create Customer User
        $this->customer = User::create([
            'name' => 'Test Customer',
            'email' => 'customer_' . uniqid() . '@example.com',
            'password' => Hash::make('Password123!'),
            'user_type' => 'CUSTOMER',
            'status' => 'ACTIVE',
        ]);

        // Create Super Admin User
        $this->superAdmin = User::updateOrCreate(
            ['email' => 'admin@femmeera.com'],
            [
                'name' => 'Super Administrator',
                'password' => Hash::make('Admin@Femmeera2026!'),
                'user_type' => 'ADMIN',
                'status' => 'ACTIVE',
            ]
        );

        $role = Role::where('name', 'SUPER_ADMIN')->first();
        if ($role) {
            $this->superAdmin->roles()->sync([$role->id]);
        }
    }

    /**
     * Test Manual Stock Adjustment and Transaction Logging.
     */
    public function test_admin_can_adjust_inventory_stock(): void
    {
        $token = $this->superAdmin->createToken('admin_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/v1/admin/inventory/{$this->variant->id}/adjust", [
                'quantity' => 15,
                'type' => 'PURCHASE',
                'notes' => 'Received new shipment batch',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'available_quantity' => 25,
                ]
            ]);

        $this->assertDatabaseHas('inventory_transactions', [
            'variant_id' => $this->variant->id,
            'type' => 'PURCHASE',
            'quantity' => 15,
        ]);
    }

    /**
     * Test Customer Checkout and Price/Snapshot Calculation.
     */
    public function test_customer_can_checkout_cart_and_reserve_stock(): void
    {
        $token = $this->customer->createToken('cust_token')->plainTextToken;

        $checkoutPayload = [
            'items' => [
                [
                    'variant_id' => $this->variant->id,
                    'quantity' => 2,
                ]
            ],
            'shipping_address' => [
                'name' => 'Ananya Sharma',
                'address' => '402 Lotus Apartments, Bandra West',
                'city' => 'Mumbai',
                'state' => 'Maharashtra',
                'pincode' => '400050',
                'phone' => '9876543210',
            ],
        ];

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/customer/orders/checkout', $checkoutPayload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'subtotal' => 2998.00,
                    'order_status' => 'PENDING',
                ]
            ]);

        // Verify stock reservation (Available: 10 - 2 = 8, Reserved: 2)
        $this->assertDatabaseHas('inventory', [
            'variant_id' => $this->variant->id,
            'available_quantity' => 8,
            'reserved_quantity' => 2,
        ]);

        $this->assertDatabaseHas('inventory_transactions', [
            'variant_id' => $this->variant->id,
            'type' => 'RESERVATION',
            'quantity' => -2,
        ]);
    }

    /**
     * Test Concurrency: Two simultaneous purchases when stock = 1.
     */
    public function test_concurrency_stock_reservation_race_condition(): void
    {
        // Set available stock = 1
        Inventory::where('variant_id', $this->variant->id)->update([
            'available_quantity' => 1,
            'reserved_quantity' => 0,
        ]);

        $checkoutService = app(CartCheckoutService::class);

        $payload = [
            'items' => [
                ['variant_id' => $this->variant->id, 'quantity' => 1]
            ],
            'shipping_address' => [
                'name' => 'Buyer',
                'address' => 'Street',
                'city' => 'City',
                'state' => 'State',
                'pincode' => '400001',
                'phone' => '9000000000',
            ],
        ];

        // Customer A purchases 1 item
        $orderA = $checkoutService->checkout($this->customer, $payload);
        $this->assertNotNull($orderA->id);

        // Customer B attempts to purchase 1 item (stock now 0)
        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $checkoutService->checkout($this->customer, $payload);
    }

    /**
     * Test Valid vs Invalid Order Status Transitions.
     */
    public function test_order_status_transitions(): void
    {
        $order = Order::create([
            'user_id' => $this->customer->id,
            'order_number' => 'ORD-TEST-' . uniqid(),
            'subtotal' => 1499.00,
            'discount_amount' => 0.00,
            'shipping_amount' => 0.00,
            'tax_amount' => 74.95,
            'total_amount' => 1573.95,
            'payment_status' => 'PENDING',
            'order_status' => 'PENDING',
            'shipping_address_snapshot' => ['name' => 'Test'],
            'billing_address_snapshot' => ['name' => 'Test'],
        ]);

        $orderStatusService = app(OrderStatusService::class);

        // Valid transition: PENDING -> CONFIRMED
        $updatedOrder = $orderStatusService->transition($order, 'CONFIRMED', 'Payment verified');
        $this->assertEquals('CONFIRMED', $updatedOrder->order_status);

        // Invalid transition: CONFIRMED -> DELIVERED (illegal state jump!)
        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $orderStatusService->transition($updatedOrder, 'DELIVERED');
    }

    /**
     * Test Order Cancellation releases reserved inventory stock.
     */
    public function test_order_cancellation_releases_reserved_stock(): void
    {
        $custToken = $this->customer->createToken('cust_token')->plainTextToken;

        // 1. Create Order as Customer
        $checkoutResponse = $this->withHeader('Authorization', "Bearer {$custToken}")
            ->postJson('/api/v1/customer/orders/checkout', [
                'items' => [['variant_id' => $this->variant->id, 'quantity' => 3]],
                'shipping_address' => [
                    'name' => 'Ananya', 'address' => 'Address', 'city' => 'City', 'state' => 'State', 'pincode' => '400001', 'phone' => '9000000000'
                ]
            ]);

        $orderId = $checkoutResponse->json('data.id');

        // Verify reserved = 3, available = 7
        $this->assertDatabaseHas('inventory', [
            'variant_id' => $this->variant->id,
            'available_quantity' => 7,
            'reserved_quantity' => 3,
        ]);

        // Reset auth guards to clear customer session in test environment
        $this->app['auth']->forgetGuards();

        // 2. Admin cancels order
        $adminToken = $this->superAdmin->createToken('admin_token')->plainTextToken;

        $cancelResponse = $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->postJson("/api/v1/admin/orders/{$orderId}/cancel", [
                'reason' => 'Out of delivery area',
            ]);

        $cancelResponse->assertStatus(200);

        // Verify reserved stock released (Available back to 10, Reserved to 0)
        $this->assertDatabaseHas('inventory', [
            'variant_id' => $this->variant->id,
            'available_quantity' => 10,
            'reserved_quantity' => 0,
        ]);

        $this->assertDatabaseHas('inventory_transactions', [
            'variant_id' => $this->variant->id,
            'type' => 'RELEASE',
            'quantity' => 3,
        ]);
    }
}
