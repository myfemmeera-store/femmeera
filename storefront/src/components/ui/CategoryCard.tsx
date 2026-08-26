'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const isTraditional = category.slug.includes('traditional');

  return (
    <Link
      href={`/women/${category.slug}`}
      className="group relative h-64 sm:h-80 bg-neutral-900 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-end p-6 text-white"
    >
      <div className="absolute inset-0 bg-neutral-800 opacity-60 group-hover:scale-105 transition-transform duration-700">
        {category.image_url ? (
          <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center font-mono text-neutral-600 font-bold text-xs uppercase">
            {category.name}
          </div>
        )}
      </div>

      <div className="relative z-10 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 block">
          WOMEN'S COLLECTION
        </span>

        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tight">{category.name}</h3>
          <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center group-hover:bg-amber-300 transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        <p className="text-[11px] text-neutral-300 line-clamp-1">
          {category.description || (isTraditional ? 'Sarees, Kurtis & Ethnic Sets' : 'Dresses, Tops & Chic Trends')}
        </p>
      </div>
    </Link>
  );
};
