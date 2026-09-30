'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RotateCcw, CheckCircle2, AlertCircle, ChevronLeft, HelpCircle } from 'lucide-react';
import { apiClient } from '@/services/apiClient';

interface ReturnPolicyData {
  title: string;
  return_window_days: number;
  allow_returns: boolean;
  allow_exchanges: boolean;
  content: string;
}

export default function ReturnPolicyPage() {
  const [policy, setPolicy] = useState<ReturnPolicyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<ReturnPolicyData>('/return-policy')
      .then((res) => {
        if (res.success && res.data) {
          setPolicy(res.data);
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
            RETURNS & REFUNDS
          </span>
          <h1 className="font-serif text-3xl font-medium text-neutral-900 mt-1">
            {policy?.title || 'Return & Exchange Policy'}
          </h1>
          <p className="text-xs text-neutral-500 mt-2">
            Hassle-free returns and exchanges within {policy?.return_window_days || 7} days of delivery.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-neutral-500">Loading return policy...</div>
        ) : (
          <div className="space-y-8 text-neutral-800 text-xs leading-relaxed">
            
            {/* Quick Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#EFE6D8] space-y-2">
                <RotateCcw className="w-5 h-5 text-[#B38548]" />
                <h4 className="font-bold text-neutral-900 text-sm">Return Window</h4>
                <p className="text-neutral-500">{policy?.return_window_days || 7} Days from Delivery Date</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EFE6D8] space-y-2">
                <CheckCircle2 className="w-5 h-5 text-[#B38548]" />
                <h4 className="font-bold text-neutral-900 text-sm">Exchanges Allowed</h4>
                <p className="text-neutral-500">{policy?.allow_exchanges ? 'Size & Color Exchanges Available' : 'No Exchanges'}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EFE6D8] space-y-2">
                <HelpCircle className="w-5 h-5 text-[#B38548]" />
                <h4 className="font-bold text-neutral-900 text-sm">Free Doorstep Pickup</h4>
                <p className="text-neutral-500">Femmeera arranges free reverse courier pickup</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EFE6D8] space-y-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-neutral-900 text-sm">Zero Restocking Fee</h4>
                <p className="text-emerald-700 font-semibold">₹0 Cost / Free Returns & Exchanges</p>
              </div>
            </div>

            {/* Free Reverse Courier Pickup Notice */}
            <div className="bg-[#FAF4EB] p-6 rounded-3xl border border-[#EFE6D8] space-y-3">
              <h3 className="font-serif text-base font-bold text-neutral-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#B38548]" />
                <span>Free Reverse Courier Pickup (No Self-Courier Required)</span>
              </h3>
              <p className="text-neutral-700 font-medium leading-relaxed">
                For eligible returns and exchanges, <strong>Femmeera arranges free reverse courier pickup from your delivery address</strong>. Customers do not need to arrange return shipping themselves.
              </p>
            </div>

            {/* Conditions Card */}
            <div className="bg-white p-6 rounded-3xl border border-[#EFE6D8] space-y-3 shadow-xs">
              <h3 className="font-serif text-base font-bold text-neutral-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#B38548]" />
                <span>Eligibility Conditions for Return & Exchange</span>
              </h3>
              <ul className="space-y-2 list-disc list-inside text-neutral-700 font-medium">
                <li>Returns are accepted for both defective and non-defective items (e.g. wrong size, color preference, or change of mind).</li>
                <li>Garments must be unused, unwashed, and undamaged.</li>
                <li>Original price tags, brand packaging, and certificates must be intact.</li>
                <li>Customized, altered, or final clearance items are non-returnable.</li>
                <li>Return request must be initiated from <strong className="text-neutral-900">My Orders</strong> within {policy?.return_window_days || 7} days of delivery.</li>
              </ul>
            </div>

            {/* Step-by-Step Return Process */}
            <div className="bg-white p-6 rounded-3xl border border-[#EFE6D8] space-y-4">
              <h3 className="font-serif text-lg font-medium text-neutral-900">How the Return Process Works</h3>
              <ol className="space-y-3 list-decimal list-inside text-neutral-700 font-medium">
                <li><strong className="text-neutral-900">Request Return:</strong> Log in to your Femmeera account, go to <strong>My Orders</strong>, select the order and click <em>Request Return / Exchange</em> within 7 days of delivery.</li>
                <li><strong className="text-neutral-900">Request Verification:</strong> Our team reviews and confirms your return request within 24 hours.</li>
                <li><strong className="text-neutral-900">Free Reverse Pickup:</strong> Femmeera schedules a free doorstep reverse pickup at your address. Our delivery partner collects the packed parcel from your home.</li>
                <li><strong className="text-neutral-900">Quality Inspection:</strong> The item is received at our facility and verified for unused condition with original tags.</li>
                <li><strong className="text-neutral-900">Refund / Exchange:</strong> Full refund is processed to your original payment method or bank account within 5–7 business days after inspection, or your exchange item is dispatched.</li>
              </ol>
            </div>

            {/* Policy Content */}
            {policy?.content && (
              <div className="bg-white p-6 rounded-3xl border border-[#EFE6D8] space-y-4">
                <h3 className="font-serif text-lg font-medium text-neutral-900">Additional Policy Details</h3>
                <p className="whitespace-pre-line text-neutral-700">
                  {policy.content}
                </p>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
