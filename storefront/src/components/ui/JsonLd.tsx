'use client';

import React from 'react';
import { Product } from '@/types';

interface JsonLdProps {
  type: 'Product' | 'Organization' | 'BreadcrumbList';
  product?: Product;
  breadcrumbs?: { name: string; item: string }[];
}

export const JsonLd: React.FC<JsonLdProps> = ({ type, product, breadcrumbs }) => {
  let schema: Record<string, unknown> | null = null;

  if (type === 'Organization') {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Femmeera',
      url: 'https://femmeera.com',
      logo: 'https://femmeera.com/logo.png',
      sameAs: ['https://instagram.com/femmeera'],
    };
  } else if (type === 'BreadcrumbList' && breadcrumbs) {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((b, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: b.name,
        item: b.item,
      })),
    };
  } else if (type === 'Product' && product) {
    const variants = product.variants || [];
    const minPrice = product.price || (variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : 1499);

    schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.images?.[0]?.image_url || [],
      description: product.description || product.short_description || '',
      sku: product.sku,
      brand: {
        '@type': 'Brand',
        name: product.brand || 'Femmeera',
      },
      offers: {
        '@type': 'Offer',
        url: `https://femmeera.com/product/${product.slug}`,
        priceCurrency: 'INR',
        price: minPrice,
        availability: 'https://schema.org/InStock',
      },
    };

    // Only include AggregateRating if real rating data exists (Spec Section 29)
    if (product.rating && product.rating > 0 && product.review_count) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.review_count,
      };
    }
  }

  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
