import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account/', '/cart/', '/checkout/', '/search'],
    },
    sitemap: 'https://femmeera.com/sitemap.xml',
  };
}
