'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface CategorySortSelectProps {
  currentSort?: string;
  categorySlug: string;
}

export const CategorySortSelect: React.FC<CategorySortSelectProps> = ({
  currentSort = 'newest',
  categorySlug,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    params.set('page', '1');
    router.push(`/women/${categorySlug}?${params.toString()}`);
  };

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="category-sort-select" className="font-bold text-neutral-500 text-xs shrink-0">
        Sort By:
      </label>
      <select
        id="category-sort-select"
        value={currentSort}
        onChange={handleSortChange}
        className="bg-white border border-neutral-200 rounded-lg px-3 py-1.5 font-bold text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer shadow-2xs"
      >
        <option value="newest">Newest / Featured Order</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="best_seller">Best Sellers</option>
        <option value="featured">Featured Outfits</option>
      </select>
    </div>
  );
};
