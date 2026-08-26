<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Register a new customer user.
     */
    public function registerCustomer(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => strtolower($data['email']),
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
            'user_type' => 'CUSTOMER',
            'status' => 'ACTIVE',
        ]);

        $token = $user->createToken('customer_auth_token')->plainTextToken;

        // Dispatch Welcome Email Notification Job asynchronously
        try {
            \App\Jobs\SendEmailNotificationJob::dispatch(
                'welcome_email',
                $user->email,
                $user->name,
                ['customer_name' => $user->name, 'user' => $user->toArray()]
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("AuthService: Failed to queue welcome email for {$user->email}: " . $e->getMessage());
        }

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'user_type' => $user->user_type,
                'status' => $user->status,
            ],
            'token' => $token,
        ];
    }

    /**
     * Authenticate a user and issue a Bearer token.
     */
    public function login(string $email, string $password, ?string $device = 'web'): array
    {
        $user = User::where('email', strtolower($email))->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials provided.'],
            ]);
        }

        if ($user->status !== 'ACTIVE') {
            throw ValidationException::withMessages([
                'email' => ['Your account is currently ' . strtolower($user->status) . '. Please contact support.'],
            ]);
        }

        $tokenName = $user->user_type === 'ADMIN' ? 'admin_auth_token' : 'customer_auth_token';
        $token = $user->createToken($tokenName)->plainTextToken;

        if ($user->user_type === 'ADMIN') {
            AuditLogService::log('ADMIN_LOGIN', $user->id, 'User', (string)$user->id);
        }

        // Fetch roles if admin
        $roles = $user->roles()->pluck('name')->toArray();

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'user_type' => $user->user_type,
                'status' => $user->status,
                'roles' => $roles,
            ],
            'token' => $token,
        ];
    }

    /**
     * Logout current user and revoke token.
     */
    public function logout(User $user): void
    {
        if ($user->user_type === 'ADMIN') {
            AuditLogService::log('ADMIN_LOGOUT', $user->id, 'User', (string)$user->id);
        }

        $user->currentAccessToken()->delete();
    }

    /**
     * Authenticate or register customer via Google OAuth payload.
     */
    public function googleLogin(array $googlePayload, ?string $guestSessionId = null): array
    {
        $googleId = $googlePayload['sub'] ?? $googlePayload['id'] ?? null;
        $email = strtolower($googlePayload['email'] ?? '');
        $name = $googlePayload['name'] ?? 'Google Customer';
        $avatar = $googlePayload['picture'] ?? $googlePayload['avatar'] ?? null;
        $emailVerified = filter_var($googlePayload['email_verified'] ?? true, FILTER_VALIDATE_BOOLEAN);

        if (!$googleId || !$email) {
            throw ValidationException::withMessages([
                'email' => ['Google authentication response did not contain a valid email or ID.'],
            ]);
        }

        if (!$emailVerified) {
            throw ValidationException::withMessages([
                'email' => ['Your Google account email is not verified.'],
            ]);
        }

        // Find user by google_id or email
        $user = User::where('google_id', $googleId)
            ->orWhere('email', $email)
            ->first();

        if ($user) {
            // Link Google account if not linked
            if (empty($user->google_id)) {
                $user->google_id = $googleId;
            }
            if (empty($user->provider)) {
                $user->provider = 'google';
            }
            if (empty($user->avatar) && $avatar) {
                $user->avatar = $avatar;
            }
            if (empty($user->email_verified_at)) {
                $user->email_verified_at = now();
            }
            $user->save();
        } else {
            // Create new customer user
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make(\Illuminate\Support\Str::random(32)),
                'user_type' => 'CUSTOMER', // STRICTLY CUSTOMER
                'status' => 'ACTIVE',
                'google_id' => $googleId,
                'provider' => 'google',
                'avatar' => $avatar,
                'email_verified_at' => now(),
            ]);
        }

        if ($user->status !== 'ACTIVE') {
            throw ValidationException::withMessages([
                'email' => ['Your account is currently ' . strtolower($user->status) . '. Please contact support.'],
            ]);
        }

        // Issue customer auth token
        $token = $user->createToken('customer_auth_token')->plainTextToken;

        // Auto-merge guest cart if session ID provided
        if ($guestSessionId) {
            try {
                $cartService = app(CartService::class);
                $cartService->mergeCart($guestSessionId, $user);
            } catch (\Throwable $e) {
                // Ignore cart merge error so auth succeeds
            }
        }

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'user_type' => $user->user_type,
                'status' => $user->status,
                'google_id' => $user->google_id,
            ],
            'token' => $token,
        ];
    }
}
