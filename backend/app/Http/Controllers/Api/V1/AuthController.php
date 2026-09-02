<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Customer Registration
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->registerCustomer($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Registration successful.',
            'data' => $result,
        ], 201);
    }

    /**
     * Login (Customer or Admin)
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->validated()['email'],
            $request->validated()['password']
        );

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'data' => $result,
        ], 200);
    }

    /**
     * Get Current Authenticated User details
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $roles = $user->roles()->pluck('name')->toArray();

        return response()->json([
            'success' => true,
            'message' => 'Authenticated user profile retrieved.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'user_type' => $user->user_type,
                    'status' => $user->status,
                    'roles' => $roles,
                    'email_verified' => !is_null($user->email_verified_at),
                ],
            ],
        ], 200);
    }

    /**
     * Logout User
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Logout successful.',
        ], 200);
    }

    /**
    /**
     * Request Password Reset Link
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower(trim($request->input('email')));
        $user = \App\Models\User::where('email', $email)->first();

        if ($user) {
            try {
                $token = \Illuminate\Support\Str::random(64);
                
                \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
                    ['email' => $email],
                    [
                        'token' => \Illuminate\Support\Facades\Hash::make($token),
                        'created_at' => now(),
                    ]
                );

                $frontendUrl = env('FRONTEND_URL', 'https://femmeera.com');
                $resetLink = "{$frontendUrl}/login/reset-password?token={$token}&email=" . urlencode($user->email);

                \App\Jobs\SendEmailNotificationJob::dispatch(
                    'password_reset',
                    $user->email,
                    $user->name,
                    [
                        'customer_name' => $user->name,
                        'reset_link' => $resetLink,
                        'email' => $user->email,
                    ]
                );
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("AuthController: Failed to queue password reset email: " . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'If your email is registered, a password reset link has been sent to your inbox.',
        ], 200);
    }

    /**
     * Reset Password and update database
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $email = strtolower(trim($request->input('email')));
        $token = $request->input('token');
        $newPassword = $request->input('password');

        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $email)->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired password reset link.',
            ], 422);
        }

        $isValidToken = \Illuminate\Support\Facades\Hash::check($token, $record->token) || $token === $record->token;

        if (!$isValidToken) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid password reset token.',
            ], 422);
        }

        if (\Carbon\Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'Password reset token has expired. Please request a new link.',
            ], 422);
        }

        $user = \App\Models\User::where('email', $email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User account not found.',
            ], 404);
        }

        $user->password = \Illuminate\Support\Facades\Hash::make($newPassword);
        $user->save();

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password has been successfully updated. You can now login with your new password.',
        ], 200);
    }

    /**
     * Verify Email Placeholder
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Email verification request processed.',
        ], 200);
    }

    /**
     * Google Sign-In / Sign-Up API Endpoint
     */
    public function googleLogin(Request $request): JsonResponse
    {
        $idToken = $request->input('id_token') ?: $request->input('credential');
        $code = $request->input('code');

        $googlePayload = null;

        if ($idToken) {
            // Verify ID Token directly with Google's official TokenInfo endpoint
            $googleResp = \Illuminate\Support\Facades\Http::get('https://oauth2.googleapis.com/tokeninfo', [
                'id_token' => $idToken,
            ]);

            if (!$googleResp->successful() || empty($googleResp->json('email'))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired Google credential.',
                ], 422);
            }

            $googlePayload = $googleResp->json();
        } elseif ($code) {
            $clientId = config('services.google.client_id', env('GOOGLE_CLIENT_ID'));
            $clientSecret = config('services.google.client_secret', env('GOOGLE_CLIENT_SECRET'));
            $redirectUri = config('services.google.redirect_uri', env('GOOGLE_REDIRECT_URI', 'http://localhost:8000/api/v1/auth/google/callback'));

            $tokenResp = \Illuminate\Support\Facades\Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'redirect_uri' => $redirectUri,
                'grant_type' => 'authorization_code',
                'code' => $code,
            ]);

            if (!$tokenResp->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to exchange Google authorization code.',
                ], 422);
            }

            $idTokenFromCode = $tokenResp->json('id_token');
            if ($idTokenFromCode) {
                $googleResp = \Illuminate\Support\Facades\Http::get('https://oauth2.googleapis.com/tokeninfo', [
                    'id_token' => $idTokenFromCode,
                ]);
                $googlePayload = $googleResp->json();
            } else {
                $userResp = \Illuminate\Support\Facades\Http::withToken($tokenResp->json('access_token'))
                    ->get('https://www.googleapis.com/oauth2/v3/userinfo');
                $googlePayload = $userResp->json();
            }
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Missing Google credential or authorization code.',
            ], 422);
        }

        try {
            $guestSessionId = $request->header('X-Guest-Session-ID') ?: $request->input('guest_session_id');
            $result = $this->authService->googleLogin($googlePayload, $guestSessionId);

            return response()->json([
                'success' => true,
                'message' => 'Google login successful.',
                'data' => $result,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first() ?: 'Google authentication failed.',
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Google authentication failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Redirect to Google OAuth Consent Page via Laravel Socialite with direct fallback
     */
    public function googleRedirect(): JsonResponse|\Symfony\Component\HttpFoundation\RedirectResponse
    {
        try {
            return \Laravel\Socialite\Facades\Socialite::driver('google')
                ->stateless()
                ->redirect();
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("AuthController googleRedirect: Socialite failed ({$e->getMessage()}), using direct OAuth redirect.");
        }

        // Direct Google OAuth URL fallback
        $clientId = config('services.google.client_id') ?: env('GOOGLE_CLIENT_ID', '1042125952884-m68nnefo4hc8nqknodjppd4d609flabb.apps.googleusercontent.com');
        $redirectUri = config('services.google.redirect') ?: env('GOOGLE_REDIRECT_URI', 'https://femmeera.com/auth/google/callback');

        $url = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'access_type' => 'online',
            'prompt' => 'select_account',
        ]);

        return redirect()->away($url);
    }

    /**
     * Google OAuth Callback Endpoint via Laravel Socialite
     */
    public function googleCallback(Request $request)
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'https://femmeera.com'), '/');

        if ($request->has('error')) {
            $errorReason = $request->input('error_description') ?: $request->input('error');
            return redirect()->away("{$frontendUrl}/login?error=" . urlencode($errorReason));
        }

        try {
            $googleUser = \Laravel\Socialite\Facades\Socialite::driver('google')->stateless()->user();

            $googlePayload = [
                'id' => $googleUser->getId(),
                'sub' => $googleUser->getId(),
                'email' => $googleUser->getEmail(),
                'name' => $googleUser->getName() ?: 'Google Customer',
                'picture' => $googleUser->getAvatar(),
                'avatar' => $googleUser->getAvatar(),
                'email_verified' => true,
            ];

            $guestSessionId = $request->header('X-Guest-Session-ID') ?: $request->input('guest_session_id');
            $result = $this->authService->googleLogin($googlePayload, $guestSessionId);

            $token = $result['token'];
            $userJson = urlencode(json_encode($result['user']));

            return redirect()->away("{$frontendUrl}/auth/google/callback?token={$token}&user={$userJson}");
        } catch (\Throwable $e) {
            // Fallback for code parameter exchange if direct Socialite code exchange hit state/network mismatch
            if ($request->has('code')) {
                $response = $this->googleLogin($request);
                $data = $response->getData(true);

                if (!empty($data['success']) && !empty($data['data']['token'])) {
                    $token = $data['data']['token'];
                    $userJson = urlencode(json_encode($data['data']['user']));
                    return redirect()->away("{$frontendUrl}/auth/google/callback?token={$token}&user={$userJson}");
                }
            }

            return redirect()->away("{$frontendUrl}/login?error=" . urlencode('Google authentication failed: ' . $e->getMessage()));
        }
    }
}
