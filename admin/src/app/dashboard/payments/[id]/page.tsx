'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  ShieldCheck,
  History,
  DollarSign,
  User,
  ShoppingBag
} from 'lucide-react';
import { apiClient } from '@/services/apiClient';

interface PaymentDetail {
  id: number;
  order_id: number;
  provider: string;
  provider_payment_order_id: string;
  provider_payment_id: string | null;
  provider_signature: string | null;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  failure_reason: string | null;
  paid_at: string | null;
  created_at: string;
  order?: {
    id: number;
    order_number: string;
    total_amount: number;
    order_status: string;
    payment_status: string;
    customer?: {
      id: number;
      name: string;
      email: string;
    };
  };
  transactions?: Array<{
    id: number;
    type: string;
    provider_reference: string | null;
    amount: number;
    status: string;
    metadata: any;
    created_at: string;
  }>;
  refunds?: Array<{
    id: number;
    amount: number;
    reason: string;
    status: string;
    provider_refund_id: string | null;
    creator?: {
      name: string;
    };
    created_at: string;
  }>;
}

export default function AdminPaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const paymentId = resolvedParams.id;
  const router = useRouter();

  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Refund Modal State
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [refundError, setRefundError] = useState('');
  const [refundSuccess, setRefundSuccess] = useState('');

  const fetchPaymentDetails = async () => {
    setLoading(true);
    try {
      const res = await apiClient<PaymentDetail>(`/admin/payments/${paymentId}`);
      if (res.success && res.data) {
        setPayment(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch payment details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetails();
  }, [paymentId]);

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setRefundError('');
    setRefundSuccess('');

    const amt = parseFloat(refundAmount);
    if (isNaN(amt) || amt <= 0) {
      setRefundError('Please enter a valid refund amount.');
      return;
    }

    if (!refundReason.trim()) {
      setRefundError('Please provide a reason for this refund.');
      return;
    }

    setSubmittingRefund(true);
    try {
      const res = await apiClient<any>(`/admin/payments/${paymentId}/refund`, {
        method: 'POST',
        body: JSON.stringify({
          amount: amt,
          reason: refundReason.trim(),
        }),
      });

      if (res.success) {
        setRefundSuccess('Refund processed successfully!');
        setShowRefundModal(false);
        setRefundAmount('');
        setRefundReason('');
        fetchPaymentDetails();
      } else {
        setRefundError(res.message || 'Refund processing failed.');
      }
    } catch (err: any) {
      setRefundError(err.message || 'Failed to process refund.');
    } finally {
      setSubmittingRefund(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-neutral-500">Loading payment audit log...</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-12 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-neutral-800">Payment Record Not Found</h2>
        <Link href="/dashboard/payments" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-amber-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Payments
        </Link>
      </div>
    );
  }

  const alreadyRefunded = (payment.refunds || []).reduce((acc, r) => acc + Number(r.amount), 0);
  const maxRefundable = payment.amount - alreadyRefunded;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/payments"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Payments List
        </Link>

        {(payment.status === 'PAID' || payment.status === 'PARTIALLY_REFUNDED') && maxRefundable > 0 && (
          <button
            onClick={() => setShowRefundModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Process Refund
          </button>
        )}
      </div>

      {refundSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{refundSuccess}</span>
        </div>
      )}

      {/* Main Payment Details Summary Header */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block mb-1">
              Payment Record ID: #{payment.id}
            </span>
            <h1 className="text-2xl font-serif font-bold text-neutral-900">
              ₹{Number(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} {payment.currency}
            </h1>
            <span className="text-xs text-neutral-500 mt-1 block">
              Method: <span className="font-bold text-neutral-800 uppercase">{payment.method || payment.provider}</span>
            </span>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${
              payment.status === 'PAID'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : payment.status === 'FAILED'
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              <ShieldCheck className="w-4 h-4" /> {payment.status}
            </span>
            <span className="text-[11px] text-neutral-500">
              Created: {new Date(payment.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Technical Provider Identifiers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Razorpay Order ID</span>
            <span className="font-mono font-bold text-neutral-800 break-all">{payment.provider_payment_order_id || 'N/A'}</span>
          </div>
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Razorpay Payment ID</span>
            <span className="font-mono font-bold text-neutral-800 break-all">{payment.provider_payment_id || 'N/A'}</span>
          </div>
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">HMAC Signature Status</span>
            <span className="font-mono font-bold text-emerald-700 break-all">
              {payment.provider_signature ? 'Verified ✓' : 'Pending / Test'}
            </span>
          </div>
        </div>
      </div>

      {/* Linked Order & Customer Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs space-y-3">
          <h3 className="font-bold text-xs uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-amber-600" /> Associated Order
          </h3>
          {payment.order ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Order Number:</span>
                <span className="font-mono font-bold text-amber-800">#{payment.order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Order Status:</span>
                <span className="font-bold text-neutral-800">{payment.order.order_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Order Amount:</span>
                <span className="font-bold text-neutral-900">₹{Number(payment.order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-500">No order record linked.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs space-y-3">
          <h3 className="font-bold text-xs uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-amber-600" /> Customer Account
          </h3>
          {payment.order?.customer ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Name:</span>
                <span className="font-bold text-neutral-900">{payment.order.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Email:</span>
                <span className="font-medium text-neutral-800">{payment.order.customer.email}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-500">Guest or unknown customer account.</p>
          )}
        </div>
      </div>

      {/* Transaction History Audit Log */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs p-6 space-y-4">
        <h3 className="font-bold text-xs uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
          <History className="w-4 h-4 text-amber-600" /> Transaction Audit Log
        </h3>

        {!payment.transactions || payment.transactions.length === 0 ? (
          <p className="text-xs text-neutral-500">No transaction audit logs recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-400 font-bold uppercase text-[10px] border-b">
                <tr>
                  <th className="px-3 py-2">Log ID</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Reference</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {payment.transactions.map((t) => (
                  <tr key={t.id} className="font-mono text-neutral-700">
                    <td className="px-3 py-2.5">#{t.id}</td>
                    <td className="px-3 py-2.5 font-bold text-amber-800">{t.type}</td>
                    <td className="px-3 py-2.5 text-neutral-500">{t.provider_reference || '—'}</td>
                    <td className="px-3 py-2.5 font-bold">₹{Number(t.amount).toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-neutral-400 text-[11px]">
                      {new Date(t.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refunds Section */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4 text-purple-600" /> Refund History
          </h3>
          <span className="text-xs font-bold text-neutral-600">
            Total Refunded: ₹{alreadyRefunded.toFixed(2)} / ₹{payment.amount.toFixed(2)}
          </span>
        </div>

        {!payment.refunds || payment.refunds.length === 0 ? (
          <p className="text-xs text-neutral-500">No refunds issued for this payment transaction.</p>
        ) : (
          <div className="space-y-3">
            {payment.refunds.map((r) => (
              <div key={r.id} className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-purple-900 block">Refund ID: #{r.id} ({r.provider_refund_id || 'Mock Provider'})</span>
                  <span className="text-neutral-600 block mt-0.5">Reason: {r.reason}</span>
                  <span className="text-[10px] text-neutral-400">By Admin {r.creator?.name || ''} on {new Date(r.created_at).toLocaleString()}</span>
                </div>
                <span className="font-mono font-bold text-purple-900 text-sm">
                  - ₹{Number(r.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Process Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 border border-neutral-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-neutral-900">Process Admin Refund</h3>
              <button onClick={() => setShowRefundModal(false)} className="text-neutral-400 hover:text-neutral-600 text-xl font-bold">×</button>
            </div>

            {refundError && (
              <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-xl text-xs font-bold">
                {refundError}
              </div>
            )}

            <form onSubmit={handleProcessRefund} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Refund Amount (Max ₹{maxRefundable.toFixed(2)})
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={maxRefundable}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder={`Enter amount up to ${maxRefundable}`}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Reason for Refund</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Reason for processing refund..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRefund}
                  className="flex-1 py-3 bg-purple-900 hover:bg-purple-950 disabled:opacity-50 text-white font-bold rounded-xl shadow-md"
                >
                  {submittingRefund ? 'Processing...' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
