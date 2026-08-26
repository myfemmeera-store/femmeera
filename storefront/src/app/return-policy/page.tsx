'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RotateCcw, CheckCircle2, AlertCircle, ChevronLeft, HelpCircle } from 'lucide-react';

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
    fetch('http://localhost:8000/api/v1/return-policy')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setPolicy(json.data);
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <h4 className="font-bold text-neutral-900 text-sm">Doorstep Pickup</h4>
                <p className="text-neutral-500">Reverse pickup arranged at your pincode</p>
              </div>
            </div>

            {/* Conditions Card */}
            <div className="bg-[#FAF4EB] p-6 rounded-3xl border border-[#EFE6D8] space-y-3">
              <h3 className="font-serif text-base font-bold text-neutral-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#B38548]" />
                <span>Eligibility Conditions for Return</span>
              </h3>
              <ul className="space-y-2 list-disc list-inside text-neutral-700 font-medium">
                <li>Garments must be unused, unwashed, and undamaged.</li>
                <li>Original price tags, brand packaging, and certificates must be intact.</li>
                <li>Customized, altered, or final clearance items are non-returnable.</li>
                <li>Return request must be initiated from <strong className="text-neutral-900">My Orders</strong> within {policy?.return_window_days || 7} days.</li>
              </ul>
            </div>

            {/* Policy Content */}
            <div className="bg-white p-6 rounded-3xl border border-[#EFE6D8] space-y-4">
              <h3 className="font-serif text-lg font-medium text-neutral-900">Full Policy Guidelines</h3>
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
