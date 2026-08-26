<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminUserStoreRequest;
use App\Http\Requests\Admin\AdminUserUpdateRequest;
use App\Services\AdminUserService;
use Illuminate\Http\JsonResponse;

class AdminUserController extends Controller
{
    protected AdminUserService $adminUserService;

    public function __construct(AdminUserService $adminUserService)
    {
        $this->adminUserService = $adminUserService;
    }

    public function index(): JsonResponse
    {
        $users = $this->adminUserService->getAdminUsers();

        return response()->json([
            'success' => true,
            'message' => 'Admin users retrieved.',
            'data' => $users,
        ], 200);
    }

    public function store(AdminUserStoreRequest $request): JsonResponse
    {
        $user = $this->adminUserService->createAdminUser($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Admin user created successfully.',
            'data' => $user,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $users = $this->adminUserService->getAdminUsers();
        $user = $users->where('id', $id)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Admin user not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Admin user details retrieved.',
            'data' => $user,
        ], 200);
    }

    public function update(AdminUserUpdateRequest $request, int $id): JsonResponse
    {
        $user = $this->adminUserService->updateAdminUser($id, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Admin user updated successfully.',
            'data' => $user,
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->adminUserService->deleteAdminUser($id);

        return response()->json([
            'success' => true,
            'message' => 'Admin user disabled successfully.',
        ], 200);
    }
}
