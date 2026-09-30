import React from 'react';
import Link from 'next/link';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { JsonLd } from '@/components/ui/JsonLd';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { Metadata } from 'next';

import { CategorySortSelect } from '@/components/ui/CategorySortSelect';
import { CategoryPagination } from '@/components/ui/CategoryPagination';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; search?: string; sort?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoriesRes = await categoryService.getCategories();
  const cat = categoriesRes.data?.find((c) => c.slug === slug);

  const catName = cat?.name || slug.replace(/-/g, ' ');
  const title = cat?.seo_title || `${catName} for Women | Elegant Ethnic & Contemporary Wear | Femmeera`;
  const description = cat?.seo_description || `Discover handcrafted ${catName} for women at Femmeera. Shop high-quality embroidered outfits, beautiful designs, and comfortable fits with free delivery across India.`;
  const canonicalUrl = `https://femmeera.com/women/${slug}`;
  const catImage = cat?.image_url || 'https://femmeera.com/logo.png';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Femmeera',
      type: 'website',
      images: [
        {
          url: catImage,
          width: 1200,
          height: 630,
          alt: `${catName} Collection - Femmeera`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [catImage],
    },
  };
}

export default async function CategoryListingPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;
  const currentPage = Number(sParams.page) || 1;
  const search = sParams.search || '';
  const currentSort = sParams.sort || 'newest';

  const [categoriesRes, productsRes] = await Promise.all([
    categoryService.getCategories(),
    productService.getProducts({
      page: currentPage,
      per_page: 24,
      category_slug: slug,
      search,
      sort: currentSort,
    }),
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
          <SlidersHorizontal className="w-4 h-4 text-[#B38548]" />
          <span>
            {meta?.total ? `Showing ${products.length} of ${meta.total} Products` : `Showing ${products.length} Products`}
          </span>
        </div>

        <CategorySortSelect currentSort={currentSort} categorySlug={slug} />
      </div>

      {/* Product Grid */}
      <ProductGrid products={products} />

      {/* Category Pagination */}
      <CategoryPagination
        currentPage={currentPage}
        lastPage={meta?.last_page || 1}
        categorySlug={slug}
        currentSort={currentSort}
        search={search}
      />

      {/* Category SEO Copy & Related Categories Internal Links */}
      <div className="border-t border-neutral-200/80 pt-10 mt-12 space-y-8 text-xs text-neutral-600 leading-relaxed">
        <div className="bg-[#FAF4EB] p-6 sm:p-8 rounded-3xl border border-[#EFE6D8] space-y-3">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-neutral-900">
            About Femmeera {cat?.name || slug.replace(/-/g, ' ')} Collection
          </h2>
          <p className="text-neutral-700">
            {cat?.description || `Explore our curated selection of ${cat?.name || slug.replace(/-/g, ' ')} designed for women who appreciate quality tailoring, comfortable fits, and elegant aesthetics. Whether you are dressing for daily wear, office hours, festive celebrations, or evening events, Femmeera offers versatile designs crafted from premium fabrics.`}
          </p>
        </div>

        {/* Related Categories Navigation */}
        <div className="space-y-3">
          <h3 className="font-serif text-sm font-bold text-neutral-900 uppercase tracking-wider">
            Explore Other Collections
          </h3>
          <div className="flex flex-wrap gap-2">
            {(categoriesRes.data || []).map((otherCat) => (
              <Link
                key={otherCat.id}
                href={`/women/${otherCat.slug}`}
                className={`px-3 py-1.5 rounded-xl border text-xs transition-colors ${
                  otherCat.slug === slug
                    ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400 hover:text-neutral-900'
                }`}
              >
                {otherCat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
