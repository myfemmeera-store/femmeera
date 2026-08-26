'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ChevronRight, User as UserIcon, Heart, ShoppingBag, Shirt } from 'lucide-react';
import { Category } from '@/types';
import { settingService } from '@/services/settingService';
import { authService } from '@/services/authService';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  categories,
}) => {
  const [logoUrl, setLogoUrl] = useState('/logo.png');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!authService.getStoredToken());
    settingService.getSettings().then((res) => {
      if (res.success && res.data?.store_logo) {
        setLogoUrl(res.data.store_logo);
      }
    });
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-xs bg-white shadow-2xl flex flex-col">
          {/* Top Drawer Header */}
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <Link href="/" onClick={onClose}>
              <Image
                src={logoUrl}
                alt="Femmeera"
                width={150}
                height={50}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <button onClick={onClose} className="p-1 text-neutral-400 hover:text-black">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-bold uppercase tracking-wider text-neutral-800">
            <Link href="/" onClick={onClose} className="block py-2.5 border-b border-neutral-100">
              Home
            </Link>

            <Link href="/women" onClick={onClose} className="block py-2.5 border-b border-neutral-100">
              All Women's Collection
            </Link>

            <Link href="/women/traditional-wear" onClick={onClose} className="flex items-center justify-between py-2.5 border-b border-neutral-100">
              <span>Traditional Wear</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </Link>

            <Link href="/women/western-wear" onClick={onClose} className="flex items-center justify-between py-2.5 border-b border-neutral-100">
              <span>Western Wear</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </Link>

            <Link href="/shop" onClick={onClose} className="block py-2.5 border-b border-neutral-100">
              Complete Shop Catalog
            </Link>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-5 border-t border-neutral-100 bg-neutral-50 space-y-2">
            <Link
              href={isLoggedIn ? "/account" : "/login"}
              onClick={onClose}
              className="flex items-center justify-center space-x-2 w-full py-2.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-neutral-800 transition-colors"
            >
              <UserIcon className="w-4 h-4 text-amber-300" />
              <span>{isLoggedIn ? "My Account & Orders" : "Customer Account Sign In"}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
