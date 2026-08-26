'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RotateCcw, CheckCircle, XCircle, Clock, Save, CheckCircle2, Filter } from 'lucide-react';
import { getAdminToken } from '@/services/api';

interface ReturnRequest {
  id: number;
  order_id: number;
  user_id: number;
  reason: string;
  comment: string | null;
  images: string[];
  status: string;
  admin_comment: string | null;
  refund_amount: number | null;
  created_at: string;
  order?: {
    order_number: string;
    total_amount: number;
  };
  user?: {
    name: string;
    email: string;
  };
  product?: {
    name: string;
  };
}

export default function ReturnsManagementPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [toast, setToast] = useState<string | null>(null);

  const [policyForm, setPolicyForm] = useState({
    title: 'Femmeera Return & Refund Policy',
    return_window_days: 7,
    allow_returns: true,
    allow_exchanges: true,
    content: '',
  });
  const [savingPolicy, setSavingPolicy] = useState(false);

  const fetchReturnsData = async () => {
    setLoading(true);
    const token = getAdminToken();
    try {
      const statusParam = selectedStatus !== 'ALL' ? `?status=${selectedStatus}` : '';
      const res = await fetch(`http://localhost:8000/api/v1/admin/returns${statusParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setReturns(json.data);
        if (json.policy) {
          setPolicyForm({
            title: json.policy.title || 'Femmeera Return & Refund Policy',
            return_window_days: json.policy.return_window_days || 7,
            allow_returns: json.policy.allow_returns ?? true,
            allow_exchanges: json.policy.allow_exchanges ?? true,
            content: json.policy.content || '',
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnsData();
  }, [selectedStatus]);

  const handleUpdateStatus = async (id: number, status: string) => {
    const token = getAdminToken();
    try {
      const res = await fetch(`http://localhost:8000/api/v1/admin/returns/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Return status updated to ${status}`);
        fetchReturnsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePolicy = async () => {
    setSavingPolicy(true);
    const token = getAdminToken();
    try {
      const res = await fetch('http://localhost:8000/api/v1/admin/policies/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(policyForm),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Return policy updated successfully!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPolicy(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'REFUNDED':
        return <Badge variant="success">{status}</Badge>;
      case 'REJECTED':
        return <Badge variant="error">{status}</Badge>;
      case 'REQUESTED':
      case 'UNDER_REVIEW':
        return <Badge variant="warning">{status}</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-black" />
            <span>Customer Return Requests</span>
          </h1>
          <p className="text-xs text-neutral-500">Approve, reject, and process customer product return requests</p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-neutral-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs bg-white font-semibold"
          >
            <option value="ALL">All Statuses</option>
            <option value="REQUESTED">Requested</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="PICKUP_SCHEDULED">Pickup Scheduled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3.5 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Return Requests List Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Return Requests Queue" subtitle="Manage customer returns & refunds">
            {loading ? (
              <div className="py-12 text-center text-xs text-neutral-400">Loading return requests...</div>
            ) : returns.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-400">No return requests found in this queue.</div>
            ) : (
              <div className="space-y-4">
                {returns.map((r) => (
                  <div key={r.id} className="p-4 border border-neutral-200 rounded-xl bg-white space-y-3 text-xs">
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-neutral-900 text-sm">Order #{r.order?.order_number || r.order_id}</span>
                        <p className="text-neutral-500 text-[11px] mt-0.5">
                          Customer: <strong className="text-neutral-800">{r.user?.name || 'Customer'}</strong> ({r.user?.email})
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        {getStatusBadge(r.status)}
                        <p className="text-[10px] text-neutral-400">{new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100 space-y-1">
                      <p className="font-bold text-neutral-800">
                        Reason: <span className="text-neutral-900 font-normal">{r.reason}</span>
                      </p>
                      {r.comment && <p className="text-neutral-600 font-normal italic">&quot;{r.comment}&quot;</p>}
                      {r.product && <p className="text-neutral-500 text-[11px]">Product: {r.product.name}</p>}
                    </div>

                    {/* Status Update Quick Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-100">
                      <span className="font-bold text-neutral-500 text-[10px] uppercase">Update Status:</span>
                      
                      <div className="flex items-center gap-1.5">
                        {r.status === 'REQUESTED' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                              className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded text-[11px] hover:bg-emerald-700 transition-colors flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
                              className="px-2.5 py-1 bg-rose-600 text-white font-bold rounded text-[11px] hover:bg-rose-700 transition-colors flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}

                        {r.status === 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'PICKUP_SCHEDULED')}
                            className="px-2.5 py-1 bg-sky-600 text-white font-bold rounded text-[11px] hover:bg-sky-700 transition-colors"
                          >
                            Schedule Pickup
                          </button>
                        )}

                        {r.status === 'PICKUP_SCHEDULED' && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'REFUNDED')}
                            className="px-2.5 py-1 bg-indigo-600 text-white font-bold rounded text-[11px] hover:bg-indigo-700 transition-colors"
                          >
                            Process Refund
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Return Policy Form */}
        <div>
          <Card title="Return Policy Settings" subtitle="Displayed on public /return-policy page">
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Policy Title</label>
                <input
                  type="text"
                  value={policyForm.title}
                  onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Return Window (Days)</label>
                <input
                  type="number"
                  value={policyForm.return_window_days}
                  onChange={(e) => setPolicyForm({ ...policyForm, return_window_days: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center space-x-2 font-bold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={policyForm.allow_returns}
                    onChange={(e) => setPolicyForm({ ...policyForm, allow_returns: e.target.checked })}
                    className="w-4 h-4 rounded text-black focus:ring-black"
                  />
                  <span>Allow Product Returns</span>
                </label>

                <label className="flex items-center space-x-2 font-bold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={policyForm.allow_exchanges}
                    onChange={(e) => setPolicyForm({ ...policyForm, allow_exchanges: e.target.checked })}
                    className="w-4 h-4 rounded text-black focus:ring-black"
                  />
                  <span>Allow Product Exchanges</span>
                </label>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Full Return Policy Content</label>
                <textarea
                  rows={6}
                  value={policyForm.content}
                  onChange={(e) => setPolicyForm({ ...policyForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black leading-relaxed"
                />
              </div>

              <button
                onClick={handleSavePolicy}
                disabled={savingPolicy}
                className="w-full py-2.5 bg-black text-white font-bold rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingPolicy ? 'Saving Policy...' : 'Save Return Policy'}</span>
              </button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
