<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AdminUserService
{
    /**
     * Get paginated admin users with roles.
     */
    public function getAdminUsers(): Collection
    {
        return User::where('user_type', 'ADMIN')
            ->with('roles')
            ->orderBy('id', 'desc')
            ->get();
    }

    /**
     * Create a new Admin user with role.
     */
    public function createAdminUser(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => strtolower($data['email']),
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($data['password']),
                'user_type' => 'ADMIN',
                'status' => 'ACTIVE',
            ]);

            $role = Role::where('name', $data['role_name'])->firstOrFail();
            $user->roles()->attach($role->id);

            AuditLogService::log(
                'ADMIN_USER_CREATED',
                auth()->id(),
                'User',
                (string)$user->id,
                null,
                ['name' => $user->name, 'email' => $user->email, 'role' => $role->name]
            );

            return $user->load('roles');
        });
    }

    /**
     * Update an Admin user details, status, or role.
     */
    public function updateAdminUser(int $id, array $data): User
    {
        $user = User::where('user_type', 'ADMIN')->findOrFail($id);

        // Safeguard: Do not allow disabling or removing SUPER_ADMIN if it's the last super admin
        if ($user->hasRole('SUPER_ADMIN') && isset($data['status']) && $data['status'] !== 'ACTIVE') {
            $superAdminCount = DB::table('role_user')
                ->join('roles', 'role_user.role_id', '=', 'roles.id')
                ->where('roles.name', 'SUPER_ADMIN')
                ->count();

            if ($superAdminCount <= 1) {
                throw new HttpException(400, 'Cannot disable the primary SUPER_ADMIN account.');
            }
        }

        return DB::transaction(function () use ($user, $data) {
            $oldValues = $user->only(['name', 'email', 'phone', 'status']);
            
            if (isset($data['name'])) $user->name = $data['name'];
            if (isset($data['email'])) $user->email = strtolower($data['email']);
            if (isset($data['phone'])) $user->phone = $data['phone'];
            if (isset($data['status'])) $user->status = $data['status'];
            if (isset($data['password']) && !empty($data['password'])) {
                $user->password = Hash::make($data['password']);
            }

            $user->save();

            if (isset($data['role_name'])) {
                $newRole = Role::where('name', $data['role_name'])->firstOrFail();
                $oldRoles = $user->roles()->pluck('name')->toArray();
                $user->roles()->sync([$newRole->id]);

                AuditLogService::log(
                    'ADMIN_ROLE_CHANGED',
                    auth()->id(),
                    'User',
                    (string)$user->id,
                    ['roles' => $oldRoles],
                    ['roles' => [$newRole->name]]
                );
            }

            AuditLogService::log(
                'ADMIN_USER_UPDATED',
                auth()->id(),
                'User',
                (string)$user->id,
                $oldValues,
                $user->only(['name', 'email', 'phone', 'status'])
            );

            return $user->load('roles');
        });
    }

    /**
     * Disable/Archive an Admin user.
     */
    public function deleteAdminUser(int $id): void
    {
        $user = User::where('user_type', 'ADMIN')->findOrFail($id);

        if ($user->id === auth()->id()) {
            throw new HttpException(400, 'You cannot delete your own admin account.');
        }

        if ($user->hasRole('SUPER_ADMIN')) {
            throw new HttpException(400, 'Cannot delete a SUPER_ADMIN user.');
        }

        $user->status = 'SUSPENDED';
        $user->save();

        AuditLogService::log('ADMIN_USER_DISABLED', auth()->id(), 'User', (string)$user->id);
    }
}
