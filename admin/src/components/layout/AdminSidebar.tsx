'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shirt,
  FolderTree,
  Boxes,
  Warehouse,
  ShoppingBag,
  CreditCard,
  Users,
  MessageSquare,
  Ticket,
  Globe,
  BarChart3,
  Settings,
  Sparkles,
  Truck,
  RotateCcw,
  Mail,
  Calculator
} from 'lucide-react';
import { User } from '@/types';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
  badge?: string;
  children?: { title: string; href: string }[];
}

interface AdminSidebarProps {
  user: User | null;
  onNavigate?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ user, onNavigate }) => {
  const pathname = usePathname();

  const userRoles = user?.roles || [];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

  const navItems: SidebarItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      title: 'Products',
      href: '/dashboard/products',
      icon: <Shirt className="w-4 h-4" />,
      permission: 'products.view',
    },
    {
      title: 'Categories',
      href: '/dashboard/categories',
      icon: <FolderTree className="w-4 h-4" />,
      permission: 'categories.view',
    },
    {
      title: 'Inventory',
      href: '/dashboard/inventory',
      icon: <Warehouse className="w-4 h-4" />,
      permission: 'inventory.view',
    },
    {
      title: 'Orders',
      href: '/dashboard/orders',
      icon: <ShoppingBag className="w-4 h-4" />,
      permission: 'orders.view',
    },
    {
      title: 'Shipping & Rules',
      href: '/dashboard/shipping',
      icon: <Truck className="w-4 h-4 text-amber-600" />,
      permission: 'settings.view',
    },
    {
      title: 'Rate Calculator',
      href: '/dashboard/shipping/rate-calculator',
      icon: <Calculator className="w-4 h-4 text-blue-600" />,
      badge: 'Shiprocket',
    },
    {
      title: 'Returns',
      href: '/dashboard/returns',
      icon: <RotateCcw className="w-4 h-4 text-rose-600" />,
      permission: 'orders.view',
    },
    {
      title: 'Payments',
      href: '/dashboard/payments',
      icon: <CreditCard className="w-4 h-4 text-[#B38548]" />,
      permission: 'orders.view',
    },
    {
      title: 'Customers',
      href: '/dashboard/customers',
      icon: <Users className="w-4 h-4" />,
      permission: 'customers.view',
    },
    {
      title: 'Reviews',
      href: '/dashboard/reviews',
      icon: <MessageSquare className="w-4 h-4" />,
      permission: 'reviews.view',
    },
    {
      title: 'Coupons & Influencers',
      href: '/dashboard/coupons',
      icon: <Ticket className="w-4 h-4 text-rose-500" />,
      permission: 'coupons.view',
    },
    {
      title: 'Website CMS',
      href: '/dashboard/cms',
      icon: <Globe className="w-4 h-4" />,
      permission: 'homepage.view',
    },
    {
      title: 'Hero Banners',
      href: '/dashboard/banners',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      badge: '100% Width',
    },
    {
      title: 'Watch & Shop Reels',
      href: '/dashboard/reels',
      icon: <Sparkles className="w-4 h-4 text-rose-500" />,
      badge: '9:16 Video',
    },
    {
      title: 'Reports',
      href: '/dashboard/reports',
      icon: <BarChart3 className="w-4 h-4" />,
      permission: 'reports.view',
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings className="w-4 h-4" />,
      permission: 'settings.view',
    },
    {
      title: 'Email Notifications',
      href: '/dashboard/settings/email-notifications',
      icon: <Mail className="w-4 h-4 text-[#B38548]" />,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-neutral-200/80 flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Navigation</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
                isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={isActive ? 'text-white dark:text-black' : 'text-neutral-400'}>{item.icon}</span>
                <span>{item.title}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
