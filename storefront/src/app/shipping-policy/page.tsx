'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, Clock, CheckCircle2, ChevronLeft } from 'lucide-react';

interface ShippingRule {
  id: number;
  name: string;
  min_order_amount: number;
  max_order_amount: number | null;
  shipping_fee: number;
  estimated_days: string;
}

interface ShippingPolicyData {
  title: string;
  dispatch_time: string;
  free_shipping_threshold: number;
  content: string;
}

export default function ShippingPolicyPage() {
  const [policy, setPolicy] = useState<ShippingPolicyData | null>(null);
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/shipping-policy')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setPolicy(json.data.policy);
          setRules(json.data.rules || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center text-xs font-bold text-neutral-500 hover:text-[#B38548] gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Page Header */}
        <div className="border-b border-[#EFE6D8] pb-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#B38548]">
            DELIVERY & LOGISTICS
          </span>
          <h1 className="font-serif text-3xl font-medium text-neutral-900 mt-1">
            {policy?.title || 'Shipping & Delivery Policy'}
          </h1>
          <p className="text-xs text-neutral-500 mt-2">
            Fast, reliable, and insured delivery across India.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-neutral-500">Loading shipping policy...</div>
        ) : (
          <div className="space-y-8 text-neutral-800 text-xs leading-relaxed">
            
            {/* Quick Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#EFE6D8] space-y-2">
                <Clock className="w-5 h-5 text-[#B38548]" />
                <h4 className="font-bold text-neutral-900 text-sm">Dispatch Time</h4>
                <p className="text-neutral-500">{policy?.dispatch_time || '24 - 48 Hours'}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EFE6D8] space-y-2">
                <Truck className="w-5 h-5 text-[#B38548]" />
                <h4 className="font-bold text-neutral-900 text-sm">Free Express Shipping</h4>
                <p className="text-neutral-500">On all orders above ₹{policy?.free_shipping_threshold?.toLocaleString('en-IN') || '2,000'}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EFE6D8] space-y-2">
                <ShieldCheck className="w-5 h-5 text-[#B38548]" />
                <h4 className="font-bold text-neutral-900 text-sm">Insured Transit</h4>
                <p className="text-neutral-500">Full tracking and tamper-evident packaging</p>
              </div>
            </div>

            {/* Shipping Rules Table */}
            <div className="bg-white p-6 rounded-3xl border border-[#EFE6D8] space-y-4 shadow-xs">
              <h3 className="font-serif text-lg font-medium text-neutral-900">Domestic Shipping Rates</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#EFE6D8] text-[#B38548] font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Order Value Tier</th>
                      <th className="py-3 px-4">Shipping Fee</th>
                      <th className="py-3 px-4">Estimated Delivery</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE6D8]">
                    {rules.map((r) => (
                      <tr key={r.id} className="hover:bg-neutral-50">
                        <td className="py-3 px-4 font-semibold text-neutral-900">
                          {r.max_order_amount
                            ? `₹${r.min_order_amount.toLocaleString('en-IN')} – ₹${r.max_order_amount.toLocaleString('en-IN')}`
                            : `₹${r.min_order_amount.toLocaleString('en-IN')}+`}
                        </td>
                        <td className="py-3 px-4 font-bold text-neutral-900">
                          {r.shipping_fee === 0 ? (
                            <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">FREE</span>
                          ) : (
                            `₹${r.shipping_fee}`
                          )}
                        </td>
                        <td className="py-3 px-4 text-neutral-600">{r.estimated_days}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Content Details */}
            <div className="bg-white p-6 rounded-3xl border border-[#EFE6D8] space-y-4">
              <h3 className="font-serif text-lg font-medium text-neutral-900">Policy Details</h3>
              <p className="whitespace-pre-line text-neutral-700">
                {policy?.content}
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
