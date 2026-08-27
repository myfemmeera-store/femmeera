<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CMSAdminController extends Controller
{
    // =========================================================================
    // 1. SYSTEM SETTINGS & LOGO MANAGEMENT
    // =========================================================================

    public function getSettings(): JsonResponse
    {
        $settingsRaw = DB::table('settings')->get();
        $settings = [];

        foreach ($settingsRaw as $s) {
            $value = $s->value_content;
            if ($s->key_name === 'store_logo' && $value && !str_starts_with($value, 'http')) {
                $value = asset('storage/' . ltrim($value, '/'));
            }
            $settings[$s->key_name] = $value;
        }

        // Decode JSON settings for admin CMS loaders
        if (isset($settings['homepage_shop_categories']) && is_string($settings['homepage_shop_categories'])) {
            $decoded = json_decode($settings['homepage_shop_categories'], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $settings['homepage_shop_categories'] = $decoded;
            }
        }
        if (isset($settings['homepage_featured_collections']) && is_string($settings['homepage_featured_collections'])) {
            $decoded = json_decode($settings['homepage_featured_collections'], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $settings['homepage_featured_collections'] = $decoded;
            }
        }

        return response()->json([
            'success' => true,
            'data' => $settings,
        ], 200);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $payload = $request->except(['_token']);

        foreach ($payload as $key => $value) {
            DB::table('settings')->updateOrInsert(
                ['key_name' => $key],
                [
                    'value_content' => $value,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully.',
            'data' => $this->getSettings()->getData()->data,
        ], 200);
    }

    // =========================================================================
    // 2. HERO BANNERS MANAGEMENT
    // =========================================================================

    public function indexBanners(): JsonResponse
    {
        $banners = DB::table('hero_banners')->orderBy('sort_order', 'asc')->get();

        $formatted = $banners->map(function ($b) {
            $b->image_display_url = str_starts_with($b->image_url, 'http') ? $b->image_url : asset('storage/' . ltrim($b->image_url, '/'));
            $b->mobile_image_display_url = !empty($b->mobile_image_url)
                ? (str_starts_with($b->mobile_image_url, 'http') ? $b->mobile_image_url : asset('storage/' . ltrim($b->mobile_image_url, '/')))
                : $b->image_display_url;
            return $b;
        });

        return response()->json([
            'success' => true,
            'data' => $formatted,
        ], 200);
    }

    public function storeBanner(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'image_url' => 'required|string',
            'mobile_image_url' => 'nullable|string',
            'button_text' => 'nullable|string|max:50',
            'button_url' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'status' => 'required|in:ACTIVE,DISABLED',
        ]);

        $id = DB::table('hero_banners')->insertGetId([
            'title' => $request->input('title'),
            'subtitle' => $request->input('subtitle'),
            'image_url' => $request->input('image_url'),
            'mobile_image_url' => $request->input('mobile_image_url', $request->input('image_url')),
            'button_text' => $request->input('button_text', 'SHOP NOW'),
            'button_url' => $request->input('button_url', '/shop'),
            'sort_order' => $request->input('sort_order', 0),
            'status' => $request->input('status', 'ACTIVE'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Hero banner created successfully.',
            'data' => DB::table('hero_banners')->where('id', $id)->first(),
        ], 201);
    }

    public function updateBanner(Request $request, int $id): JsonResponse
    {
        $banner = DB::table('hero_banners')->where('id', $id)->first();
        if (!$banner) {
            return response()->json(['success' => false, 'message' => 'Banner not found.'], 404);
        }

        $data = $request->only(['title', 'subtitle', 'image_url', 'mobile_image_url', 'button_text', 'button_url', 'sort_order', 'status']);
        $data['updated_at'] = now();

        DB::table('hero_banners')->where('id', $id)->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Hero banner updated successfully.',
            'data' => DB::table('hero_banners')->where('id', $id)->first(),
        ], 200);
    }

    public function destroyBanner(int $id): JsonResponse
    {
        DB::table('hero_banners')->where('id', $id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Hero banner deleted successfully.',
        ], 200);
    }

    // =========================================================================
    // 3. POPUPS MANAGEMENT
    // =========================================================================

    public function indexPopups(): JsonResponse
    {
        $popups = DB::table('popups')->latest('id')->get();

        return response()->json([
            'success' => true,
            'data' => $popups,
        ], 200);
    }

    public function storePopup(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'button_text' => 'nullable|string|max:50',
            'button_url' => 'nullable|string|max:255',
            'coupon_code' => 'nullable|string|max:50',
            'status' => 'required|in:ACTIVE,DISABLED',
        ]);

        $id = DB::table('popups')->insertGetId([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'image_url' => $request->input('image_url'),
            'button_text' => $request->input('button_text'),
            'button_url' => $request->input('button_url'),
            'coupon_code' => $request->input('coupon_code'),
            'status' => $request->input('status', 'ACTIVE'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Popup created successfully.',
            'data' => DB::table('popups')->where('id', $id)->first(),
        ], 201);
    }

    public function updatePopup(Request $request, int $id): JsonResponse
    {
        $data = $request->only(['title', 'description', 'image_url', 'button_text', 'button_url', 'coupon_code', 'status']);
        $data['updated_at'] = now();

        DB::table('popups')->where('id', $id)->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Popup updated successfully.',
            'data' => DB::table('popups')->where('id', $id)->first(),
        ], 200);
    }

    public function destroyPopup(int $id): JsonResponse
    {
        DB::table('popups')->where('id', $id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Popup deleted successfully.',
        ], 200);
    }

    // =========================================================================
    // 4. WATCH AND SHOP REELS MANAGEMENT
    // =========================================================================

    public function indexWatchAndShop(): JsonResponse
    {
        $reels = DB::table('watch_and_shop_videos')->orderBy('sort_order', 'asc')->get();

        $formatted = $reels->map(function ($r) {
            $fullVideoUrl = str_starts_with($r->video_url, 'http') ? $r->video_url : asset('storage/' . ltrim($r->video_url, '/'));
            $r->video_url = $fullVideoUrl;
            $r->video_display_url = $fullVideoUrl;
            $r->poster_display_url = !empty($r->poster_url)
                ? (str_starts_with($r->poster_url, 'http') ? $r->poster_url : asset('storage/' . ltrim($r->poster_url, '/')))
                : null;
            return $r;
        });

        return response()->json([
            'success' => true,
            'data' => $formatted,
        ], 200);
    }

    public function storeWatchAndShop(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'video_url' => 'required|string',
            'poster_url' => 'nullable|string',
            'product_url' => 'required|string|max:255',
            'button_text' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer',
            'status' => 'required|in:ACTIVE,DISABLED',
        ]);

        $id = DB::table('watch_and_shop_videos')->insertGetId([
            'title' => $request->input('title'),
            'video_url' => $request->input('video_url'),
            'poster_url' => $request->input('poster_url'),
            'product_url' => $request->input('product_url'),
            'button_text' => $request->input('button_text', 'View Product'),
            'sort_order' => $request->input('sort_order', 0),
            'status' => $request->input('status', 'ACTIVE'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Watch & Shop reel created successfully.',
            'data' => DB::table('watch_and_shop_videos')->where('id', $id)->first(),
        ], 201);
    }

    public function updateWatchAndShop(Request $request, int $id): JsonResponse
    {
        $reel = DB::table('watch_and_shop_videos')->where('id', $id)->first();
        if (!$reel) {
            return response()->json(['success' => false, 'message' => 'Reel video not found.'], 404);
        }

        $data = $request->only(['title', 'video_url', 'poster_url', 'product_url', 'button_text', 'sort_order', 'status']);
        $data['updated_at'] = now();

        DB::table('watch_and_shop_videos')->where('id', $id)->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Watch & Shop reel updated successfully.',
            'data' => DB::table('watch_and_shop_videos')->where('id', $id)->first(),
        ], 200);
    }

    public function destroyWatchAndShop(int $id): JsonResponse
    {
        DB::table('watch_and_shop_videos')->where('id', $id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Watch & Shop reel deleted successfully.',
        ], 200);
    }
}
