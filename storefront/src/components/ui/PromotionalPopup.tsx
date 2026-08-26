'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Sparkles } from 'lucide-react';
import { PopupCMS } from '@/types';
import { cmsService } from '@/services/cmsService';

export const PromotionalPopup: React.FC = () => {
  const [popup, setPopup] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if dismissed previously in session
    const dismissed = sessionStorage.getItem('femmeera_popup_dismissed');
    if (dismissed) return;

    cmsService.getPromotionalPopup().then((res) => {
      if (res.success && res.data) {
        setPopup(res.data);
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    });
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem('femmeera_popup_dismissed', 'true');
  };

  if (!isOpen || !popup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={handleDismiss} />

      <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl border border-neutral-200">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-black rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-black text-amber-300 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-black uppercase tracking-tight text-neutral-900">{popup.title}</h3>

        <p className="text-xs text-neutral-600 leading-relaxed">{popup.description}</p>

        {popup.coupon_code && (
          <div className="p-3 bg-neutral-100 rounded-xl border border-dashed border-neutral-300 font-mono text-sm font-black text-black">
            CODE: {popup.coupon_code}
          </div>
        )}

        <Link
          href={popup.cta_url || popup.button_url || '/shop'}
          onClick={handleDismiss}
          className="block w-full py-3 bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-md"
        >
          {popup.cta_text || popup.button_text || 'CLAIM NOW'}
        </Link>
      </div>
    </div>
  );
};
