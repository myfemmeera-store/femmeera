<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'variants', 'images']);

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('sku', 'like', "%{$s}%")
                    ->orWhere('slug', 'like', "%{$s}%");
            });
        }

        if ($request->filled('category_slug')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->input('category_slug'));
            });
        }

        $products = $query->orderBy('id', 'desc')->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Products list retrieved.',
            'data' => $products->items(),
            'meta' => [
                'pagination' => [
                    'total' => $products->total(),
                    'per_page' => $products->perPage(),
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                ]
            ]
        ], 200);
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::with(['category', 'variants.inventory', 'images'])->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $product,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku',
            'brand' => 'nullable|string|max:100',
            'gender' => 'required|in:WOMEN,MEN,UNISEX',
            'status' => 'required|in:ACTIVE,INACTIVE,ARCHIVED',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'images' => 'nullable|array',
            'variants' => 'nullable|array',
        ]);

        $product = Product::create([
            'category_id' => $request->input('category_id'),
            'name' => $request->input('name'),
            'slug' => Str::slug($request->input('name')) . '-' . Str::random(5),
            'sku' => $request->input('sku'),
            'brand' => $request->input('brand', 'Femmeera'),
            'gender' => $request->input('gender', 'WOMEN'),
            'status' => $request->input('status', 'ACTIVE'),
            'description' => $request->input('description'),
            'short_description' => $request->input('short_description'),
        ]);

        // Attach variants if provided
        if ($request->has('variants') && is_array($request->input('variants'))) {
            foreach ($request->input('variants') as $v) {
                $varSku = !empty($v['sku']) ? $v['sku'] : ($product->sku . '-' . Str::slug($v['color'] ?? 'MULTI') . '-' . strtoupper($v['size'] ?? 'FREE') . '-' . Str::random(3));
                $variant = ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $varSku,
                    'size' => $v['size'] ?? 'Free Size',
                    'color' => $v['color'] ?? 'Multicolor',
                    'color_code' => $v['color_code'] ?? null,
                    'mrp' => $v['mrp'] ?? 1999,
                    'price' => $v['price'] ?? 1499,
                    'stock' => $v['stock'] ?? 10,
                    'low_stock_threshold' => $v['low_stock_threshold'] ?? 5,
                    'status' => 'ACTIVE',
                ]);

                Inventory::create([
                    'variant_id' => $variant->id,
                    'available_quantity' => $v['stock'] ?? 10,
                    'reserved_quantity' => 0,
                    'low_stock_threshold' => 5,
                ]);
            }
        }

        // Attach uploaded images if provided (supports strings or objects with image_url and color_name)
        if ($request->has('images') && is_array($request->input('images'))) {
            foreach ($request->input('images') as $idx => $img) {
                $imgUrl = is_array($img) ? ($img['image_url'] ?? null) : $img;
                $colorName = is_array($img) ? ($img['color_name'] ?? null) : null;

                if (!empty($imgUrl)) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'color_name' => $colorName,
                        'image_url' => $imgUrl,
                        'is_primary' => $idx === 0 ? 1 : 0,
                        'sort_order' => $idx + 1,
                    ]);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully.',
            'data' => $product->load(['variants', 'images']),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku,' . $id,
            'brand' => 'nullable|string|max:100',
            'gender' => 'required|in:WOMEN,MEN,UNISEX',
            'status' => 'required|in:ACTIVE,INACTIVE,ARCHIVED',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
        ]);

        $product->update([
            'category_id' => $request->input('category_id', $product->category_id),
            'name' => $request->input('name'),
            'sku' => $request->input('sku'),
            'brand' => $request->input('brand', $product->brand),
            'gender' => $request->input('gender', $product->gender),
            'status' => $request->input('status', $product->status),
            'description' => $request->input('description'),
            'short_description' => $request->input('short_description'),
        ]);

        // If variants array supplied, sync variants
        if ($request->has('variants') && is_array($request->input('variants'))) {
            $oldVariantIds = ProductVariant::where('product_id', $product->id)->pluck('id');
            Inventory::whereIn('variant_id', $oldVariantIds)->delete();
            ProductVariant::where('product_id', $product->id)->delete();

            foreach ($request->input('variants') as $v) {
                $varSku = !empty($v['sku']) ? $v['sku'] : ($product->sku . '-' . Str::slug($v['color'] ?? 'MULTI') . '-' . strtoupper($v['size'] ?? 'FREE') . '-' . Str::random(3));
                $variant = ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $varSku,
                    'size' => $v['size'] ?? 'Free Size',
                    'color' => $v['color'] ?? 'Multicolor',
                    'color_code' => $v['color_code'] ?? null,
                    'mrp' => $v['mrp'] ?? 1999,
                    'price' => $v['price'] ?? 1499,
                    'stock' => $v['stock'] ?? 10,
                    'low_stock_threshold' => $v['low_stock_threshold'] ?? 5,
                    'status' => 'ACTIVE',
                ]);

                Inventory::create([
                    'variant_id' => $variant->id,
                    'available_quantity' => $v['stock'] ?? 10,
                    'reserved_quantity' => 0,
                    'low_stock_threshold' => 5,
                ]);
            }
        }

        // If images array supplied, sync images
        if ($request->has('images') && is_array($request->input('images'))) {
            ProductImage::where('product_id', $product->id)->delete();
            foreach ($request->input('images') as $idx => $img) {
                $imgUrl = is_array($img) ? ($img['image_url'] ?? null) : $img;
                $colorName = is_array($img) ? ($img['color_name'] ?? null) : null;

                if (!empty($imgUrl)) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'color_name' => $colorName,
                        'image_url' => $imgUrl,
                        'is_primary' => $idx === 0 ? 1 : 0,
                        'sort_order' => $idx + 1,
                    ]);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully.',
            'data' => $product->load(['variants', 'images']),
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully.',
        ], 200);
    }

    /**
     * Matrix Variant Generator.
     */
    public function generateVariants(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'colors' => 'required|array|min:1',
            'colors.*' => 'required|string',
            'sizes' => 'required|array|min:1',
            'sizes.*' => 'required|string',
            'base_price' => 'required|numeric|min:0',
            'base_mrp' => 'required|numeric|min:0',
            'base_stock' => 'required|integer|min:0',
        ]);

        $product = Product::findOrFail($id);
        $colors = $request->input('colors');
        $sizes = $request->input('sizes');
        $basePrice = $request->input('base_price');
        $baseMrp = $request->input('base_mrp');
        $baseStock = $request->input('base_stock');

        $createdVariants = [];

        DB::transaction(function () use ($product, $colors, $sizes, $basePrice, $baseMrp, $baseStock, &$createdVariants) {
            foreach ($colors as $color) {
                foreach ($sizes as $size) {
                    $colorClean = trim($color);
                    $sizeClean = trim($size);

                    $exists = ProductVariant::where('product_id', $product->id)
                        ->where('size', $sizeClean)
                        ->where('color', $colorClean)
                        ->exists();

                    if (!$exists) {
                        $sku = strtoupper(Str::slug($product->sku . '-' . $colorClean . '-' . $sizeClean));

                        $variant = ProductVariant::create([
                            'product_id' => $product->id,
                            'sku' => $sku,
                            'size' => $sizeClean,
                            'color' => $colorClean,
                            'price' => $basePrice,
                            'mrp' => $baseMrp,
                            'stock' => $baseStock,
                            'status' => 'ACTIVE',
                        ]);

                        Inventory::create([
                            'variant_id' => $variant->id,
                            'available_quantity' => $baseStock,
                            'reserved_quantity' => 0,
                            'low_stock_threshold' => 5,
                        ]);

                        $createdVariants[] = $variant;
                    }
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => count($createdVariants) . ' variants generated successfully.',
            'data' => $product->fresh()->load('variants'),
        ], 200);
    }

    public function updateVariant(Request $request, int $id, int $variantId): JsonResponse
    {
        $variant = ProductVariant::where('product_id', $id)->where('id', $variantId)->firstOrFail();

        $request->validate([
            'price' => 'nullable|numeric|min:0',
            'mrp' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'sku' => 'nullable|string',
            'size' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        if ($request->filled('size') || $request->filled('color')) {
            $newSize = $request->input('size', $variant->size);
            $newColor = $request->input('color', $variant->color);

            $duplicateExists = ProductVariant::where('product_id', $id)
                ->where('size', $newSize)
                ->where('color', $newColor)
                ->where('id', '!=', $variantId)
                ->exists();

            if ($duplicateExists) {
                return response()->json([
                    'success' => false,
                    'message' => "A variant with size '{$newSize}' and color '{$newColor}' already exists for this product.",
                ], 422);
            }
        }

        $variant->update($request->only(['sku', 'size', 'color', 'color_code', 'price', 'mrp', 'stock', 'status']));

        if ($request->has('stock')) {
            Inventory::where('variant_id', $variant->id)->update([
                'available_quantity' => $request->input('stock'),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Variant updated successfully.',
            'data' => $variant->fresh(),
        ], 200);
    }

    public function destroyVariant(int $id, int $variantId): JsonResponse
    {
        $variant = ProductVariant::where('product_id', $id)->where('id', $variantId)->firstOrFail();
        $variant->delete();

        return response()->json([
            'success' => true,
            'message' => 'Variant deleted successfully.',
        ], 200);
    }
}
