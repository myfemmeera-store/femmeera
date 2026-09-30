<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductFeedController extends Controller
{
    /**
     * GET /api/v1/feeds/google-merchant
     * Generates a fully Google Merchant Center compliant XML (or JSON) product feed.
     */
    public function googleMerchant(Request $request)
    {
        $products = Product::with(['category', 'variants' => function ($query) {
            $query->where('status', 'ACTIVE');
        }, 'images'])
            ->where('status', 'ACTIVE')
            ->orderBy('id', 'desc')
            ->get();

        if ($request->input('format') === 'json') {
            return response()->json([
                'success' => true,
                'feed_format' => 'google_merchant_json',
                'total_products' => $products->count(),
                'items' => $this->generateJsonItems($products),
            ]);
        }

        $dom = new \DOMDocument('1.0', 'UTF-8');
        $dom->formatOutput = true;

        $rss = $dom->createElement('rss');
        $rss->setAttribute('version', '2.0');
        $rss->setAttribute('xmlns:g', 'http://base.google.com/ns/1.0');
        $dom->appendChild($rss);

        $channel = $dom->createElement('channel');
        $rss->appendChild($channel);

        $title = $dom->createElement('title');
        $title->appendChild($dom->createTextNode('Femmeera Google Merchant Center Feed'));
        $channel->appendChild($title);

        $link = $dom->createElement('link');
        $link->appendChild($dom->createTextNode('https://femmeera.com'));
        $channel->appendChild($link);

        $description = $dom->createElement('description');
        $description->appendChild($dom->createTextNode('Official product catalog feed for Femmeera Women\'s Apparel.'));
        $channel->appendChild($description);

        $googleNs = 'http://base.google.com/ns/1.0';

        foreach ($products as $product) {
            $images = $product->images->pluck('image_url')->filter()->toArray();
            $mainImage = !empty($images) ? $images[0] : 'https://femmeera.com/logo.png';
            $additionalImages = array_slice($images, 1, 10);

            $rawDesc = $product->description ?: $product->short_description ?: "Buy {$product->name} online at Femmeera. High quality women's traditional and western wear.";
            $cleanDesc = mb_substr(trim(preg_replace('/\s+/', ' ', strip_tags($rawDesc))), 0, 5000);

            $categoryName = $product->category?->name ?: "Women's Clothing";
            $googleCategory = $this->getGoogleProductCategory($categoryName, $product->name);
            $productUrl = "https://femmeera.com/product/{$product->slug}";
            $brand = $product->brand ?: 'Femmeera';
            $parentGroupId = $product->sku ?: "FEM-GRP-{$product->id}";

            $activeVariants = $product->variants->filter(fn($v) => $v->status === 'ACTIVE');

            if ($activeVariants->count() > 0) {
                foreach ($activeVariants as $variant) {
                    $item = $dom->createElement('item');
                    $channel->appendChild($item);

                    $variantId = $variant->sku ?: "FEM-{$product->id}-V{$variant->id}";

                    $this->appendNsElement($dom, $item, $googleNs, 'g:id', $variantId);
                    $this->appendNsElement($dom, $item, $googleNs, 'g:item_group_id', $parentGroupId);
                    $this->appendNsElement($dom, $item, $googleNs, 'g:title', $product->name);
                    $this->appendNsElement($dom, $item, $googleNs, 'g:description', $cleanDesc);
                    $this->appendNsElement($dom, $item, $googleNs, 'g:link', $productUrl);
                    $this->appendNsElement($dom, $item, $googleNs, 'g:image_link', $mainImage);

                    foreach ($additionalImages as $addImg) {
                        $this->appendNsElement($dom, $item, $googleNs, 'g:additional_image_link', $addImg);
                    }

                    // Price & Sale Price
                    $sellingPrice = (float)($variant->price ?: 0);
                    $mrpPrice = (float)($variant->mrp ?: 0);

                    if ($mrpPrice > $sellingPrice && $sellingPrice > 0) {
                        $this->appendNsElement($dom, $item, $googleNs, 'g:price', number_format($mrpPrice, 2, '.', '') . ' INR');
                        $this->appendNsElement($dom, $item, $googleNs, 'g:sale_price', number_format($sellingPrice, 2, '.', '') . ' INR');
                    } else {
                        $priceVal = $sellingPrice > 0 ? $sellingPrice : $mrpPrice;
                        $this->appendNsElement($dom, $item, $googleNs, 'g:price', number_format($priceVal, 2, '.', '') . ' INR');
                    }

                    $inStock = ($variant->stock ?? 0) > 0;
                    $this->appendNsElement($dom, $item, $googleNs, 'g:availability', $inStock ? 'in_stock' : 'out_of_stock');
                    $this->appendNsElement($dom, $item, $googleNs, 'g:brand', $brand);
                    $this->appendNsElement($dom, $item, $googleNs, 'g:condition', 'new');
                    $this->appendNsElement($dom, $item, $googleNs, 'g:gender', 'female');
                    $this->appendNsElement($dom, $item, $googleNs, 'g:age_group', 'adult');
                    $this->appendNsElement($dom, $item, $googleNs, 'g:product_type', $categoryName);
                    $this->appendNsElement($dom, $item, $googleNs, 'g:google_product_category', $googleCategory);
                    $this->appendNsElement($dom, $item, $googleNs, 'g:identifier_exists', 'no');

                    if (!empty($variant->color)) {
                        $this->appendNsElement($dom, $item, $googleNs, 'g:color', $variant->color);
                    }
                    if (!empty($variant->size)) {
                        $this->appendNsElement($dom, $item, $googleNs, 'g:size', $variant->size);
                    }

                    // Standard Free Shipping
                    $gShipping = $dom->createElementNS($googleNs, 'g:shipping');
                    $gCountry = $dom->createElementNS($googleNs, 'g:country', 'IN');
                    $gService = $dom->createElementNS($googleNs, 'g:service', 'Standard');
                    $gPrice = $dom->createElementNS($googleNs, 'g:price', '0.00 INR');
                    $gShipping->appendChild($gCountry);
                    $gShipping->appendChild($gService);
                    $gShipping->appendChild($gPrice);
                    $item->appendChild($gShipping);
                }
            } else {
                $item = $dom->createElement('item');
                $channel->appendChild($item);

                $productId = $product->sku ?: "FEM-{$product->id}";

                $this->appendNsElement($dom, $item, $googleNs, 'g:id', $productId);
                $this->appendNsElement($dom, $item, $googleNs, 'g:title', $product->name);
                $this->appendNsElement($dom, $item, $googleNs, 'g:description', $cleanDesc);
                $this->appendNsElement($dom, $item, $googleNs, 'g:link', $productUrl);
                $this->appendNsElement($dom, $item, $googleNs, 'g:image_link', $mainImage);

                foreach ($additionalImages as $addImg) {
                    $this->appendNsElement($dom, $item, $googleNs, 'g:additional_image_link', $addImg);
                }

                $this->appendNsElement($dom, $item, $googleNs, 'g:price', '1499.00 INR');
                $this->appendNsElement($dom, $item, $googleNs, 'g:availability', 'in_stock');
                $this->appendNsElement($dom, $item, $googleNs, 'g:brand', $brand);
                $this->appendNsElement($dom, $item, $googleNs, 'g:condition', 'new');
                $this->appendNsElement($dom, $item, $googleNs, 'g:gender', 'female');
                $this->appendNsElement($dom, $item, $googleNs, 'g:age_group', 'adult');
                $this->appendNsElement($dom, $item, $googleNs, 'g:product_type', $categoryName);
                $this->appendNsElement($dom, $item, $googleNs, 'g:google_product_category', $googleCategory);
                $this->appendNsElement($dom, $item, $googleNs, 'g:identifier_exists', 'no');

                $gShipping = $dom->createElementNS($googleNs, 'g:shipping');
                $gCountry = $dom->createElementNS($googleNs, 'g:country', 'IN');
                $gService = $dom->createElementNS($googleNs, 'g:service', 'Standard');
                $gPrice = $dom->createElementNS($googleNs, 'g:price', '0.00 INR');
                $gShipping->appendChild($gCountry);
                $gShipping->appendChild($gService);
                $gShipping->appendChild($gPrice);
                $item->appendChild($gShipping);
            }
        }

        return response($dom->saveXML(), 200, [
            'Content-Type' => 'application/xml; charset=utf-8',
            'Cache-Control' => 'public, max-age=3600, s-maxage=3600',
        ]);
    }

    protected function appendNsElement(\DOMDocument $dom, \DOMElement $parent, string $ns, string $name, string $value): void
    {
        $el = $dom->createElementNS($ns, $name);
        $el->appendChild($dom->createTextNode($value));
        $parent->appendChild($el);
    }

    protected function getGoogleProductCategory(?string $categoryName, string $productName): string
    {
        $combined = strtolower(($categoryName ?: '') . ' ' . $productName);
        if (str_contains($combined, 'traditional') || str_contains($combined, 'saree') || str_contains($combined, 'lehenga') || str_contains($combined, 'kurti') || str_contains($combined, 'ethnic') || str_contains($combined, 'anarkali')) {
            return 'Apparel & Accessories > Clothing > Traditional Wear';
        }
        if (str_contains($combined, 'western') || str_contains($combined, 'dress') || str_contains($combined, 'gown') || str_contains($combined, 'co-ord')) {
            return 'Apparel & Accessories > Clothing > Dresses';
        }
        return 'Apparel & Accessories > Clothing';
    }

    protected function generateJsonItems($products): array
    {
        $items = [];
        foreach ($products as $product) {
            $images = $product->images->pluck('image_url')->filter()->toArray();
            $mainImage = !empty($images) ? $images[0] : 'https://femmeera.com/logo.png';
            $categoryName = $product->category?->name ?: "Women's Clothing";

            foreach ($product->variants as $variant) {
                $items[] = [
                    'id' => $variant->sku ?: "FEM-{$product->id}-V{$variant->id}",
                    'item_group_id' => $product->sku ?: "FEM-GRP-{$product->id}",
                    'title' => $product->name,
                    'description' => strip_tags($product->description ?: $product->short_description ?: ''),
                    'link' => "https://femmeera.com/product/{$product->slug}",
                    'image_link' => $mainImage,
                    'price' => number_format((float)($variant->mrp ?: $variant->price), 2, '.', '') . ' INR',
                    'sale_price' => $variant->mrp > $variant->price ? number_format((float)$variant->price, 2, '.', '') . ' INR' : null,
                    'availability' => ($variant->stock ?? 0) > 0 ? 'in_stock' : 'out_of_stock',
                    'brand' => $product->brand ?: 'Femmeera',
                    'condition' => 'new',
                    'gender' => 'female',
                    'age_group' => 'adult',
                    'color' => $variant->color,
                    'size' => $variant->size,
                    'product_type' => $categoryName,
                    'google_product_category' => $this->getGoogleProductCategory($categoryName, $product->name),
                    'identifier_exists' => 'no',
                ];
            }
        }
        return $items;
    }
}
