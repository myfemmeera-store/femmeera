'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Bell, User as UserIcon, LogOut } from 'lucide-react';
import { User } from '@/types';
import { authService } from '@/services/authService';

interface AdminNavbarProps {
  user: User | null;
  onOpenMobileMenu: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ user, onOpenMobileMenu }) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200/80 px-4 sm:px-6 h-16 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none"
          aria-label="Open Mobile Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Title */}
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="Femmeera Admin"
            width={150}
            height={48}
            className="h-9 w-auto object-contain"
            priority
          />
          <span className="hidden sm:inline-block text-xs font-semibold text-neutral-500 uppercase tracking-widest border-l border-neutral-200 pl-2.5">
            Admin Panel
          </span>
        </Link>
      </div>

      {/* Right Header Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Notifications Icon */}
        <button className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* User Info & Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-neutral-200">
          <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-neutral-900 leading-tight">{user?.name || 'Admin User'}</p>
            <p className="text-[11px] font-medium text-neutral-500">{user?.roles?.[0] || 'Administrator'}</p>
          </div>
          <button
            onClick={() => authService.logout()}
            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
