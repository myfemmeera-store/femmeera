'use client';

import React from 'react';
import { CartDrawer as RealCartDrawer } from '@/components/cart/CartDrawer';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCartUpdate?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  return <RealCartDrawer isOpen={isOpen} onClose={onClose} />;
};
