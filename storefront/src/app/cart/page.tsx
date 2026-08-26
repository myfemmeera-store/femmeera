'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { cartService, CartPayload } from '@/services/cartService';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCart = async (code?: string) => {
    setLoading(true);
    try {
      const res = await cartService.getCart(code);
      if (res.success && res.data) {
        setCart(res.data);
        if (res.data.applied_coupon) {
          setCouponCode(res.data.applied_coupon.code);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQty = async (cartItemId: number, newQty: number) => {
    const res = await cartService.updateQuantity(cartItemId, newQty);
    if (res.success && res.data) {
      setCart(res.data);
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    const res = await cartService.removeItem(cartItemId);
    if (res.success && res.data) {
      setCart(res.data);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    setCouponMsg(null);

    const res = await cartService.getCart(couponCode.trim());
    setApplyingCoupon(false);

    if (res.success && res.data) {
      setCart(res.data);
      if (res.data.coupon_error) {
        setCouponMsg({ type: 'error', text: res.data.coupon_error });
      } else if (res.data.applied_coupon) {
        setCouponMsg({ type: 'success', text: `Coupon '${res.data.applied_coupon.code}' applied!` });
      }
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponCode('');
    setCouponMsg(null);
    fetchCart('');
  };

  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">Loading shopping bag...</p>
        </div>
      </div>
    );
  }

  const freeShippingThreshold = cart?.shipping.free_shipping_threshold || 999;
  const amountNeeded = cart?.shipping.amount_needed_for_free_shipping || 0;
  const freeShippingProgress = Math.min(100, Math.round(((cart?.subtotal || 0) / freeShippingThreshold) * 100));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-rose-600" />
            <h1 className="text-2xl font-bold text-gray-900">Shopping Bag</h1>
            {cart && cart.item_count > 0 && (
              <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full">
                {cart.item_count} items
              </span>
            )}
          </div>
          <Link href="/women" className="text-xs font-semibold text-rose-600 hover:text-rose-700">
            ← Continue Shopping
          </Link>
        </div>

        {/* Validation Warnings (Spec Section 9) */}
        {cart && cart.validation_notices && cart.validation_notices.length > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
            {cart.validation_notices.map((notice, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{notice}</span>
              </div>
            ))}
          </div>
        )}

        {/* Free Shipping Banner */}
        {cart && cart.items.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Truck className="w-4 h-4 text-amber-700" />
                {amountNeeded > 0 ? (
                  <span>Add <strong>₹{amountNeeded.toFixed(0)}</strong> more to get <strong>FREE SHIPPING!</strong></span>
                ) : (
                  <span className="text-emerald-700">🎉 Congratulations! You unlocked FREE Delivery!</span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-amber-800">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-amber-200/70 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {!cart || cart.items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xs">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your Shopping Bag is empty</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              Explore our handcrafted traditional sarees, kurtis, and trendy western wear dresses to add your favorite items.
            </p>
            <Link
              href="/women"
              className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-full shadow-lg shadow-rose-600/20 transition-all hover:scale-[1.02]"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Desktop Table / Mobile Cards */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
              
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-5 px-6">Product Item</th>
                      <th className="py-5 px-4 text-center">Quantity</th>
                      <th className="py-5 px-4 text-right">Price</th>
                      <th className="py-5 px-6 text-right">Subtotal</th>
                      <th className="py-5 px-4 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {cart.items.map((item) => (
                      <tr key={item.cart_item_id} className="hover:bg-rose-50/20 transition-colors">
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-5">
                            <div className="relative w-20 h-28 md:w-24 md:h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200 shadow-2xs">
                              <Image src={item.image_url} alt={item.product_name} fill className="object-cover" />
                            </div>
                            <div className="space-y-1">
                              <Link href={`/product/${item.slug}`} className="text-sm md:text-base font-bold text-gray-900 hover:text-rose-600 line-clamp-2">
                                {item.product_name}
                              </Link>
                              <p className="text-xs text-gray-500">
                                SKU: <span className="font-mono text-gray-600">{item.sku}</span>
                              </p>
                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md font-semibold border border-gray-200">
                                  Color: {item.color}
                                </span>
                                <span className="text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md font-semibold border border-gray-200">
                                  Size: {item.size}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-4 text-center">
                          <div className="inline-flex items-center border border-gray-300 rounded-lg bg-gray-50">
                            <button
                              onClick={() => handleUpdateQty(item.cart_item_id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-200 text-gray-700 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-3.5 text-sm font-bold text-gray-900">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQty(item.cart_item_id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-200 text-gray-700 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="py-5 px-4 text-right">
                          <div className="text-sm md:text-base font-semibold text-gray-900">₹{item.unit_price.toLocaleString('en-IN')}</div>
                          {item.mrp > item.unit_price && (
                            <div className="text-xs text-gray-400 line-through">₹{item.mrp.toLocaleString('en-IN')}</div>
                          )}
                        </td>
                        <td className="py-5 px-6 text-right font-extrabold text-base md:text-lg text-gray-900">
                          ₹{item.line_total.toLocaleString('en-IN')}
                        </td>
                        <td className="py-5 px-4 text-center">
                          <button
                            onClick={() => handleRemoveItem(item.cart_item_id)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                            title="Remove Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Cards View */}
              <div className="sm:hidden divide-y divide-gray-100">
                {cart.items.map((item) => (
                  <div key={item.cart_item_id} className="p-4 flex gap-3">
                    <div className="relative w-20 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                      <Image src={item.image_url} alt={item.product_name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-xs font-bold text-gray-900 line-clamp-1">{item.product_name}</h3>
                          <button onClick={() => handleRemoveItem(item.cart_item_id)} className="text-gray-400 hover:text-rose-600 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                          <span>Color: <strong>{item.color}</strong></span>
                          <span>Size: <strong>{item.size}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button onClick={() => handleUpdateQty(item.cart_item_id, item.quantity - 1)} className="p-1.5 text-gray-600">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-gray-900">{item.quantity}</span>
                          <button onClick={() => handleUpdateQty(item.cart_item_id, item.quantity + 1)} className="p-1.5 text-gray-600">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-900">₹{item.line_total.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Coupon Section */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-bold text-gray-900">Apply Promo Coupon</h3>
                </div>

                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. WELCOME10)"
                    className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs uppercase font-mono font-semibold text-gray-900 focus:outline-hidden focus:border-rose-600"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon || !couponCode.trim()}
                    className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
                  >
                    {applyingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                </form>

                {couponMsg && (
                  <div className={`mt-2.5 text-xs font-medium flex items-center gap-1.5 ${couponMsg.type === 'success' ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {couponMsg.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{couponMsg.text}</span>
                  </div>
                )}

                {cart.applied_coupon && (
                  <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-900">
                    <div>
                      <span className="font-bold font-mono">{cart.applied_coupon.code}</span>
                      <span className="ml-2 font-medium">(-₹{cart.applied_coupon.discount_amount})</span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-emerald-700 hover:text-emerald-900 font-bold underline">
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Order Totals Summary */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Order Summary</h3>

                <div className="space-y-2.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-gray-900">₹{cart.subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {cart.offer_discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Automatic Offer Discount</span>
                      <span>-₹{cart.offer_discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {cart.coupon_discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Coupon Discount ({cart.applied_coupon?.code})</span>
                      <span>-₹{cart.coupon_discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span>
                      {cart.shipping.is_free_shipping ? (
                        <strong className="text-emerald-600 font-bold">FREE</strong>
                      ) : (
                        `₹${cart.shipping.amount}`
                      )}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-gray-900">Grand Total</span>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-rose-600">₹{Number(cart.total || cart.subtotal || 0).toLocaleString('en-IN')}</span>
                      <p className="text-[10px] text-gray-500 font-medium">Inclusive of all taxes</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-600/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 mt-4"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Authoritative 256-bit Secure Checkout</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
