<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WatchAndShopTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_can_fetch_public_watch_and_shop_reels(): void
    {
        $response = $this->getJson('/api/v1/cms/watch-and-shop');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertIsArray($response->json('data'));
        $this->assertNotEmpty($response->json('data'));
    }

    public function test_admin_can_create_and_manage_reels(): void
    {
        $admin = \App\Models\User::where('email', 'admin@femmeera.com')->first();

        // Create
        $createRes = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/watch-and-shop', [
                'title' => 'Test 9:16 Festive Reel',
                'video_url' => 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-red-dress-41334-large.mp4',
                'poster_url' => 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
                'product_url' => '/product/embroidered-silk-lehenga-set',
                'button_text' => 'View Product',
                'sort_order' => 1,
                'status' => 'ACTIVE',
            ]);

        $createRes->assertStatus(201)
            ->assertJson(['success' => true]);

        $reelId = $createRes->json('data.id');

        // Update
        $updateRes = $this->actingAs($admin, 'sanctum')
            ->putJson('/api/v1/admin/watch-and-shop/' . $reelId, [
                'title' => 'Updated 9:16 Festive Reel',
                'video_url' => 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-red-dress-41334-large.mp4',
                'poster_url' => 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
                'product_url' => '/product/embroidered-silk-lehenga-set',
                'button_text' => 'View Item',
                'sort_order' => 2,
                'status' => 'ACTIVE',
            ]);

        $updateRes->assertStatus(200)
            ->assertJson(['success' => true]);

        // Delete
        $deleteRes = $this->actingAs($admin, 'sanctum')
            ->deleteJson('/api/v1/admin/watch-and-shop/' . $reelId);

        $deleteRes->assertStatus(200)
            ->assertJson(['success' => true]);
    }
}
