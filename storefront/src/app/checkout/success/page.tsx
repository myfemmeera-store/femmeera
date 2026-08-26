'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || 'FM25-05-24-12345';
  const paymentMethod = searchParams.get('method') || 'UPI';

  const isCod = paymentMethod === 'COD';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Success Section */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 font-medium tracking-tight">
          {isCod ? 'Order Confirmed!' : 'Payment Successful!'}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 font-medium">
          {isCod ? 'Thank you for shopping with us. Your order has been placed.' : 'Thank you for your order. Your payment has been processed.'}
        </p>

        {/* Order ID Badge Box */}
        <div className="inline-block bg-white border border-[#EFE6D8] rounded-2xl px-6 py-3 shadow-2xs mt-2">
          <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#B38548] uppercase block">
            ORDER ID
          </span>
          <span className="font-mono text-lg font-bold text-neutral-900">{orderNumber}</span>
          <p className="text-[10px] text-neutral-400 mt-0.5">Order placed on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Dual Details Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: ORDER DETAILS */}
        <div className="bg-white rounded-3xl p-6 border border-[#EFE6D8] shadow-2xs space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900 border-b border-[#F5EDE0] pb-3">
            ORDER DETAILS
          </h3>

          <div className="flex space-x-3 items-center">
            <div className="relative w-16 h-20 bg-neutral-100 rounded-xl overflow-hidden shrink-0 border border-[#EFE6D8]">
              <Image src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop" alt="" fill className="object-cover" />
            </div>
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-neutral-900">Linen Co-ord Set</h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">Color: Beige | Size: M</p>
              <p className="text-[11px] text-neutral-500">Qty: 1</p>
            </div>
            <span className="font-bold text-xs text-neutral-900">₹2,199</span>
          </div>

          <div className="space-y-2 text-xs text-neutral-600 pt-3 border-t border-[#F5EDE0]">
            <div className="flex justify-between">
              <span>Price (1 item)</span>
              <span className="font-medium text-neutral-900">₹2,199</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Discount</span>
              <span className="font-medium text-emerald-600">- ₹99</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-neutral-900 pt-2 border-t border-[#F5EDE0]">
              <span>Total Amount</span>
              <span className="text-[#B38548]">₹2,199</span>
            </div>
          </div>
        </div>

        {/* Right Card: PAYMENT DETAILS */}
        <div className="bg-white rounded-3xl p-6 border border-[#EFE6D8] shadow-2xs space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900 border-b border-[#F5EDE0] pb-3">
            PAYMENT DETAILS
          </h3>

          <div className="space-y-3 text-xs">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl font-bold flex items-center justify-between">
              <span>{isCod ? 'Cash on Delivery' : 'Paid Successfully'}</span>
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded">
                {isCod ? 'COD' : 'UPI (Google Pay)'}
              </span>
            </div>

            <div className="space-y-2 text-neutral-600">
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span className="font-semibold text-neutral-900">{isCod ? 'Pay on Delivery' : 'UPI (Google Pay)'}</span>
              </div>
              <div className="flex justify-between">
                <span>Transaction ID</span>
                <span className="font-mono text-neutral-900">T250524184512345</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid</span>
                <span className="font-bold text-neutral-900">₹2,199</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Timeline Tracker */}
      <div className="bg-white rounded-3xl p-6 border border-[#EFE6D8] shadow-2xs space-y-6">
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xs font-bold">1</div>
            <span className="text-neutral-900 font-bold block text-[11px]">Order Confirmed</span>
            <span className="text-[10px] text-neutral-400 block">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
          </div>
          <div className="space-y-2 opacity-60">
            <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center mx-auto text-xs font-bold">2</div>
            <span className="text-neutral-700 block text-[11px]">Processing</span>
            <span className="text-[10px] text-neutral-400 block">We are preparing your order</span>
          </div>
          <div className="space-y-2 opacity-60">
            <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center mx-auto text-xs font-bold">3</div>
            <span className="text-neutral-700 block text-[11px]">Shipped</span>
            <span className="text-[10px] text-neutral-400 block">Will be delivered soon</span>
          </div>
          <div className="space-y-2 opacity-60">
            <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center mx-auto text-xs font-bold">4</div>
            <span className="text-neutral-700 block text-[11px]">Delivered</span>
            <span className="text-[10px] text-neutral-400 block">Enjoy your purchase</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#F5EDE0]">
          <Link
            href="/account/orders"
            className="flex-1 py-3.5 px-4 bg-[#B38548] hover:bg-[#966C32] text-white font-bold text-xs uppercase tracking-wider rounded-xl text-center shadow-md transition-all"
          >
            TRACK ORDER
          </Link>
          <Link
            href="/shop"
            className="flex-1 py-3.5 px-4 bg-white border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl text-center transition-all"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center py-20 text-xs font-bold text-[#B38548]">Loading order details...</div>}>
        <OrderSuccessContent />
      </Suspense>
    </div>
  );
}
