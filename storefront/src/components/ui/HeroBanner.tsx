'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroBanner as HeroBannerType } from '@/types';

interface HeroBannerProps {
  banner: HeroBannerType;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ banner }) => {
  return (
    <section className="relative bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl text-white my-6">
      {/* Background Image Box with mobile responsiveness */}
      <div className="absolute inset-0 z-0 opacity-40">
        <picture>
          {banner.mobile_image_url && (
            <source media="(max-width: 640px)" srcSet={banner.mobile_image_url} />
          )}
          <img
            src={banner.image_url}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
        </picture>
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 max-w-2xl px-6 sm:px-12 py-16 sm:py-28 space-y-4 sm:space-y-6">
        <span className="px-3 py-1 bg-amber-400 text-black font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-full inline-block">
          FESTIVE EDIT 2026
        </span>

        <h1 className="text-2xl sm:text-5xl font-black tracking-tight leading-tight uppercase font-sans">
          {banner.title}
        </h1>

        <p className="text-xs sm:text-base text-neutral-200 font-medium max-w-lg leading-relaxed">
          {banner.subtitle}
        </p>

        <div className="pt-2">
          <Link
            href={banner.cta_url}
            className="inline-flex items-center space-x-3 px-6 sm:px-8 py-3 sm:py-4 bg-white text-black font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl hover:bg-amber-300 transition-colors shadow-lg"
          >
            <span>{banner.cta_text}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
