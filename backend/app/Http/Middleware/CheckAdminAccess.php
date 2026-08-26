<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated access.',
            ], 401);
        }

        if ($user->user_type !== 'ADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Customer accounts cannot access administrative endpoints.',
            ], 403);
        }

        if ($user->status !== 'ACTIVE') {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Your admin account is suspended or inactive.',
            ], 403);
        }

        return $next($request);
    }
}
