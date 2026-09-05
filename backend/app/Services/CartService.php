<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Str;

class CartService
{
    protected DiscountService $discountService;
    protected ShippingService $shippingService;
    protected TaxService $taxService;

    public function __construct(
        DiscountService $discountService,
        ShippingService $shippingService,
        TaxService $taxService
    ) {
        $this->discountService = $discountService;
        $this->shippingService = $shippingService;
        $this->taxService = $taxService;
    }

    /**
     * Get or create active cart for user or guest session.
     */
    public function getOrCreateCart(?User $user, ?string $guestSessionId): Cart
    {
        if ($user) {
            $cart = Cart::where('customer_id', $user->id)
                ->where('status', 'ACTIVE')
                ->first();

            if (!$cart) {
                $cart = Cart::create([
                    'customer_id' => $user->id,
                    'status' => 'ACTIVE',
                    'last_activity_at' => now(),
                ]);
            }
        } else {
            $session = $guestSessionId ?: Str::uuid()->toString();

            $cart = Cart::where('guest_session_id', $session)
                ->where('status', 'ACTIVE')
                ->first();

            if (!$cart) {
                $cart = Cart::create([
                    'guest_session_id' => $session,
                    'status' => 'ACTIVE',
                    'last_activity_at' => now(),
                ]);
            }
        }

        $cart->update(['last_activity_at' => now()]);
        return $cart;
    }

    /**
     * Add variant to cart with stock validation.
     */
    public function addItem(Cart $cart, int $variantId, int $quantity): array
    {
        $variant = ProductVariant::with('product')->find($variantId);

        if (!$variant) {
            return ['success' => false, 'message' => 'Product variant not found.'];
        }

        if ($variant->status !== 'ACTIVE') {
            return ['success' => false, 'message' => 'This product variant is currently inactive.'];
        }

        if (!$variant->product || $variant->product->status !== 'ACTIVE') {
            return ['success' => false, 'message' => 'This product is currently unavailable.'];
        }

        $availableStock = $variant->stock;
        if ($availableStock <= 0) {
            return ['success' => false, 'message' => 'Sorry, this product variant is out of stock.'];
        }

        $existingItem = CartItem::where('cart_id', $cart->id)
            ->where('variant_id', $variantId)
            ->first();

        $currentQty = $existingItem ? $existingItem->quantity : 0;
        $newQty = $currentQty + $quantity;

        if ($newQty > $availableStock) {
            return [
                'success' => false,
                'message' => "Cannot add {$quantity} more items. Only {$availableStock} items available in stock.",
            ];
        }

        if ($existingItem) {
            $existingItem->update(['quantity' => $newQty]);
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'variant_id' => $variantId,
                'quantity' => $newQty,
            ]);
        }

        $cart->touch();
        return ['success' => true, 'message' => 'Item added to cart successfully.'];
    }

    /**
     * Update quantity of an existing cart item.
     */
    public function updateItem(Cart $cart, int $cartItemId, int $quantity): array
    {
        $item = CartItem::where('cart_id', $cart->id)->where('id', $cartItemId)->first();

        if (!$item) {
            return ['success' => false, 'message' => 'Cart item not found.'];
        }

        if ($quantity <= 0) {
            $item->delete();
            return ['success' => true, 'message' => 'Cart item removed.'];
        }

        $variant = ProductVariant::find($item->variant_id);
        if (!$variant) {
            $item->delete();
            return ['success' => false, 'message' => 'Variant no longer exists. Item removed from cart.'];
        }

        if ($quantity > $variant->stock) {
            return [
                'success' => false,
                'message' => "Requested quantity {$quantity} exceeds available stock ({$variant->stock}).",
            ];
        }

        $item->update(['quantity' => $quantity]);
        $cart->touch();

        return ['success' => true, 'message' => 'Cart item quantity updated.'];
    }

    /**
     * Remove item from cart.
     */
    public function removeItem(Cart $cart, int $cartItemId): array
    {
        $item = CartItem::where('cart_id', $cart->id)->where('id', $cartItemId)->first();

        if ($item) {
            $item->delete();
            $cart->touch();
        }

        return ['success' => true, 'message' => 'Item removed from cart.'];
    }

    /**
     * Merge guest cart into customer cart upon login (Spec Section 11).
     */
    public function mergeCart(string $guestSessionId, User $user): array
    {
        $guestCart = Cart::where('guest_session_id', $guestSessionId)
            ->where('status', 'ACTIVE')
            ->first();

        if (!$guestCart) {
            return ['success' => true, 'message' => 'No guest cart to merge.'];
        }

        $customerCart = $this->getOrCreateCart($user, null);
        $adjustments = [];

        $guestItems = CartItem::where('cart_id', $guestCart->id)->get();

        foreach ($guestItems as $gItem) {
            $variant = ProductVariant::find($gItem->variant_id);
            if (!$variant || $variant->status !== 'ACTIVE') {
                continue;
            }

            $cItem = CartItem::where('cart_id', $customerCart->id)
                ->where('variant_id', $gItem->variant_id)
                ->first();

            $existingQty = $cItem ? $cItem->quantity : 0;
            $combinedQty = $existingQty + $gItem->quantity;

            $finalQty = min($combinedQty, $variant->stock);

            if ($finalQty < $combinedQty) {
                $adjustments[] = "Quantity for {$variant->color} / {$variant->size} adjusted to {$finalQty} due to stock limits.";
            }

            if ($cItem) {
                $cItem->update(['quantity' => $finalQty]);
            } else {
                CartItem::create([
                    'cart_id' => $customerCart->id,
                    'variant_id' => $gItem->variant_id,
                    'quantity' => $finalQty,
                ]);
            }
        }

        $guestCart->update(['status' => 'CONVERTED']);

        return [
            'success' => true,
            'message' => 'Cart merged successfully.',
            'adjustments' => $adjustments,
        ];
    }

    /**
     * Compute authoritative dynamic cart details (Spec Section 7 & 9).
     */
    public function getCartPayload(Cart $cart, ?string $couponCode = null, ?int $shippingMethodId = null, ?User $user = null): array
    {
        $rawItems = CartItem::with(['variant.product.images', 'variant.product.category'])
            ->where('cart_id', $cart->id)
            ->get();

        $formattedItems = [];
        $subtotal = 0.00;
        $validationNotices = [];

        foreach ($rawItems as $item) {
            $variant = $item->variant;
            if (!$variant || $variant->status !== 'ACTIVE' || !$variant->product || $variant->product->status !== 'ACTIVE') {
                if (!$variant || !$variant->product) {
                    $item->delete();
                }
                $validationNotices[] = "An item in your cart is no longer available and was excluded.";
                continue;
            }

            $availableStock = $variant->stock;
            $isAvailable = $availableStock >= $item->quantity;

            if ($availableStock <= 0) {
                $validationNotices[] = "{$variant->product->name} ({$variant->color}/{$variant->size}) is currently out of stock.";
            } elseif ($item->quantity > $availableStock) {
                $validationNotices[] = "Quantity for {$variant->product->name} ({$variant->color}/{$variant->size}) reduced to available stock ({$availableStock}).";
                $item->update(['quantity' => $availableStock]);
            }

            $unitPrice = (float) $variant->price;
            $mrp = (float) $variant->mrp;
            $lineTotal = round($unitPrice * $item->quantity, 2);

            $subtotal += $lineTotal;

            // Resolve image matching variant color, variant id, or primary image
            $images = $variant->product->images;
            $variantColorClean = trim(strtolower($variant->color ?? ''));

            $variantImg = $images->firstWhere('product_variant_id', $variant->id);
            $colorMatchImg = null;
            if (!$variantImg && !empty($variantColorClean)) {
                $colorMatchImg = $images->first(function ($img) use ($variantColorClean) {
                    return !empty($img->color_name) && trim(strtolower($img->color_name)) === $variantColorClean;
                });
            }
            $filenameMatchImg = null;
            if (!$variantImg && !$colorMatchImg && !empty($variantColorClean)) {
                $filenameMatchImg = $images->first(function ($img) use ($variantColorClean) {
                    return !empty($img->image_url) && str_contains(strtolower($img->image_url), $variantColorClean);
                });
            }

            $primaryImg = $images->firstWhere('is_primary', true);
            $firstImg = $images->first();

            $imgUrl = $variantImg 
                ? $variantImg->image_url 
                : ($colorMatchImg 
                    ? $colorMatchImg->image_url 
                    : ($filenameMatchImg 
                        ? $filenameMatchImg->image_url 
                        : ($primaryImg ? $primaryImg->image_url : ($firstImg ? $firstImg->image_url : '/images/placeholder.jpg'))));

            $formattedItems[] = [
                'cart_item_id' => $item->id,
                'variant_id' => $variant->id,
                'product_id' => $variant->product->id,
                'product_name' => $variant->product->name,
                'slug' => $variant->product->slug,
                'brand' => $variant->product->brand,
                'category_name' => $variant->product->category ? $variant->product->category->name : 'Women',
                'sku' => $variant->sku,
                'size' => $variant->size,
                'color' => $variant->color,
                'image_url' => $imgUrl,
                'unit_price' => $unitPrice,
                'mrp' => $mrp,
                'discount_percent' => $mrp > $unitPrice ? round((($mrp - $unitPrice) / $mrp) * 100) : 0,
                'quantity' => $item->quantity,
                'line_total' => $lineTotal,
                'stock' => $availableStock,
                'is_available' => $isAvailable,
            ];
        }

        // Calculate discounts (automatic offers + coupon)
        $discountResult = $this->discountService->calculateDiscounts($subtotal, $formattedItems, $couponCode, $user);
        $totalDiscount = $discountResult['total_discount'];

        $netSubtotal = max(0.00, $subtotal - $totalDiscount);

        // Calculate shipping
        $shippingResult = $this->shippingService->calculateShipping($shippingMethodId, $netSubtotal);

        // Calculate tax
        $taxResult = $this->taxService->calculateTax($netSubtotal);

        $taxAdded = !empty($taxResult['is_inclusive']) ? 0.00 : $taxResult['tax_amount'];
        $grandTotal = round($netSubtotal + $shippingResult['amount'] + $taxAdded, 2);

        return [
            'cart_id' => $cart->id,
            'guest_session_id' => $cart->guest_session_id,
            'items' => $formattedItems,
            'item_count' => count($formattedItems),
            'subtotal' => round($subtotal, 2),
            'discount' => round($totalDiscount, 2),
            'offer_discount' => $discountResult['offer_discount'],
            'coupon_discount' => $discountResult['coupon_discount'],
            'applied_coupon' => $discountResult['applied_coupon'],
            'coupon_error' => $discountResult['coupon_error'],
            'shipping' => $shippingResult,
            'tax' => $taxResult,
            'total' => $grandTotal,
            'currency' => 'INR',
            'currency_symbol' => '₹',
            'validation_notices' => array_values(array_unique($validationNotices)),
        ];
    }
}
