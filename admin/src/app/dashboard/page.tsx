'use client';

import React, { useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboardService';
import { DashboardStats } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { IndianRupee, ShoppingBag, Users, AlertTriangle, ArrowUpRight, TrendingUp, Sparkles, PlusCircle, Ticket, Package, Video, Mail } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visitorStats, setVisitorStats] = useState<{ live_visitors: number; total_visitors: number }>({
    live_visitors: 0,
    total_visitors: 0,
  });

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      } else {
        setError(res.message || 'Failed to load dashboard metrics.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to communicate with dashboard API.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();

    // Poll live visitor stats every 5 seconds
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.femmeera.com/api/v1';
    const fetchVisitorStats = async () => {
      try {
        let res = await fetch(`${apiBaseUrl}/admin/analytics/visitors`);
        if (!res.ok) res = await fetch(`${apiBaseUrl}/visitor/stats`);
        const json = await res.json();
        if (json.success && json.data) {
          setVisitorStats({
            live_visitors: json.data.live_visitors ?? 0,
            total_visitors: json.data.total_visitors ?? 0,
          });
        }
      } catch (err) {}
    };

    fetchVisitorStats();
    const interval = setInterval(fetchVisitorStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboardStats} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">Overview Dashboard</h1>
          <p className="text-xs text-neutral-500">Live operational metrics & storefront snapshot</p>
        </div>
        <div className="inline-flex items-center text-xs font-semibold text-neutral-500 bg-white border border-neutral-200 px-3 py-1.5 rounded-lg shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
          Realtime Store Monitor
        </div>
      </div>

      {/* Realtime Live & Total Visitor Traffic Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-neutral-900 via-neutral-800 to-black text-white rounded-2xl shadow-md border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex h-3.5 w-3.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-2">
              <span>Real-Time Visitor Traffic</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full">Live Monitor</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">Active storefront visitors & total unique visits counter</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-6 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">🟢 Live Active:</span>
            <span className="font-mono font-black text-lg sm:text-xl text-white">{visitorStats.live_visitors}</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">👥 Total Visitors:</span>
            <span className="font-mono font-black text-lg sm:text-xl text-white">{visitorStats.total_visitors.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards Grid - Single Row on Mobile (grid-cols-4) */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-4">
        {/* Total Sales */}
        <div className="bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-neutral-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-xs font-bold uppercase tracking-tight sm:tracking-wider text-neutral-500 truncate">Total Sales</span>
            <div className="p-1 sm:p-2 bg-emerald-50 text-emerald-600 rounded-md sm:rounded-lg shrink-0">
              <IndianRupee className="w-3 h-3 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-xs sm:text-2xl font-black text-neutral-900 mt-1.5 sm:mt-3 truncate">
            ₹{stats?.todays_sales ? stats.todays_sales.toLocaleString('en-IN') : '0'}
          </p>
          <div className="hidden sm:flex items-center text-[11px] text-emerald-600 font-semibold mt-2">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>Active transactions</span>
          </div>
        </div>

        {/* Orders Today */}
        <div className="bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-neutral-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-xs font-bold uppercase tracking-tight sm:tracking-wider text-neutral-500 truncate">Orders Today</span>
            <div className="p-1 sm:p-2 bg-sky-50 text-sky-600 rounded-md sm:rounded-lg shrink-0">
              <ShoppingBag className="w-3 h-3 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-xs sm:text-2xl font-black text-neutral-900 mt-1.5 sm:mt-3 truncate">{stats?.orders_today || 0}</p>
          <p className="hidden sm:block text-[11px] text-neutral-500 mt-2">{stats?.pending_orders || 0} orders pending</p>
        </div>

        {/* Total Customers */}
        <Link href="/dashboard/customers" className="block">
          <div className="bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-neutral-100 shadow-2xs hover:border-[#B38548] cursor-pointer flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-xs font-bold uppercase tracking-tight sm:tracking-wider text-neutral-500 truncate">Customers</span>
              <div className="p-1 sm:p-2 bg-indigo-50 text-indigo-600 rounded-md sm:rounded-lg shrink-0">
                <Users className="w-3 h-3 sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-xs sm:text-2xl font-black text-neutral-900 mt-1.5 sm:mt-3 truncate">
              {stats?.total_customers ? stats.total_customers.toLocaleString('en-IN') : 0}
            </p>
            <p className="hidden sm:flex text-[11px] text-indigo-600 font-semibold mt-2 items-center justify-between">
              <span>View user directory</span>
              <span>→</span>
            </p>
          </div>
        </Link>

        {/* Low Stock Alerts */}
        <div className="bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-neutral-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-xs font-bold uppercase tracking-tight sm:tracking-wider text-neutral-500 truncate">Low Stock</span>
            <div className="p-1 sm:p-2 bg-amber-50 text-amber-600 rounded-md sm:rounded-lg shrink-0">
              <AlertTriangle className="w-3 h-3 sm:w-5 sm:h-5" />
            </div>
          </div>
          <p className="text-xs sm:text-2xl font-black text-neutral-900 mt-1.5 sm:mt-3 truncate">{stats?.low_stock_products || 0}</p>
          <p className="hidden sm:block text-[11px] text-amber-700 font-medium mt-2">Variants below limit</p>
        </div>
      </div>

      {/* MOBILE ONLY: App-Style Daily Quick Actions Launcher Grid (sm:hidden) */}
      <div className="block sm:hidden bg-gradient-to-br from-neutral-900 via-neutral-900 to-rose-950 p-4 rounded-2xl text-white shadow-lg space-y-3 border border-white/10">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-rose-100">Daily Quick Actions</span>
          </div>
          <span className="text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
            Mobile App View
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center pt-1">
          <Link href="/dashboard/orders" className="flex flex-col items-center justify-center p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-95">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg mb-1 relative">
              <ShoppingBag className="w-4 h-4" />
              {stats?.pending_orders ? (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                  {stats.pending_orders}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] font-bold text-neutral-200 truncate w-full">Orders</span>
          </Link>

          <Link href="/dashboard/products/new" className="flex flex-col items-center justify-center p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-95">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg mb-1">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-neutral-200 truncate w-full">+ Add Item</span>
          </Link>

          <Link href="/dashboard/coupons" className="flex flex-col items-center justify-center p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-95">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg mb-1">
              <Ticket className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-neutral-200 truncate w-full">Coupons</span>
          </Link>

          <Link href="/dashboard/products" className="flex flex-col items-center justify-center p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-95">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg mb-1">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-neutral-200 truncate w-full">Products</span>
          </Link>

          <Link href="/dashboard/reels" className="flex flex-col items-center justify-center p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-95">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg mb-1">
              <Video className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-neutral-200 truncate w-full">Reels</span>
          </Link>

          <Link href="/dashboard/banners" className="flex flex-col items-center justify-center p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-95">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg mb-1">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-neutral-200 truncate w-full">Banners</span>
          </Link>

          <Link href="/dashboard/settings/email-notifications" className="flex flex-col items-center justify-center p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-95">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg mb-1">
              <Mail className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-neutral-200 truncate w-full">Emails</span>
          </Link>

          <Link href="/dashboard/customers" className="flex flex-col items-center justify-center p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-95">
            <div className="p-2 bg-teal-500/20 text-teal-400 rounded-lg mb-1">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-neutral-200 truncate w-full">Customers</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Recent Orders + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders List */}
        <Card
          title="Recent Storefront Orders"
          subtitle="Latest checkout transactions"
          action={
            <Link
              href="/dashboard/orders"
              className="text-xs font-bold text-black hover:underline inline-flex items-center"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          }
          className="lg:col-span-2"
        >
          {stats?.recent_orders && stats.recent_orders.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-xs hover:bg-neutral-100/80 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-neutral-900">{order.order_number}</p>
                    <p className="text-neutral-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-black text-neutral-900">₹{order.total_amount.toLocaleString('en-IN')}</p>
                    <Badge variant={order.payment_status === 'PAID' ? 'success' : 'warning'}>
                      {order.payment_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-neutral-400">No orders recorded today yet.</div>
          )}
        </Card>

        {/* Operational Quick Actions Panel */}
        <Card title="Quick Catalog Actions" subtitle="Rapid store management shortcuts">
          <div className="space-y-2.5 pt-1">
            <Link
              href="/dashboard/products/new"
              className="block p-3 bg-black text-white rounded-lg text-xs font-bold text-center hover:bg-neutral-800 transition-colors"
            >
              + Add New Clothing Product
            </Link>

            <Link
              href="/dashboard/categories"
              className="block p-3 bg-neutral-100 text-neutral-900 rounded-lg text-xs font-bold text-center hover:bg-neutral-200 transition-colors"
            >
              Manage Catalog Categories
            </Link>

            <Link
              href="/dashboard/inventory"
              className="block p-3 bg-neutral-100 text-neutral-900 rounded-lg text-xs font-bold text-center hover:bg-neutral-200 transition-colors"
            >
              Review Low Stock Inventory
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
