'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { orderService, DetailedOrder } from '@/services/orderService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Search, Eye, ShoppingBag, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<DetailedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await orderService.getOrders(currentPage, debouncedSearch, statusFilter, paymentStatusFilter);
      if (res.success && res.data) {
        setOrders(res.data);
        if (res.meta?.pagination) {
          setLastPage(res.meta.pagination.last_page);
        }
      } else {
        setError(res.message || 'Failed to load orders.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage, debouncedSearch, statusFilter, paymentStatusFilter]);

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="success">DELIVERED</Badge>;
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return <Badge variant="info">{status}</Badge>;
      case 'PROCESSING':
      case 'PACKED':
      case 'CONFIRMED':
        return <Badge variant="warning">{status}</Badge>;
      case 'CANCELLED':
      case 'REFUNDED':
        return <Badge variant="error">{status}</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">Order Fulfillment Queue</h1>
        <p className="text-xs text-neutral-500">Manage order statuses, shipping tracking & customer cancellations</p>
      </div>

      {/* Filters & Search */}
      <Card className="!p-3 sm:!p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative w-full sm:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search Order # or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black min-h-[40px]"
            />
          </div>

          <Select
            options={[
              { value: '', label: '-- All Order Statuses --' },
              { value: 'PENDING', label: 'PENDING' },
              { value: 'CONFIRMED', label: 'CONFIRMED' },
              { value: 'PROCESSING', label: 'PROCESSING' },
              { value: 'PACKED', label: 'PACKED' },
              { value: 'SHIPPED', label: 'SHIPPED' },
              { value: 'DELIVERED', label: 'DELIVERED' },
              { value: 'CANCELLED', label: 'CANCELLED' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          />

          <Select
            options={[
              { value: '', label: '-- All Payment Statuses --' },
              { value: 'PAID', label: 'PAID' },
              { value: 'UNPAID', label: 'UNPAID' },
              { value: 'FAILED', label: 'FAILED' },
              { value: 'REFUNDED', label: 'REFUNDED' },
            ]}
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </Card>

      {/* Orders List Content */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadOrders} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No Orders Found"
          description="There are currently no customer orders matching your query filters."
          icon={<ShoppingBag className="w-6 h-6" />}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden bg-white border border-neutral-200/80 rounded-xl shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-extrabold text-neutral-900">{o.order_number}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-neutral-900">{o.user?.name || o.shipping_address_snapshot?.name || 'Customer'}</p>
                      <p className="text-[11px] text-neutral-400">{o.user?.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px]">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-black text-neutral-900">₹{o.total_amount.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={o.payment_status === 'PAID' ? 'success' : 'warning'}>
                        {o.payment_status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">{getOrderStatusBadge(o.order_status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/dashboard/orders/${o.id}`}>
                        <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Order Cards */}
          <div className="md:hidden space-y-3">
            {orders.map((o) => (
              <Card key={o.id} className="!p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-black text-xs text-neutral-900 block">{o.order_number}</span>
                    <p className="text-xs font-bold text-neutral-700 mt-0.5">{o.user?.name || o.shipping_address_snapshot?.name}</p>
                    <p className="text-[11px] text-neutral-400">{new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  {getOrderStatusBadge(o.order_status)}
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase block">Total</span>
                    <span className="font-black text-base text-neutral-900">₹{o.total_amount.toLocaleString('en-IN')}</span>
                  </div>

                  <Link href={`/dashboard/orders/${o.id}`}>
                    <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                      View Order
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <span className="text-xs font-medium text-neutral-500">
                Page {currentPage} of {lastPage}
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= lastPage}
                  onClick={() => setCurrentPage((prev) => Math.min(lastPage, prev + 1))}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
