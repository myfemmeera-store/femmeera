'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { Product } from '@/types';
import { wishlistService } from '@/services/wishlistService';
import { cartService } from '@/services/cartService';
import { analytics } from '@/lib/analytics';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(() =>
    wishlistService.isInWishlist(product.id)
  );

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = wishlistService.toggleWishlist(product);
    setIsWishlisted(result.isWishlisted);
    if (result.isWishlisted) {
      analytics.track('WISHLIST_ADD', { product_id: product.id, product_name: product.name });
    }
  };

  // Find lowest price & highest mrp among variants
  const variants = product.variants || [];
  const primaryPrice = product.price || (variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : 1499);
  const primaryMrp = product.mrp || (variants.length > 0 ? Math.max(...variants.map((v) => v.mrp)) : 1999);
  const discountPercent = primaryMrp > primaryPrice ? Math.round(((primaryMrp - primaryPrice) / primaryMrp) * 100) : 0;

  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const firstVariant = variants[0];
    if (!firstVariant) return;

    setIsAdding(true);
    try {
      const res = await cartService.addItem(firstVariant.id, 1);
      if (res.success) {
        setAddedSuccess(true);
        window.dispatchEvent(new Event('femmeera-cart-updated'));
        setTimeout(() => setAddedSuccess(false), 2000);
      }
    } catch (err) {
      // Ignore
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group relative bg-white border border-neutral-200/80 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      {/* Product Image Box */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-3/4 bg-neutral-100 overflow-hidden">
        {/* Placeholder / Primary Image */}
        <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400 font-bold text-xs group-hover:scale-105 transition-transform duration-500">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="uppercase tracking-widest text-[11px] text-neutral-400 font-mono">{product.brand || 'FEMMEERA'}</span>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col space-y-1">
          {product.is_new && (
            <span className="px-2 py-0.5 bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-md">
              NEW
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2.5 right-2.5 p-2 bg-white/90 backdrop-blur-md rounded-full text-neutral-700 hover:text-rose-600 transition-colors shadow-sm z-10"
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>
      </Link>

      {/* Product Details Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
            {product.category?.name || product.brand || 'WOMEN'}
          </span>
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 line-clamp-1 group-hover:text-neutral-600 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Real Rating & Review Count */}
        {product.rating !== undefined && product.rating > 0 && (
          <div className="flex items-center space-x-1 text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-neutral-900">{product.rating.toFixed(1)}</span>
            {product.review_count !== undefined && (
              <span className="text-neutral-400 text-[11px]">({product.review_count})</span>
            )}
          </div>
        )}

        {/* Price & Add to Cart Row */}
        <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-sm sm:text-base font-black text-neutral-900">
              ₹{Number(primaryPrice || 0).toLocaleString('en-IN')}
            </span>
            {primaryMrp > primaryPrice && (
              <span className="text-[11px] text-neutral-400 line-through">
                ₹{Number(primaryMrp || 0).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              addedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-black text-white hover:bg-neutral-800 active:scale-95'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {addedSuccess ? 'Added' : isAdding ? '...' : 'Add'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
