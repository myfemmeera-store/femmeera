'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Truck, Plus, Trash2, Edit2, Save, CheckCircle2, Calculator } from 'lucide-react';
import Link from 'next/link';
import { getAdminToken } from '@/services/api';

interface ShippingRule {
  id?: number;
  name: string;
  min_order_amount: number;
  max_order_amount: number | null;
  shipping_fee: number;
  estimated_days: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export default function ShippingManagementPage() {
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [policyForm, setPolicyForm] = useState({
    title: 'Femmeera Shipping & Delivery Policy',
    dispatch_time: '24 - 48 Hours',
    free_shipping_threshold: 2000,
    content: '',
  });

  const [newRule, setNewRule] = useState<ShippingRule>({
    name: '',
    min_order_amount: 0,
    max_order_amount: 999,
    shipping_fee: 99,
    estimated_days: '3-7 working days',
    status: 'ACTIVE',
  });

  const fetchShippingData = async () => {
    setLoading(true);
    const token = getAdminToken();
    try {
      const res = await fetch('http://localhost:8000/api/v1/admin/shipping-rules', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setRules(json.data.rules || []);
        if (json.data.policy) {
          setPolicyForm({
            title: json.data.policy.title || 'Femmeera Shipping & Delivery Policy',
            dispatch_time: json.data.policy.dispatch_time || '24 - 48 Hours',
            free_shipping_threshold: json.data.policy.free_shipping_threshold || 2000,
            content: json.data.policy.content || '',
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
    fetchShippingData();
  }, []);

  const handleSavePolicy = async () => {
    setSavingPolicy(true);
    const token = getAdminToken();
    try {
      const res = await fetch('http://localhost:8000/api/v1/admin/policies/shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(policyForm),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Shipping policy updated successfully!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAdminToken();
    try {
      const res = await fetch('http://localhost:8000/api/v1/admin/shipping-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRule),
      });
      const json = await res.json();
      if (json.success) {
        showToast('New shipping rule created!');
        setNewRule({
          name: '',
          min_order_amount: 0,
          max_order_amount: 999,
          shipping_fee: 99,
          estimated_days: '3-7 working days',
          status: 'ACTIVE',
        });
        fetchShippingData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm('Are you sure you want to delete this shipping rule?')) return;
    const token = getAdminToken();
    try {
      const res = await fetch(`http://localhost:8000/api/v1/admin/shipping-rules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        showToast('Shipping rule deleted.');
        fetchShippingData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-black" />
            <span>Shipping & Charges Settings</span>
          </h1>
          <p className="text-xs text-neutral-500">Configure subtotal shipping charge rules and shipping policy</p>
        </div>

        <Link href="/dashboard/shipping/rate-calculator">
          <button className="px-4 py-2 bg-black text-white font-bold rounded-xl text-xs flex items-center space-x-2 hover:bg-neutral-800 transition-colors shadow-xs">
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>Shipping Rate Calculator ↗</span>
          </button>
        </Link>
      </div>

      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3.5 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Grid: Rules Table + Policy Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Shipping Rules Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Active Shipping Charge Tiers" subtitle="Server-side subtotal pricing rules">
            {loading ? (
              <div className="py-10 text-center text-xs text-neutral-400">Loading rules...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-3">Rule Name</th>
                      <th className="py-3 px-3">Subtotal Tier Range</th>
                      <th className="py-3 px-3">Shipping Charge</th>
                      <th className="py-3 px-3">Est. Delivery</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    {rules.map((r) => (
                      <tr key={r.id} className="hover:bg-neutral-50">
                        <td className="py-3 px-3 font-bold text-neutral-900">{r.name}</td>
                        <td className="py-3 px-3 text-neutral-700">
                          ₹{r.min_order_amount} – {r.max_order_amount ? `₹${r.max_order_amount}` : '∞'}
                        </td>
                        <td className="py-3 px-3 font-bold">
                          {r.shipping_fee === 0 ? (
                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] font-black">FREE</span>
                          ) : (
                            `₹${r.shipping_fee}`
                          )}
                        </td>
                        <td className="py-3 px-3 text-neutral-600">{r.estimated_days}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => r.id && handleDeleteRule(r.id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Add New Rule Form */}
          <Card title="Add New Shipping Tier Rule" subtitle="Control subtotal threshold and fee">
            <form onSubmit={handleCreateRule} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard Shipping"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Min Order Subtotal (₹)</label>
                <input
                  type="number"
                  required
                  value={newRule.min_order_amount}
                  onChange={(e) => setNewRule({ ...newRule, min_order_amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Max Order Subtotal (₹)</label>
                <input
                  type="number"
                  placeholder="Leave empty for unlimited threshold"
                  value={newRule.max_order_amount ?? ''}
                  onChange={(e) => setNewRule({ ...newRule, max_order_amount: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Shipping Fee (₹)</label>
                <input
                  type="number"
                  required
                  value={newRule.shipping_fee}
                  onChange={(e) => setNewRule({ ...newRule, shipping_fee: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-neutral-700 block mb-1">Delivery Estimate Label</label>
                <input
                  type="text"
                  required
                  value={newRule.estimated_days}
                  onChange={(e) => setNewRule({ ...newRule, estimated_days: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-black text-white font-bold rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Shipping Rule</span>
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Shipping Policy Panel */}
        <div>
          <Card title="Shipping Policy Settings" subtitle="Displayed on public /shipping-policy page">
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
                <label className="font-bold text-neutral-700 block mb-1">Dispatch Time Window</label>
                <input
                  type="text"
                  value={policyForm.dispatch_time}
                  onChange={(e) => setPolicyForm({ ...policyForm, dispatch_time: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Free Shipping Threshold (₹)</label>
                <input
                  type="number"
                  value={policyForm.free_shipping_threshold}
                  onChange={(e) => setPolicyForm({ ...policyForm, free_shipping_threshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Full Policy Content</label>
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
                <span>{savingPolicy ? 'Saving Policy...' : 'Save Policy Changes'}</span>
              </button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
