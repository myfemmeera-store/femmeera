'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Shirt, Warehouse, FolderTree } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  const items = [
    { label: 'Dash', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Orders', href: '/dashboard/orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { label: 'Products', href: '/dashboard/products', icon: <Shirt className="w-5 h-5" /> },
    { label: 'Stock', href: '/dashboard/inventory', icon: <Warehouse className="w-5 h-5" /> },
    { label: 'Category', href: '/dashboard/categories', icon: <FolderTree className="w-5 h-5" /> },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200/80 px-2 py-1.5 shadow-lg flex items-center justify-around">
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full py-1 text-[11px] font-semibold transition-colors touch-manipulation ${
              isActive ? 'text-black font-bold' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-neutral-100' : ''}`}>{item.icon}</div>
            <span className="mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
