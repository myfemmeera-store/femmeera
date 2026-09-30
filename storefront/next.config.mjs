/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/google-merchant-feed.xml',
        destination: 'https://api.femmeera.com/api/v1/feeds/google-merchant',
      },
      {
        source: '/google-product-feed.xml',
        destination: 'https://api.femmeera.com/api/v1/feeds/google-product',
      },
    ];
  },
};

export default nextConfig;
