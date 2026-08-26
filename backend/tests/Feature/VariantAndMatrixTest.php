<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Role;
use App\Models\User;
use App\Services\CartCheckoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class VariantAndMatrixTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $category = Category::firstOrCreate(
            ['slug' => 'women'],
            ['name' => 'Women', 'status' => 'ACTIVE', 'sort_order' => 1]
        );

        $this->product = Product::create([
            'category_id' => $category->id,
            'name' => 'Floral Summer Dress Variant Test ' . uniqid(),
            'slug' => 'floral-summer-dress-variant-test-' . uniqid(),
            'sku' => 'FEM-VAR-TEST-' . uniqid(),
            'brand' => 'Femmeera',
            'gender' => 'WOMEN',
            'status' => 'ACTIVE',
        ]);
    }

    /**
     * Test Admin Variant Matrix Generator API.
     */
    public function test_admin_can_generate_variant_matrix(): void
    {
        $pm = User::create([
            'name' => 'Priya Product Manager',
            'email' => 'pm_' . uniqid() . '@femmeera.com',
            'password' => Hash::make('Password123!'),
            'user_type' => 'ADMIN',
            'status' => 'ACTIVE',
        ]);

        $pmRole = Role::where('name', 'PRODUCT_MANAGER')->firstOrFail();
        $pm->roles()->attach($pmRole->id);

        Sanctum::actingAs($pm);

        $response = $this->postJson("/api/v1/admin/products/{$this->product->id}/variants/generate", [
            'colors' => ['Midnight Black', 'Ivory White'],
            'sizes' => ['S', 'M', 'L'],
            'base_price' => 1299.00,
            'base_mrp' => 1999.00,
            'base_stock' => 10,
        ]);

        $response->assertStatus(200);

        // Verify 2 colors * 3 sizes = 6 variants created
        $this->assertEquals(6, ProductVariant::where('product_id', $this->product->id)->count());

        $this->assertDatabaseHas('product_variants', [
            'product_id' => $this->product->id,
            'color' => 'Midnight Black',
            'size' => 'M',
            'price' => 1299.00,
        ]);
    }

    /**
     * Test Duplicate Variant Protection.
     */
    public function test_duplicate_variant_combination_is_prevented(): void
    {
        ProductVariant::create([
            'product_id' => $this->product->id,
            'sku' => 'FEM-VAR-B-S-UNIQUE-' . uniqid(),
            'size' => 'S',
            'color' => 'Black',
            'price' => 1299.00,
            'mrp' => 1999.00,
            'stock' => 10,
        ]);

        $this->expectException(\Illuminate\Database\QueryException::class);

        ProductVariant::create([
            'product_id' => $this->product->id,
            'sku' => 'FEM-VAR-B-S-DUPLICATE-' . uniqid(),
            'size' => 'S',
            'color' => 'Black',
            'price' => 1299.00,
            'mrp' => 1999.00,
            'stock' => 10,
        ]);
    }

    /**
     * Test Server-Side Authoritative Checkout Price Calculation with Variant.
     */
    public function test_checkout_uses_database_variant_price_authoritatively(): void
    {
        $variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'sku' => 'FEM-VAR-W-M-AUTH-' . uniqid(),
            'size' => 'M',
            'color' => 'White',
            'price' => 1399.00,
            'mrp' => 1999.00,
            'stock' => 5,
        ]);

        Inventory::create([
            'variant_id' => $variant->id,
            'available_quantity' => 5,
            'reserved_quantity' => 0,
            'low_stock_threshold' => 5,
        ]);

        $customer = User::create([
            'name' => 'Buyer',
            'email' => 'buyer_' . uniqid() . '@example.com',
            'password' => Hash::make('Password123!'),
            'user_type' => 'CUSTOMER',
            'status' => 'ACTIVE',
        ]);

        $checkoutService = app(CartCheckoutService::class);

        $payload = [
            'items' => [
                // Client tries to spoof price = 100.00, but service must use DB price = 1399.00
                ['variant_id' => $variant->id, 'quantity' => 2, 'price' => 100.00]
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

        $order = $checkoutService->checkout($customer, $payload);

        // Subtotal = 1399 * 2 = 2798.00 (NOT 200.00!)
        $this->assertEquals(2798.00, $order->subtotal);
    }
}
