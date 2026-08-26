'use client';

import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { ProductImage } from '@/types';

interface ProductImageLightboxProps {
  isOpen: boolean;
  images: ProductImage[];
  activeIndex: number;
  productName: string;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}

export const ProductImageLightbox: React.FC<ProductImageLightboxProps> = ({
  isOpen,
  images,
  activeIndex,
  productName,
  onClose,
  onSelectIndex,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        onSelectIndex(activeIndex === 0 ? images.length - 1 : activeIndex - 1);
      }
      if (e.key === 'ArrowRight') {
        onSelectIndex(activeIndex === images.length - 1 ? 0 : activeIndex + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, images.length, onClose, onSelectIndex]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[activeIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectIndex(activeIndex === 0 ? images.length - 1 : activeIndex - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectIndex(activeIndex === images.length - 1 ? 0 : activeIndex + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none">
      {/* Top Bar Actions */}
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-3">
        <span className="text-xs font-mono font-bold text-neutral-400">
          {activeIndex + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Close image zoom view (Escape)"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Prev Arrow */}
      {images.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 z-50 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Main Zoomed Display */}
      <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center p-2">
        {currentImage?.image_url ? (
          <img
            src={currentImage.image_url}
            alt={currentImage.alt_text || `${productName} view ${activeIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        ) : (
          <div className="text-white font-mono font-bold text-sm uppercase tracking-widest">
            {productName}
          </div>
        )}
      </div>

      {/* Next Arrow */}
      {images.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 z-50 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
