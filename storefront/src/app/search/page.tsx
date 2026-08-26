import React from 'react';
import { productService } from '@/services/productService';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { Search as SearchIcon } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Catalog | Femmeera',
  description: 'Search traditional sarees, kurtis, western dresses and fashion trends at Femmeera.',
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sParams = await searchParams;
  const query = sParams.q || '';
  const page = Number(sParams.page) || 1;

  const res = await productService.getProducts({ page, search: query });
  const products = res.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="border-b border-neutral-200 pb-6 space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
          CATALOG SEARCH RESULTS
        </span>
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900">
          {query ? `Search: "${query}"` : 'Search Catalog'}
        </h1>
        <p className="text-xs text-neutral-500">Found {products.length} matching apparel items</p>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
