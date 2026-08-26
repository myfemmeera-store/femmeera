'use client';

import React from 'react';
import { ProductImage } from '@/types';

interface ProductThumbnailProps {
  image: ProductImage;
  index: number;
  isActive: boolean;
  productName: string;
  onSelect: (index: number) => void;
}

export const ProductThumbnail: React.FC<ProductThumbnailProps> = ({
  image,
  index,
  isActive,
  productName,
  onSelect,
}) => {
  const altText = image.alt_text || `View image ${index + 1} of ${productName}`;

  return (
    <button
      onClick={() => onSelect(index)}
      className={`relative w-16 sm:w-20 aspect-3/4 rounded-xl overflow-hidden border-2 transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-black ${
        isActive
          ? 'border-black ring-2 ring-black/40 scale-105 shadow-md'
          : 'border-neutral-200 opacity-60 hover:opacity-100 hover:border-neutral-400'
      }`}
      aria-label={altText}
      aria-current={isActive ? 'true' : 'false'}
    >
      {image.image_url ? (
        <img
          src={image.image_url}
          alt={altText}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-neutral-100 flex items-center justify-center font-bold text-[10px] text-neutral-400 uppercase">
          {index + 1}
        </div>
      )}

      {/* Visual Active Indicator overlay badge */}
      {isActive && (
        <span className="absolute bottom-1 right-1 w-2 h-2 bg-black rounded-full" />
      )}
    </button>
  );
};
