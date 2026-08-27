<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CMSPublicController extends Controller
{
    /**
     * Get public store settings (logo, contact info, announcement, shipping threshold).
     */
    public function settings(): JsonResponse
    {
        $settingsRaw = DB::table('settings')->get();
        $settings = [];

        foreach ($settingsRaw as $s) {
            $value = $s->value_content;
            // Resolve relative storage path for logo & promo banner
            if (in_array($s->key_name, ['store_logo', 'promo_banner_image']) && $value && !str_starts_with($value, 'http') && !str_starts_with($value, '/images/')) {
                $value = asset('storage/' . ltrim($value, '/'));
            }
            $settings[$s->key_name] = $value;
        }

        // Fallbacks if not set in DB
        $settings['store_name'] = $settings['store_name'] ?? 'Femmeera';
        $settings['store_logo'] = $settings['store_logo'] ?? asset('logo.png');
        $settings['currency_symbol'] = $settings['currency_symbol'] ?? '₹';
        $settings['store_currency'] = $settings['store_currency'] ?? 'INR';
        $settings['free_shipping_threshold'] = $settings['free_shipping_threshold'] ?? '1499';
        $settings['announcement_bar'] = $settings['announcement_bar'] ?? 'Free Shipping on Orders above ₹1499 | COD Available';
        $settings['promo_banner_image'] = $settings['promo_banner_image'] ?? '/images/unlock_world_fashion_banner.jpg';
        $settings['promo_banner_url'] = $settings['promo_banner_url'] ?? '/women/western-wear';
        $settings['promo_banner_status'] = $settings['promo_banner_status'] ?? 'ACTIVE';
        $settings['promo_banner_fit'] = $settings['promo_banner_fit'] ?? 'cover';

        // Parse JSON settings for homepage shop categories & featured collections
        if (isset($settings['homepage_shop_categories']) && is_string($settings['homepage_shop_categories'])) {
            $settings['homepage_shop_categories'] = json_decode($settings['homepage_shop_categories'], true);
        }
        if (isset($settings['homepage_featured_collections']) && is_string($settings['homepage_featured_collections'])) {
            $settings['homepage_featured_collections'] = json_decode($settings['homepage_featured_collections'], true);
        }

        return response()->json([
            'success' => true,
            'data' => $settings,
        ], 200);
    }

    /**
     * Get active hero banners for homepage slider.
     */
    public function heroBanners(): JsonResponse
    {
        $banners = DB::table('hero_banners')
            ->where('status', 'ACTIVE')
            ->orderBy('sort_order', 'asc')
            ->get();

        $formatted = $banners->map(function ($b) {
            return [
                'id' => $b->id,
                'title' => $b->title,
                'subtitle' => $b->subtitle ?? '',
                'image_url' => str_starts_with($b->image_url, 'http') ? $b->image_url : asset('storage/' . ltrim($b->image_url, '/')),
                'mobile_image_url' => !empty($b->mobile_image_url)
                    ? (str_starts_with($b->mobile_image_url, 'http') ? $b->mobile_image_url : asset('storage/' . ltrim($b->mobile_image_url, '/')))
                    : (str_starts_with($b->image_url, 'http') ? $b->image_url : asset('storage/' . ltrim($b->image_url, '/'))),
                'button_text' => $b->button_text ?? 'SHOP NOW',
                'button_url' => $b->button_url ?? '/shop',
                'sort_order' => $b->sort_order,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted,
        ], 200);
    }

    /**
     * Get active homepage sections.
     */
    public function homepageSections(): JsonResponse
    {
        $sections = DB::table('homepage_sections')
            ->where('status', 'ACTIVE')
            ->orderBy('sort_order', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $sections,
        ], 200);
    }

    /**
     * Get active announcement bar.
     */
    public function announcement(): JsonResponse
    {
        $announcement = DB::table('announcements')
            ->where('status', 'ACTIVE')
            ->latest('id')
            ->first();

        return response()->json([
            'success' => true,
            'data' => $announcement,
        ], 200);
    }

    /**
     * Get active promo popup.
     */
    public function popup(): JsonResponse
    {
        $popup = DB::table('popups')
            ->where('status', 'ACTIVE')
            ->latest('id')
            ->first();

        if ($popup && $popup->image_url && !str_starts_with($popup->image_url, 'http')) {
            $popup->image_url = asset('storage/' . ltrim($popup->image_url, '/'));
        }

        return response()->json([
            'success' => true,
            'data' => $popup,
        ], 200);
    }

    /**
     * Get active 9:16 Watch & Shop fashion reels.
     */
    public function watchAndShop(): JsonResponse
    {
        $reels = DB::table('watch_and_shop_videos')
            ->where('status', 'ACTIVE')
            ->orderBy('sort_order', 'asc')
            ->get();

        $formatted = $reels->map(function ($r) {
            if ($r->video_url && !str_starts_with($r->video_url, 'http')) {
                $r->video_url = asset('storage/' . ltrim($r->video_url, '/'));
            }
            if ($r->poster_url && !str_starts_with($r->poster_url, 'http')) {
                $r->poster_url = asset('storage/' . ltrim($r->poster_url, '/'));
            }
            return $r;
        });

        return response()->json([
            'success' => true,
            'data' => $formatted,
        ], 200);
    }
}
