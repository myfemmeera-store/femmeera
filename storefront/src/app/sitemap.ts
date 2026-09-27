import { MetadataRoute } from 'next';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { JOURNAL_ARTICLES } from '@/data/articles';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://femmeera.com';

  // Base static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/women`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/journal`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/return-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  const journalRoutes: MetadataRoute.Sitemap = JOURNAL_ARTICLES.map((art) => ({
    url: `${baseUrl}/journal/${art.slug}`,
    lastModified: new Date(art.dateModified || art.datePublished),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  try {
    const [categoriesRes, productsRes] = await Promise.all([
      categoryService.getCategories(),
      productService.getProducts({ page: 1 }),
    ]);

    const categoryRoutes: MetadataRoute.Sitemap = (categoriesRes.data || [])
      .filter((cat) => Boolean(cat.slug))
      .map((cat) => ({
        url: `${baseUrl}/women/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));

    const productRoutes: MetadataRoute.Sitemap = (productsRes.data || [])
      .filter((prod) => Boolean(prod.slug) && prod.status !== 'INACTIVE')
      .map((prod) => ({
        url: `${baseUrl}/product/${prod.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      }));

    return [...staticRoutes, ...journalRoutes, ...categoryRoutes, ...productRoutes];
  } catch {
    return [...staticRoutes, ...journalRoutes];
  }
}
