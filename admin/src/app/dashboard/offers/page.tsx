'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Plus, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { apiClient } from '@/services/apiClient';

interface Offer {
  id: number;
  name: string;
  description?: string;
  type: 'PRODUCT_DISCOUNT' | 'CATEGORY_DISCOUNT' | 'BUY_X_GET_Y' | 'FREE_SHIPPING' | 'ORDER_DISCOUNT';
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount_value: number;
  minimum_quantity: number;
  minimum_order_amount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Offer['type']>('ORDER_DISCOUNT');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(10);
  const [minQty, setMinQty] = useState(1);
  const [minOrder, setMinOrder] = useState(0);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await apiClient<Offer[]>('/admin/offers');
      if (res.success && res.data) {
        setOffers(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleOpenModal = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
      setName(offer.name);
      setDescription(offer.description || '');
      setType(offer.type);
      setDiscountType(offer.discount_type);
      setDiscountValue(offer.discount_value);
      setMinQty(offer.minimum_quantity);
      setMinOrder(offer.minimum_order_amount);
      setStatus(offer.status);
    } else {
      setEditingOffer(null);
      setName('');
      setDescription('');
      setType('ORDER_DISCOUNT');
      setDiscountType('PERCENTAGE');
      setDiscountValue(10);
      setMinQty(1);
      setMinOrder(0);
      setStatus('ACTIVE');
    }
    setShowModal(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      description,
      type,
      discount_type: discountType,
      discount_value: discountValue,
      minimum_quantity: minQty,
      minimum_order_amount: minOrder,
      status,
    };

    let res;
    if (editingOffer) {
      res = await apiClient<Offer>(`/admin/offers/${editingOffer.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      res = await apiClient<Offer>('/admin/offers', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    if (res.success) {
      setShowModal(false);
      fetchOffers();
    }
  };

  const handleDeleteOffer = async (id: number) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      const res = await apiClient(`/admin/offers/${id}`, { method: 'DELETE' });
      if (res.success) fetchOffers();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h1 className="text-1xl font-bold text-gray-900">Automatic Offers & Promotions</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">Configure automatic storewide, product, or category promotional rules.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Offer</span>
        </button>
      </div>

      {/* Offers List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">Loading offers...</div>
        ) : offers.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No automatic offers configured. Click "Create Offer" to add one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Offer Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Min Qty</th>
                  <th className="py-3.5 px-4">Min Order</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{offer.name}</div>
                      {offer.description && <p className="text-[11px] text-gray-400 line-clamp-1">{offer.description}</p>}
                    </td>
                    <td className="py-4 px-4 text-gray-700 font-semibold">{offer.type}</td>
                    <td className="py-4 px-4 font-bold text-amber-700">
                      {offer.discount_type === 'PERCENTAGE' ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`}
                    </td>
                    <td className="py-4 px-4 text-gray-700">{offer.minimum_quantity}</td>
                    <td className="py-4 px-4 text-gray-700">₹{offer.minimum_order_amount}</td>
                    <td className="py-4 px-4">
                      {offer.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button onClick={() => handleOpenModal(offer)} className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteOffer(offer.id)} className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-gray-100 rounded-lg">
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

      {/* Offer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <h2 className="text-base font-bold text-gray-900">{editingOffer ? 'Edit Offer' : 'Create Automatic Offer'}</h2>

            <form onSubmit={handleSaveOffer} className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Flat 10% Off Orders"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Offer Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                    <option value="ORDER_DISCOUNT">Order Discount</option>
                    <option value="PRODUCT_DISCOUNT">Product Discount</option>
                    <option value="CATEGORY_DISCOUNT">Category Discount</option>
                    <option value="BUY_X_GET_Y">Buy X Get Y</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Discount Type</label>
                  <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Value *</label>
                  <input type="number" required value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-amber-600" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Min Qty</label>
                  <input type="number" value={minQty} onChange={(e) => setMinQty(Number(e.target.value))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Min Order (₹)</label>
                  <input type="number" value={minOrder} onChange={(e) => setMinOrder(Number(e.target.value))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700">Save Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
