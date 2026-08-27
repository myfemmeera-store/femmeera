'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock, MapPin, Truck, Package, AlertCircle } from 'lucide-react';
import { apiClient } from '@/services/apiClient';

interface OrderItemData {
  id: number;
  product_name_snapshot: string;
  sku_snapshot: string;
  size_snapshot: string;
  color_snapshot: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_amount: number;
  product?: {
    images?: { image_url: string }[];
  };
}

interface OrderData {
  id: number;
  order_number: string;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_status: string;
  order_status: string;
  created_at: string;
  shipping_address_snapshot?: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
  };
  items?: OrderItemData[];
  latest_payment?: {
    payment_method?: string;
    gateway_transaction_id?: string;
    status?: string;
  };
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const rawOrderNumber = searchParams.get('order_number') || searchParams.get('order') || searchParams.get('order_id') || '';
  const paymentMethodParam = searchParams.get('method') || '';

  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rawOrderNumber) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    apiClient<OrderData>(`/orders/lookup/${rawOrderNumber}`)
      .then((res) => {
        if (res.success && res.data) {
          setOrder(res.data);
        } else {
          setError(res.message || 'Order details not found.');
        }
      })
      .catch(() => {
        setError('Unable to fetch order details.');
      })
      .finally(() => setIsLoading(false));
  }, [rawOrderNumber]);

  // Payment status calculation
  const paymentMethod = order?.latest_payment?.payment_method || paymentMethodParam || 'COD';
  const isCod = paymentMethod.toUpperCase() === 'COD' || paymentMethod.toLowerCase().includes('cash');
  const rawPaymentStatus = order?.payment_status?.toUpperCase() || (isCod ? 'PENDING' : 'PAID');
  const isPaid = rawPaymentStatus === 'PAID';

  // Timeline step calculation based on order_status
  const currentStatus = order?.order_status?.toUpperCase() || 'CONFIRMED';
  let activeStep = 1;
  if (currentStatus === 'PROCESSING') activeStep = 2;
  if (currentStatus === 'SHIPPED') activeStep = 3;
  if (currentStatus === 'DELIVERED') activeStep = 4;

  const displayOrderNumber = order?.order_number || rawOrderNumber || 'ORDER CONFIRMED';
  const orderDate = order?.created_at
    ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

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
          {isCod
            ? 'Thank you for shopping with us. Your Cash on Delivery order has been successfully placed.'
            : 'Thank you for your order. Your payment has been processed successfully.'}
        </p>

        {/* Order ID Badge Box */}
        <div className="inline-block bg-white border border-[#EFE6D8] rounded-2xl px-6 py-3 shadow-2xs mt-2">
          <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#B38548] uppercase block">
            ORDER NUMBER
          </span>
          <span className="font-mono text-lg font-bold text-neutral-900">{displayOrderNumber}</span>
          <p className="text-[10px] text-neutral-400 mt-0.5">Placed on {orderDate}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 border border-[#EFE6D8] text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#B38548] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#B38548]">Fetching your real order details...</p>
        </div>
      ) : error && !order ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-6 rounded-3xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="font-bold text-sm">Order Placed Successfully</h3>
          <p className="text-xs text-amber-700">Order #{displayOrderNumber} is confirmed in system.</p>
        </div>
      ) : (
        <>
          {/* Dual Details Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Card: ORDER DETAILS & ITEMS */}
            <div className="bg-white rounded-3xl p-6 border border-[#EFE6D8] shadow-2xs space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900 border-b border-[#F5EDE0] pb-3 flex items-center justify-between">
                <span>ORDER DETAILS</span>
                <span className="text-[10px] font-normal text-neutral-500">
                  {order?.items?.length || 0} {order?.items?.length === 1 ? 'Item' : 'Items'}
                </span>
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {order?.items && order.items.length > 0 ? (
                  order.items.map((item) => {
                    const imgUrl =
                      item.product?.images?.[0]?.image_url ||
                      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop';
                    return (
                      <div key={item.id} className="flex space-x-3 items-center border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                        <div className="relative w-14 h-16 bg-neutral-100 rounded-xl overflow-hidden shrink-0 border border-[#EFE6D8]">
                          <Image src={imgUrl} alt={item.product_name_snapshot} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 text-xs">
                          <h4 className="font-bold text-neutral-900 truncate">{item.product_name_snapshot}</h4>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            Size: {item.size_snapshot || 'Standard'} {item.color_snapshot ? `| ${item.color_snapshot}` : ''}
                          </p>
                          <p className="text-[11px] text-neutral-500">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-xs text-neutral-900">
                          ₹{Number(item.total_amount || item.unit_price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-neutral-500">Order items recorded.</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs text-neutral-600 pt-3 border-t border-[#F5EDE0]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-neutral-900">₹{Number(order?.subtotal || 0).toLocaleString('en-IN')}</span>
                </div>
                {Number(order?.discount_amount) > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="font-medium text-emerald-600">- ₹{Number(order?.discount_amount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold text-emerald-600">
                    {Number(order?.shipping_amount) === 0 ? 'FREE' : `₹${order?.shipping_amount}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm text-neutral-900 pt-2 border-t border-[#F5EDE0]">
                  <span>Total Amount</span>
                  <span className="text-[#B38548]">₹{Number(order?.total_amount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Right Card: PAYMENT DETAILS & SHIPPING ADDRESS */}
            <div className="bg-white rounded-3xl p-6 border border-[#EFE6D8] shadow-2xs space-y-5">
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900 border-b border-[#F5EDE0] pb-3">
                  PAYMENT DETAILS
                </h3>

                {/* Payment Status Banner */}
                <div
                  className={`p-3 rounded-xl font-bold flex items-center justify-between text-xs border ${
                    isPaid
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {isPaid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber-600" />}
                    <span>{isPaid ? 'Payment Received' : 'Payment Pending (COD)'}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      isPaid ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                    }`}
                  >
                    {isCod ? 'Cash on Delivery' : 'Online Payment'}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Payment Mode</span>
                    <span className="font-semibold text-neutral-900">{isCod ? 'Pay Cash on Delivery' : paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status</span>
                    <span
                      className={`font-bold uppercase ${
                        isPaid ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {rawPaymentStatus}
                    </span>
                  </div>
                  {order?.latest_payment?.gateway_transaction_id && (
                    <div className="flex justify-between">
                      <span>Transaction ID</span>
                      <span className="font-mono text-neutral-900">{order.latest_payment.gateway_transaction_id}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-neutral-900 pt-1">
                    <span>Amount Payable</span>
                    <span className="text-[#B38548]">₹{Number(order?.total_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address Section */}
              {order?.shipping_address_snapshot && (
                <div className="pt-4 border-t border-[#F5EDE0] space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-900 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#B38548]" />
                    <span>Delivery Address</span>
                  </h4>
                  <div className="text-xs text-neutral-600 leading-relaxed bg-[#FDFBF7] p-3 rounded-xl border border-[#F5EDE0]">
                    <p className="font-bold text-neutral-900">{order.shipping_address_snapshot.name}</p>
                    <p>{order.shipping_address_snapshot.address}</p>
                    <p>
                      {order.shipping_address_snapshot.city}, {order.shipping_address_snapshot.state} - {order.shipping_address_snapshot.pincode}
                    </p>
                    <p className="mt-1 font-medium text-neutral-700">📞 Phone: {order.shipping_address_snapshot.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Timeline Tracker */}
          <div className="bg-white rounded-3xl p-6 border border-[#EFE6D8] shadow-2xs space-y-6">
            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900 flex items-center space-x-2 border-b border-[#F5EDE0] pb-3">
              <Truck className="w-4 h-4 text-[#B38548]" />
              <span>Order Delivery Progress</span>
            </h3>

            <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
              <div className={`space-y-2 ${activeStep >= 1 ? 'opacity-100' : 'opacity-40'}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                    activeStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  1
                </div>
                <span className="text-neutral-900 font-bold block text-[11px]">Order Confirmed</span>
                <span className="text-[10px] text-neutral-400 block">{orderDate}</span>
              </div>

              <div className={`space-y-2 ${activeStep >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                    activeStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  2
                </div>
                <span className="text-neutral-700 block text-[11px]">Processing</span>
                <span className="text-[10px] text-neutral-400 block">We are preparing your order</span>
              </div>

              <div className={`space-y-2 ${activeStep >= 3 ? 'opacity-100' : 'opacity-50'}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                    activeStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  3
                </div>
                <span className="text-neutral-700 block text-[11px]">Shipped</span>
                <span className="text-[10px] text-neutral-400 block">Will be delivered soon</span>
              </div>

              <div className={`space-y-2 ${activeStep >= 4 ? 'opacity-100' : 'opacity-50'}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                    activeStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  4
                </div>
                <span className="text-neutral-700 block text-[11px]">Delivered</span>
                <span className="text-[10px] text-neutral-400 block">Enjoy your purchase</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#F5EDE0]">
              <Link
                href="/account"
                className="flex-1 py-3.5 px-4 bg-[#B38548] hover:bg-[#966C32] text-white font-bold text-xs uppercase tracking-wider rounded-xl text-center shadow-md transition-all flex items-center justify-center space-x-1"
              >
                <Package className="w-4 h-4 mr-1" />
                <span>VIEW IN MY ORDERS</span>
              </Link>
              <Link
                href="/shop"
                className="flex-1 py-3.5 px-4 bg-white border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl text-center transition-all"
              >
                CONTINUE SHOPPING
              </Link>
            </div>
          </div>
        </>
      )}
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
