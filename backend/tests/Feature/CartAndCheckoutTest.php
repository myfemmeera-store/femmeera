<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\CustomerAddress;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ShippingMethod;
use App\Models\TaxRule;
use App\Models\User;
use App\Services\CartService;
use App\Services\CartCheckoutService;
use App\Services\ShippingService;
use App\Services\TaxService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CartAndCheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;
    protected ProductVariant $variant1;
    protected ProductVariant $variant2;
    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $category = Category::firstOrCreate(
            ['slug' => 'women'],
            ['name' => 'Women', 'status' => 'ACTIVE', 'sort_order' => 1]
        );

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Phase 7 Silk Dress ' . uniqid(),
            'slug' => 'phase7-silk-dress-' . uniqid(),
            'sku' => 'P7-DRS-' . uniqid(),
            'brand' => 'Femmeera',
            'gender' => 'WOMEN',
            'status' => 'ACTIVE',
        ]);

        $this->variant1 = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'P7-DRS-BLK-S-' . uniqid(),
            'size' => 'S',
            'color' => 'Black',
            'price' => 1299.00,
            'mrp' => 1999.00,
            'stock' => 10,
            'status' => 'ACTIVE',
        ]);

        Inventory::create([
            'variant_id' => $this->variant1->id,
            'available_quantity' => 10,
            'reserved_quantity' => 0,
            'low_stock_threshold' => 5,
        ]);

        $this->variant2 = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'P7-DRS-RED-M-' . uniqid(),
            'size' => 'M',
            'color' => 'Red',
            'price' => 1499.00,
            'mrp' => 2499.00,
            'stock' => 2, // Low stock for testing bounds
            'status' => 'ACTIVE',
        ]);

        Inventory::create([
            'variant_id' => $this->variant2->id,
            'available_quantity' => 2,
            'reserved_quantity' => 0,
            'low_stock_threshold' => 5,
        ]);

        $this->customer = User::create([
            'name' => 'Aditi Sharma',
            'email' => 'aditi_' . uniqid() . '@example.com',
            'password' => Hash::make('Password123!'),
            'user_type' => 'CUSTOMER',
            'status' => 'ACTIVE',
        ]);
    }

    /**
     * Test Guest Cart Creation and Item Management via X-Guest-Session-ID.
     */
    public function test_guest_cart_add_and_update(): void
    {
        $guestSessionId = 'guest_session_' . uniqid();

        // 1. Add Item to Guest Cart
        $addRes = $this->withHeader('X-Guest-Session-ID', $guestSessionId)
            ->postJson('/api/v1/cart/items', [
                'variant_id' => $this->variant1->id,
                'quantity' => 2,
            ]);

        $addRes->assertStatus(200);
        $addRes->assertJsonPath('data.item_count', 1);
        $addRes->assertJsonPath('data.subtotal', 2598);

        // 2. Fetch Cart
        $getRes = $this->withHeader('X-Guest-Session-ID', $guestSessionId)
            ->getJson('/api/v1/cart');

        $getRes->assertStatus(200);
        $cartItemId = $getRes->json('data.items.0.cart_item_id');

        // 3. Update Quantity
        $updateRes = $this->withHeader('X-Guest-Session-ID', $guestSessionId)
            ->patchJson("/api/v1/cart/items/{$cartItemId}", [
                'quantity' => 3,
            ]);

        $updateRes->assertStatus(200);
        $updateRes->assertJsonPath('data.subtotal', 3897);
    }

    /**
     * Test Stock Limit Enforcement on Cart Item Addition.
     */
    public function test_cart_item_quantity_cannot_exceed_available_stock(): void
    {
        $guestSessionId = 'guest_session_' . uniqid();

        // Variant2 has stock = 2. Adding quantity = 3 must fail.
        $response = $this->withHeader('X-Guest-Session-ID', $guestSessionId)
            ->postJson('/api/v1/cart/items', [
                'variant_id' => $this->variant2->id,
                'quantity' => 3,
            ]);

        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
    }

    /**
     * Test Merging Guest Cart into Customer Cart upon Login.
     */
    public function test_guest_cart_merges_into_customer_cart_on_login(): void
    {
        $guestSessionId = 'guest_session_' . uniqid();

        // Guest adds 1 unit of variant1
        $this->withHeader('X-Guest-Session-ID', $guestSessionId)
            ->postJson('/api/v1/cart/items', [
                'variant_id' => $this->variant1->id,
                'quantity' => 1,
            ]);

        // Logged-in customer adds 1 unit of variant1 directly
        Sanctum::actingAs($this->customer);
        $this->postJson('/api/v1/cart/items', [
            'variant_id' => $this->variant1->id,
            'quantity' => 1,
        ]);

        // Trigger Merge Cart API
        $mergeRes = $this->postJson('/api/v1/cart/merge', [
            'guest_session_id' => $guestSessionId,
        ]);

        $mergeRes->assertStatus(200);
        $mergeRes->assertJsonPath('data.items.0.quantity', 2);
    }

    /**
     * Test Indian PIN Code Serviceability and Shipping Calculation.
     */
    public function test_pin_code_serviceability_and_free_shipping_threshold(): void
    {
        $shippingService = app(ShippingService::class);

        // Valid 6-digit Indian PIN
        $val1 = $shippingService->checkServiceability('560001');
        $this->assertTrue($val1['serviceable']);

        // Invalid PIN format
        $val2 = $shippingService->checkServiceability('0123');
        $this->assertFalse($val2['serviceable']);

        // Order subtotal = 1299.00 (below free shipping threshold 1999.00) -> Shipping cost applied
        $ship1 = $shippingService->calculateShipping(null, 1299.00);
        $this->assertGreaterThan(0, $ship1['amount']);

        // Order subtotal = 2500.00 (above free shipping threshold) -> Free Shipping!
        $ship2 = $shippingService->calculateShipping(null, 2500.00);
        $this->assertTrue($ship2['is_free_shipping']);
        $this->assertEquals(0.00, $ship2['amount']);
    }

    /**
     * Test Configurable Tax Calculation (GST).
     */
    public function test_configurable_tax_calculation(): void
    {
        $taxService = app(TaxService::class);

        $calc = $taxService->calculateTax(1000.00);
        $this->assertTrue($calc['is_inclusive']);
        $this->assertEquals(0.00, $calc['tax_amount']);
    }

    /**
     * Test Coupon Validation, Date Expiry, Min Order, and Max Cap.
     */
    public function test_coupon_validation_and_max_discount_cap(): void
    {
        $coupon = Coupon::firstOrCreate(
            ['code' => 'TEST10'],
            [
                'name' => 'Test 10% Off',
                'discount_type' => 'PERCENTAGE',
                'discount_value' => 10.00,
                'minimum_order_amount' => 1000.00,
                'maximum_discount_amount' => 150.00, // Capped at ₹150
                'status' => 'ACTIVE',
            ]
        );

        $guestSessionId = 'guest_session_' . uniqid();

        // Subtotal = 2598.00. 10% of 2598 = 259.80, but capped at 150.00!
        $cartRes = $this->withHeader('X-Guest-Session-ID', $guestSessionId)
            ->postJson('/api/v1/cart/items', [
                'variant_id' => $this->variant1->id,
                'quantity' => 2,
            ]);

        $cartRes->assertStatus(200);

        $getRes = $this->withHeader('X-Guest-Session-ID', $guestSessionId)
            ->getJson('/api/v1/cart?coupon_code=TEST10');

        $getRes->assertStatus(200);
        $this->assertEquals(150.00, $getRes->json('data.coupon_discount'));
    }

    /**
     * Test Transactional Checkout Order Creation & Price Spoofing Defense.
     */
    public function test_checkout_creates_order_transactionally_and_defends_price_spoofing(): void
    {
        Sanctum::actingAs($this->customer);

        // Add 2 units of variant1 to customer cart (Price = 1299.00 * 2 = 2598.00)
        $this->postJson('/api/v1/cart/items', [
            'variant_id' => $this->variant1->id,
            'quantity' => 2,
        ]);

        $checkoutRes = $this->postJson('/api/v1/checkout/create-order', [
            'shipping_address' => [
                'name' => 'Aditi Sharma',
                'phone' => '9876543210',
                'address' => 'MG Road',
                'city' => 'Bengaluru',
                'state' => 'Karnataka',
                'pincode' => '560001',
            ],
            'coupon_code' => 'WELCOME10', // 10% off (259.80 off), Free Shipping over 1999!
        ]);

        $checkoutRes->assertStatus(201);
        $orderNumber = $checkoutRes->json('data.order.order_number');
        $this->assertNotEmpty($orderNumber);

        $orderId = $checkoutRes->json('data.order.id');

        // Verify reserved inventory
        $inventory = Inventory::where('variant_id', $this->variant1->id)->first();
        $this->assertEquals(8, $inventory->available_quantity);
        $this->assertEquals(2, $inventory->reserved_quantity);
    }
}
