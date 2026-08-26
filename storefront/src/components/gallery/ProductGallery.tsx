'use client';

import React, { useState } from 'react';
import { ProductImage } from '@/types';
import { MainProductImage } from './MainProductImage';
import { ProductThumbnailList } from './ProductThumbnailList';
import { ProductImageLightbox } from './ProductImageLightbox';

interface ProductGalleryProps {
  images?: ProductImage[];
  productName: string;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images = [],
  productName,
  isWishlisted,
  onToggleWishlist,
}) => {
  // Sort images by sort_order ASC (Spec Rule: sort_order 1 -> Front, 2 -> Back, 3 -> Side, etc.)
  const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order);

  // Fallback image if product has 0 images
  const displayImages: ProductImage[] =
    sortedImages.length > 0
      ? sortedImages
      : [{ id: 0, product_id: 0, image_url: '', is_primary: true, sort_order: 1, alt_text: productName }];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const handleSelectThumbnail = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* 1. Main Display Product Image */}
      <MainProductImage
        image={displayImages[activeIndex]}
        currentIndex={activeIndex}
        totalImages={displayImages.length}
        productName={productName}
        isWishlisted={isWishlisted}
        onPrev={handlePrev}
        onNext={handleNext}
        onOpenZoom={() => setIsLightboxOpen(true)}
        onToggleWishlist={onToggleWishlist}
      />

      {/* 2. Horizontal Thumbnail Selector List */}
      <ProductThumbnailList
        images={displayImages}
        activeIndex={activeIndex}
        productName={productName}
        onSelect={handleSelectThumbnail}
      />

      {/* 3. Fullscreen Lightbox Zoom Modal */}
      <ProductImageLightbox
        isOpen={isLightboxOpen}
        images={displayImages}
        activeIndex={activeIndex}
        productName={productName}
        onClose={() => setIsLightboxOpen(false)}
        onSelectIndex={setActiveIndex}
      />
    </div>
  );
};
