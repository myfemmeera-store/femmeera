'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { apiClient } from '@/services/apiClient';

interface PaymentItem {
  id: number;
  order_id: number;
  provider: string;
  provider_payment_order_id: string;
  provider_payment_id: string | null;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  paid_at: string | null;
  created_at: string;
  order?: {
    id: number;
    order_number: string;
    customer?: {
      name: string;
      email: string;
    };
  };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let query = `/admin/payments?page=${page}`;
      if (selectedStatus !== 'ALL') {
        query += `&status=${selectedStatus}`;
      }
      if (search.trim()) {
        query += `&search=${encodeURIComponent(search.trim())}`;
      }

      const res = await apiClient<any>(query);
      if (res.success && res.data) {
        setPayments(res.data.data || []);
        setTotalPages(res.data.last_page || 1);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPayments();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> PAID
          </span>
        );
      case 'PENDING':
      case 'CREATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" /> PENDING
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertTriangle className="w-3.5 h-3.5" /> FAILED
          </span>
        );
      case 'REFUNDED':
      case 'PARTIALLY_REFUNDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <RotateCcw className="w-3.5 h-3.5" /> {status.replace('_', ' ')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-amber-100 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-amber-900/30">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold tracking-widest uppercase rounded-full">
              Phase 8 • Razorpay System
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold tracking-widest uppercase rounded-full">
              Live Signature Auditing
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-amber-400" />
            Payment Management & Transaction Audit
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Server-authoritative payment tracking, Razorpay webhook log auditing, and admin refund management.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Transactions
        </button>
      </div>

      {/* Controls Bar: Search & Status Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setSelectedStatus(st);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all shrink-0 cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Order # or Provider ID..."
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          </form>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-neutral-500">Loading payment records...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-neutral-800">No payment transactions found</h3>
            <p className="text-xs text-neutral-500 mt-1">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Payment ID</th>
                  <th className="px-4 py-3">Order Number</th>
                  <th className="px-4 py-3">Provider Order ID</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Paid Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700 font-medium">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-neutral-900">
                      #{p.id}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-800">
                      {p.order?.order_number || `#${p.order_id}`}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-neutral-600">
                      {p.provider_payment_order_id || '—'}
                    </td>
                    <td className="px-4 py-3 font-bold text-neutral-900">
                      ₹{Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 font-bold rounded text-[10px] uppercase">
                        {p.method || p.provider}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-[11px]">
                      {p.paid_at ? new Date(p.paid_at).toLocaleString() : 'Not paid'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/payments/${p.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg font-bold text-[11px] shadow-2xs transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-600">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg disabled:opacity-40 font-semibold"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg disabled:opacity-40 font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
