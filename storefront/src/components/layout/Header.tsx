'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Heart,
  ShoppingBag,
  User as UserIcon,
  ChevronDown,
  X,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  CreditCard
} from 'lucide-react';
import { Category, User } from '@/types';
import { categoryService } from '@/services/categoryService';
import { authService } from '@/services/authService';
import { cartService } from '@/services/cartService';
import { wishlistService } from '@/services/wishlistService';
import { settingService } from '@/services/settingService';
import { productService, SearchSuggestion } from '@/services/productService';
import { MobileNavDrawer } from './MobileNavDrawer';
import { CartDrawer } from './CartDrawer';

export const Header: React.FC = () => {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [logoUrl, setLogoUrl] = useState('/logo.png');
  const [announcementText, setAnnouncementText] = useState('Free Shipping on Orders above ₹1499 | COD Available');
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    categoryService.getCategories().then((res) => {
      if (res.success && res.data) {
        setCategories(res.data);
      }
    });

    settingService.getSettings().then((res) => {
      if (res.success && res.data) {
        if (res.data.store_logo) setLogoUrl(res.data.store_logo);
        if (res.data.announcement_bar) setAnnouncementText(res.data.announcement_bar);
      }
    });

    const updateAuthUser = () => {
      const storedUser = authService.getStoredUser();
      const token = authService.getStoredToken();
      if (storedUser || token) {
        setUser(storedUser || ({ id: 0, name: 'Account', email: '' } as any));
      } else {
        setUser(null);
      }
    };

    updateAuthUser();
    updateCounts();

    window.addEventListener('storage', updateCounts);
    window.addEventListener('storage', updateAuthUser);
    window.addEventListener('femmeera-cart-updated', updateCounts);
    window.addEventListener('femmeera-auth-updated', updateAuthUser);
    return () => {
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('storage', updateAuthUser);
      window.removeEventListener('femmeera-cart-updated', updateCounts);
      window.removeEventListener('femmeera-auth-updated', updateAuthUser);
    };
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await productService.getSearchSuggestions(searchQuery);
        if (res.success && res.data) {
          setSuggestions(res.data);
        }
      } catch (err) {
        // Ignore
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const updateCounts = async () => {
    try {
      const res = await cartService.getCart();
      if (res.success && res.data) {
        setCartCount(res.data.item_count);
      }
    } catch { }
    setWishlistCount(wishlistService.getWishlist().length);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (slug: string) => {
    router.push(`/product/${slug}`);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSuggestions([]);
  };

  const womenCategory = categories.find((c) => c.slug === 'women') || categories[0];
  const subCategories = categories.filter((c) => c.parent_id === womenCategory?.id);

  return (
    <>
      {/* Top Announcement Bar - Reference Design */}
      {isAnnouncementVisible && (
        <div className="bg-[#FAF4EB] border-b border-[#EFE5D5] text-[#7A6240] text-[11px] font-semibold py-2 px-4 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center space-x-6 mx-auto md:mx-0 overflow-x-auto scrollbar-none py-0.5">
              <span className="flex items-center gap-1.5 shrink-0">
                <Truck className="w-3.5 h-3.5 text-[#B38548]" />
                {announcementText}
              </span>
              <span className="hidden sm:flex items-center gap-1.5 shrink-0">
                <CreditCard className="w-3.5 h-3.5 text-[#B38548]" />
                COD Available
              </span>
              <span className="hidden md:flex items-center gap-1.5 shrink-0">
                <RotateCcw className="w-3.5 h-3.5 text-[#B38548]" />
                Easy Returns
              </span>
              <span className="hidden lg:flex items-center gap-1.5 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B38548]" />
                Secure Payment
              </span>
            </div>

            <div className="flex items-center space-x-3 text-[11px] text-[#555] font-medium shrink-0 ml-auto">
              <div className="hidden sm:flex items-center space-x-1">
                <span>India (INR ₹)</span>
                <ChevronDown className="w-3 h-3 text-[#777]" />
              </div>
              <button
                type="button"
                onClick={() => setIsAnnouncementVisible(false)}
                title="Dismiss Announcement"
                className="p-1 hover:bg-[#EFE5D5] text-[#7A6240] hover:text-black rounded-full transition-colors shrink-0"
                aria-label="Dismiss Announcement Bar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Header Bar */}
      <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-[#EFE6D8] shadow-2xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 sm:h-24 flex items-center justify-between">

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="lg:hidden p-2 text-neutral-800 hover:bg-[#FAF4EB] rounded-lg transition-colors"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Femmeera Brand Logo Graphic */}
          <Link href="/" className="flex items-center group py-1">
            <Image
              src={logoUrl}
              alt="Femmeera - Dress to Express"
              width={220}
              height={70}
              className="h-12 sm:h-16 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              priority
            />
          </Link>

          {/* Navigation Links - Reference Design */}
          <nav className="hidden lg:flex items-center space-x-7 text-[11px] font-bold uppercase tracking-[0.15em] text-[#222222]">
            <Link href="/shop" className="hover:text-[#B38548] transition-colors py-2">
              NEW ARRIVALS
            </Link>

            <Link href="/women/traditional-wear" className="hover:text-[#B38548] transition-colors py-2">
              Traditional Wear
            </Link>

            {/* <Link href="/women/traditional-wear" className="hover:text-[#B38548] transition-colors py-2">
              LEHENGAS
            </Link>

            <Link href="/women/traditional-wear" className="hover:text-[#B38548] transition-colors py-2">
              KURTIS
            </Link> */}

            <Link href="/women/western-wear" className="hover:text-[#B38548] transition-colors py-2">
              WESTERN WEAR
            </Link>

            {/* <Link href="/shop" className="text-[#B38548] font-extrabold hover:text-[#966C32] transition-colors py-2">
              SALE
            </Link> */}
          </nav>

          {/* Right Header Utilities */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Search Icon */}
            <div className="relative">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-neutral-800 hover:text-[#B38548] hover:bg-[#FAF4EB] rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white border border-[#EFE6D8] shadow-2xl rounded-2xl p-3 z-50 space-y-2">
                  <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Search sarees, dresses, kurtis..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-[#FDFBF7] border border-[#E8DEC8] rounded-xl text-xs focus:outline-hidden focus:border-[#B38548]"
                      autoFocus
                    />
                    <button type="submit" className="p-2 bg-[#B38548] text-white rounded-xl hover:bg-[#966C32] transition-colors">
                      <Search className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Autocomplete / Live Suggestions Box */}
                  {searchQuery.trim().length > 0 && (
                    <div className="pt-2 border-t border-neutral-100 max-h-72 overflow-y-auto space-y-1">
                      {isSearching ? (
                        <p className="text-[11px] text-neutral-400 p-2 text-center font-bold">Searching products...</p>
                      ) : suggestions.length > 0 ? (
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-2 block mb-1">
                            Matching Products ({suggestions.length})
                          </span>
                          {suggestions.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelectSuggestion(item.slug)}
                              className="w-full text-left p-2 hover:bg-[#FAF4EB] rounded-xl flex items-center space-x-3 transition-colors group"
                            >
                              <div className="w-10 h-10 bg-neutral-100 rounded-lg overflow-hidden shrink-0 border border-neutral-200">
                                {item.image_url ? (
                                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[9px] text-neutral-400 font-bold">FEM</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-neutral-900 truncate group-hover:text-[#B38548] transition-colors">{item.name}</h4>
                                <span className="text-[10px] text-neutral-400 block truncate">{item.category_name}</span>
                              </div>
                              <span className="text-xs font-black text-neutral-900">
                                ₹{Number(item.price || 0).toLocaleString('en-IN')}
                              </span>
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={handleSearchSubmit}
                            className="w-full py-2 mt-1 text-center text-xs font-bold text-[#B38548] hover:bg-[#FAF4EB] rounded-xl transition-colors"
                          >
                            View all results for &quot;{searchQuery}&quot; →
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 text-center space-y-1">
                          <p className="text-xs text-neutral-500 font-medium">No direct matches for &quot;{searchQuery}&quot;</p>
                          <button
                            type="button"
                            onClick={handleSearchSubmit}
                            className="text-[11px] font-bold text-[#B38548] underline hover:text-[#966C32]"
                          >
                            Browse catalog with related recommendations
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Account Icon */}
            {(() => {
              const isLoggedIn = isMounted && (!!user || !!authService.getStoredToken());
              return (
                <Link
                  href={isLoggedIn ? '/account' : '/login'}
                  className="p-2 text-neutral-800 hover:text-[#B38548] hover:bg-[#FAF4EB] rounded-full transition-colors relative group"
                  aria-label="Account"
                  title={isLoggedIn ? `Account (${user?.name || 'Logged In'})` : 'Sign In / Register'}
                >
                  <UserIcon className="w-5 h-5" />
                  {isLoggedIn && (
                    <span className="absolute bottom-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
                  )}
                </Link>
              );
            })()}

            {/* Wishlist Heart Icon */}
            <Link
              href="/wishlist"
              className="relative p-2 text-neutral-800 hover:text-[#B38548] hover:bg-[#FAF4EB] rounded-full transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#B38548] text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Bag Icon */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-2 text-neutral-800 hover:text-[#B38548] hover:bg-[#FAF4EB] rounded-full transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#B38548] text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileNavDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        categories={subCategories}
      />

      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        onCartUpdate={updateCounts}
      />
    </>
  );
};
