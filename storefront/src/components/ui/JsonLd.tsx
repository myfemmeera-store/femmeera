'use client';

import React from 'react';
import { Product } from '@/types';

interface JsonLdProps {
  type: 'Product' | 'Organization' | 'WebSite' | 'BreadcrumbList' | 'FAQPage' | 'Article' | 'SiteNavigationElement';
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
      sameAs: [
        'https://www.instagram.com/femmeera.co/',
        'https://www.facebook.com/profile.php?id=61595048331512',
        'https://www.youtube.com/@Femmeera_co',
        'https://x.com/femmeera_co',
        'https://in.pinterest.com/femmeera_co/',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@femmeera.com',
        url: 'https://femmeera.com/contact',
      },
    };
  } else if (type === 'SiteNavigationElement') {
    schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ItemList',
          '@id': 'https://femmeera.com/#site-navigation',
          name: 'Femmeera Navigation',
          itemListElement: [
            {
              '@type': 'SiteNavigationElement',
              position: 1,
              name: 'Traditional Wear',
              description: 'Women\'s handcrafted sarees, lehengas, kurtis, and ethnic suit sets.',
              url: 'https://femmeera.com/women/traditional-wear',
            },
            {
              '@type': 'SiteNavigationElement',
              position: 2,
              name: 'Western Wear',
              description: 'Chic modern dresses, co-ord sets, evening gowns, and partywear.',
              url: 'https://femmeera.com/women/western-wear',
            },
            {
              '@type': 'SiteNavigationElement',
              position: 3,
              name: 'New Arrivals',
              description: 'Explore the latest women\'s fashion arrivals at Femmeera.',
              url: 'https://femmeera.com/shop',
            },
            {
              '@type': 'SiteNavigationElement',
              position: 4,
              name: 'About Femmeera',
              description: 'Learn about Femmeera online women\'s fashion brand offering premium traditional and western wear.',
              url: 'https://femmeera.com/about',
            },
            {
              '@type': 'SiteNavigationElement',
              position: 5,
              name: 'Return & Exchange Policy',
              description: 'Hassle-free 7-day return and exchange policy on Femmeera products.',
              url: 'https://femmeera.com/return-policy',
            },
          ],
        },
      ],
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

    const rawDesc = product.description || product.short_description || `Buy ${product.name} online at Femmeera. Discover premium women's traditional and western wear with free delivery across India.`;
    const cleanDescription = rawDesc.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();

    const sellerSchema = {
      '@type': 'Organization',
      name: 'Femmeera',
      url: 'https://femmeera.com',
    };

    const priceValidUntil = '2027-12-31';

    const returnPolicySchema = {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'IN',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 7,
      returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/FreeReturn',
      refundType: 'https://schema.org/FullRefund',
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
      const variantSchemas = variants.map((v) => {
        const varSku = v.sku || `${product.sku || 'FEM'}-${v.id}`;
        return {
          '@type': 'Product',
          name: `${product.name} - ${v.color || 'Standard'} / ${v.size || 'Free Size'}`,
          sku: varSku,
          mpn: varSku,
          color: v.color || undefined,
          size: v.size || undefined,
          image: imageUrls,
          brand: {
            '@type': 'Brand',
            name: product.brand || 'Femmeera',
          },
          offers: {
            '@type': 'Offer',
            url: productUrl,
            priceCurrency: 'INR',
            price: Number(v.price || minPrice),
            priceValidUntil,
            availability: (v.stock ?? 1) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: sellerSchema,
            hasMerchantReturnPolicy: returnPolicySchema,
            shippingDetails: shippingDetailsSchema,
          },
        };
      });

      schema = {
        '@context': 'https://schema.org',
        '@type': 'ProductGroup',
        name: product.name,
        description: cleanDescription,
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
      const prodSku = product.sku || `FEM-${product.id}`;
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: imageUrls,
        description: cleanDescription,
        sku: prodSku,
        mpn: prodSku,
        brand: {
          '@type': 'Brand',
          name: product.brand || 'Femmeera',
        },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'INR',
          price: minPrice,
          priceValidUntil,
          availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: sellerSchema,
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
