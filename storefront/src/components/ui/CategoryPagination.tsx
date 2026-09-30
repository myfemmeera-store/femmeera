'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryPaginationProps {
  currentPage: number;
  lastPage: number;
  categorySlug: string;
  currentSort?: string;
  search?: string;
}

export const CategoryPagination: React.FC<CategoryPaginationProps> = ({
  currentPage,
  lastPage,
  categorySlug,
  currentSort = 'newest',
  search = '',
}) => {
  if (lastPage <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    if (currentSort && currentSort !== 'newest') params.set('sort', currentSort);
    if (search) params.set('search', search);
    return `/women/${categorySlug}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between border-t border-neutral-200/80 pt-6 mt-8">
      <p className="text-xs text-neutral-500 font-medium">
        Page <span className="font-bold text-neutral-900">{currentPage}</span> of{' '}
        <span className="font-bold text-neutral-900">{lastPage}</span>
      </p>

      <div className="flex items-center space-x-2">
        {currentPage > 1 ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="flex items-center space-x-1 px-3.5 py-2 bg-white border border-neutral-200 hover:border-neutral-400 text-neutral-800 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </Link>
        ) : (
          <span className="flex items-center space-x-1 px-3.5 py-2 bg-neutral-100 text-neutral-400 rounded-xl text-xs font-bold cursor-not-allowed">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </span>
        )}

        {currentPage < lastPage ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="flex items-center space-x-1 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <span className="flex items-center space-x-1 px-3.5 py-2 bg-neutral-100 text-neutral-400 rounded-xl text-xs font-bold cursor-not-allowed">
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </div>
  );
};
