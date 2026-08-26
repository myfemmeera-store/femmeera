'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { paymentService } from '@/services/paymentService';
import { ShieldAlert, RefreshCw, ShoppingBag, ArrowLeft } from 'lucide-react';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id') || searchParams.get('order_number') || '';
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRetry = async () => {
    if (!orderId) {
      router.push('/checkout');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      // Create new payment attempt order
      const paymentOrder = await paymentService.retryPayment(orderId);

      // Load Razorpay Script dynamically if needed
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
          document.body.appendChild(script);
        });
      }

      const options = {
        key: paymentOrder.key_id,
        amount: Math.round(paymentOrder.amount * 100),
        currency: paymentOrder.currency || 'INR',
        name: 'Femmeera Couture',
        description: `Payment for Order #${paymentOrder.order_number}`,
        order_id: paymentOrder.provider_payment_order_id,
        handler: async function (response: any) {
          try {
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            router.push(`/checkout/success?order_number=${paymentOrder.order_number}&order_id=${paymentOrder.order_id}`);
          } catch (err: any) {
            setErrorMsg(err.message || 'Payment verification failed.');
          }
        },
        theme: {
          color: '#8b0000',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize payment retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="bg-rose-50/50 border border-rose-200 rounded-3xl p-8 sm:p-12 text-center shadow-xl backdrop-blur-md">
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold tracking-widest text-rose-800 uppercase bg-rose-100 px-4 py-1.5 rounded-full inline-block mb-3">
          Payment Incomplete
        </span>

        <h1 className="text-3xl sm:text-4xl font-serif text-slate-900 font-bold mb-3">
          Payment Failed or Cancelled
        </h1>

        <p className="text-slate-600 max-w-md mx-auto mb-6 text-sm leading-relaxed">
          Your payment could not be processed. Don't worry, your order items remain reserved in your account. You can retry payment immediately below.
        </p>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-100 border border-rose-300 text-rose-800 rounded-xl text-sm font-medium max-w-md mx-auto">
            {errorMsg}
          </div>
        )}

        {orderId && (
          <div className="bg-white/80 rounded-2xl p-4 border border-rose-100 max-w-xs mx-auto mb-8 shadow-xs">
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Reference Order</span>
            <span className="text-lg font-mono font-bold text-slate-900">#{orderId}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={handleRetry}
            disabled={loading}
            className="w-full sm:w-auto flex-1 bg-gradient-to-r from-rose-900 to-rose-950 hover:from-rose-800 hover:to-rose-900 text-amber-100 py-3.5 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            Retry Payment Now
          </button>

          <Link
            href="/cart"
            className="w-full sm:w-auto flex-1 bg-white hover:bg-slate-50 text-slate-700 py-3.5 px-6 rounded-2xl font-semibold border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5 text-slate-500" />
            View Cart
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-rose-100 text-xs text-slate-500 flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Need help? Contact Femmeera Concierge Support</span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-rose-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500">Loading payment status...</p>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}
