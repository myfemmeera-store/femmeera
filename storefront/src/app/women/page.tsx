import React from 'react';
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Women\'s Fashion Collection | Femmeera',
  description: 'Shop handcrafted traditional sarees, kurtis, western dresses and tops for women.',
};

export default async function WomenPage() {
  const [categoriesRes, productsRes] = await Promise.all([
    categoryService.getCategories(),
    productService.getProducts({ page: 1 }),
  ]);

  const categories = categoriesRes.data || [];
  const products = productsRes.data || [];

  const womenCategory = categories.find((c) => c.slug === 'women') || categories[0];
  const subCategories = categories.filter((c) => c.parent_id === womenCategory?.id || c.slug !== 'women');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      <div className="border-b border-neutral-200 pb-6 space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
          FEMMEERA EDIT
        </span>
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900">
          Women's Clothing Collection
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subCategories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>

      <div className="space-y-6 pt-6">
        <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900">
          Trending Women's Apparels
        </h2>
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
