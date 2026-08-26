<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class Phase2AuthRbacTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;
    /**
     * Test Customer Registration.
     */
    public function test_customer_can_register(): void
    {
        $email = 'ananya_' . uniqid() . '@example.com';
        $payload = [
            'name' => 'Ananya Sharma',
            'email' => $email,
            'phone' => '98' . rand(10000000, 99999999),
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ];

        $response = $this->postJson('/api/v1/auth/register', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Registration successful.',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => $email,
            'user_type' => 'CUSTOMER',
            'status' => 'ACTIVE',
        ]);
    }

    /**
     * Test Customer Login and token generation.
     */
    public function test_customer_can_login_and_fetch_me(): void
    {
        $email = 'riya_' . uniqid() . '@example.com';
        $user = User::create([
            'name' => 'Riya Patel',
            'email' => $email,
            'password' => Hash::make('Secret123!'),
            'user_type' => 'CUSTOMER',
            'status' => 'ACTIVE',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $email,
            'password' => 'Secret123!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['user', 'token'],
            ]);

        $token = $response->json('data.token');

        $meResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me');

        $meResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'email' => $email,
                        'user_type' => 'CUSTOMER',
                    ]
                ]
            ]);
    }

    /**
     * Test Invalid Credentials rejection.
     */
    public function test_invalid_login_credentials_rejected(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nonexistent_' . uniqid() . '@example.com',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validation failed.',
            ]);
    }

    /**
     * Test Customer accessing Admin API returns 403 Forbidden.
     */
    public function test_customer_cannot_access_admin_api(): void
    {
        $customer = User::create([
            'name' => 'Test Customer',
            'email' => 'customer_' . uniqid() . '@example.com',
            'password' => Hash::make('Password123!'),
            'user_type' => 'CUSTOMER',
            'status' => 'ACTIVE',
        ]);

        $token = $customer->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * Test Product Manager permissions (Allowed on products, 403 on inventory).
     */
    public function test_product_manager_permissions(): void
    {
        $pm = User::create([
            'name' => 'Priya Product Manager',
            'email' => 'pm_' . uniqid() . '@femmeera.com',
            'password' => Hash::make('Password123!'),
            'user_type' => 'ADMIN',
            'status' => 'ACTIVE',
        ]);

        $pmRole = Role::where('name', 'PRODUCT_MANAGER')->first();
        $pm->roles()->attach($pmRole->id);

        $token = $pm->createToken('pm_token')->plainTextToken;

        // Allowed: GET /admin/products
        $prodResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/products');
        $prodResponse->assertStatus(200);

        // Forbidden: GET /admin/inventory
        $invResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/inventory');
        $invResponse->assertStatus(403);
    }

    /**
     * Test Inventory Manager permissions (Allowed on inventory, 403 on products).
     */
    public function test_inventory_manager_permissions(): void
    {
        $im = User::create([
            'name' => 'Irfan Inventory Manager',
            'email' => 'im_' . uniqid() . '@femmeera.com',
            'password' => Hash::make('Password123!'),
            'user_type' => 'ADMIN',
            'status' => 'ACTIVE',
        ]);

        $imRole = Role::where('name', 'INVENTORY_MANAGER')->first();
        $im->roles()->attach($imRole->id);

        $token = $im->createToken('im_token')->plainTextToken;

        // Allowed: GET /admin/inventory
        $invResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/inventory');
        $invResponse->assertStatus(200);

        // Forbidden: GET /admin/products
        $prodResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/products');
        $prodResponse->assertStatus(403);
    }

    /**
     * Test Order Manager permissions.
     */
    public function test_order_manager_permissions(): void
    {
        $om = User::create([
            'name' => 'Omkar Order Manager',
            'email' => 'om_' . uniqid() . '@femmeera.com',
            'password' => Hash::make('Password123!'),
            'user_type' => 'ADMIN',
            'status' => 'ACTIVE',
        ]);

        $omRole = Role::where('name', 'ORDER_MANAGER')->first();
        $om->roles()->attach($omRole->id);

        $token = $om->createToken('om_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/orders');
        $response->assertStatus(200);
    }

    /**
     * Test Marketing Manager permissions (Allowed on coupons & homepage).
     */
    public function test_marketing_manager_permissions(): void
    {
        $mm = User::create([
            'name' => 'Meera Marketing Manager',
            'email' => 'mm_' . uniqid() . '@femmeera.com',
            'password' => Hash::make('Password123!'),
            'user_type' => 'ADMIN',
            'status' => 'ACTIVE',
        ]);

        $mmRole = Role::where('name', 'MARKETING_MANAGER')->first();
        $mm->roles()->attach($mmRole->id);

        $token = $mm->createToken('mm_token')->plainTextToken;

        $couponResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/coupons');
        $couponResponse->assertStatus(200);

        $hpResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/homepage');
        $hpResponse->assertStatus(200);
    }

    /**
     * Test Super Admin managing admin users and audit logging.
     */
    public function test_super_admin_user_management_and_audit_logging(): void
    {
        $superAdmin = User::where('email', 'admin@femmeera.com')->first();
        $token = $superAdmin->createToken('super_token')->plainTextToken;
        $newEmail = 'lead_' . uniqid() . '@femmeera.com';

        // 1. Create a new Admin user via POST /admin/users
        $createResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/admin/users', [
                'name' => 'New Product Lead',
                'email' => $newEmail,
                'password' => 'SecurePass123!',
                'role_name' => 'PRODUCT_MANAGER',
            ]);

        $createResponse->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'email' => $newEmail,
                ]
            ]);

        // 2. Verify audit log entry for ADMIN_USER_CREATED
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'ADMIN_USER_CREATED',
            'user_id' => $superAdmin->id,
        ]);
    }
}
