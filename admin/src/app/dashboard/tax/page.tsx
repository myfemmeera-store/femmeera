'use client';

import React, { useEffect, useState } from 'react';
import { Percent, Plus, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/services/apiClient';

interface TaxRule {
  id: number;
  name: string;
  rate_percentage: number;
  is_inclusive: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export default function AdminTaxPage() {
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<TaxRule | null>(null);
  const [name, setName] = useState('');
  const [rate, setRate] = useState(5.00);
  const [isInclusive, setIsInclusive] = useState(false);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const fetchTaxRules = async () => {
    setLoading(true);
    try {
      const res = await apiClient<TaxRule[]>('/admin/tax');
      if (res.success && res.data) {
        setTaxRules(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxRules();
  }, []);

  const handleOpenModal = (rule?: TaxRule) => {
    if (rule) {
      setEditingRule(rule);
      setName(rule.name);
      setRate(rule.rate_percentage);
      setIsInclusive(rule.is_inclusive);
      setStatus(rule.status);
    } else {
      setEditingRule(null);
      setName('');
      setRate(5.00);
      setIsInclusive(false);
      setStatus('ACTIVE');
    }
    setShowModal(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      rate_percentage: rate,
      is_inclusive: isInclusive,
      status,
    };

    let res;
    if (editingRule) {
      res = await apiClient<TaxRule>(`/admin/tax/${editingRule.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      res = await apiClient<TaxRule>('/admin/tax', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    if (res.success) {
      setShowModal(false);
      fetchTaxRules();
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (confirm('Are you sure you want to delete this tax rule?')) {
      const res = await apiClient(`/admin/tax/${id}`, { method: 'DELETE' });
      if (res.success) fetchTaxRules();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-gray-900">Configurable Tax Rules (GST)</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">Manage applicable GST tax rules and percentage calculations dynamically.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tax Rule</span>
        </button>
      </div>

      {/* Tax Rules Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">Loading tax rules...</div>
        ) : taxRules.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No tax rules defined yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Rule Name</th>
                  <th className="py-3.5 px-4">Rate (%)</th>
                  <th className="py-3.5 px-4">Calculation Mode</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {taxRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">{rule.name}</td>
                    <td className="py-4 px-4 font-bold text-emerald-600">{rule.rate_percentage}%</td>
                    <td className="py-4 px-4 text-gray-700">
                      {rule.is_inclusive ? 'Inclusive GST' : 'Exclusive GST'}
                    </td>
                    <td className="py-4 px-4">
                      {rule.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button onClick={() => handleOpenModal(rule)} className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-gray-100 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteRule(rule.id)} className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-gray-100 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 text-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-gray-900">{editingRule ? 'Edit Tax Rule' : 'Add Tax Rule'}</h2>
            <form onSubmit={handleSaveRule} className="space-y-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Rule Name *</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. GST Apparel 5%" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Rate Percentage (%) *</label>
                  <input type="number" step="0.01" required value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-emerald-600" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="is_inclusive" checked={isInclusive} onChange={(e) => setIsInclusive(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
                <label htmlFor="is_inclusive" className="font-semibold text-gray-700">Tax is inclusive in item prices</label>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">Save Tax Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
