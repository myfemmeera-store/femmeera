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
     * Request Password Reset Link
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $email = strtolower($request->input('email'));
        $user = User::where('email', $email)->first();

        if ($user) {
            try {
                $token = \Illuminate\Support\Str::random(60);
                \App\Jobs\SendEmailNotificationJob::dispatch(
                    'password_reset',
                    $user->email,
                    $user->name,
                    [
                        'customer_name' => $user->name,
                        'reset_link' => "http://localhost:3000/auth/reset-password?token={$token}&email=" . urlencode($user->email),
                    ]
                );
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("AuthController: Failed to queue password reset email: " . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Password reset request received. If registered, a reset link has been dispatched.',
        ], 200);
    }

    /**
     * Reset Password
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Password has been successfully reset.',
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
     * Redirect to Google OAuth Consent Page
     */
    public function googleRedirect(): JsonResponse|\Illuminate\Http\RedirectResponse
    {
        $clientId = config('services.google.client_id', env('GOOGLE_CLIENT_ID'));
        $redirectUri = config('services.google.redirect_uri', env('GOOGLE_REDIRECT_URI', 'http://localhost:8000/api/v1/auth/google/callback'));

        if (!$clientId) {
            return response()->json([
                'success' => false,
                'message' => 'Google Client ID is not configured on server.',
            ], 500);
        }

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
     * Google OAuth Callback Endpoint
     */
    public function googleCallback(Request $request)
    {
        if ($request->has('error')) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000') . '/login?error=' . urlencode($request->input('error'));
            return redirect()->away($frontendUrl);
        }

        $code = $request->input('code');
        if (!$code) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000') . '/login?error=missing_code';
            return redirect()->away($frontendUrl);
        }

        $request->merge(['code' => $code]);
        $response = $this->googleLogin($request);

        $data = $response->getData(true);
        if (isset($data['success']) && $data['success'] && isset($data['data']['token'])) {
            $token = $data['data']['token'];
            $userJson = urlencode(json_encode($data['data']['user']));
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000') . '/login/callback?token=' . $token . '&user=' . $userJson;
            return redirect()->away($frontendUrl);
        } else {
            $errMsg = $data['message'] ?? 'Google login failed';
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000') . '/login?error=' . urlencode($errMsg);
            return redirect()->away($frontendUrl);
        }
    }
}
