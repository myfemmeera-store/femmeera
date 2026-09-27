<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProductFeedController extends Controller
{
    /**
     * GET /api/v1/feeds/google-merchant
     * Generates a Google Merchant Center XML (or JSON) product feed from active public products.
     */
    public function googleMerchant(Request $request)
    {
        $products = Product::with(['category', 'variants', 'images'])
            ->where('status', 'ACTIVE')
            ->orderBy('id', 'desc')
            ->get();

        if ($request->input('format') === 'json') {
            $feedItems = [];
            foreach ($products as $product) {
                $mainImage = $product->images->first()?->image_url ?? 'https://femmeera.com/logo.png';
                $price = number_format((float)($product->price ?: ($product->variants->first()?->price ?? 0)), 2, '.', '');
                $hasStock = $product->variants->count() > 0
                    ? $product->variants->contains(fn($v) => ($v->stock ?? 0) > 0)
                    : true;

                $colors = array_filter(array_unique($product->variants->pluck('color')->toArray()));
                $sizes = array_filter(array_unique($product->variants->pluck('size')->toArray()));

                $feedItems[] = [
                    'id' => $product->sku ?: "FEM-{$product->id}",
                    'title' => $product->name,
                    'description' => strip_tags($product->description ?: $product->short_description ?: "Buy {$product->name} online at Femmeera."),
                    'link' => "https://femmeera.com/product/{$product->slug}",
                    'image_link' => $mainImage,
                    'additional_image_links' => $product->images->skip(1)->pluck('image_url')->take(5)->toArray(),
                    'price' => "{$price} INR",
                    'availability' => $hasStock ? 'in_stock' : 'out_of_stock',
                    'brand' => $product->brand ?: 'Femmeera',
                    'condition' => 'new',
                    'gender' => 'female',
                    'product_type' => $product->category?->name ?: "Women's Clothing",
                    'color' => implode('/', $colors),
                    'size' => implode('/', $sizes),
                ];
            }

            return response()->json([
                'success' => true,
                'feed_format' => 'google_merchant_json',
                'total_products' => count($feedItems),
                'items' => $feedItems,
            ]);
        }

        // XML Feed Output (RSS 2.0 with Google Merchant namespace)
        $xml = new \SimpleXMLElement('<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"/>');
        $channel = $xml->addChild('channel');
        $channel->addChild('title', 'Femmeera Product Feed');
        $channel->addChild('link', 'https://femmeera.com');
        $channel->addChild('description', 'Official product catalog feed for Femmeera Women\'s Traditional & Western Wear.');

        foreach ($products as $product) {
            $mainImage = $product->images->first()?->image_url ?? 'https://femmeera.com/logo.png';
            $price = number_format((float)($product->price ?: ($product->variants->first()?->price ?? 0)), 2, '.', '');
            $hasStock = $product->variants->count() > 0
                ? $product->variants->contains(fn($v) => ($v->stock ?? 0) > 0)
                : true;

            $item = $channel->addChild('item');
            $item->addChild('g:id', htmlspecialchars($product->sku ?: "FEM-{$product->id}"), 'http://base.google.com/ns/1.0');
            $item->addChild('g:title', htmlspecialchars($product->name), 'http://base.google.com/ns/1.0');
            
            $rawDesc = $product->description ?: $product->short_description ?: "Buy {$product->name} online at Femmeera.";
            $cleanDesc = htmlspecialchars(mb_substr(trim(preg_replace('/\s+/', ' ', strip_tags($rawDesc))), 0, 5000));
            $item->addChild('g:description', $cleanDesc, 'http://base.google.com/ns/1.0');
            
            $item->addChild('g:link', htmlspecialchars("https://femmeera.com/product/{$product->slug}"), 'http://base.google.com/ns/1.0');
            $item->addChild('g:image_link', htmlspecialchars($mainImage), 'http://base.google.com/ns/1.0');
            $item->addChild('g:price', "{$price} INR", 'http://base.google.com/ns/1.0');
            $item->addChild('g:availability', $hasStock ? 'in_stock' : 'out_of_stock', 'http://base.google.com/ns/1.0');
            $item->addChild('g:brand', htmlspecialchars($product->brand ?: 'Femmeera'), 'http://base.google.com/ns/1.0');
            $item->addChild('g:condition', 'new', 'http://base.google.com/ns/1.0');
            $item->addChild('g:gender', 'female', 'http://base.google.com/ns/1.0');
            
            if ($product->category?->name) {
                $item->addChild('g:product_type', htmlspecialchars($product->category->name), 'http://base.google.com/ns/1.0');
            }

            $colors = array_filter(array_unique($product->variants->pluck('color')->toArray()));
            if (!empty($colors)) {
                $item->addChild('g:color', htmlspecialchars(implode('/', $colors)), 'http://base.google.com/ns/1.0');
            }

            $sizes = array_filter(array_unique($product->variants->pluck('size')->toArray()));
            if (!empty($sizes)) {
                $item->addChild('g:size', htmlspecialchars(implode('/', $sizes)), 'http://base.google.com/ns/1.0');
            }
        }

        return response($xml->asXML(), 200, [
            'Content-Type' => 'application/xml; charset=utf-8',
        ]);
    }
}
