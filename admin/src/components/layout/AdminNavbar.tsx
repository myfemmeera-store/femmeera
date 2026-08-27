'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Menu,
  Bell,
  User as UserIcon,
  LogOut,
  ShoppingBag,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  CheckCheck,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { User } from '@/types';
import { authService } from '@/services/authService';

interface AdminNavbarProps {
  user: User | null;
  onOpenMobileMenu: () => void;
}

interface NotificationItem {
  id: string;
  type: 'order' | 'stock' | 'user' | 'payment';
  title: string;
  description: string;
  time: string;
  link: string;
  isRead: boolean;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ user, onOpenMobileMenu }) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'orders'>('all');
  const notifRef = useRef<HTMLDivElement>(null);

  // Initial Sample Notifications (Simulating live store events)
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'order',
      title: 'New Order Received',
      description: 'Order #FEM-9402 placed for ₹2,499 by Ananya Sharma.',
      time: '10m ago',
      link: '/dashboard/orders',
      isRead: false,
    },
    {
      id: '2',
      type: 'stock',
      title: 'Low Stock Alert',
      description: 'Embroidered Silk Anarkali (Size L) has only 2 items left in stock.',
      time: '45m ago',
      link: '/dashboard/inventory',
      isRead: false,
    },
    {
      id: '3',
      type: 'user',
      title: 'New Customer Registered',
      description: 'Priya Verma created a new account on Femmeera Store.',
      time: '2h ago',
      link: '/dashboard/customers',
      isRead: false,
    },
    {
      id: '4',
      type: 'payment',
      title: 'Payment Confirmed',
      description: 'Razorpay payment ₹1,899 verified for Order #FEM-9398.',
      time: '3h ago',
      link: '/dashboard/payments',
      isRead: true,
    },
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'orders') return n.type === 'order';
    return true;
  });

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'stock':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'user':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'payment':
        return <CheckCircle2 className="w-4 h-4 text-purple-600" />;
    }
  };

  const getBg = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order':
        return 'bg-emerald-50 border-emerald-100';
      case 'stock':
        return 'bg-amber-50 border-amber-100';
      case 'user':
        return 'bg-blue-50 border-blue-100';
      case 'payment':
        return 'bg-purple-50 border-purple-100';
    }
  };

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
        {/* Interactive Notifications Icon & Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-neutral-700" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200/80 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header */}
              <div className="p-3.5 bg-neutral-900 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-xs uppercase tracking-wider">Store Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-rose-500/30 text-rose-300 border border-rose-500/50 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-neutral-300 hover:text-white flex items-center space-x-1 hover:underline transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-neutral-100 bg-neutral-50/80 p-1 gap-1 text-xs">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    activeTab === 'all'
                      ? 'bg-white text-black shadow-2xs border border-neutral-200/80'
                      : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setActiveTab('unread')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    activeTab === 'unread'
                      ? 'bg-white text-black shadow-2xs border border-neutral-200/80'
                      : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    activeTab === 'orders'
                      ? 'bg-white text-black shadow-2xs border border-neutral-200/80'
                      : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  Orders
                </button>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
                {filteredNotifications.length === 0 ? (
                  <div className="p-6 text-center text-neutral-400 space-y-1">
                    <Sparkles className="w-6 h-6 mx-auto text-neutral-300" />
                    <p className="text-xs font-bold text-neutral-600">No Notifications</p>
                    <p className="text-[11px] text-neutral-400">All store alerts will appear right here.</p>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => (
                    <Link
                      key={notif.id}
                      href={notif.link}
                      onClick={() => {
                        markAsRead(notif.id);
                        setIsNotifOpen(false);
                      }}
                      className={`block p-3 hover:bg-neutral-50/80 transition-colors relative group ${
                        !notif.isRead ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`p-2 rounded-xl border flex-shrink-0 ${getBg(
                            notif.type
                          )}`}
                        >
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4
                              className={`text-xs font-bold truncate ${
                                !notif.isRead ? 'text-neutral-900' : 'text-neutral-700'
                              }`}
                            >
                              {notif.title}
                            </h4>
                            <span className="text-[10px] font-mono text-neutral-400 flex-shrink-0">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-600 line-clamp-2 mt-0.5">
                            {notif.description}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity self-center flex-shrink-0" />
                      </div>
                      {!notif.isRead && (
                        <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                      )}
                    </Link>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-xs">
                <Link
                  href="/dashboard/settings/email-notifications"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-[11px] font-semibold text-neutral-500 hover:text-black flex items-center space-x-1"
                >
                  <span>Notification Settings</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <Link
                  href="/dashboard/orders"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-[11px] font-bold text-black hover:underline"
                >
                  View All Orders →
                </Link>
              </div>
            </div>
          )}
        </div>

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
