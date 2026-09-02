'use client';

import React, { useEffect, useState } from 'react';
import { Tag, Plus, Edit, Trash2, CheckCircle2, XCircle, Copy, Check, Users, TrendingUp, Calendar, AlertTriangle, Eye, ShoppingBag, DollarSign, PackageCheck, X } from 'lucide-react';
import { apiClient } from '@/services/apiClient';

interface Coupon {
  id: number;
  code: string;
  name: string;
  influencer_name?: string;
  influencer_handle?: string;
  influencer_commission_percent?: number;
  description?: string;
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount_amount?: number;
  usage_limit?: number;
  usage_limit_per_customer?: number;
  start_at?: string;
  end_at?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  usages_count?: number;
  successful_purchases_count?: number;
  unpaid_attempts_count?: number;
  total_discount_given?: number;
  total_sales_generated?: number;
  influencer_commission_earned?: number;
  is_expired?: boolean;
}

interface Analytics {
  total_coupons: number;
  active_coupons: number;
  total_redemptions: number;
  successful_paid_purchases?: number;
  unpaid_attempts?: number;
  total_discount_issued: number;
  total_sales_generated: number;
}

interface CouponDetailData {
  coupon: Coupon;
  metrics: {
    total_applications: number;
    successful_paid_purchases: number;
    unpaid_attempts: number;
    total_sales_generated: number;
    total_discount_given: number;
    commission_percent: number;
    commission_earned: number;
  };
  purchased_products: Array<{
    product_name: string;
    sku?: string;
    color: string;
    size: string;
    total_quantity_sold: number;
    total_revenue: number;
  }>;
  orders: Array<{
    order_id: number;
    order_number: string;
    total_amount: number;
    discount_amount: number;
    order_status: string;
    payment_status: string;
    order_date: string;
    customer_name?: string;
    customer_email?: string;
    items: Array<{
      id: number;
      product_name: string;
      sku?: string;
      color?: string;
      size?: string;
      quantity: number;
      unit_price: number;
      total_amount: number;
    }>;
  }>;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Detail Modal State
  const [viewingCouponId, setViewingCouponId] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<CouponDetailData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [influencerName, setInfluencerName] = useState('');
  const [influencerHandle, setInfluencerHandle] = useState('');
  const [influencerCommission, setInfluencerCommission] = useState(10);
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(15);
  const [minOrder, setMinOrder] = useState(999);
  const [maxDiscount, setMaxDiscount] = useState<number | ''>(500);
  const [usageLimit, setUsageLimit] = useState<number | ''>(100);
  const [endAt, setEndAt] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'EXPIRED'>('ACTIVE');

  const fetchCouponsAndAnalytics = async () => {
    setLoading(true);
    try {
      const [couponsRes, analyticsRes] = await Promise.all([
        apiClient<Coupon[]>('/admin/coupons'),
        apiClient<Analytics>('/admin/coupons/analytics').catch(() => ({ success: false, data: null })),
      ]);

      if (couponsRes.success && couponsRes.data) {
        setCoupons(couponsRes.data);
      }
      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouponsAndAnalytics();
  }, []);

  const handleOpenDetailModal = async (couponId: number) => {
    setViewingCouponId(couponId);
    setLoadingDetail(true);
    try {
      const res = await apiClient<CouponDetailData>(`/admin/coupons/${couponId}`);
      if (res.success && res.data) {
        setDetailData(res.data);
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCode(coupon.code);
      setName(coupon.name);
      setInfluencerName(coupon.influencer_name || '');
      setInfluencerHandle(coupon.influencer_handle || '');
      setInfluencerCommission(coupon.influencer_commission_percent ?? 10);
      setDescription(coupon.description || '');
      setDiscountType(coupon.discount_type);
      setDiscountValue(coupon.discount_value);
      setMinOrder(coupon.minimum_order_amount);
      setMaxDiscount(coupon.maximum_discount_amount ?? '');
      setUsageLimit(coupon.usage_limit ?? '');
      setEndAt(coupon.end_at ? coupon.end_at.slice(0, 10) : '');
      setStatus(coupon.status);
    } else {
      setEditingCoupon(null);
      setCode('');
      setName('');
      setInfluencerName('');
      setInfluencerHandle('');
      setInfluencerCommission(10);
      setDescription('');
      setDiscountType('PERCENTAGE');
      setDiscountValue(15);
      setMinOrder(999);
      setMaxDiscount(500);
      setUsageLimit(100);
      setEndAt('');
      setStatus('ACTIVE');
    }
    setShowModal(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code,
      name: name || (influencerName ? `${influencerName} Promo Code` : code),
      influencer_name: influencerName,
      influencer_handle: influencerHandle,
      influencer_commission_percent: influencerCommission,
      description,
      discount_type: discountType,
      discount_value: discountValue,
      minimum_order_amount: minOrder,
      maximum_discount_amount: maxDiscount === '' ? null : maxDiscount,
      usage_limit: usageLimit === '' ? null : usageLimit,
      end_at: endAt ? `${endAt} 23:59:59` : null,
      status,
    };

    let res;
    if (editingCoupon) {
      res = await apiClient<Coupon>(`/admin/coupons/${editingCoupon.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      res = await apiClient<Coupon>('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    if (res.success) {
      setShowModal(false);
      fetchCouponsAndAnalytics();
    }
  };

  const handleToggleStatus = async (id: number) => {
    const res = await apiClient<Coupon>(`/admin/coupons/${id}/toggle-status`, {
      method: 'POST',
    });
    if (res.success) {
      fetchCouponsAndAnalytics();
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (confirm('Are you sure you want to delete this influencer coupon?')) {
      const res = await apiClient(`/admin/coupons/${id}`, { method: 'DELETE' });
      if (res.success) fetchCouponsAndAnalytics();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-rose-600" />
            <h1 className="text-xl font-bold text-gray-900">Influencer Coupons & Promo Codes</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">Track influencer promo codes, paid purchases vs abandoned cart attempts, and detailed product sales breakdown.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Influencer Coupon</span>
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Campaigns</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{analytics?.active_coupons || 0}</div>
          <p className="text-[11px] text-gray-400">Total {analytics?.total_coupons || 0} codes registered</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Paid Purchases</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{analytics?.successful_paid_purchases || 0}</div>
          <p className="text-[11px] text-gray-400">{analytics?.unpaid_attempts || 0} unpaid / abandoned attempts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Influencer Sales</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">₹{(analytics?.total_sales_generated || 0).toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-gray-400">Revenue generated after successful payment</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Discount Savings</span>
            <Tag className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">₹{(analytics?.total_discount_issued || 0).toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-gray-400">Total savings passed to customers</p>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">Loading influencer coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No influencer codes generated yet. Click "Create Influencer Coupon" to add one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Coupon Code & Partner</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Paid Purchases</th>
                  <th className="py-3.5 px-4">Sales & Commission</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-600 text-sm px-2 py-0.5 bg-rose-50 border border-rose-200 rounded-md">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          title="Copy Code"
                          className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                        >
                          {copiedCode === coupon.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="font-bold text-gray-900 mt-1">{coupon.name}</div>
                      {(coupon.influencer_name || coupon.influencer_handle) && (
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium mt-0.5">
                          <span>Influencer: <strong className="text-gray-800">{coupon.influencer_name || 'N/A'}</strong></span>
                          {coupon.influencer_handle && (
                            <span className="text-rose-600 font-semibold">({coupon.influencer_handle})</span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 font-bold text-gray-900">
                      <span className="text-sm text-emerald-600 font-black">
                        {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                      </span>
                      <div className="text-[10px] text-gray-400 font-medium mt-0.5">
                        Min spend: ₹{coupon.minimum_order_amount} {coupon.maximum_discount_amount ? `| Max: ₹${coupon.maximum_discount_amount}` : ''}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-gray-700">
                      <div className="flex flex-col space-y-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {coupon.successful_purchases_count || 0} Paid Purchases
                        </span>
                        {(coupon.unpaid_attempts_count ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md w-fit">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            {coupon.unpaid_attempts_count} Unpaid / Attempts
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-gray-700">
                      <div className="font-bold text-gray-900">
                        ₹{(coupon.total_sales_generated || 0).toLocaleString('en-IN')}
                      </div>
                      {(coupon.influencer_commission_earned ?? 0) > 0 && (
                        <div className="text-[10px] font-bold text-purple-600 mt-0.5">
                          Commission ({coupon.influencer_commission_percent}%): ₹{(coupon.influencer_commission_earned || 0).toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      {coupon.status === 'ACTIVE' && !coupon.is_expired ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : coupon.status === 'EXPIRED' || coupon.is_expired ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenDetailModal(coupon.id)}
                        title="View Purchased Products & Order Details"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>View Analytics</span>
                      </button>
                      <button
                        onClick={() => handleToggleStatus(coupon.id)}
                        className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                          coupon.status === 'ACTIVE'
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {coupon.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                      </button>
                      <button onClick={() => handleOpenModal(coupon)} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg cursor-pointer">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteCoupon(coupon.id)} className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-gray-100 rounded-lg cursor-pointer">
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

      {/* Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">{editingCoupon ? 'Edit Influencer Coupon' : 'Generate Influencer Promo Code'}</h2>
            
            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. PRIYANKA20"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono uppercase font-bold text-rose-600 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priyanka Festive Campaign"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              {/* Influencer Details */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-rose-50/50 border border-rose-100 rounded-2xl">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Influencer Name</label>
                  <input
                    type="text"
                    value={influencerName}
                    onChange={(e) => setInfluencerName(e.target.value)}
                    placeholder="Priyanka Sharma"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Social Handle</label>
                  <input
                    type="text"
                    value={influencerHandle}
                    onChange={(e) => setInfluencerHandle(e.target.value)}
                    placeholder="@priyanka_couture"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    placeholder="15"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Min Order Spend (₹)</label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="No Limit"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Max Usage Limit</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expiration Date</label>
                  <input
                    type="date"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                >
                  <option value="ACTIVE">Active (Ready to Use)</option>
                  <option value="INACTIVE">Inactive (Disabled)</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-md shadow-rose-600/20 cursor-pointer"
                >
                  Save Coupon Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Analytics & Products Purchased Detail Modal */}
      {viewingCouponId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-lg text-rose-600 px-3 py-1 bg-rose-50 border border-rose-200 rounded-xl">
                  {detailData?.coupon.code || 'LOADING...'}
                </span>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{detailData?.coupon.name}</h2>
                  {detailData?.coupon.influencer_name && (
                    <p className="text-xs text-gray-500 font-medium">
                      Influencer: <strong className="text-gray-900">{detailData.coupon.influencer_name}</strong> {detailData.coupon.influencer_handle && <span className="text-rose-600">({detailData.coupon.influencer_handle})</span>}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setViewingCouponId(null)}
                className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="p-12 text-center text-xs text-gray-500 font-medium">
                Loading coupon analytics & purchased products...
              </div>
            ) : detailData ? (
              <div className="space-y-6 overflow-y-auto pr-1">
                
                {/* 4 Summary Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Successful Paid Purchases</span>
                    <span className="text-xl font-black text-emerald-700">{detailData.metrics.successful_paid_purchases}</span>
                    <span className="text-[10px] text-emerald-600 font-medium block">Confirmed after payment</span>
                  </div>

                  <div className="bg-amber-50/60 border border-amber-200 p-3.5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Unpaid / Abandoned Attempts</span>
                    <span className="text-xl font-black text-amber-700">{detailData.metrics.unpaid_attempts}</span>
                    <span className="text-[10px] text-amber-600 font-medium block">Applied but not purchased</span>
                  </div>

                  <div className="bg-purple-50/60 border border-purple-200 p-3.5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">Total Paid Sales</span>
                    <span className="text-xl font-black text-purple-900">₹{detailData.metrics.total_sales_generated.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-purple-600 font-medium block">₹{detailData.metrics.total_discount_given.toLocaleString('en-IN')} discount given</span>
                  </div>

                  <div className="bg-rose-50/60 border border-rose-200 p-3.5 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Commission Earned</span>
                    <span className="text-xl font-black text-rose-700">₹{detailData.metrics.commission_earned.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-rose-600 font-medium block">Rate: {detailData.metrics.commission_percent}%</span>
                  </div>
                </div>

                {/* Sub-Nav Tabs */}
                <div className="flex border-b border-gray-100 space-x-6 text-xs font-bold">
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'products' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Purchased Products ({detailData.purchased_products.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'orders' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Customer Orders ({detailData.orders.length})</span>
                  </button>
                </div>

                {/* TAB 1: Purchased Products Breakdown */}
                {activeTab === 'products' && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Products Bought Using Coupon Code #{detailData.coupon.code}</h3>
                    {detailData.purchased_products.length === 0 ? (
                      <div className="p-8 text-center bg-gray-50 rounded-2xl text-xs text-gray-500">
                        No completed purchases recorded for this coupon code yet.
                      </div>
                    ) : (
                      <div className="border border-gray-100 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase border-b border-gray-100">
                              <th className="py-3 px-4">Product Name</th>
                              <th className="py-3 px-3">Color / Size</th>
                              <th className="py-3 px-3 text-center">Units Sold</th>
                              <th className="py-3 px-4 text-right">Total Revenue Generated</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {detailData.purchased_products.map((prod, i) => (
                              <tr key={i} className="hover:bg-gray-50/50">
                                <td className="py-3 px-4 font-bold text-gray-900">
                                  {prod.product_name}
                                  {prod.sku && <div className="text-[10px] text-gray-400 font-mono">SKU: {prod.sku}</div>}
                                </td>
                                <td className="py-3 px-3 text-gray-600">
                                  <span className="font-semibold text-gray-800">{prod.color}</span> / <span className="text-gray-700">{prod.size}</span>
                                </td>
                                <td className="py-3 px-3 text-center font-extrabold text-gray-900">
                                  {prod.total_quantity_sold} pcs
                                </td>
                                <td className="py-3 px-4 text-right font-black text-emerald-600">
                                  ₹{prod.total_revenue.toLocaleString('en-IN')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Customer Redemptions & Orders */}
                {activeTab === 'orders' && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Customer Redemptions History</h3>
                    {detailData.orders.length === 0 ? (
                      <div className="p-8 text-center bg-gray-50 rounded-2xl text-xs text-gray-500">
                        No orders recorded for this coupon code yet.
                      </div>
                    ) : (
                      <div className="border border-gray-100 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase border-b border-gray-100">
                              <th className="py-3 px-4">Order # & Date</th>
                              <th className="py-3 px-4">Customer</th>
                              <th className="py-3 px-3">Payment Status</th>
                              <th className="py-3 px-4">Items Ordered</th>
                              <th className="py-3 px-4 text-right">Order Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {detailData.orders.map((ord) => (
                              <tr key={ord.order_id} className="hover:bg-gray-50/50">
                                <td className="py-3 px-4 font-bold text-gray-900">
                                  <div className="font-mono text-rose-600">{ord.order_number}</div>
                                  <div className="text-[10px] text-gray-400 font-medium">{ord.order_date ? ord.order_date.slice(0, 10) : ''}</div>
                                </td>
                                <td className="py-3 px-4 text-gray-800 font-medium">
                                  <div>{ord.customer_name || 'Guest User'}</div>
                                  <div className="text-[10px] text-gray-400">{ord.customer_email || 'N/A'}</div>
                                </td>
                                <td className="py-3 px-3">
                                  {ord.payment_status === 'PAID' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                      <AlertTriangle className="w-3 h-3 text-amber-600" /> {ord.payment_status}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-gray-700">
                                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                                    {ord.items.map((item, idx) => (
                                      <li key={idx} className="font-medium text-gray-800">
                                        {item.product_name} ({item.color || 'N/A'} / {item.size || 'N/A'}) x {item.quantity}
                                      </li>
                                    ))}
                                  </ul>
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-gray-900">
                                  ₹{ord.total_amount.toLocaleString('en-IN')}
                                  <div className="text-[10px] text-emerald-600 font-semibold">Saved ₹{ord.discount_amount}</div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : null}

            <div className="flex justify-end pt-3 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setViewingCouponId(null)}
                className="px-5 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
