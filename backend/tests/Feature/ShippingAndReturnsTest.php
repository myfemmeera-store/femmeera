<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderReturn;
use App\Models\Product;
use App\Models\ShippingRule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ShippingAndReturnsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed basic roles and shipping rules
        DB::table('roles')->insertOrIgnore([
            ['id' => 1, 'name' => 'SUPER_ADMIN', 'display_name' => 'Super Admin', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'CUSTOMER', 'display_name' => 'Customer', 'created_at' => now(), 'updated_at' => now()],
        ]);

        ShippingRule::create([
            'name' => 'Tier 1 Standard',
            'min_order_amount' => 0.00,
            'max_order_amount' => 999.00,
            'shipping_fee' => 99.00,
            'estimated_days' => '3-7 working days',
            'status' => 'ACTIVE',
        ]);

        ShippingRule::create([
            'name' => 'Tier 2 Express Free',
            'min_order_amount' => 1000.00,
            'max_order_amount' => null,
            'shipping_fee' => 0.00,
            'estimated_days' => '2-4 working days',
            'status' => 'ACTIVE',
        ]);

        DB::table('settings')->insert([
            'group_name' => 'policy',
            'key_name' => 'shipping_policy',
            'value_content' => json_encode(['title' => 'Test Shipping Policy', 'content' => 'Shipping rules apply']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('settings')->insert([
            'group_name' => 'policy',
            'key_name' => 'return_policy',
            'value_content' => json_encode(['title' => 'Test Return Policy', 'return_window_days' => 7, 'content' => '7 days return']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function test_public_can_fetch_shipping_policy(): void
    {
        $response = $this->getJson('/api/v1/shipping-policy');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.policy.title', 'Test Shipping Policy');
    }

    public function test_public_can_fetch_return_policy(): void
    {
        $response = $this->getJson('/api/v1/return-policy');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Test Return Policy');
    }

    public function test_customer_can_submit_return_request(): void
    {
        $user = User::factory()->create();
        $order = Order::create([
            'user_id' => $user->id,
            'order_number' => 'ORD-TEST-RET-01',
            'subtotal' => 1500.00,
            'shipping_amount' => 0.00,
            'tax_amount' => 0.00,
            'total_amount' => 1500.00,
            'payment_status' => 'PAID',
            'order_status' => 'DELIVERED',
            'shipping_address_snapshot' => ['city' => 'Delhi'],
            'billing_address_snapshot' => ['city' => 'Delhi'],
            'delivered_at' => now()->subDays(2),
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/customer/returns', [
            'order_id' => $order->id,
            'reason' => 'Size too small',
            'comment' => 'Please exchange for Medium',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'REQUESTED');

        $this->assertDatabaseHas('order_returns', [
            'order_id' => $order->id,
            'user_id' => $user->id,
            'reason' => 'Size too small',
            'status' => 'REQUESTED',
        ]);
    }

    public function test_cannot_return_non_returnable_product(): void
    {
        $user = User::factory()->create();
        $category = DB::table('categories')->insertGetId([
            'name' => 'Custom Suits',
            'slug' => 'custom-suits',
            'status' => 'ACTIVE',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $product = Product::create([
            'category_id' => $category,
            'name' => 'Custom Tailored Sari',
            'slug' => 'custom-tailored-sari',
            'sku' => 'CUSTOM-SARI-01',
            'return_policy_type' => 'NON_RETURNABLE',
        ]);

        $order = Order::create([
            'user_id' => $user->id,
            'order_number' => 'ORD-TEST-RET-02',
            'subtotal' => 2500.00,
            'shipping_amount' => 0.00,
            'tax_amount' => 0.00,
            'total_amount' => 2500.00,
            'payment_status' => 'PAID',
            'order_status' => 'DELIVERED',
            'shipping_address_snapshot' => ['city' => 'Mumbai'],
            'billing_address_snapshot' => ['city' => 'Mumbai'],
            'delivered_at' => now()->subDays(1),
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/customer/returns', [
            'order_id' => $order->id,
            'product_id' => $product->id,
            'reason' => 'Defective',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'This product is marked as non-returnable.');
    }
}
