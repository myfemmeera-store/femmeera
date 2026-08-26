<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategoryAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = DB::table('categories')->orderBy('sort_order', 'asc')->get();

        $formatted = $categories->map(function ($c) {
            $c->image_display_url = !empty($c->image_url)
                ? (str_starts_with($c->image_url, 'http') ? $c->image_url : asset('storage/' . ltrim($c->image_url, '/')))
                : null;
            return $c;
        });

        return response()->json([
            'success' => true,
            'data' => $formatted,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug',
            'parent_id' => 'nullable|integer|exists:categories,id',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'status' => 'required|in:ACTIVE,DISABLED',
        ]);

        $slug = $request->filled('slug') ? Str::slug($request->input('slug')) : Str::slug($request->input('name'));

        $id = DB::table('categories')->insertGetId([
            'parent_id' => $request->input('parent_id'),
            'name' => $request->input('name'),
            'slug' => $slug,
            'description' => $request->input('description'),
            'image_url' => $request->input('image_url'),
            'status' => $request->input('status', 'ACTIVE'),
            'sort_order' => $request->input('sort_order', 1),
            'seo_title' => $request->input('seo_title'),
            'seo_description' => $request->input('seo_description'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully.',
            'data' => DB::table('categories')->where('id', $id)->first(),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $category = DB::table('categories')->where('id', $id)->first();
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Category not found.'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug,' . $id,
            'parent_id' => 'nullable|integer|exists:categories,id',
        ]);

        $data = $request->only(['name', 'parent_id', 'description', 'image_url', 'status', 'sort_order', 'seo_title', 'seo_description']);
        if ($request->filled('slug')) {
            $data['slug'] = Str::slug($request->input('slug'));
        }
        $data['updated_at'] = now();

        DB::table('categories')->where('id', $id)->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully.',
            'data' => DB::table('categories')->where('id', $id)->first(),
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        DB::table('categories')->where('id', $id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully.',
        ], 200);
    }
}
