import React from 'react';
import { Metadata } from 'next';
import { productService } from '@/services/productService';
import { JsonLd } from '@/components/ui/JsonLd';
import ProductDetailClient from './ProductDetailClient';
import { Product } from '@/types';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await productService.getProductBySlug(slug);
  let product: Product | undefined = res.data;

  if (!product) {
    const catalogRes = await productService.getProducts({ page: 1, search: slug.replace(/-/g, ' ') });
    const allProductsRes = catalogRes.data?.length ? catalogRes : await productService.getProducts({ page: 1 });
    product = allProductsRes.data?.find((p: any) =>
      p.slug === slug ||
      String(p.id) === String(slug) ||
      p.slug?.includes(slug) ||
      slug.includes(p.slug) ||
      p.name?.toLowerCase().includes(slug.replace(/-/g, ' ').toLowerCase())
    ) || allProductsRes.data?.[0];
  }

  if (!product) {
    return {
      title: 'Women\'s Apparel Collection | Femmeera',
      description: 'Shop elegant handcrafted sarees, kurtis, ethnic sets, and western dresses at Femmeera.',
      alternates: {
        canonical: `https://femmeera.com/product/${slug}`,
      },
    };
  }

  const title = `${product.name} | Femmeera`;
  const rawDescription = product.description || product.short_description || `Buy ${product.name} online at Femmeera. Discover premium women's traditional and western wear.`;
  const description = rawDescription.replace(/<[^>]*>?/gm, '').slice(0, 160).trim();
  const mainImage = product.images?.[0]?.image_url || 'https://femmeera.com/logo.png';

  return {
    title,
    description,
    alternates: {
      canonical: `https://femmeera.com/product/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://femmeera.com/product/${slug}`,
      type: 'website',
      images: [
        {
          url: mainImage,
          width: 800,
          height: 1000,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const res = await productService.getProductBySlug(slug);
  let product: Product | undefined = res.data;

  if (!product) {
    const catalogRes = await productService.getProducts({ page: 1, search: slug.replace(/-/g, ' ') });
    const allProductsRes = catalogRes.data?.length ? catalogRes : await productService.getProducts({ page: 1 });
    product = allProductsRes.data?.find((p: any) =>
      p.slug === slug ||
      String(p.id) === String(slug) ||
      p.slug?.includes(slug) ||
      slug.includes(p.slug) ||
      p.name?.toLowerCase().includes(slug.replace(/-/g, ' ').toLowerCase())
    ) || allProductsRes.data?.[0];
  }

  const breadcrumbs = [
    { name: 'Home', item: 'https://femmeera.com' },
    { name: 'Women', item: 'https://femmeera.com/women' },
    ...(product?.category?.name
      ? [{ name: product.category.name, item: `https://femmeera.com/women/${product.category.slug}` }]
      : []),
    { name: product?.name || slug, item: `https://femmeera.com/product/${slug}` },
  ];

  return (
    <main>
      {product && (
        <>
          <JsonLd type="Product" product={product} />
          <JsonLd type="BreadcrumbList" breadcrumbs={breadcrumbs} />
        </>
      )}
      <ProductDetailClient initialProduct={product} />
    </main>
  );
}
