<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated access.',
            ], 401);
        }

        // Fetch user roles
        $roles = DB::table('role_user')
            ->join('roles', 'role_user.role_id', '=', 'roles.id')
            ->where('role_user.user_id', $user->id)
            ->pluck('roles.name')
            ->toArray();

        // SUPER_ADMIN bypasses all permission checks
        if (in_array('SUPER_ADMIN', $roles)) {
            return $next($request);
        }

        // Check if any assigned role possesses the required permission
        $hasPermission = DB::table('role_user')
            ->join('permission_role', 'role_user.role_id', '=', 'permission_role.role_id')
            ->join('permissions', 'permission_role.permission_id', '=', 'permissions.id')
            ->where('role_user.user_id', $user->id)
            ->where('permissions.name', $permission)
            ->exists();

        if (!$hasPermission) {
            return response()->json([
                'success' => false,
                'message' => "Forbidden. Missing required permission: {$permission}.",
            ], 403);
        }

        return $next($request);
    }
}
