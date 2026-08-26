'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Sparkles, Copy, Check } from 'lucide-react';
import { cmsService, PublicPopup } from '@/services/cmsService';

export const PromoPopupModal: React.FC = () => {
  const [popup, setPopup] = useState<PublicPopup | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check session storage so modal isn't repetitive in same session
    const hasSeenPopup = sessionStorage.getItem('femmeera_popup_dismissed');
    if (hasSeenPopup) return;

    cmsService.getPopup().then((res) => {
      if (res.success && res.data) {
        setPopup(res.data);
        const delay = (res.data.delay_seconds || 2) * 1000;
        const timer = setTimeout(() => setIsOpen(true), delay);
        return () => clearTimeout(timer);
      }
    });
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('femmeera_popup_dismissed', 'true');
  };

  const handleCopyCoupon = () => {
    if (popup?.coupon_code) {
      navigator.clipboard.writeText(popup.coupon_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (!isOpen || !popup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-300">
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-[#EFE6D8] text-center p-6 sm:p-8 space-y-5">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors"
          aria-label="Close offer popup"
        >
          <X className="w-5 h-5" />
        </button>

        {popup.image_url ? (
          <div className="relative w-full h-48 rounded-xl overflow-hidden mb-2">
            <Image src={popup.image_url} alt={popup.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="w-16 h-16 bg-[#FAF4EB] border border-[#EFE5D5] rounded-full flex items-center justify-center mx-auto text-[#B38548]">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
        )}

        <div className="space-y-2">
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#B38548] uppercase">EXCLUSIVE OFFER</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">{popup.title}</h2>
          <p className="text-xs text-neutral-600 leading-relaxed max-w-xs mx-auto">{popup.description}</p>
        </div>

        {popup.coupon_code && (
          <div className="p-3 bg-[#FAF4EB] border border-dashed border-[#B38548] rounded-xl inline-flex items-center space-x-3">
            <span className="font-mono text-xs font-bold text-neutral-900 tracking-wider">
              {popup.coupon_code}
            </span>
            <button
              onClick={handleCopyCoupon}
              className="p-1.5 bg-[#B38548] hover:bg-[#966C32] text-white rounded-lg text-[10px] font-bold flex items-center space-x-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        )}

        <div>
          <Link
            href={popup.button_url || '/shop'}
            onClick={handleClose}
            className="inline-block w-full py-3.5 bg-[#B38548] hover:bg-[#966C32] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors shadow-md"
          >
            {popup.button_text || 'SHOP NOW'}
          </Link>
        </div>
      </div>
    </div>
  );
};
