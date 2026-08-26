import React from 'react';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { JsonLd } from '@/components/ui/JsonLd';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { Metadata } from 'next';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; search?: string; sort?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoriesRes = await categoryService.getCategories();
  const cat = categoriesRes.data?.find((c) => c.slug === slug);

  const title = cat?.seo_title || `${cat?.name || 'Women\'s Clothing'} Collection | Femmeera`;
  const description = cat?.seo_description || `Discover handcrafted ${cat?.name || 'clothing'} for women at Femmeera.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://femmeera.com/women/${slug}`,
    },
  };
}

export default async function CategoryListingPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;
  const currentPage = Number(sParams.page) || 1;
  const search = sParams.search || '';

  const [categoriesRes, productsRes] = await Promise.all([
    categoryService.getCategories(),
    productService.getProducts({ page: currentPage, category_slug: slug, search }),
  ]);

  const cat = categoriesRes.data?.find((c) => c.slug === slug);
  const products = productsRes.data || [];
  const meta = productsRes.meta?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <JsonLd
        type="BreadcrumbList"
        breadcrumbs={[
          { name: 'Home', item: 'https://femmeera.com' },
          { name: 'Women', item: 'https://femmeera.com/women' },
          { name: cat?.name || slug, item: `https://femmeera.com/women/${slug}` },
        ]}
      />

      {/* Category Header */}
      <div className="border-b border-neutral-200 pb-6 space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
          WOMEN'S CLOTHING
        </span>
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900">
          {cat?.name || slug.replace('-', ' ')}
        </h1>
        {cat?.description && (
          <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl">{cat.description}</p>
        )}
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 px-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs">
        <div className="flex items-center space-x-2 font-bold text-neutral-700">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Showing {products.length} Products</span>
        </div>

        <div className="flex items-center space-x-3">
          <label className="font-bold text-neutral-500">Sort By:</label>
          <select className="bg-white border border-neutral-200 rounded-lg px-3 py-1.5 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-black">
            <option value="newest">Newest Arrivals</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="featured">Featured</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid products={products} />
    </div>
  );
}
