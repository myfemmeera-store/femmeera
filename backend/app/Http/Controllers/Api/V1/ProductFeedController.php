<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

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

        // XML Feed Output (RSS 2.0 with Google Merchant namespace via DOMDocument for robust entity escaping)
        $dom = new \DOMDocument('1.0', 'UTF-8');
        $dom->formatOutput = true;

        $rss = $dom->createElement('rss');
        $rss->setAttribute('version', '2.0');
        $rss->setAttribute('xmlns:g', 'http://base.google.com/ns/1.0');
        $dom->appendChild($rss);

        $channel = $dom->createElement('channel');
        $rss->appendChild($channel);

        $title = $dom->createElement('title');
        $title->appendChild($dom->createTextNode('Femmeera Product Feed'));
        $channel->appendChild($title);

        $link = $dom->createElement('link');
        $link->appendChild($dom->createTextNode('https://femmeera.com'));
        $channel->appendChild($link);

        $description = $dom->createElement('description');
        $description->appendChild($dom->createTextNode('Official product catalog feed for Femmeera Women\'s Traditional & Western Wear.'));
        $channel->appendChild($description);

        foreach ($products as $product) {
            $mainImage = $product->images->first()?->image_url ?? 'https://femmeera.com/logo.png';
            $price = number_format((float)($product->price ?: ($product->variants->first()?->price ?? 0)), 2, '.', '');
            $hasStock = $product->variants->count() > 0
                ? $product->variants->contains(fn($v) => ($v->stock ?? 0) > 0)
                : true;

            $item = $dom->createElement('item');
            $channel->appendChild($item);

            $id = $dom->createElementNS('http://base.google.com/ns/1.0', 'g:id');
            $id->appendChild($dom->createTextNode($product->sku ?: "FEM-{$product->id}"));
            $item->appendChild($id);

            $gTitle = $dom->createElementNS('http://base.google.com/ns/1.0', 'g:title');
            $gTitle->appendChild($dom->createTextNode($product->name));
            $item->appendChild($gTitle);

            $rawDesc = $product->description ?: $product->short_description ?: "Buy {$product->name} online at Femmeera.";
            $cleanDesc = mb_substr(trim(preg_replace('/\s+/', ' ', strip_tags($rawDesc))), 0, 5000);
            $gDesc = $dom->createElementNS('http://base.google.com/ns/1.0', 'g:description');
            $gDesc->appendChild($dom->createTextNode($cleanDesc));
            $item->appendChild($gDesc);

            $gLink = $dom->createElementNS('http://base.google.com/ns/1.0', 'g:link');
            $gLink->appendChild($dom->createTextNode("https://femmeera.com/product/{$product->slug}"));
            $item->appendChild($gLink);

            $gImage = $dom->createElementNS('http://base.google.com/ns/1.0', 'g:image_link');
            $gImage->appendChild($dom->createTextNode($mainImage));
            $item->appendChild($gImage);

            $gPrice = $dom->createElementNS('http://base.google.com/ns/1.0', 'g:price');
            $gPrice->appendChild($dom->createTextNode("{$price} INR"));
            $item->appendChild($gPrice);

            $gAvailability = $dom->createElementNS('http://base.google.com/ns/1.0', 'g:availability');
            $gAvailability->appendChild($dom->createTextNode($hasStock ? 'in_stock' : 'out_of_stock'));
            $item->appendChild($gAvailability);

            $gBrand = $dom->createElementNS('http://base.google.com/ns/1.0', 'g:brand');
            $gBrand->appendChild($dom->createTextNode($product->brand ?: 'Femmeera'));
            $item->appendChild($gBrand);

            $gCondition = $dom->createElementNS('http://base.google.com/ns/1.0', 'g:condition');
            $gCondition->appendChild($dom->createTextNode('new'));
            $item->appendChild($gCondition);

            $gGender = $dom->createElementNS('http://base.google.com/ns/1.0', 'g:gender');
            $gGender->appendChild($dom->createTextNode('female'));
            $item->appendChild($gGender);

            if ($product->category?->name) {
                $gType = $dom->createElementNS('http://base.google.com/ns/1.0', 'g:product_type');
                $gType->appendChild($dom->createTextNode($product->category->name));
                $item->appendChild($gType);
            }

            $colors = array_filter(array_unique($product->variants->pluck('color')->toArray()));
            if (!empty($colors)) {
                $gColor = $dom->createElementNS('http://base.google.com/ns/1.0', 'g:color');
                $gColor->appendChild($dom->createTextNode(implode('/', $colors)));
                $item->appendChild($gColor);
            }

            $sizes = array_filter(array_unique($product->variants->pluck('size')->toArray()));
            if (!empty($sizes)) {
                $gSize = $dom->createElementNS('http://base.google.com/ns/1.0', 'g:size');
                $gSize->appendChild($dom->createTextNode(implode('/', $sizes)));
                $item->appendChild($gSize);
            }
        }

        return response($dom->saveXML(), 200, [
            'Content-Type' => 'application/xml; charset=utf-8',
        ]);
    }
}
