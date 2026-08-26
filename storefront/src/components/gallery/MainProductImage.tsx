'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, Heart } from 'lucide-react';
import { ProductImage } from '@/types';

interface MainProductImageProps {
  image: ProductImage;
  currentIndex: number;
  totalImages: number;
  productName: string;
  isWishlisted: boolean;
  onPrev: () => void;
  onNext: () => void;
  onOpenZoom: () => void;
  onToggleWishlist: () => void;
}

export const MainProductImage: React.FC<MainProductImageProps> = ({
  image,
  currentIndex,
  totalImages,
  productName,
  isWishlisted,
  onPrev,
  onNext,
  onOpenZoom,
  onToggleWishlist,
}) => {
  // Touch Swipe Gesture Handling for Mobile
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const minSwipeDistance = 40;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onNext();
    } else if (isRightSwipe) {
      onPrev();
    }
  };

  const altText = image.alt_text || `${productName} main product view ${currentIndex + 1}`;

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="group relative aspect-3/4 bg-neutral-100 rounded-3xl overflow-hidden shadow-lg border border-neutral-200/80 select-none cursor-pointer"
      onClick={onOpenZoom}
    >
      {/* Main Image View */}
      {image?.image_url ? (
        <img
          src={image.image_url}
          alt={altText}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          fetchPriority={currentIndex === 0 ? 'high' : 'auto'}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center font-bold text-neutral-400 text-xs space-y-2 uppercase tracking-widest bg-neutral-100">
          <span>{productName}</span>
          <span className="text-[10px] text-neutral-300 font-mono">FEMMEERA EDIT</span>
        </div>
      )}

      {/* Hover Zoom Hint */}
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <span className="px-3.5 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[11px] font-extrabold uppercase tracking-wider text-black shadow-md flex items-center space-x-1">
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Click to Zoom</span>
        </span>
      </div>

      {/* Image Counter Badge (Spec Rule: Mobile / Desktop Counter 1 / 5) */}
      {totalImages > 1 && (
        <span className="absolute bottom-3 right-3 px-3 py-1 bg-black/75 backdrop-blur-md text-white font-mono font-bold text-[11px] rounded-full shadow-md">
          {currentIndex + 1} / {totalImages}
        </span>
      )}

      {/* Wishlist Heart Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist();
        }}
        className="absolute top-3.5 right-3.5 p-3 bg-white/90 backdrop-blur-md rounded-full text-neutral-800 hover:text-rose-600 shadow-md transition-colors z-10"
        aria-label="Toggle Wishlist"
      >
        <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
      </button>

      {/* Previous Control Arrow */}
      {totalImages > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-md hover:bg-white text-neutral-800 rounded-full shadow-md opacity-80 hover:opacity-100 transition-all sm:opacity-0 group-hover:opacity-100 z-10"
          aria-label="Previous Image"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Next Control Arrow */}
      {totalImages > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-md hover:bg-white text-neutral-800 rounded-full shadow-md opacity-80 hover:opacity-100 transition-all sm:opacity-0 group-hover:opacity-100 z-10"
          aria-label="Next Image"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
