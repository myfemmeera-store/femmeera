'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Eye, ArrowLeft } from 'lucide-react';
import { Order } from '@/types';
import { apiClient } from '@/services/apiClient';
import { authService } from '@/services/authService';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = authService.getStoredUser();
    if (user) {
      apiClient<Order[]>('/customer/orders')
        .then((res) => {
          if (res.success && res.data) {
            setOrders(res.data);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex items-center space-x-3 border-b border-neutral-200 pb-6">
        <Link href="/account" className="p-2 border border-neutral-200 rounded-xl hover:bg-neutral-100">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
            ORDER HISTORY
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
            My Orders ({orders.length})
          </h1>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs font-bold text-neutral-400">Loading order history...</div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto" />
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">You haven't placed any orders yet</p>
          <Link href="/shop" className="inline-block px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="p-5 bg-white border border-neutral-200/80 rounded-3xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-black text-xs text-neutral-900 block">{o.order_number}</span>
                  <span className="text-[11px] text-neutral-400">{new Date(o.created_at).toLocaleDateString()}</span>
                </div>
                <span className="px-3 py-1 bg-neutral-100 text-neutral-900 text-xs font-bold rounded-full uppercase">
                  {o.order_status}
                </span>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase font-bold block">Total Amount</span>
                  <span className="font-black text-sm text-neutral-900">₹{o.total_amount.toLocaleString('en-IN')}</span>
                </div>

                <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-[11px] font-bold rounded-md">
                  {o.payment_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
