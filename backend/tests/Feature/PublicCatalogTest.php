<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicCatalogTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;
    public function test_public_can_fetch_categories_without_auth(): void
    {
        Category::firstOrCreate(
            ['slug' => 'public-test-cat'],
            ['name' => 'Public Test Cat', 'status' => 'ACTIVE', 'sort_order' => 1]
        );

        $response = $this->getJson('/api/v1/categories');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $this->assertNotEmpty($response->json('data'));
    }

    public function test_public_can_fetch_products_without_auth(): void
    {
        $category = Category::firstOrCreate(
            ['slug' => 'public-prod-cat'],
            ['name' => 'Public Prod Cat', 'status' => 'ACTIVE', 'sort_order' => 1]
        );

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Public Silk Saree ' . uniqid(),
            'slug' => 'public-silk-saree-' . uniqid(),
            'sku' => 'PUB-SAREE-' . uniqid(),
            'brand' => 'Femmeera',
            'gender' => 'WOMEN',
            'status' => 'ACTIVE',
        ]);

        $response = $this->getJson('/api/v1/products');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $this->assertNotEmpty($response->json('data'));

        $singleRes = $this->getJson("/api/v1/products/{$product->slug}");
        $singleRes->assertStatus(200);
        $singleRes->assertJsonPath('data.slug', $product->slug);
    }
}
