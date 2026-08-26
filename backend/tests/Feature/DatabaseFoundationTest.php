<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DatabaseFoundationTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    /**
     * Test API v1 health endpoint works.
     */
    public function test_api_v1_health_check(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'version' => '1.0.0'
            ]);
    }

    /**
     * Test core database tables exist and seeders executed.
     */
    public function test_core_tables_and_roles_exist(): void
    {
        $rolesCount = DB::table('roles')->count();
        $this->assertGreaterThanOrEqual(6, $rolesCount);

        $superAdminRole = DB::table('roles')->where('name', 'SUPER_ADMIN')->first();
        $this->assertNotNull($superAdminRole);

        $superAdminUser = DB::table('users')->where('email', 'admin@femmeera.com')->first();
        $this->assertNotNull($superAdminUser);
    }

    /**
     * Test category hierarchy (Women -> Traditional Wear & Western Wear).
     */
    public function test_category_hierarchy_resolution(): void
    {
        $womenRoot = DB::table('categories')->where('slug', 'women')->first();
        $this->assertNotNull($womenRoot);
        $this->assertNull($womenRoot->parent_id);

        $children = DB::table('categories')->where('parent_id', $womenRoot->id)->get();
        $this->assertCount(2, $children);

        $slugs = $children->pluck('slug')->toArray();
        $this->assertContains('traditional-wear', $slugs);
        $this->assertContains('western-wear', $slugs);
    }

    /**
     * Test product to variant and inventory relationships.
     */
    public function test_product_variant_inventory_relationships(): void
    {
        $product = DB::table('products')->first();
        $this->assertNotNull($product);

        $variants = DB::table('product_variants')->where('product_id', $product->id)->get();
        $this->assertGreaterThanOrEqual(1, count($variants));

        foreach ($variants as $variant) {
            $inventory = DB::table('inventory')->where('variant_id', $variant->id)->first();
            $this->assertNotNull($inventory);
            $this->assertEquals($variant->stock, $inventory->available_quantity);

            $tx = DB::table('inventory_transactions')->where('variant_id', $variant->id)->first();
            $this->assertNotNull($tx);
            $this->assertEquals('PURCHASE', $tx->type);
        }
    }
}
