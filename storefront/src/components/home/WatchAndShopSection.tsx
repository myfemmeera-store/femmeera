'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { cmsService, PublicReel } from '@/services/cmsService';
import { Play, Sparkles, ChevronLeft, ChevronRight, ShoppingBag, ArrowRight, X, Volume2, VolumeX, Maximize2 } from 'lucide-react';

const defaultFallbackReels: PublicReel[] = [
  {
    id: 101,
    title: 'Festive Silk Lehenga Collection',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-pink-outfit-41221-large.mp4',
    product_url: '/women/traditional-wear',
    button_text: 'View Product',
    sort_order: 1,
  },
  {
    id: 102,
    title: 'Royal Ethnic Anarkali Suit Set',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-model-posing-in-a-fashion-photoshoot-41224-large.mp4',
    product_url: '/women/traditional-wear',
    button_text: 'View Product',
    sort_order: 2,
  },
  {
    id: 103,
    title: 'Modern Western Couture Edit',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-for-a-camera-41222-large.mp4',
    product_url: '/women/western-wear',
    button_text: 'View Product',
    sort_order: 3,
  },
];

export const WatchAndShopSection: React.FC = () => {
  const [reels, setReels] = useState<PublicReel[]>(defaultFallbackReels);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Active Selected Reel Modal State
  const [activeModalReel, setActiveModalReel] = useState<PublicReel | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    cmsService.getWatchAndShopReels().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setReels(res.data);
      }
    });
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const openReelModal = (reel: PublicReel) => {
    setActiveModalReel(reel);
    setIsMuted(false);
  };

  const closeReelModal = () => {
    setActiveModalReel(null);
  };

  if (reels.length === 0) return null;

  return (
    <section className="py-5 sm:py-20 bg-[#FAF6F0] border-t border-b border-[#EFE6D8] text-neutral-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">

        {/* Section Header Matching Store Aesthetic */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-center md:text-left">
          <div>
            <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#B38548] uppercase block">
              FASHION IN MOTION
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-medium tracking-tight mt-1 uppercase">
              WATCH &amp; SHOP
            </h2>
            <div className="flex items-center justify-center md:justify-start space-x-2 mt-2">
              <span className="h-px bg-[#C59B58] w-8"></span>
              <span className="text-[#B38548] text-xs">🪷</span>
              <span className="h-px bg-[#C59B58] w-8"></span>
            </div>
          </div>

        </div>

        {/* 9:16 Vertical Video Reels Carousel */}
        <div
          ref={scrollRef}
          className="flex space-x-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory focus:outline-none scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {reels.map((reel) => (
            <div
              key={reel.id}
              className="snap-start shrink-0 w-[230px] sm:w-[260px] group relative rounded-2xl overflow-hidden bg-white border border-[#EFE6D8] shadow-md hover:shadow-xl hover:border-[#B38548]/60 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* 9:16 Aspect Ratio Container */}
              <div
                className="relative aspect-[9/16] w-full bg-neutral-900 cursor-pointer overflow-hidden"
                onClick={() => openReelModal(reel)}
              >
                <video
                  src={reel.video_url}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

                {/* Top Reel Badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center space-x-1.5 bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                  <Play className="w-2.5 h-2.5 fill-amber-300" />
                  <span>Tap to Play</span>
                </div>

                {/* Expand Fullscreen Icon */}
                <div className="absolute top-3 right-3 z-10 p-1.5 bg-black/50 backdrop-blur-xs text-white rounded-full opacity-80 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>

                {/* Reel Title Overlay */}
                <div className="absolute bottom-16 inset-x-0 px-4 z-10">
                  <h3 className="text-xs font-black text-white leading-snug drop-shadow-md line-clamp-2">
                    {reel.title}
                  </h3>
                </div>
              </div>

              {/* View Product CTA Button */}
              <div className="p-3 bg-[#FAF6F0] border-t border-[#EFE6D8]">
                <Link
                  href={reel.product_url}
                  className="flex items-center justify-between w-full py-2.5 px-3 bg-black text-white hover:bg-[#B38548] rounded-xl text-[11px] font-black uppercase tracking-wider transition-colors shadow-sm"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="truncate">{reel.button_text || 'View Product'}</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-Screen Interactive Video Reel Modal */}
      {activeModalReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-sm sm:max-w-md bg-black rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 aspect-[9/16] max-h-[85vh] flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* High Def Video Player */}
            <video
              src={activeModalReel.video_url}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 pointer-events-none" />

            {/* Top Modal Bar */}
            <div className="relative z-20 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Femmeera Reel</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 bg-black/60 backdrop-blur-md text-white rounded-full border border-white/20 hover:bg-black transition-colors"
                  aria-label="Toggle Sound"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
                <button
                  onClick={closeReelModal}
                  className="p-2 bg-black/60 backdrop-blur-md text-white rounded-full border border-white/20 hover:bg-black transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Modal CTA Content */}
            <div className="relative z-20 p-5 space-y-4 text-white">
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-widest text-amber-300 uppercase bg-amber-400/20 px-2 py-0.5 rounded">
                  Featured Apparel Outfit
                </span>
                <h3 className="text-base font-black text-white leading-snug drop-shadow-md">
                  {activeModalReel.title}
                </h3>
              </div>

              {/* Direct View Product Link */}
              <Link
                href={activeModalReel.product_url}
                onClick={closeReelModal}
                className="flex items-center justify-between w-full py-3.5 px-5 bg-white text-black hover:bg-amber-400 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-2xl"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-black" />
                  <span>{activeModalReel.button_text || 'View Product'}</span>
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
