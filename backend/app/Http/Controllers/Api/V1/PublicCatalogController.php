<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicCatalogController extends Controller
{
    /**
     * GET /api/v1/categories
     * Public active categories for customer storefront.
     */
    public function categories(): JsonResponse
    {
        $categories = Category::where('status', 'ACTIVE')
            ->orderBy('sort_order', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Active categories retrieved.',
            'data' => $categories,
        ], 200);
    }

    /**
     * GET /api/v1/products
     * Public active products with search, category filtering, and variants for customer storefront.
     */
    public function products(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'variants.inventory', 'images'])
            ->where('status', 'ACTIVE');

        // Category Filter
        if ($request->filled('category_slug')) {
          $catSlug = $request->input('category_slug');
          $category = Category::where('slug', $catSlug)->first();

          if ($category) {
              $childIds = Category::where('parent_id', $category->id)->pluck('id')->toArray();
              $catIds = array_merge([$category->id], $childIds);
              $query->whereIn('category_id', $catIds);
          }
        }

        // Gender Filter
        if ($request->filled('gender')) {
            $query->where('gender', strtoupper($request->input('gender')));
        }

        // Search Filter
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%")
                  ->orWhere('brand', 'LIKE', "%{$search}%")
                  ->orWhere('sku', 'LIKE', "%{$search}%")
                  ->orWhereHas('category', function ($catQuery) use ($search) {
                      $catQuery->where('name', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Price Filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float)$request->input('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float)$request->input('max_price'));
        }

        // Sorting
        $sort = $request->input('sort', 'newest');
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'best_seller':
                $query->orderBy('is_best_seller', 'desc')->orderBy('id', 'desc');
                break;
            case 'featured':
                $query->orderBy('is_featured', 'desc')->orderBy('id', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('id', 'desc');
                break;
        }

        $perPage = (int)$request->input('per_page', 12);
        $products = $query->paginate($perPage);

        // Related / Recommendation Products fallback if search/filter returns 0 results
        $relatedProducts = [];
        if ($products->total() === 0) {
            $relatedProducts = Product::with(['category', 'variants.inventory', 'images'])
                ->where('status', 'ACTIVE')
                ->where('is_featured', true)
                ->orderBy('id', 'desc')
                ->limit(8)
                ->get();

            if ($relatedProducts->isEmpty()) {
                $relatedProducts = Product::with(['category', 'variants.inventory', 'images'])
                    ->where('status', 'ACTIVE')
                    ->orderBy('id', 'desc')
                    ->limit(8)
                    ->get();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Active products retrieved.',
            'data' => $products->items(),
            'related_products' => $relatedProducts,
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

    /**
     * GET /api/v1/products/suggestions?q=...
     * Live search autocomplete suggestions API endpoint.
     */
    public function searchSuggestions(Request $request): JsonResponse
    {
        $search = trim($request->input('q', ''));
        if (strlen($search) < 1) {
            return response()->json(['success' => true, 'data' => []], 200);
        }

        $products = Product::with(['category', 'images', 'variants'])
            ->where('status', 'ACTIVE')
            ->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('brand', 'LIKE', "%{$search}%")
                  ->orWhere('sku', 'LIKE', "%{$search}%")
                  ->orWhereHas('category', function ($catQuery) use ($search) {
                      $catQuery->where('name', 'LIKE', "%{$search}%");
                  });
            })
            ->limit(6)
            ->get();

        $suggestions = $products->map(function ($p) {
            $firstImage = $p->images->first()?->image_url ?? null;
            $firstVariant = $p->variants->first();
            $price = $p->price ?: ($firstVariant?->price ?? 0);
            $mrp = $p->mrp ?: ($firstVariant?->mrp ?? $price);

            return [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'price' => (float)$price,
                'mrp' => (float)$mrp,
                'category_name' => $p->category?->name ?? 'Women',
                'image_url' => $firstImage,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $suggestions,
        ], 200);
    }

    /**
     * GET /api/v1/products/{slug}
     * Public active single product details for customer storefront.
     */
    public function productBySlug(string $slug): JsonResponse
    {
        $product = Product::with(['category', 'variants.inventory', 'images'])
            ->where('slug', $slug)
            ->where('status', 'ACTIVE')
            ->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Product retrieved successfully.',
            'data' => $product,
        ], 200);
    }
}
