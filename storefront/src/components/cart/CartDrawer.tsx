'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Truck } from 'lucide-react';
import { cartService, CartPayload } from '@/services/cartService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [cart, setCart] = useState<CartPayload | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await cartService.getCart();
      if (res.success && res.data) {
        setCart(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

  const freeShippingThreshold = cart?.shipping.free_shipping_threshold || 999;
  const amountNeeded = cart?.shipping.amount_needed_for_free_shipping || 0;
  const freeShippingProgress = Math.min(100, Math.round(((cart?.subtotal || 0) / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg md:max-w-xl lg:max-w-xl bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-rose-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-rose-600" />
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Your Shopping Bag</h2>
              {cart && cart.item_count > 0 && (
                <span className="bg-rose-100 text-rose-800 text-xs md:text-sm font-extrabold px-2.5 py-0.5 rounded-full">
                  {cart.item_count}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          {cart && (
            <div className="bg-amber-50/80 px-4 sm:px-5 py-3 border-b border-amber-100 text-xs sm:text-sm text-amber-900">
              <div className="flex items-center gap-1.5 font-medium mb-1.5">
                <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                {amountNeeded > 0 ? (
                  <span>Add <strong className="text-amber-800 font-bold">₹{amountNeeded.toFixed(0)}</strong> more for <strong className="font-bold">FREE Delivery!</strong></span>
                ) : (
                  <span className="text-emerald-700 font-bold">🎉 Congratulations! You qualify for FREE Delivery!</span>
                )}
              </div>
              <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-amber-600 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-gray-100">
            {loading && !cart ? (
              <div className="py-12 text-center text-sm text-gray-500">Loading cart...</div>
            ) : !cart || cart.items.length === 0 ? (
              <div className="py-16 text-center">
                <ShoppingBag className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-900 font-bold text-base mb-1">Your bag is empty</p>
                <p className="text-xs sm:text-sm text-gray-500 mb-6">Explore our ethnic & western collections to add items.</p>
                <button
                  onClick={onClose}
                  className="inline-flex items-center px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-full transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div key={item.cart_item_id} className="py-4 sm:py-5 flex gap-4 items-center">
                  <div className="relative w-20 h-24 sm:w-24 sm:h-28 md:w-28 md:h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between h-full py-0.5">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 line-clamp-2">{item.product_name}</h3>
                        <button
                          onClick={() => handleRemoveItem(item.cart_item_id)}
                          className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Color: <span className="font-semibold text-gray-800">{item.color}</span> | Size: <span className="font-semibold text-gray-800">{item.size}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50">
                        <button
                          onClick={() => handleUpdateQty(item.cart_item_id, item.quantity - 1)}
                          className="p-1.5 sm:p-2 hover:bg-gray-200 text-gray-700 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs sm:text-sm font-bold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(item.cart_item_id, item.quantity + 1)}
                          className="p-1.5 sm:p-2 hover:bg-gray-200 text-gray-700 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm sm:text-base md:text-lg font-extrabold text-gray-900">₹{item.line_total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout Actions */}
          {cart && cart.items.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/80">
              <div className="space-y-1.5 text-xs text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{cart.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Total Discount</span>
                    <span>-₹{cart.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-medium text-gray-900">
                    {cart.shipping.is_free_shipping ? (
                      <strong className="text-emerald-600">FREE</strong>
                    ) : (
                      `₹${cart.shipping.amount}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Estimated Total</span>
                  <span className="text-rose-600">₹{cart.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="w-full text-center py-2.5 px-3 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  View Bag
                </Link>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full text-center py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-colors flex items-center justify-center gap-1"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
