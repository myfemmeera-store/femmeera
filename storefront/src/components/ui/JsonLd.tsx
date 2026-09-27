'use client';

import React from 'react';
import { Product } from '@/types';

interface JsonLdProps {
  type: 'Product' | 'Organization' | 'WebSite' | 'BreadcrumbList' | 'FAQPage' | 'Article';
  product?: Product;
  breadcrumbs?: { name: string; item: string }[];
  faqs?: { q: string; a: string }[];
  article?: {
    title: string;
    description: string;
    slug: string;
    image?: string;
    datePublished: string;
    dateModified?: string;
    authorName?: string;
  };
}

export const JsonLd: React.FC<JsonLdProps> = ({ type, product, breadcrumbs, faqs, article }) => {
  let schema: Record<string, unknown> | null = null;

  if (type === 'Organization') {
    schema = {
      '@context': 'https://schema.org',
      '@type': ['Organization', 'OnlineStore'],
      '@id': 'https://femmeera.com/#organization',
      name: 'Femmeera',
      url: 'https://femmeera.com/',
      logo: 'https://femmeera.com/logo.png',
      description: 'Femmeera is an online fashion store offering elegant ethnic and contemporary womens wear for every occasion.',
      sameAs: ['https://instagram.com/femmeera'],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@femmeera.com',
        url: 'https://femmeera.com/contact',
      },
    };
  } else if (type === 'WebSite') {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': 'https://femmeera.com/#website',
      name: 'Femmeera',
      url: 'https://femmeera.com/',
      publisher: {
        '@id': 'https://femmeera.com/#organization',
      },
    };
  } else if (type === 'FAQPage' && faqs) {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    };
  } else if (type === 'Article' && article) {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      image: article.image || 'https://femmeera.com/logo.png',
      datePublished: article.datePublished,
      dateModified: article.dateModified || article.datePublished,
      author: {
        '@type': 'Organization',
        name: article.authorName || 'Femmeera Editorial Team',
        url: 'https://femmeera.com',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Femmeera',
        logo: {
          '@type': 'ImageObject',
          url: 'https://femmeera.com/logo.png',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://femmeera.com/journal/${article.slug}`,
      },
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
    const minPrice = Number(product.price || (variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : 1499));

    const hasStock = variants.length > 0
      ? variants.some((v) => (v.stock ?? 1) > 0)
      : product.status !== 'INACTIVE';

    const imageUrls = product.images && product.images.length > 0
      ? product.images.map((img) => img.image_url).filter(Boolean)
      : ['https://femmeera.com/logo.png'];

    const returnPolicySchema = {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'IN',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 7,
      returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/FreeReturn',
    };

    const shippingDetailsSchema = {
      '@type': 'OfferShippingDetails',
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: 0,
        currency: 'INR',
      },
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: 'IN',
      },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: 1,
          maxValue: 2,
          unitCode: 'DAY',
        },
        transitTime: {
          '@type': 'QuantitativeValue',
          minValue: 2,
          maxValue: 5,
          unitCode: 'DAY',
        },
      },
    };

    const productUrl = `https://femmeera.com/product/${product.slug}`;

    if (variants.length > 0) {
      const variantSchemas = variants.map((v) => ({
        '@type': 'Product',
        name: `${product.name} - ${v.color || 'Standard'} / ${v.size || 'Free Size'}`,
        sku: v.sku || `${product.sku}-${v.id}`,
        color: v.color || undefined,
        size: v.size || undefined,
        image: imageUrls,
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'INR',
          price: Number(v.price || minPrice),
          availability: (v.stock ?? 1) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          hasMerchantReturnPolicy: returnPolicySchema,
          shippingDetails: shippingDetailsSchema,
        },
      }));

      schema = {
        '@context': 'https://schema.org',
        '@type': 'ProductGroup',
        name: product.name,
        description: product.description || product.short_description || `Buy ${product.name} online at Femmeera.`,
        productGroupID: product.sku || `FEM-${product.id}`,
        url: productUrl,
        brand: {
          '@type': 'Brand',
          name: product.brand || 'Femmeera',
        },
        variesBy: [
          'https://schema.org/color',
          'https://schema.org/size',
        ],
        hasVariant: variantSchemas,
      };
    } else {
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: imageUrls,
        description: product.description || product.short_description || `Buy ${product.name} online at Femmeera.`,
        sku: product.sku || `FEM-${product.id}`,
        brand: {
          '@type': 'Brand',
          name: product.brand || 'Femmeera',
        },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'INR',
          price: minPrice,
          availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          hasMerchantReturnPolicy: returnPolicySchema,
          shippingDetails: shippingDetailsSchema,
        },
      };
    }

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
