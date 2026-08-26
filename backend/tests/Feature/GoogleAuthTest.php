<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_google_login_creates_new_customer_account(): void
    {
        Http::fake([
            'https://oauth2.googleapis.com/tokeninfo*' => Http::response([
                'sub' => 'google-user-123456',
                'email' => 'newgoogleuser@example.com',
                'name' => 'Ananya Google',
                'picture' => 'https://lh3.googleusercontent.com/avatar.jpg',
                'email_verified' => 'true',
            ], 200),
        ]);

        $response = $this->postJson('/api/v1/auth/google', [
            'id_token' => 'mock_google_id_token_123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'newgoogleuser@example.com')
            ->assertJsonPath('data.user.user_type', 'CUSTOMER');

        $this->assertDatabaseHas('users', [
            'email' => 'newgoogleuser@example.com',
            'google_id' => 'google-user-123456',
            'user_type' => 'CUSTOMER',
        ]);
    }

    public function test_google_login_links_existing_email_account(): void
    {
        $existingUser = User::factory()->create([
            'email' => 'existingcustomer@example.com',
            'google_id' => null,
            'user_type' => 'CUSTOMER',
        ]);

        Http::fake([
            'https://oauth2.googleapis.com/tokeninfo*' => Http::response([
                'sub' => 'google-user-999888',
                'email' => 'existingcustomer@example.com',
                'name' => 'Existing Customer',
                'picture' => 'https://lh3.googleusercontent.com/avatar2.jpg',
                'email_verified' => 'true',
            ], 200),
        ]);

        $response = $this->postJson('/api/v1/auth/google', [
            'id_token' => 'mock_id_token_linking',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.id', $existingUser->id);

        $this->assertDatabaseHas('users', [
            'id' => $existingUser->id,
            'google_id' => 'google-user-999888',
        ]);
    }

    public function test_google_login_rejects_invalid_token(): void
    {
        Http::fake([
            'https://oauth2.googleapis.com/tokeninfo*' => Http::response([
                'error_description' => 'Invalid Value',
            ], 400),
        ]);

        $response = $this->postJson('/api/v1/auth/google', [
            'id_token' => 'invalid_token_xyz',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }
}
