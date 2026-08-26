'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { cartService } from '@/services/cartService';
import { wishlistService } from '@/services/wishlistService';
import { authService } from '@/services/authService';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const update = async () => {
      try {
        const res = await cartService.getCart();
        if (res.success && res.data) {
          setCartCount(res.data.item_count);
        }
      } catch {}
      setWishlistCount(wishlistService.getWishlist().length);
      setIsLoggedIn(!!authService.getStoredToken());
    };
    update();
    window.addEventListener('storage', update);
    window.addEventListener('femmeera-auth-updated', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('femmeera-auth-updated', update);
    };
  }, []);

  const navs = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/shop', label: 'Shop', icon: Grid },
    { href: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { href: '/cart', label: 'Cart', icon: ShoppingBag, badge: cartCount },
    { href: isLoggedIn ? '/account' : '/login', label: 'Account', icon: User },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-2 py-2 flex items-center justify-around">
      {navs.map((n) => {
        const Icon = n.icon;
        const isActive = pathname === n.href;
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`flex flex-col items-center py-1 px-3 relative transition-colors ${
              isActive ? 'text-black' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Icon className="w-5 h-5" />
            {n.badge !== undefined && n.badge > 0 && (
              <span className="absolute top-0 right-2 w-4 h-4 bg-black text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                {n.badge}
              </span>
            )}
            <span className="text-[10px] font-bold mt-1 tracking-tight">{n.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
