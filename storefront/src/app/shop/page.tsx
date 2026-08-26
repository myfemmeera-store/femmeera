'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { Product, Category } from '@/types';
import { Search, Filter, Sparkles, ArrowUpDown, X, RefreshCw } from 'lucide-react';

function ShopPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category_slug') || '';
  const sortParam = searchParams.get('sort') || 'newest';

  const [products, setProducts] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState(searchParam);
  const [categorySlug, setCategorySlug] = useState(categoryParam);
  const [sort, setSort] = useState(sortParam);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    categoryService.getCategories().then((res) => {
      if (res.success && res.data) {
        setCategories(res.data);
      }
    });
  }, []);

  useEffect(() => {
    setSearch(searchParam);
    setCategorySlug(categoryParam);
    setSort(sortParam);
  }, [searchParam, categoryParam, sortParam]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await productService.getProducts({
        search,
        category_slug: categorySlug,
        sort,
      });

      if (res.success && res.data) {
        setProducts(res.data);
        setRelatedProducts(res.related_products || []);
      } else {
        setProducts([]);
        setRelatedProducts([]);
      }
    } catch (err) {
      setProducts([]);
      setRelatedProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search, categorySlug, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ search, category_slug: categorySlug, sort });
  };

  const handleCategorySelect = (slug: string) => {
    const nextSlug = categorySlug === slug ? '' : slug;
    setCategorySlug(nextSlug);
    updateUrlParams({ search, category_slug: nextSlug, sort });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSort = e.target.value;
    setSort(nextSort);
    updateUrlParams({ search, category_slug: categorySlug, sort: nextSort });
  };

  const clearFilters = () => {
    setSearch('');
    setCategorySlug('');
    setSort('newest');
    router.push('/shop');
  };

  const updateUrlParams = (params: { search?: string; category_slug?: string; sort?: string }) => {
    const q = new URLSearchParams();
    if (params.search?.trim()) q.set('search', params.search.trim());
    if (params.category_slug) q.set('category_slug', params.category_slug);
    if (params.sort && params.sort !== 'newest') q.set('sort', params.sort);
    router.push(`/shop?${q.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 min-h-[80vh]">
      {/* Header Banner */}
      <div className="border-b border-neutral-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#B38548] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#B38548]" />
            FEMMEERA COLLECTION 2026
          </span>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 mt-1">
            {search ? `Search Results for "${search}"` : categorySlug ? `Category: ${categorySlug.replace('-', ' ')}` : 'Complete Catalog'}
          </h1>
        </div>

        {/* Search Bar inside Shop Header */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search catalog by name, style, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black"
          />
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                updateUrlParams({ search: '', category_slug: categorySlug, sort });
              }}
              className="absolute right-3 top-3 text-neutral-400 hover:text-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Filter Tabs & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-neutral-100">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
          <button
            onClick={() => handleCategorySelect('')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              categorySlug === ''
                ? 'bg-black text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                categorySlug === cat.slug
                  ? 'bg-black text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort Selector & Reset */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-1.5 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={sort}
              onChange={handleSortChange}
              className="bg-transparent text-xs font-bold text-neutral-800 focus:outline-none cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="best_seller">Bestsellers</option>
              <option value="featured">Featured</option>
            </select>
          </div>

          {(search || categorySlug || sort !== 'newest') && (
            <button
              onClick={clearFilters}
              className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-12">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-3/4 bg-neutral-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-4">
          <p className="text-xs font-bold text-neutral-500">
            Showing {products.length} product{products.length === 1 ? '' : 's'}
          </p>
          <ProductGrid products={products} />
        </div>
      ) : (
        /* Empty Search / Filter Fallback with Related Recommendations */
        <div className="space-y-12 py-6">
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-8 text-center space-y-3 max-w-2xl mx-auto">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-800">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight">
              No Exact Matches Found
            </h3>
            <p className="text-xs text-neutral-600">
              We couldn&apos;t find any direct items matching &quot;{search || categorySlug}&quot;. Try checking for spelling errors or clearing your active filters.
            </p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors inline-block"
            >
              View Full Catalog
            </button>
          </div>

          {/* Related Items Section */}
          {relatedProducts.length > 0 && (
            <div className="space-y-6 pt-4 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 block">
                    RECOMMENDED FOR YOU
                  </span>
                  <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900">
                    You Might Also Like
                  </h2>
                </div>
              </div>
              <ProductGrid products={relatedProducts} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs font-bold text-neutral-400">
        Loading catalog...
      </div>
    }>
      <ShopPageContent />
    </Suspense>
  );
}
