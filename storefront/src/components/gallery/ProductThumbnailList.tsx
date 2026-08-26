'use client';

import React from 'react';
import { ProductImage } from '@/types';
import { ProductThumbnail } from './ProductThumbnail';

interface ProductThumbnailListProps {
  images: ProductImage[];
  activeIndex: number;
  productName: string;
  onSelect: (index: number) => void;
}

export const ProductThumbnailList: React.FC<ProductThumbnailListProps> = ({
  images,
  activeIndex,
  productName,
  onSelect,
}) => {
  if (images.length <= 1) return null;

  return (
    <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none pt-1">
      {images.map((img, index) => (
        <ProductThumbnail
          key={img.id || index}
          image={img}
          index={index}
          isActive={activeIndex === index}
          productName={productName}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};
