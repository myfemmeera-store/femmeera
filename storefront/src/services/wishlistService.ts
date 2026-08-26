import { Product } from '@/types';

const WISHLIST_KEY = 'femmeera_wishlist_items';

export const wishlistService = {
  getWishlist(): Product[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(WISHLIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleWishlist(product: Product): { isWishlisted: boolean; wishlist: Product[] } {
    const wishlist = this.getWishlist();
    const index = wishlist.findIndex((p) => p.id === product.id);
    let isWishlisted = false;

    if (index > -1) {
      wishlist.splice(index, 1);
      isWishlisted = false;
    } else {
      wishlist.push(product);
      isWishlisted = true;
    }

    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    return { isWishlisted, wishlist };
  },

  isInWishlist(productId: number): boolean {
    const wishlist = this.getWishlist();
    return wishlist.some((p) => p.id === productId);
  }
};
