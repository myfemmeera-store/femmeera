'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '@/types';
import { wishlistService } from '@/services/wishlistService';
import { ProductGrid } from '@/components/ui/ProductGrid';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    setWishlist(wishlistService.getWishlist());
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="border-b border-neutral-200 pb-6 space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
          SAVED ITEMS
        </span>
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900">
          My Wishlist ({wishlist.length})
        </h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <Heart className="w-12 h-12 text-neutral-300 mx-auto" />
          <h2 className="text-lg font-black uppercase text-neutral-900">Your Wishlist is Empty</h2>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Save your favorite sarees, kurtis, and western dresses here for quick access later.
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-3.5 bg-black text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-colors shadow-md"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <ProductGrid products={wishlist} />
      )}
    </div>
  );
}
