'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowLeft, Truck, Package, Clock, CheckCircle2, MapPin, X, Star, MessageSquare, Check } from 'lucide-react';
import { Order } from '@/types';
import { apiClient } from '@/services/apiClient';
import { authService } from '@/services/authService';

interface DetailedOrderItem {
  id: number;
  product_id?: number;
  product_name_snapshot: string;
  sku_snapshot: string;
  size_snapshot: string;
  color_snapshot: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  product?: {
    id?: number;
    images?: { image_url: string }[];
  };
}

interface DetailedOrder extends Omit<Order, 'shipping_address_snapshot' | 'items'> {
  items?: DetailedOrderItem[];
  shipping_address_snapshot?: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
  };
  latest_payment?: {
    payment_method?: string;
  };
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<DetailedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrackOrder, setSelectedTrackOrder] = useState<DetailedOrder | null>(null);

  // Review modal state
  const [reviewModalItem, setReviewModalItem] = useState<{ item: DetailedOrderItem; order: DetailedOrder } | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [submittedReviews, setSubmittedReviews] = useState<Record<number, boolean>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      const user = authService.getStoredUser();
      const token = authService.getStoredToken();

      let fetchedOrders: DetailedOrder[] = [];

      // 1. Attempt API fetch if authenticated
      if (token || user) {
        try {
          const res = await apiClient<DetailedOrder[]>('/customer/orders');
          if (res.success && res.data && Array.isArray(res.data)) {
            fetchedOrders = res.data;
          }
        } catch {}
      }

      // 2. If no orders returned from API, check localStorage for placed orders (Guest / Offline fallback)
      if (fetchedOrders.length === 0 && typeof window !== 'undefined') {
        try {
          const storedNumbers: string[] = JSON.parse(
            localStorage.getItem('femmeera_customer_orders') || '[]'
          );
          const lastOrderNum = localStorage.getItem('femmeera_last_order');
          
          if (lastOrderNum && !storedNumbers.includes(lastOrderNum)) {
            storedNumbers.unshift(lastOrderNum);
          }

          for (const num of storedNumbers) {
            try {
              const res = await apiClient<DetailedOrder>(`/orders/lookup/${num}`);
              const orderDetail = res.data;
              if (res.success && orderDetail && !fetchedOrders.some((o) => o.id === orderDetail.id)) {
                fetchedOrders.push(orderDetail);
              }
            } catch {}
          }
        } catch {}
      }

      setOrders(fetchedOrders);
      setIsLoading(false);
    };

    fetchOrders();
  }, []);

  const getStepNumber = (status?: string) => {
    const s = status?.toUpperCase() || 'CONFIRMED';
    if (s === 'PROCESSING') return 2;
    if (s === 'SHIPPED') return 3;
    if (s === 'DELIVERED') return 4;
    return 1;
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalItem) return;

    const productId = reviewModalItem.item.product_id || reviewModalItem.item.product?.id || 1;
    setIsSubmittingReview(true);
    try {
      const res = await apiClient<{ id: number }>('/customer/reviews', {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          order_item_id: reviewModalItem.item.id,
          rating,
          title: reviewTitle || 'Loved the product!',
          comment: reviewComment,
        }),
      });

      if (res.success) {
        setSubmittedReviews((prev) => ({ ...prev, [reviewModalItem.item.id]: true }));
        setToastMsg('Thank you! Your product review has been submitted successfully.');
        setTimeout(() => setToastMsg(null), 4000);
        setReviewModalItem(null);
        setReviewTitle('');
        setReviewComment('');
        setRating(5);
      } else {
        alert(res.message || 'Failed to submit product review.');
      }
    } catch (err: any) {
      alert(err?.message || 'Error submitting product review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 min-h-screen bg-[#FDFBF7]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-[#EFE6D8] pb-6">
        <Link href="/account" className="p-2.5 border border-[#EFE6D8] rounded-2xl hover:bg-white transition-colors bg-white shadow-2xs">
          <ArrowLeft className="w-4 h-4 text-neutral-800" />
        </Link>
        <div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#B38548] block">
            MY ACCOUNT
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-neutral-900 tracking-tight">
            Order History & Product Reviews ({orders.length})
          </h1>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#B38548] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#B38548]">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-white border border-[#EFE6D8] rounded-3xl p-8 space-y-4 shadow-2xs">
          <ShoppingBag className="w-12 h-12 text-[#D4A86A] mx-auto opacity-70" />
          <h3 className="text-base font-serif font-bold text-neutral-900">You haven't placed any orders yet</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Discover our luxury collection of Ethnic Sarees, Co-ord Sets, and Dresses.
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-3 bg-[#B38548] hover:bg-[#966C32] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all"
          >
            Start Shopping Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((o) => {
            const isCod =
              o.latest_payment?.payment_method?.toUpperCase() === 'COD' ||
              o.payment_status?.toUpperCase() === 'COD' ||
              o.payment_status?.toUpperCase() === 'PENDING';

            const activeStep = getStepNumber(o.order_status);
            const orderDateStr = new Date(o.created_at).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={o.id}
                className="p-5 sm:p-6 bg-white border border-[#EFE6D8] rounded-3xl space-y-4 shadow-2xs hover:shadow-md transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F5EDE0] pb-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#B38548] block">
                      ORDER ID: {o.order_number}
                    </span>
                    <span className="text-xs text-neutral-500 font-medium">Placed on {orderDateStr}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        o.order_status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : o.order_status === 'SHIPPED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {o.order_status || 'CONFIRMED'}
                    </span>

                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        isCod ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isCod ? 'COD (Payment Pending)' : 'PAID'}
                    </span>
                  </div>
                </div>

                {/* Items Thumbnails & Review Action */}
                <div className="space-y-4">
                  {o.items && o.items.length > 0 ? (
                    o.items.map((item) => {
                      const imgUrl =
                        item.product?.images?.[0]?.image_url ||
                        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop';
                      const isReviewed = submittedReviews[item.id];

                      return (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#FAF6F0]/60 rounded-2xl border border-[#EFE6D8]/60 text-xs">
                          <div className="flex items-center space-x-3">
                            <div className="relative w-12 h-14 bg-neutral-100 rounded-xl overflow-hidden shrink-0 border border-[#EFE6D8]">
                              <Image src={imgUrl} alt={item.product_name_snapshot} fill className="object-cover" />
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="font-bold text-neutral-900">{item.product_name_snapshot}</h4>
                              <p className="text-[11px] text-neutral-500">
                                Size: {item.size_snapshot || 'Standard'} {item.color_snapshot ? `| ${item.color_snapshot}` : ''} • Qty: {item.quantity}
                              </p>
                              <p className="font-extrabold text-[#B38548] text-xs">
                                ₹{Number(item.total_amount || item.unit_price * item.quantity).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>

                          {/* Review Button */}
                          <div className="self-end sm:self-center">
                            {isReviewed ? (
                              <span className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Review Submitted</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => setReviewModalItem({ item, order: o })}
                                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-[#8C6026] border border-[#E6D4B5] rounded-xl text-[11px] font-bold transition-all shadow-2xs"
                              >
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                <span>Leave Product Review</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-neutral-500">Items recorded in order.</p>
                  )}
                </div>

                {/* Total & Action Footer */}
                <div className="pt-4 border-t border-[#F5EDE0] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Total Paid / Payable</span>
                    <span className="text-base font-bold text-[#B38548]">₹{Number(o.total_amount).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedTrackOrder(o)}
                      className="px-4 py-2 bg-[#B38548] hover:bg-[#966C32] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center space-x-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>TRACK ORDER</span>
                    </button>
                    <Link
                      href={`/checkout/success?order_number=${o.order_number}`}
                      className="px-4 py-2 bg-white border border-neutral-300 hover:border-black text-neutral-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                    >
                      View Invoice
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TRACK ORDER MODAL POPUP */}
      {selectedTrackOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-[#EFE6D8] relative">
            <button
              onClick={() => setSelectedTrackOrder(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B38548]">
                LIVE DELIVERY TRACKER
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">
                Order #{selectedTrackOrder.order_number}
              </h3>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-6 pt-2">
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
                <div className={`space-y-2 ${getStepNumber(selectedTrackOrder.order_status) >= 1 ? 'opacity-100' : 'opacity-40'}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                      getStepNumber(selectedTrackOrder.order_status) >= 1 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    1
                  </div>
                  <span className="text-neutral-900 font-bold block text-[11px]">Order Confirmed</span>
                  <span className="text-[10px] text-neutral-400 block">
                    {new Date(selectedTrackOrder.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </div>

                <div className={`space-y-2 ${getStepNumber(selectedTrackOrder.order_status) >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                      getStepNumber(selectedTrackOrder.order_status) >= 2 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    2
                  </div>
                  <span className="text-neutral-700 block text-[11px]">Processing</span>
                  <span className="text-[10px] text-neutral-400 block">Preparing your package</span>
                </div>

                <div className={`space-y-2 ${getStepNumber(selectedTrackOrder.order_status) >= 3 ? 'opacity-100' : 'opacity-50'}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                      getStepNumber(selectedTrackOrder.order_status) >= 3 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    3
                  </div>
                  <span className="text-neutral-700 block text-[11px]">Shipped</span>
                  <span className="text-[10px] text-neutral-400 block">Out for delivery</span>
                </div>

                <div className={`space-y-2 ${getStepNumber(selectedTrackOrder.order_status) >= 4 ? 'opacity-100' : 'opacity-50'}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                      getStepNumber(selectedTrackOrder.order_status) >= 4 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    4
                  </div>
                  <span className="text-neutral-700 block text-[11px]">Delivered</span>
                  <span className="text-[10px] text-neutral-400 block">Enjoy your purchase</span>
                </div>
              </div>

              {/* Shipping Address Snapshot */}
              {selectedTrackOrder.shipping_address_snapshot && (
                <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#EFE6D8] text-xs space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Shipping Address</span>
                  <p className="font-bold text-neutral-900">{selectedTrackOrder.shipping_address_snapshot.name}</p>
                  <p className="text-neutral-600">
                    {selectedTrackOrder.shipping_address_snapshot.address}, {selectedTrackOrder.shipping_address_snapshot.city},{' '}
                    {selectedTrackOrder.shipping_address_snapshot.state} - {selectedTrackOrder.shipping_address_snapshot.pincode}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setSelectedTrackOrder(null)}
                className="w-full py-3 bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl"
              >
                Close Tracker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEAVE PRODUCT REVIEW MODAL POPUP */}
      {reviewModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-[#EFE6D8] relative">
            <button
              onClick={() => setReviewModalItem(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B38548]">
                CUSTOMER FEEDBACK & RATING
              </span>
              <h3 className="text-xl font-serif font-bold text-neutral-900">
                Write a Product Review
              </h3>
              <p className="text-xs text-neutral-500">
                For order <span className="font-bold text-neutral-800">#{reviewModalItem.order.order_number}</span>
              </p>
            </div>

            {/* Product Summary Header */}
            <div className="flex items-center space-x-3 p-3 bg-[#FAF6F0] rounded-2xl border border-[#EFE6D8] text-xs">
              <div className="relative w-12 h-14 bg-neutral-100 rounded-xl overflow-hidden shrink-0 border border-[#EFE6D8]">
                <Image
                  src={
                    reviewModalItem.item.product?.images?.[0]?.image_url ||
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop'
                  }
                  alt={reviewModalItem.item.product_name_snapshot}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900">{reviewModalItem.item.product_name_snapshot}</h4>
                <p className="text-[11px] text-neutral-500">
                  Size: {reviewModalItem.item.size_snapshot || 'Standard'} {reviewModalItem.item.color_snapshot ? `| ${reviewModalItem.item.color_snapshot}` : ''}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              {/* Rating Selector */}
              <div className="space-y-1.5 text-center">
                <label className="font-bold text-neutral-700 block">Overall Satisfaction Rating</label>
                <div className="flex items-center justify-center space-x-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoverRating || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform transform hover:scale-125"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            isFilled
                              ? 'fill-amber-400 text-amber-500'
                              : 'fill-neutral-100 text-neutral-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] font-bold text-amber-800">
                  {rating === 5
                    ? ' Excellent!'
                    : rating === 4
                    ? ' Very Good'
                    : rating === 3
                    ? ' Average'
                    : rating === 2
                    ? ' Below Average'
                    : ' Poor'}
                </p>
              </div>

              {/* Review Headline */}
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Review Headline (Optional)</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Absolutely stunning saree & premium fabric quality!"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-medium"
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Detailed Review / Feedback *</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about fitting, color, material comfort, and delivery experience..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-medium"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalItem(null)}
                  className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-xl text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex-[2] py-3 bg-[#B38548] hover:bg-[#966C32] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center space-x-1.5"
                >
                  {isSubmittingReview ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Submit Product Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

