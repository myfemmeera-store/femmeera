'use client';

import React, { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { cartService } from '@/services/cartService';

interface AddToCartButtonProps {
  variantId?: number;
  productId?: number;
  className?: string;
  buttonText?: string;
  compact?: boolean;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  variantId,
  productId,
  className = '',
  buttonText = 'ADD TO CART',
  compact = false,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Use provided variantId or default variant 1
    const targetVariantId = variantId || productId || 1;

    setIsAdding(true);
    try {
      const res = await cartService.addItem(targetVariantId, 1);
      if (res.success) {
        setIsSuccess(true);
        window.dispatchEvent(new Event('femmeera-cart-updated'));
        setTimeout(() => setIsSuccess(false), 2000);
      }
    } catch (err) {
      // Ignore
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`rounded-xl font-sans font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 ${
        compact ? 'px-2.5 py-1 text-[10px]' : 'px-3.5 py-2 text-[11px]'
      } ${
        isSuccess
          ? 'bg-emerald-600 text-white'
          : 'bg-[#B38548] hover:bg-[#966C32] text-white active:scale-95 shadow-2xs'
      } ${className}`}
    >
      {isSuccess ? (
        <>
          <Check className="w-3.5 h-3.5" />
          <span>ADDED</span>
        </>
      ) : (
        <>
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{isAdding ? '...' : buttonText}</span>
        </>
      )}
    </button>
  );
};
